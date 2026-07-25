"""
FIR Analytics Router — KSP Trinetra Sentinel Python ML Service
FastAPI router exposing FIR-schema analytics endpoints that require
Python-native computation (median, percentiles, NetworkX graph).

Mounted at /api/v1/fir in main.py.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
import psycopg2
import psycopg2.extras
from contextlib import contextmanager
import networkx as nx
from datetime import date, datetime

router = APIRouter(prefix="/api/v1/fir", tags=["FIR Analytics"])

# ─── DB Connection ─────────────────────────────────────────────────────────────

# SECURITY: DATABASE_URL MUST be set via Catalyst Vault / environment variable in all non-local environments.
# The fallback below is ONLY for local development (default postgres credentials — never commit real creds).
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/trinetra_db")



@contextmanager
def get_db_conn():
    """Context manager for PostgreSQL connection (no pool needed for infrequent analytics)."""
    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
        yield conn
    except psycopg2.OperationalError as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")
    finally:
        if conn:
            conn.close()


# ─── Request Models ────────────────────────────────────────────────────────────

class ChargesheetLagRequest(BaseModel):
    unit_id: Optional[int] = None
    district_id: Optional[int] = None
    crime_head_id: Optional[int] = None
    from_date: Optional[str] = None
    to_date: Optional[str] = None
    group_by: Optional[str] = "unit"          # 'unit' | 'crime_head' | 'io'
    state_wide: Optional[bool] = False


class VictimJourneyRequest(BaseModel):
    case_master_id: int
    include_related: Optional[bool] = False


class AccusedNetworkRequest(BaseModel):
    min_cases: Optional[int] = 2
    district_id: Optional[int] = None
    unit_id: Optional[int] = None
    days: Optional[int] = 365                 # lookback window


# ─── Chargesheet Lag Endpoint ─────────────────────────────────────────────────

@router.post("/analytics/chargesheet-lag")
def chargesheet_lag(req: ChargesheetLagRequest):
    """
    Compute time-to-chargesheet distribution per unit / crime head / IO.
    Returns: avg_days, median_days, p90_days, max_days per group.
    Uses Python statistics for percentile computation (more portable than Postgres PERCENTILE_CONT).
    """
    conditions = []
    params = []

    if req.unit_id:
        conditions.append(f"cm.PoliceStationID = %s")
        params.append(req.unit_id)
    if req.district_id:
        conditions.append("u.DistrictID = %s")
        params.append(req.district_id)
    if req.crime_head_id:
        conditions.append("cm.CrimeMajorHeadID = %s")
        params.append(req.crime_head_id)
    if req.from_date:
        conditions.append("cm.CrimeRegisteredDate >= %s")
        params.append(req.from_date)
    if req.to_date:
        conditions.append("cm.CrimeRegisteredDate <= %s")
        params.append(req.to_date)

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    group_field_map = {
        "unit": "u.UnitName",
        "crime_head": "ch.CrimeGroupName",
        "io": "e.FirstName",
    }
    group_field = group_field_map.get(req.group_by or "unit", "u.UnitName")

    sql = f"""
        SELECT
            {group_field} AS group_name,
            (cd.ChargesheetDate - cm.CrimeRegisteredDate::date) AS lag_days
        FROM CaseMaster cm
            JOIN ChargesheetDetails cd ON cd.CaseMasterID    = cm.CaseMasterID
            JOIN Unit               u  ON cm.PoliceStationID = u.UnitID
            LEFT JOIN CrimeHead     ch ON cm.CrimeMajorHeadID = ch.CrimeHeadID
            LEFT JOIN Employee      e  ON cd.IOID             = e.EmployeeID
        {where_clause}
        AND cd.ChargesheetDate IS NOT NULL
        ORDER BY group_name
    """

    try:
        with get_db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, params)
                rows = cur.fetchall()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not rows:
        return {"success": True, "group_by": req.group_by, "data": [],
                "note": "No chargesheeted cases found for the given filters."}

    # Group by group_name and compute Python statistics
    from collections import defaultdict
    import statistics

    groups: dict = defaultdict(list)
    for row in rows:
        groups[row["group_name"]].append(row["lag_days"])

    results = []
    for group_name, lags in groups.items():
        if len(lags) < 2:
            continue
        sorted_lags = sorted(lags)
        results.append({
            "group_name": group_name,
            "count": len(lags),
            "avg_days": round(statistics.mean(lags), 1),
            "median_days": round(statistics.median(lags), 1),
            "p90_days": round(sorted_lags[int(len(sorted_lags) * 0.9)], 1),
            "max_days": max(lags),
            "min_days": min(lags),
            "bottleneck": statistics.median(lags) > 60,  # > 60 days = bottleneck
        })

    results.sort(key=lambda x: x["avg_days"], reverse=True)

    return {
        "success": True,
        "group_by": req.group_by,
        "total_groups": len(results),
        "data": results[:30],
    }


# ─── Victim Journey Endpoint ───────────────────────────────────────────────────

@router.post("/analytics/victim-journey")
def victim_journey(req: VictimJourneyRequest):
    """
    Case milestone timeline: FIR → Arrest(s) → Chargesheet → Court date.
    Highlights bottlenecks and computes justice lag in days.
    """
    try:
        with get_db_conn() as conn:
            with conn.cursor() as cur:
                # Case core record
                cur.execute("""
                    SELECT cm.CaseMasterID, cm.CrimeNo, cm.CaseNo,
                           cm.CrimeRegisteredDate AS fir_date,
                           cm.IncidentFromDate AS incident_date,
                           go.GravityOffenceName, csm.CaseStatusName,
                           u.UnitName AS police_station,
                           e.FirstName AS io_name
                    FROM CaseMaster cm
                        LEFT JOIN GravityOffence   go  ON cm.GravityOffenceID = go.GravityOffenceID
                        LEFT JOIN CaseStatusMaster csm ON cm.CaseStatusID     = csm.CaseStatusID
                        LEFT JOIN Unit             u   ON cm.PoliceStationID  = u.UnitID
                        LEFT JOIN Employee         e   ON cm.PolicePersonID   = e.EmployeeID
                    WHERE cm.CaseMasterID = %s
                    LIMIT 1
                """, (req.case_master_id,))
                case_row = cur.fetchone()

                if not case_row:
                    raise HTTPException(status_code=404, detail=f"Case {req.case_master_id} not found.")

                # Arrests
                cur.execute("""
                    SELECT ars.ArrestSurrenderDate AS event_date,
                           ars.ArrestSurrenderTypeID AS event_type,
                           acc.AccusedName
                    FROM ArrestSurrender ars
                        JOIN Accused acc ON ars.AccusedMasterID = acc.AccusedMasterID
                    WHERE ars.CaseMasterID = %s
                    ORDER BY ars.ArrestSurrenderDate
                """, (req.case_master_id,))
                arrests = cur.fetchall()

                # Chargesheet
                cur.execute("""
                    SELECT ChargesheetDate, FiledInCourtDate, NextHearingDate
                    FROM ChargesheetDetails
                    WHERE CaseMasterID = %s
                    ORDER BY ChargesheetDate LIMIT 1
                """, (req.case_master_id,))
                chargesheet = cur.fetchone()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    fir_date = case_row["fir_date"]
    if isinstance(fir_date, str):
        fir_date = datetime.fromisoformat(fir_date)

    today = datetime.now().replace(tzinfo=fir_date.tzinfo if fir_date.tzinfo else None)

    milestones = [{
        "event": "FIR Registered",
        "date": str(fir_date.date() if hasattr(fir_date, 'date') else fir_date),
        "days_from_fir": 0,
        "status": "COMPLETED",
    }]

    for arrest in arrests:
        arr_date = arrest["event_date"]
        if arr_date and fir_date:
            delta = (arr_date - fir_date.date() if hasattr(fir_date, 'date') else fir_date).days
            milestones.append({
                "event": "Surrender" if arrest["event_type"] == 2 else "Arrest",
                "subject": arrest["accusedname"] if "accusedname" in arrest else "",
                "date": str(arr_date),
                "days_from_fir": delta,
                "status": "COMPLETED",
            })

    if chargesheet and chargesheet["chargesheetdate"]:
        cs_date = chargesheet["chargesheetdate"]
        delta = (cs_date - fir_date.date() if hasattr(fir_date, 'date') else fir_date).days
        milestones.append({
            "event": "Chargesheet Filed",
            "date": str(cs_date),
            "days_from_fir": delta,
            "status": "COMPLETED",
            "court_date": str(chargesheet["filedIncourtdate"]) if chargesheet.get("filedIncourtdate") else None,
            "next_hearing": str(chargesheet["nexthearingdate"]) if chargesheet.get("nexthearingdate") else None,
        })
    else:
        pending_days = (today.date() - fir_date.date()).days if hasattr(fir_date, 'date') else 0
        milestones.append({
            "event": "Chargesheet Pending",
            "date": None,
            "days_from_fir": None,
            "pending_days": pending_days,
            "status": "BOTTLENECK" if pending_days > 60 else "PENDING",
            "bottleneck_note": f"Overdue by {pending_days - 60} days beyond 60-day window" if pending_days > 60 else None,
        })

    return {
        "success": True,
        "case": dict(case_row),
        "milestones": milestones,
        "is_bottleneck": any(m.get("status") == "BOTTLENECK" for m in milestones),
        "total_days_elapsed": (today.date() - fir_date.date()).days if hasattr(fir_date, 'date') else 0,
    }


# ─── Accused Network Graph Endpoint ───────────────────────────────────────────

@router.post("/analytics/accused-network")
def accused_network(req: AccusedNetworkRequest):
    """
    Build a NetworkX graph of accused persons connected by shared FIRs.
    Returns: graph nodes (accused), edges (shared case), centrality scores.
    Accused appearing in >= min_cases are highlighted as 'syndicate_node'.
    """
    conditions = ["cm.CrimeRegisteredDate >= NOW() - INTERVAL '1 day' * %s"]
    params: List = [req.days]

    if req.district_id:
        conditions.append("u.DistrictID = %s")
        params.append(req.district_id)
    if req.unit_id:
        conditions.append("cm.PoliceStationID = %s")
        params.append(req.unit_id)

    where_clause = "WHERE " + " AND ".join(conditions)

    sql = f"""
        SELECT
            acc.AccusedMasterID,
            acc.AccusedName,
            acc.PersonID,
            cm.CaseMasterID,
            cm.CrimeNo
        FROM Accused acc
            JOIN CaseMaster cm ON acc.CaseMasterID   = cm.CaseMasterID
            JOIN Unit       u  ON cm.PoliceStationID = u.UnitID
        {where_clause}
        ORDER BY acc.AccusedName
    """

    try:
        with get_db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, params)
                rows = cur.fetchall()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not rows:
        return {"success": True, "nodes": [], "edges": [], "note": "No data for given filters."}

    # Build NetworkX graph: accused → case links
    G = nx.Graph()
    case_accused: dict = {}

    for row in rows:
        name = row["accusedname"] or f"Accused-{row['accusedmasterid']}"
        case_no = row["crimeno"] or str(row["casemasterid"])
        G.add_node(name, type="accused", person_id=row.get("personid"))
        if case_no not in case_accused:
            case_accused[case_no] = []
        case_accused[case_no].append(name)

    # Connect accused who share the same FIR (edge = shared case)
    for case_no, accused_list in case_accused.items():
        for i in range(len(accused_list)):
            for j in range(i + 1, len(accused_list)):
                if G.has_edge(accused_list[i], accused_list[j]):
                    G[accused_list[i]][accused_list[j]]["shared_cases"].append(case_no)
                else:
                    G.add_edge(accused_list[i], accused_list[j], shared_cases=[case_no])

    # Compute centrality
    try:
        betweenness = nx.betweenness_centrality(G)
        degree = dict(G.degree())
    except Exception:
        betweenness = {n: 0 for n in G.nodes}
        degree = {n: 0 for n in G.nodes}

    nodes = [
        {
            "id": node,
            "type": "accused",
            "degree": degree.get(node, 0),
            "betweenness": round(betweenness.get(node, 0), 4),
            "syndicate_node": degree.get(node, 0) >= req.min_cases,
            **G.nodes[node],
        }
        for node in G.nodes
    ]

    edges = [
        {
            "source": u,
            "target": v,
            "shared_cases": G[u][v].get("shared_cases", []),
            "shared_case_count": len(G[u][v].get("shared_cases", [])),
        }
        for u, v in G.edges
    ]

    # Sort: syndicate nodes first
    nodes.sort(key=lambda n: (-n["degree"], -n["betweenness"]))

    return {
        "success": True,
        "total_accused": len(nodes),
        "total_connections": len(edges),
        "syndicate_nodes": [n for n in nodes if n["syndicate_node"]],
        "nodes": nodes[:100],
        "edges": edges[:200],
    }
