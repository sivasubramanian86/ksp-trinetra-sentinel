/**
 * Query Builder — KSP Trinetra Sentinel
 * Safe, parameterized SQL builders for schema-aware FIR queries.
 *
 * These builders power the copilot's NL→SQL execution path.
 * All queries go through the RBAC scope injected by scopeToUnit().
 *
 * Design principles:
 *   - Never interpolate user strings into SQL (all values are $N params)
 *   - Scope clause always comes first (first $N params are always scope params)
 *   - Return { sql, params } for execution by the caller via db.query()
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Case Search — gravity + section + accused status + date range
// ─────────────────────────────────────────────────────────────────────────────
function buildCaseSearchSQL(scopeResult, filters = {}) {
  const { clause: scopeClause, params: scopeParams, offset } = scopeResult;
  let paramIdx = offset;
  const conditions = [scopeClause];
  const params = [...scopeParams];

  if (filters.gravityOffenceID) {
    conditions.push(`cm.GravityOffenceID = $${paramIdx++}`);
    params.push(filters.gravityOffenceID);
  }
  if (filters.caseStatusID) {
    conditions.push(`cm.CaseStatusID = $${paramIdx++}`);
    params.push(filters.caseStatusID);
  }
  if (filters.fromDate) {
    conditions.push(`cm.CrimeRegisteredDate >= $${paramIdx++}`);
    params.push(filters.fromDate);
  }
  if (filters.toDate) {
    conditions.push(`cm.CrimeRegisteredDate <= $${paramIdx++}`);
    params.push(filters.toDate);
  }
  if (filters.unitID) {
    conditions.push(`cm.PoliceStationID = $${paramIdx++}`);
    params.push(filters.unitID);
  }
  if (filters.districtID) {
    conditions.push(`u.DistrictID = $${paramIdx++}`);
    params.push(filters.districtID);
  }

  // Act/Section filter (IPC/BNS dual-aware)
  let sectionJoin = '';
  if (filters.sectionCode || filters.actCode) {
    sectionJoin = `
      JOIN ActSectionAssociation asa ON asa.CaseMasterID = cm.CaseMasterID
      JOIN Section s ON asa.SectionID = s.SectionID
    `;
    if (filters.sectionCode) {
      conditions.push(`s.SectionCode = $${paramIdx++}`);
      params.push(filters.sectionCode);
    }
    if (filters.actCode) {
      conditions.push(`asa.ActCode = $${paramIdx++}`);
      params.push(filters.actCode);
    }
  }

  // Absconding accused filter (no ArrestSurrender record)
  let accusedJoin = '';
  if (filters.accusedStatus === 'ABSCONDING') {
    accusedJoin = `
      JOIN Accused acc ON acc.CaseMasterID = cm.CaseMasterID
      LEFT JOIN ArrestSurrender ars ON ars.AccusedMasterID = acc.AccusedMasterID
    `;
    conditions.push(`ars.ArrestSurrenderID IS NULL`);
  } else if (filters.accusedStatus === 'ARRESTED') {
    accusedJoin = `
      JOIN ArrestSurrender ars ON ars.CaseMasterID = cm.CaseMasterID AND ars.IsAccused = 1
    `;
  }

  params.push(filters.limit || 50);

  const sql = `
    SELECT DISTINCT
      cm.CaseMasterID,
      cm.CrimeNo,
      cm.CaseNo,
      cm.CrimeRegisteredDate,
      cm.BriefFacts,
      go.GravityOffenceName,
      csm.CaseStatusName,
      u.UnitName AS police_station,
      e.FirstName AS investigating_officer,
      cm.latitude,
      cm.longitude
    FROM CaseMaster cm
      JOIN Unit             u   ON cm.PoliceStationID  = u.UnitID
      JOIN GravityOffence   go  ON cm.GravityOffenceID = go.GravityOffenceID
      JOIN CaseStatusMaster csm ON cm.CaseStatusID     = csm.CaseStatusID
      LEFT JOIN Employee    e   ON cm.PolicePersonID   = e.EmployeeID
      ${sectionJoin}
      ${accusedJoin}
    WHERE ${conditions.join(' AND ')}
    ORDER BY cm.CrimeRegisteredDate DESC
    LIMIT $${paramIdx}
  `;

  return { sql, params };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Accused Cross-Case Trace — find accused appearing in >= N cases
// ─────────────────────────────────────────────────────────────────────────────
function buildAccusedTraceSql(scopeResult, filters = {}) {
  const { clause: scopeClause, params: scopeParams, offset } = scopeResult;
  let paramIdx = offset;
  const params = [...scopeParams];

  const minCases = filters.minCases || 2;
  params.push(minCases);

  const districtFilter = filters.districtID
    ? `AND u.DistrictID = $${paramIdx + 1}` : '';
  if (filters.districtID) params.push(filters.districtID);

  const sql = `
    SELECT
      acc.AccusedName,
      acc.PersonID,
      acc.GenderID,
      COUNT(DISTINCT acc.CaseMasterID) AS case_count,
      ARRAY_AGG(DISTINCT cm.CrimeNo ORDER BY cm.CrimeNo) AS crime_numbers,
      ARRAY_AGG(DISTINCT u.UnitName) AS stations_involved,
      MAX(cm.CrimeRegisteredDate) AS latest_case_date
    FROM Accused acc
      JOIN CaseMaster cm ON acc.CaseMasterID   = cm.CaseMasterID
      JOIN Unit       u  ON cm.PoliceStationID = u.UnitID
    WHERE ${scopeClause}
      ${districtFilter}
    GROUP BY acc.AccusedName, acc.PersonID, acc.GenderID
    HAVING COUNT(DISTINCT acc.CaseMasterID) >= $${paramIdx}
    ORDER BY case_count DESC
    LIMIT 50
  `;

  return { sql, params };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Chargesheet Lag Query — per unit or per IO
// ─────────────────────────────────────────────────────────────────────────────
function buildChargesheetLagSQL(scopeResult, filters = {}) {
  const { clause: scopeClause, params: scopeParams } = scopeResult;
  const params = [...scopeParams];
  const groupField = filters.groupBy === 'io' ? 'e.FirstName' : 'u.UnitName';

  const sql = `
    SELECT
      ${groupField} AS group_name,
      COUNT(*) AS total_chargesheeted,
      ROUND(AVG(cd.ChargesheetDate - cm.CrimeRegisteredDate::date)) AS avg_days,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cd.ChargesheetDate - cm.CrimeRegisteredDate::date) AS median_days,
      MAX(cd.ChargesheetDate - cm.CrimeRegisteredDate::date) AS max_days
    FROM CaseMaster cm
      JOIN ChargesheetDetails cd ON cd.CaseMasterID    = cm.CaseMasterID
      JOIN Unit               u  ON cm.PoliceStationID = u.UnitID
      LEFT JOIN Employee      e  ON cd.IOID            = e.EmployeeID
    WHERE ${scopeClause}
    GROUP BY ${groupField}
    HAVING COUNT(*) >= 3
    ORDER BY avg_days DESC
    LIMIT 20
  `;

  return { sql, params };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Section-based case list (dual IPC/BNS aware)
// e.g. "List all cheating cases (IPC 420 / BNS 318)"
// ─────────────────────────────────────────────────────────────────────────────
function buildSectionCaseSql(scopeResult, filters = {}) {
  const { clause: scopeClause, params: scopeParams, offset } = scopeResult;
  let paramIdx = offset;
  const params = [...scopeParams];

  // Accept either IPC or BNS section code and match both via the LegalKnowledgeBase
  const sectionCodes = [];
  if (filters.sectionCode) sectionCodes.push(filters.sectionCode);
  if (filters.legacySectionCode) sectionCodes.push(filters.legacySectionCode);

  const sectionInClause = sectionCodes.map(() => `$${paramIdx++}`).join(', ');
  params.push(...sectionCodes);

  const sql = `
    SELECT DISTINCT
      cm.CaseMasterID,
      cm.CrimeNo,
      cm.CaseNo,
      cm.CrimeRegisteredDate,
      go.GravityOffenceName,
      csm.CaseStatusName,
      u.UnitName AS police_station,
      a.ActCode,
      s.SectionCode,
      s.SectionDescription
    FROM CaseMaster cm
      JOIN ActSectionAssociation asa ON asa.CaseMasterID = cm.CaseMasterID
      JOIN Section               s   ON asa.SectionID    = s.SectionID
      JOIN Act                   a   ON asa.ActCode       = a.ActCode
      JOIN Unit             u   ON cm.PoliceStationID     = u.UnitID
      JOIN GravityOffence   go  ON cm.GravityOffenceID    = go.GravityOffenceID
      JOIN CaseStatusMaster csm ON cm.CaseStatusID        = csm.CaseStatusID
    WHERE ${scopeClause}
      AND s.SectionCode IN (${sectionInClause || "'000'"})
    ORDER BY cm.CrimeRegisteredDate DESC
    LIMIT 100
  `;

  return { sql, params };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. IO-level case summary (for copilot: "Show all FIRs by IO X in Station Y")
// ─────────────────────────────────────────────────────────────────────────────
function buildIOCaseSummarySql(scopeResult, filters = {}) {
  const { clause: scopeClause, params: scopeParams, offset } = scopeResult;
  let paramIdx = offset;
  const params = [...scopeParams];

  let ioFilter = '';
  if (filters.ioName) {
    ioFilter = `AND e.FirstName ILIKE $${paramIdx++}`;
    params.push(`%${filters.ioName}%`);
  }
  if (filters.unitName) {
    ioFilter += ` AND u.UnitName ILIKE $${paramIdx++}`;
    params.push(`%${filters.unitName}%`);
  }

  const sql = `
    SELECT
      e.FirstName AS io_name,
      e.KGID,
      u.UnitName AS station,
      COUNT(cm.CaseMasterID) AS total_firs,
      SUM(CASE WHEN cm.CaseStatusID = 3 THEN 1 ELSE 0 END) AS chargesheeted,
      SUM(CASE WHEN cm.CaseStatusID IN (1,2) THEN 1 ELSE 0 END) AS pending,
      csm.CaseStatusName,
      a.ActCode,
      s.SectionCode
    FROM CaseMaster cm
      JOIN Employee         e   ON cm.PolicePersonID   = e.EmployeeID
      JOIN Unit             u   ON cm.PoliceStationID  = u.UnitID
      JOIN CaseStatusMaster csm ON cm.CaseStatusID     = csm.CaseStatusID
      LEFT JOIN ActSectionAssociation asa ON asa.CaseMasterID = cm.CaseMasterID
      LEFT JOIN Act     a ON asa.ActCode  = a.ActCode
      LEFT JOIN Section s ON asa.SectionID = s.SectionID
    WHERE ${scopeClause} ${ioFilter}
    GROUP BY e.FirstName, e.KGID, u.UnitName, csm.CaseStatusName, a.ActCode, s.SectionCode
    ORDER BY total_firs DESC
    LIMIT 50
  `;

  return { sql, params };
}

module.exports = {
  buildCaseSearchSQL,
  buildAccusedTraceSql,
  buildChargesheetLagSQL,
  buildSectionCaseSql,
  buildIOCaseSummarySql,
};
