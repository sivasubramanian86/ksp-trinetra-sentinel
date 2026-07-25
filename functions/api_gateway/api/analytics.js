/**
 * Analytics API Router — KSP Trinetra Sentinel
 * DG Snapshot, Chargesheet Lag, Arrest Performance, Victim Journey
 *
 * All queries are RBAC-scoped via scopeToUnit() and enforce the
 * analytics access levels defined in rbac_policy.js.
 */

'use strict';

const express = require('express');
const router = express.Router();

const { authenticate, verifyRole, scopeToUnit } = require('../auth');
const db = require('../db');

router.use(authenticate);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/snapshot
// Senior Officer (DG/ADGP/IGP) state-wide crime snapshot
// Returns: crime trends by head, gravity dist, top units by volume, status breakdown
// ─────────────────────────────────────────────────────────────────────────────
router.get('/snapshot', verifyRole(['SHO', 'DCP', 'IGP', 'ADGP', 'DGP', 'COMMISSIONER', 'HQ_ANALYST', 'ANALYST']), async (req, res) => {
  try {
    const { clause: scopeClause, params: scopeParams, offset } = scopeToUnit(req);
    const days = parseInt(req.query.days || '30', 10);

    let paramIdx = offset;
    const dateParam = `$${paramIdx++}`;
    const allParams = [...scopeParams, days];

    const [crimeTrend, gravityDist, statusBreakdown, topUnits] = await Promise.all([
      // 1. Crime trend by Major Head (last N days)
      db.query(`
        SELECT
          ch.CrimeGroupName AS crime_head,
          DATE_TRUNC('day', cm.CrimeRegisteredDate) AS crime_date,
          COUNT(*) AS total_cases
        FROM CaseMaster cm
          JOIN Unit      u  ON cm.PoliceStationID  = u.UnitID
          JOIN CrimeHead ch ON cm.CrimeMajorHeadID = ch.CrimeHeadID
        WHERE ${scopeClause}
          AND cm.CrimeRegisteredDate >= NOW() - INTERVAL '1 day' * ${dateParam}
        GROUP BY ch.CrimeGroupName, DATE_TRUNC('day', cm.CrimeRegisteredDate)
        ORDER BY crime_date DESC, total_cases DESC
        LIMIT 300
      `, allParams),

      // 2. Gravity distribution
      db.query(`
        SELECT
          go.GravityOffenceName AS gravity,
          COUNT(*) AS total_cases,
          ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0), 1) AS pct
        FROM CaseMaster cm
          JOIN Unit           u  ON cm.PoliceStationID  = u.UnitID
          JOIN GravityOffence go ON cm.GravityOffenceID = go.GravityOffenceID
        WHERE ${scopeClause}
          AND cm.CrimeRegisteredDate >= NOW() - INTERVAL '1 day' * ${dateParam}
        GROUP BY go.GravityOffenceName
        ORDER BY total_cases DESC
      `, allParams),

      // 3. Case status breakdown
      db.query(`
        SELECT
          csm.CaseStatusName AS status,
          COUNT(*) AS total_cases
        FROM CaseMaster cm
          JOIN Unit            u   ON cm.PoliceStationID = u.UnitID
          JOIN CaseStatusMaster csm ON cm.CaseStatusID  = csm.CaseStatusID
        WHERE ${scopeClause}
          AND cm.CrimeRegisteredDate >= NOW() - INTERVAL '1 day' * ${dateParam}
        GROUP BY csm.CaseStatusName
        ORDER BY total_cases DESC
      `, allParams),

      // 4. Top 10 units by case volume (serious + heinous)
      db.query(`
        SELECT
          u.UnitName,
          u.DistrictID,
          go.GravityOffenceName AS gravity,
          COUNT(*) AS total_cases
        FROM CaseMaster cm
          JOIN Unit           u  ON cm.PoliceStationID  = u.UnitID
          JOIN GravityOffence go ON cm.GravityOffenceID = go.GravityOffenceID
        WHERE ${scopeClause}
          AND cm.GravityOffenceID >= 2
          AND cm.CrimeRegisteredDate >= NOW() - INTERVAL '1 day' * ${dateParam}
        GROUP BY u.UnitName, u.DistrictID, go.GravityOffenceName
        ORDER BY total_cases DESC
        LIMIT 30
      `, allParams),
    ]);

    res.json({
      success: true,
      scope: req.user.policy.analyticsAccess,
      periodDays: days,
      snapshot: {
        crimeTrend: crimeTrend.rows,
        gravityDistribution: gravityDist.rows,
        statusBreakdown: statusBreakdown.rows,
        topUnitsByVolume: topUnits.rows,
      },
    });
  } catch (err) {
    console.error('[Analytics] /snapshot error:', err.message);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/chargesheet-lag
// Time-to-chargesheet distribution per unit / crime head
// Highlights delay bottlenecks using median / P90 computation
// ─────────────────────────────────────────────────────────────────────────────
router.get('/chargesheet-lag', verifyRole(['SHO', 'DCP', 'IGP', 'ADGP', 'DGP', 'COMMISSIONER', 'HQ_ANALYST', 'ANALYST']), async (req, res) => {
  try {
    const { clause: scopeClause, params: scopeParams, offset } = scopeToUnit(req);
    const groupBy = req.query.group_by || 'unit';  // 'unit' | 'crime_head' | 'io'
    let paramIdx = offset;
    const allParams = [...scopeParams];

    const groupExpr = groupBy === 'crime_head'
      ? 'ch.CrimeGroupName'
      : groupBy === 'io'
        ? 'e.FirstName'
        : 'u.UnitName';

    const sql = `
      SELECT
        ${groupExpr} AS group_name,
        COUNT(*)                                               AS total_chargesheeted,
        ROUND(AVG(cd.ChargesheetDate - cm.CrimeRegisteredDate::date))  AS avg_days_to_chargesheet,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cd.ChargesheetDate - cm.CrimeRegisteredDate::date)
                                                               AS median_days,
        PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY cd.ChargesheetDate - cm.CrimeRegisteredDate::date)
                                                               AS p90_days,
        MAX(cd.ChargesheetDate - cm.CrimeRegisteredDate::date) AS max_days
      FROM CaseMaster cm
        JOIN ChargesheetDetails cd ON cd.CaseMasterID    = cm.CaseMasterID
        JOIN Unit               u  ON cm.PoliceStationID = u.UnitID
        LEFT JOIN CrimeHead     ch ON cm.CrimeMajorHeadID = ch.CrimeHeadID
        LEFT JOIN Employee      e  ON cd.IOID              = e.EmployeeID
      WHERE ${scopeClause}
        AND cd.ChargesheetDate IS NOT NULL
      GROUP BY ${groupExpr}
      HAVING COUNT(*) >= 3
      ORDER BY avg_days_to_chargesheet DESC
      LIMIT 50
    `;

    const result = await db.query(sql, allParams);
    res.json({ success: true, groupBy, data: result.rows });
  } catch (err) {
    console.error('[Analytics] /chargesheet-lag error:', err.message);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/arrest-performance
// Arrest counts, delays from FIR date, per unit and IO
// ─────────────────────────────────────────────────────────────────────────────
router.get('/arrest-performance', verifyRole(['SHO', 'DCP', 'IGP', 'ADGP', 'DGP', 'COMMISSIONER', 'HQ_ANALYST', 'ANALYST']), async (req, res) => {
  try {
    const { clause: scopeClause, params: scopeParams, offset } = scopeToUnit(req);
    const days = parseInt(req.query.days || '90', 10);
    const allParams = [...scopeParams, days];
    const dateParam = `$${offset}`;

    const sql = `
      SELECT
        u.UnitName,
        e.FirstName         AS io_name,
        COUNT(ars.ArrestSurrenderID)    AS total_arrests,
        COUNT(DISTINCT ars.CaseMasterID) AS cases_with_arrest,
        ROUND(AVG(ars.ArrestSurrenderDate - cm.CrimeRegisteredDate::date)) AS avg_days_to_arrest,
        SUM(CASE WHEN ars.IsComplainantAccused = 1 THEN 1 ELSE 0 END) AS complainant_is_accused_count
      FROM ArrestSurrender ars
        JOIN CaseMaster cm ON ars.CaseMasterID   = cm.CaseMasterID
        JOIN Unit       u  ON cm.PoliceStationID = u.UnitID
        LEFT JOIN Employee e ON ars.IOID         = e.EmployeeID
      WHERE ${scopeClause}
        AND ars.ArrestSurrenderDate >= NOW() - INTERVAL '1 day' * ${dateParam}
      GROUP BY u.UnitName, e.FirstName
      ORDER BY total_arrests DESC
      LIMIT 50
    `;

    const result = await db.query(sql, allParams);
    res.json({ success: true, periodDays: days, data: result.rows });
  } catch (err) {
    console.error('[Analytics] /arrest-performance error:', err.message);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/victim-journey/:caseMasterID
// Case milestone timeline: FIR → Arrest(s) → Chargesheet → Court
// ─────────────────────────────────────────────────────────────────────────────
router.get('/victim-journey/:caseMasterID', verifyRole(['IO', 'SHO', 'DCP', 'IGP', 'ADGP', 'DGP', 'COMMISSIONER', 'HQ_ANALYST', 'ANALYST']), async (req, res) => {
  try {
    const { clause: scopeClause, params: scopeParams, offset } = scopeToUnit(req);
    const caseMasterID = parseInt(req.params.caseMasterID, 10);

    if (isNaN(caseMasterID)) {
      return res.status(400).json({ error: 'INVALID_ID', message: 'caseMasterID must be an integer.' });
    }

    // Case core milestones
    const caseSQL = `
      SELECT
        cm.CaseMasterID,
        cm.CrimeNo,
        cm.CrimeRegisteredDate AS fir_date,
        cm.IncidentFromDate    AS incident_date,
        csm.CaseStatusName     AS current_status,
        go.GravityOffenceName  AS gravity
      FROM CaseMaster cm
        JOIN Unit             u   ON cm.PoliceStationID = u.UnitID
        JOIN GravityOffence   go  ON cm.GravityOffenceID  = go.GravityOffenceID
        JOIN CaseStatusMaster csm ON cm.CaseStatusID      = csm.CaseStatusID
      WHERE ${scopeClause} AND cm.CaseMasterID = $${offset}
      LIMIT 1
    `;

    const [caseResult, arrestsResult, chargesheetResult] = await Promise.all([
      db.query(caseSQL, [...scopeParams, caseMasterID]),
      db.query(`
        SELECT
          ars.ArrestSurrenderDate   AS event_date,
          ars.ArrestSurrenderTypeID AS event_type,
          acc.AccusedName           AS subject
        FROM ArrestSurrender ars
          JOIN Accused acc ON ars.AccusedMasterID = acc.AccusedMasterID
        WHERE ars.CaseMasterID = $1
        ORDER BY ars.ArrestSurrenderDate
      `, [caseMasterID]),
      db.query(`
        SELECT
          ChargesheetDate   AS event_date,
          FiledInCourtDate  AS court_date,
          NextHearingDate   AS hearing_date,
          RemarksText       AS remarks
        FROM ChargesheetDetails
        WHERE CaseMasterID = $1
        ORDER BY ChargesheetDate
      `, [caseMasterID]),
    ]);

    if (caseResult.rowCount === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: `Case ${caseMasterID} not found.` });
    }

    const caseData = caseResult.rows[0];
    const firDate = new Date(caseData.fir_date);
    const now = new Date();

    // Build chronological milestones
    const milestones = [
      {
        event: 'FIR Registered',
        date: caseData.fir_date,
        daysFromFIR: 0,
        status: 'COMPLETED',
      },
    ];

    for (const arrest of arrestsResult.rows) {
      const days = Math.round((new Date(arrest.event_date) - firDate) / 86400000);
      milestones.push({
        event: arrest.event_type === 2 ? 'Surrender' : 'Arrest',
        subject: arrest.subject,
        date: arrest.event_date,
        daysFromFIR: days,
        status: 'COMPLETED',
      });
    }

    if (chargesheetResult.rowCount > 0) {
      const cs = chargesheetResult.rows[0];
      milestones.push({
        event: 'Chargesheet Filed',
        date: cs.event_date,
        daysFromFIR: Math.round((new Date(cs.event_date) - firDate) / 86400000),
        status: 'COMPLETED',
        courtDate: cs.court_date,
        nextHearing: cs.hearing_date,
      });
    } else {
      // Case not yet chargesheeted — compute lag
      const pendingDays = Math.round((now - firDate) / 86400000);
      milestones.push({
        event: 'Chargesheet Pending',
        date: null,
        daysFromFIR: null,
        pendingDays,
        status: pendingDays > 60 ? 'BOTTLENECK' : 'PENDING',
        bottleneckNote: pendingDays > 60 ? `Chargesheet overdue by ${pendingDays - 60} days beyond standard 60-day window` : null,
      });
    }

    res.json({
      success: true,
      case: caseData,
      milestones,
      totalMilestones: milestones.length,
      isBottleneck: milestones.some(m => m.status === 'BOTTLENECK'),
    });
  } catch (err) {
    console.error('[Analytics] /victim-journey error:', err.message);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

module.exports = router;
