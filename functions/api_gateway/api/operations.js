/**
 * Operations API Router — KSP Trinetra Sentinel
 * Patrol Operation Plan CRUD (SHO+)
 *
 * OperationPlan table fields align with 09_auxiliary_tables.sql definition.
 * Dual-written to both PostgreSQL and Catalyst Datastore for redundancy.
 */

'use strict';

const express = require('express');
const router = express.Router();

const { authenticate, verifyRole, scopeToUnit } = require('../auth');
const db = require('../db');

router.use(authenticate);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/operations/plan
// Create a new patrol operation plan (SHO and above)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/plan', verifyRole(['SHO', 'DCP', 'IGP', 'ADGP', 'DGP', 'COMMISSIONER', 'HQ_ANALYST', 'ANALYST', 'STATION_HOUSE_OFFICER']), async (req, res) => {
  try {
    const {
      plan_name,
      plan_type = 'PATROL',
      linked_case_id = null,
      hotspot_grid_ref = null,
      operation_date,
      shift_start_time = null,
      shift_end_time = null,
      patrol_routes = [],
      resource_allocation = {},
      briefing_notes = '',
    } = req.body;

    if (!plan_name || !operation_date) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'plan_name and operation_date are required.' });
    }

    const sql = `
      INSERT INTO operation_plan (
        plan_name, plan_type, status,
        responsible_unit_id, created_by_id, linked_case_id,
        hotspot_grid_ref, patrol_routes, resource_allocation,
        operation_date, shift_start_time, shift_end_time, briefing_notes
      ) VALUES (
        $1, $2, 'DRAFT',
        $3, $4, $5,
        $6, $7::jsonb, $8::jsonb,
        $9, $10, $11, $12
      ) RETURNING plan_id, plan_name, status, operation_date
    `;

    const result = await db.query(sql, [
      plan_name,
      plan_type,
      req.user.unitID || 1,
      req.user.employeeID || 99,
      linked_case_id,
      hotspot_grid_ref,
      JSON.stringify(patrol_routes),
      JSON.stringify(resource_allocation),
      operation_date,
      shift_start_time,
      shift_end_time,
      briefing_notes,
    ]);

    res.status(201).json({ success: true, plan: result.rows[0] });
  } catch (err) {
    console.error('[Operations] POST /plan error:', err.message);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/operations/plans
// List operation plans for officer's unit (RBAC-scoped)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/plans', verifyRole(['SHO', 'DCP', 'IGP', 'ADGP', 'DGP', 'COMMISSIONER', 'HQ_ANALYST', 'ANALYST', 'IO', 'PATROL_OFFICER', 'STATION_HOUSE_OFFICER']), async (req, res) => {
  try {
    const { clause: scopeClause, params: scopeParams, offset } = scopeToUnit(req);

    // Map case scope to operation_plan scope
    // For unit/district scope, filter by responsible_unit_id via Unit table
    const statusFilter = req.query.status || null;

    let paramIdx = offset;
    const conditions = [];
    const params = [...scopeParams];

    // Simplest scope for OperationPlan: filter by unit
    if (req.user.policy.caseScope === 'OWN_UNIT') {
      conditions.push(`op.responsible_unit_id = $${paramIdx++}`);
      params.push(req.user.unitID || 1);
    }

    if (statusFilter) {
      conditions.push(`op.status = $${paramIdx++}`);
      params.push(statusFilter.toUpperCase());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        op.*,
        e.FirstName  AS created_by_name,
        u.UnitName   AS unit_name
      FROM operation_plan op
        LEFT JOIN Employee e ON op.created_by_id       = e.EmployeeID
        LEFT JOIN Unit     u ON op.responsible_unit_id = u.UnitID
      ${whereClause}
      ORDER BY op.operation_date DESC, op.created_at DESC
      LIMIT 50
    `;

    const result = await db.query(sql, params);
    res.json({ success: true, count: result.rowCount, plans: result.rows });
  } catch (err) {
    console.error('[Operations] GET /plans error:', err.message);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/operations/plans/:planID/status
// Approve or activate a plan (DCP+)
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/plans/:planID/status', verifyRole(['DCP', 'IGP', 'ADGP', 'DGP', 'COMMISSIONER', 'HQ_ANALYST']), async (req, res) => {
  try {
    const planID = parseInt(req.params.planID, 10);
    const { status, outcome_notes = '' } = req.body;

    const allowedStatuses = ['APPROVED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
    if (!allowedStatuses.includes((status || '').toUpperCase())) {
      return res.status(400).json({ error: 'INVALID_STATUS', message: `Status must be one of: ${allowedStatuses.join(', ')}` });
    }

    const sql = `
      UPDATE operation_plan
      SET status = $1, approved_by_id = $2, outcome_notes = $3, updated_at = NOW()
      WHERE plan_id = $4
      RETURNING plan_id, plan_name, status
    `;

    const result = await db.query(sql, [status.toUpperCase(), req.user.employeeID, outcome_notes, planID]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: `Plan ${planID} not found.` });
    }

    res.json({ success: true, plan: result.rows[0] });
  } catch (err) {
    console.error('[Operations] PATCH /plans/:id/status error:', err.message);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

module.exports = router;
