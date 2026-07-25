/**
 * FIR Cases API Router — KSP Trinetra Sentinel
 * RBAC-scoped REST endpoints over the official FIR ER schema.
 *
 * All queries use parameterized SQL; scope is enforced at the DB layer
 * via scopeToUnit() from auth.js — never trust-only at middleware.
 */

'use strict';

const express = require('express');
const router = express.Router();

const { authenticate, verifyRole, maskPII, scopeToUnit } = require('../auth');
const { getRolePolicy } = require('../rbac_policy');
const db = require('../db');
const { auditMiddleware, auditCopilotQuery, AUDIT_ACTIONS } = require('../audit_logger');

router.use(authenticate);


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/cases
// List FIR cases — RBAC-scoped, filterable by gravity, status, date, unit
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', verifyRole(['IO', 'SHO', 'DCP', 'IGP', 'ADGP', 'DGP', 'COMMISSIONER', 'HQ_ANALYST', 'ANALYST', 'PATROL_OFFICER', 'CONSTABLE', 'BEAT_OFFICER']),
  auditMiddleware(AUDIT_ACTIONS.CASE_SEARCH, 'CaseMaster'),
  async (req, res) => {
  try {
    const { clause: scopeClause, params: scopeParams, offset } = scopeToUnit(req);

    // Query filters from request
    const gravityOffenceID  = req.query.gravity   ? parseInt(req.query.gravity, 10)   : null;
    const caseStatusID      = req.query.status    ? parseInt(req.query.status, 10)    : null;
    const fromDate          = req.query.from      || null;
    const toDate            = req.query.to        || null;
    const page              = Math.max(1, parseInt(req.query.page || '1', 10));
    const pageSize          = Math.min(100, parseInt(req.query.limit || '25', 10));
    const offsetRows        = (page - 1) * pageSize;

    // Dynamic WHERE clause builder
    let paramIdx = offset;
    const conditions = [scopeClause];
    const params = [...scopeParams];

    if (gravityOffenceID) { conditions.push(`cm.GravityOffenceID = $${paramIdx++}`); params.push(gravityOffenceID); }
    if (caseStatusID)     { conditions.push(`cm.CaseStatusID = $${paramIdx++}`);     params.push(caseStatusID); }
    if (fromDate)         { conditions.push(`cm.CrimeRegisteredDate >= $${paramIdx++}`); params.push(fromDate); }
    if (toDate)           { conditions.push(`cm.CrimeRegisteredDate <= $${paramIdx++}`); params.push(toDate); }

    params.push(pageSize, offsetRows);
    const limitOffset = `LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;

    const sql = `
      SELECT
        cm.CaseMasterID,
        cm.CrimeNo,
        cm.CaseNo,
        cm.CrimeRegisteredDate,
        cm.BriefFacts,
        cm.GravityOffenceID,
        go.GravityOffenceName,
        cm.CaseStatusID,
        csm.CaseStatusName,
        u.UnitName    AS PoliceStation,
        e.FirstName   AS InvestigatingOfficer,
        ch.CrimeGroupName   AS CrimeMajorHead,
        cm.latitude,
        cm.longitude
      FROM CaseMaster cm
        LEFT JOIN Unit              u   ON cm.PoliceStationID   = u.UnitID
        LEFT JOIN GravityOffence    go  ON cm.GravityOffenceID  = go.GravityOffenceID
        LEFT JOIN CaseStatusMaster  csm ON cm.CaseStatusID      = csm.CaseStatusID
        LEFT JOIN Employee          e   ON cm.PolicePersonID     = e.EmployeeID
        LEFT JOIN CrimeHead         ch  ON cm.CrimeMajorHeadID  = ch.CrimeHeadID
      WHERE ${conditions.join(' AND ')}
      ORDER BY cm.CrimeRegisteredDate DESC
      ${limitOffset}
    `;

    const result = await db.query(sql, params);
    const masked = maskPII(result.rows, req.user.role);

    res.json({
      success: true,
      page,
      pageSize,
      count: result.rowCount,
      cases: masked,
    });
  } catch (err) {
    console.error('[Cases API] GET /cases error:', err.message);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/cases/search
// Schema-aware structured search: gravity + act/section + accused status + date
// ─────────────────────────────────────────────────────────────────────────────
router.get('/search', verifyRole(['SHO', 'DCP', 'IGP', 'ADGP', 'DGP', 'COMMISSIONER', 'HQ_ANALYST', 'ANALYST', 'IO']),
  auditMiddleware(AUDIT_ACTIONS.CASE_SEARCH, 'CaseMaster'),
  async (req, res) => {
  try {
    const { clause: scopeClause, params: scopeParams, offset } = scopeToUnit(req);

    // Supported search params
    const sectionCode   = req.query.section || null;   // e.g. '318' (BNS) or '420' (IPC)
    const actCode       = req.query.act || null;        // e.g. 'BNS' or 'IPC'
    const accusedStatus = req.query.accused_status || null; // 'ABSCONDING', 'ARRESTED', 'SURRENDERED'
    const gravity       = req.query.gravity ? parseInt(req.query.gravity, 10) : null;
    const fromDate      = req.query.from || null;
    const toDate        = req.query.to || null;
    const districtID    = req.query.district ? parseInt(req.query.district, 10) : null;
    const unitID        = req.query.unit ? parseInt(req.query.unit, 10) : null;

    let paramIdx = offset;
    const conditions = [scopeClause];
    const params = [...scopeParams];

    if (gravity)    { conditions.push(`cm.GravityOffenceID = $${paramIdx++}`); params.push(gravity); }
    if (fromDate)   { conditions.push(`cm.CrimeRegisteredDate >= $${paramIdx++}`); params.push(fromDate); }
    if (toDate)     { conditions.push(`cm.CrimeRegisteredDate <= $${paramIdx++}`); params.push(toDate); }
    if (unitID)     { conditions.push(`cm.PoliceStationID = $${paramIdx++}`); params.push(unitID); }
    if (districtID) { conditions.push(`u.DistrictID = $${paramIdx++}`); params.push(districtID); }

    // Act/Section join condition
    let actSectionJoin = '';
    if (sectionCode || actCode) {
      actSectionJoin = `
        JOIN ActSectionAssociation asa ON asa.CaseMasterID = cm.CaseMasterID
        JOIN Section s ON asa.SectionID = s.SectionID
      `;
      if (sectionCode) { conditions.push(`s.SectionCode = $${paramIdx++}`); params.push(sectionCode); }
      if (actCode)     { conditions.push(`asa.ActCode = $${paramIdx++}`);   params.push(actCode); }
    }

    // Accused status filter
    let accusedJoin = '';
    if (accusedStatus) {
      if (accusedStatus === 'ABSCONDING') {
        accusedJoin = `
          JOIN Accused acc ON acc.CaseMasterID = cm.CaseMasterID
          LEFT JOIN ArrestSurrender ars ON ars.AccusedMasterID = acc.AccusedMasterID
        `;
        conditions.push(`ars.ArrestSurrenderID IS NULL`);  // no arrest record = absconding
      } else if (accusedStatus === 'ARRESTED') {
        accusedJoin = `
          JOIN ArrestSurrender ars ON ars.CaseMasterID = cm.CaseMasterID
        `;
        conditions.push(`ars.IsAccused = 1`);
      }
    }

    const sql = `
      SELECT DISTINCT
        cm.CaseMasterID,
        cm.CrimeNo,
        cm.CaseNo,
        cm.CrimeRegisteredDate,
        cm.GravityOffenceID,
        go.GravityOffenceName,
        cm.CaseStatusID,
        csm.CaseStatusName,
        u.UnitName AS PoliceStation,
        e.FirstName AS InvestigatingOfficer,
        cm.latitude,
        cm.longitude
      FROM CaseMaster cm
        LEFT JOIN Unit             u   ON cm.PoliceStationID  = u.UnitID
        LEFT JOIN GravityOffence   go  ON cm.GravityOffenceID = go.GravityOffenceID
        LEFT JOIN CaseStatusMaster csm ON cm.CaseStatusID     = csm.CaseStatusID
        LEFT JOIN Employee         e   ON cm.PolicePersonID   = e.EmployeeID
        ${actSectionJoin}
        ${accusedJoin}
      WHERE ${conditions.join(' AND ')}
      ORDER BY cm.CrimeRegisteredDate DESC
      LIMIT 100
    `;

    const result = await db.query(sql, params);
    const masked = maskPII(result.rows, req.user.role);

    res.json({ success: true, count: result.rowCount, cases: masked });
  } catch (err) {
    console.error('[Cases API] GET /cases/search error:', err.message);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/cases/:caseMasterID
// Full case detail — accused, victims, sections, chargesheet, arrests
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:caseMasterID', verifyRole(['IO', 'SHO', 'DCP', 'IGP', 'ADGP', 'DGP', 'COMMISSIONER', 'HQ_ANALYST', 'ANALYST']),
  auditMiddleware(AUDIT_ACTIONS.CASE_VIEW, 'CaseMaster', r => r.params.caseMasterID),
  async (req, res) => {
  try {
    const { clause: scopeClause, params: scopeParams, offset } = scopeToUnit(req);
    const caseMasterID = parseInt(req.params.caseMasterID, 10);

    if (isNaN(caseMasterID)) {
      return res.status(400).json({ error: 'INVALID_ID', message: 'caseMasterID must be an integer.' });
    }

    // Main case record
    const caseSQL = `
      SELECT
        cm.*,
        go.GravityOffenceName,
        csm.CaseStatusName,
        u.UnitName    AS PoliceStation,
        e.FirstName   AS InvestigatingOfficer,
        e.KGID        AS IOID,
        ch.CrimeGroupName AS CrimeMajorHead,
        csh.CrimeHeadName AS CrimeMinorHead
      FROM CaseMaster cm
        LEFT JOIN Unit             u   ON cm.PoliceStationID   = u.UnitID
        LEFT JOIN GravityOffence   go  ON cm.GravityOffenceID  = go.GravityOffenceID
        LEFT JOIN CaseStatusMaster csm ON cm.CaseStatusID      = csm.CaseStatusID
        LEFT JOIN Employee         e   ON cm.PolicePersonID    = e.EmployeeID
        LEFT JOIN CrimeHead        ch  ON cm.CrimeMajorHeadID  = ch.CrimeHeadID
        LEFT JOIN CrimeSubHead     csh ON cm.CrimeMinorHeadID  = csh.CrimeSubHeadID
      WHERE ${scopeClause} AND cm.CaseMasterID = $${offset}
      LIMIT 1
    `;
    const caseResult = await db.query(caseSQL, [...scopeParams, caseMasterID]);

    if (caseResult.rowCount === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: `Case ${caseMasterID} not found or access denied.` });
    }

    const caseRecord = caseResult.rows[0];

    // Parallel fetch of related records
    const [accusedResult, victimResult, sectionsResult, arrestResult, chargesheetResult] = await Promise.all([
      db.query(`SELECT * FROM Accused WHERE CaseMasterID = $1`, [caseMasterID]),
      db.query(`SELECT * FROM Victim WHERE CaseMasterID = $1`, [caseMasterID]),
      db.query(`
        SELECT asa.IsLegacy, a.ActCode, a.ActDescription, s.SectionCode, s.SectionDescription
        FROM ActSectionAssociation asa
          JOIN Act     a ON asa.ActCode   = a.ActCode
          JOIN Section s ON asa.SectionID = s.SectionID
        WHERE asa.CaseMasterID = $1
        ORDER BY asa.IsLegacy DESC, a.ActCode
      `, [caseMasterID]),
      db.query(`
        SELECT ars.*, e.FirstName AS IOName, e.KGID
        FROM ArrestSurrender ars
          LEFT JOIN Employee e ON ars.IOID = e.EmployeeID
        WHERE ars.CaseMasterID = $1
        ORDER BY ars.ArrestSurrenderDate
      `, [caseMasterID]),
      db.query(`
        SELECT cd.*, e.FirstName AS IOName
        FROM ChargesheetDetails cd
          LEFT JOIN Employee e ON cd.IOID = e.EmployeeID
        WHERE cd.CaseMasterID = $1
        ORDER BY cd.ChargesheetDate
      `, [caseMasterID]),
    ]);

    const detail = {
      case: maskPII(caseRecord, req.user.role),
      accused: maskPII(accusedResult.rows, req.user.role),
      victims: maskPII(victimResult.rows, req.user.role),
      sections: sectionsResult.rows,       // Legal sections — no PII
      arrests: maskPII(arrestResult.rows, req.user.role),
      chargesheet: chargesheetResult.rows, // Chargesheet — no direct PII
    };

    res.json({ success: true, caseMasterID, detail });
  } catch (err) {
    console.error('[Cases API] GET /cases/:id error:', err.message);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/cases/:caseMasterID/auditlog
// Explicit audit log entry when a case is accessed from external UI
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:caseMasterID/auditlog', authenticate, async (req, res) => {
  try {
    const caseMasterID = parseInt(req.params.caseMasterID, 10);
    const { action = 'CASE_VIEW', note = '' } = req.body;

    // Non-blocking write — do not fail the request if audit write fails
    setImmediate(async () => {
      try {
        await db.query(`
          INSERT INTO audit_log
            (employee_id, unit_id, action_type, resource_type, resource_id, query_text, ip_address, response_status, pii_masked, dpdp_compliant)
          VALUES ($1, $2, $3, 'CaseMaster', $4, $5, $6, 200, $7, 1)
        `, [
          req.user.employeeID || 99,
          req.user.unitID || 1,
          action,
          String(caseMasterID),
          note,
          req.ip || req.headers['x-forwarded-for'] || 'UNKNOWN',
          req.user.policy.piiMaskTier < 3 ? 1 : 0,
        ]);
      } catch (auditErr) {
        console.error('[AuditLog] Write failed (non-blocking):', auditErr.message);
      }
    });

    res.json({ success: true, logged: true, caseMasterID, action });
  } catch (err) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

module.exports = router;
