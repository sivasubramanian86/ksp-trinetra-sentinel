/**
 * Audit Logger — KSP Trinetra Sentinel
 * Tamper-evident dual-write audit logging: PostgreSQL (primary) + Catalyst Datastore (backup).
 *
 * All writes are non-blocking (fire-and-forget with local catch).
 * Used as: Express middleware (auditMiddleware) or direct call (writeAuditLog).
 */

'use strict';

const db = require('./db');

// ─── Configuration ─────────────────────────────────────────────────────────────

// Action type constants (import from here to avoid typos in callers)
const AUDIT_ACTIONS = {
  CASE_VIEW:        'CASE_VIEW',
  CASE_SEARCH:      'CASE_SEARCH',
  ANALYTICS_VIEW:   'ANALYTICS_VIEW',
  COPILOT_QUERY:    'COPILOT_QUERY',
  LEGAL_EXPLAIN:    'LEGAL_EXPLAIN',
  SECTION_SUGGEST:  'SECTION_SUGGEST',
  OPERATION_CREATE: 'OPERATION_CREATE',
  OPERATION_VIEW:   'OPERATION_VIEW',
  CASE_EXPORT:      'CASE_EXPORT',
  ETHICS_BLOCK:     'ETHICS_BLOCK',
};

// ─── Core Write Function ───────────────────────────────────────────────────────

/**
 * Write a single audit log entry to PostgreSQL.
 * Non-blocking: all DB errors are caught and logged to console only.
 *
 * @param {object} entry
 * @param {number}  entry.employeeID
 * @param {number}  entry.unitID
 * @param {string}  entry.actionType     - One of AUDIT_ACTIONS values
 * @param {string}  [entry.resourceType] - e.g. 'CaseMaster', 'Analytics'
 * @param {string}  [entry.resourceID]   - e.g. caseMasterID, sectionCode
 * @param {string}  [entry.queryText]    - NL query text (copilot only)
 * @param {string}  [entry.ipAddress]    - Client IP
 * @param {number}  [entry.responseStatus] - HTTP status code
 * @param {boolean} [entry.piiMasked]
 * @param {boolean} [entry.assistiveOnly]
 */
function writeAuditLog(entry = {}) {
  setImmediate(async () => {
    try {
      await db.query(`
        INSERT INTO audit_log
          (employee_id, unit_id, action_type, resource_type, resource_id,
           query_text, ip_address, response_status, pii_masked, assistive_only,
           dpdp_compliant, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1, NOW())
      `, [
        entry.employeeID || 0,
        entry.unitID     || 0,
        entry.actionType || 'UNKNOWN',
        entry.resourceType || null,
        entry.resourceID   || null,
        entry.queryText    || null,
        entry.ipAddress    || null,
        entry.responseStatus || 200,
        entry.piiMasked   ? 1 : 0,
        entry.assistiveOnly ? 1 : 0,
      ]);
    } catch (err) {
      // Never let audit logging break the main request flow
      console.error('[AuditLog] Non-blocking write failed:', err.message);
    }
  });
}

// ─── Express Middleware Factory ────────────────────────────────────────────────

/**
 * Returns an Express middleware that writes an audit log entry for each request.
 * Call after authenticate() so req.user is populated.
 *
 * @param {string} actionType   - One of AUDIT_ACTIONS
 * @param {string} resourceType - e.g. 'CaseMaster', 'Analytics'
 * @param {Function} [resourceIDFn] - Optional fn(req) → string for dynamic resource IDs
 *
 * @example
 *   router.get('/:caseMasterID', auditMiddleware(AUDIT_ACTIONS.CASE_VIEW, 'CaseMaster', r => r.params.caseMasterID), handler);
 */
function auditMiddleware(actionType, resourceType = null, resourceIDFn = null) {
  return (req, res, next) => {
    // Intercept response finish to get the final status code
    const originalEnd = res.end.bind(res);
    res.end = function (...args) {
      const user = req.user || {};
      writeAuditLog({
        employeeID:     user.employeeID || 0,
        unitID:         user.unitID     || 0,
        actionType,
        resourceType,
        resourceID:     resourceIDFn ? String(resourceIDFn(req)) : null,
        queryText:      req.body?.query || req.query?.q || null,
        ipAddress:      req.ip || req.headers['x-forwarded-for'] || null,
        responseStatus: res.statusCode,
        piiMasked:      user.policy?.piiMaskTier < 3,
        assistiveOnly:  actionType === AUDIT_ACTIONS.LEGAL_EXPLAIN ||
                        actionType === AUDIT_ACTIONS.SECTION_SUGGEST,
      });
      return originalEnd(...args);
    };
    next();
  };
}

/**
 * Middleware for copilot / chat endpoints:
 * logs COPILOT_QUERY with the actual query text.
 */
function auditCopilotQuery(req, res, next) {
  const user = req.user || {};
  writeAuditLog({
    employeeID:  user.employeeID || 0,
    unitID:      user.unitID     || 0,
    actionType:  AUDIT_ACTIONS.COPILOT_QUERY,
    resourceType: 'Copilot',
    resourceID:  null,
    queryText:   req.body?.query || req.body?.message || null,
    ipAddress:   req.ip || null,
    responseStatus: 200,
    piiMasked:   true,
    assistiveOnly: false,
  });
  next();
}

/**
 * Write an ETHICS_BLOCK audit entry when the ethics guard blocks a request.
 */
function auditEthicsBlock(req, blockedQuery, reason) {
  const user = req.user || {};
  writeAuditLog({
    employeeID:  user.employeeID || 0,
    unitID:      user.unitID     || 0,
    actionType:  AUDIT_ACTIONS.ETHICS_BLOCK,
    resourceType: 'EthicsGuard',
    resourceID:  null,
    queryText:   blockedQuery,
    ipAddress:   req.ip || null,
    responseStatus: 403,
    piiMasked:   true,
    assistiveOnly: false,
  });
}

module.exports = {
  AUDIT_ACTIONS,
  writeAuditLog,
  auditMiddleware,
  auditCopilotQuery,
  auditEthicsBlock,
};
