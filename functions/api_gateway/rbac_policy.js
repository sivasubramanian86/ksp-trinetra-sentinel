/**
 * RBAC Policy Table — KSP Trinetra Sentinel
 *
 * Declarative policy mapping every role to its allowed endpoints,
 * data scope, PII mask tier, and clearance level.
 *
 * Anchored on Employee.RankID → Rank.ClearanceLevel from the FIR ER schema.
 *
 * Clearance levels (from Rank seed data):
 *   1 = Constable / Head Constable (Beat Officer)
 *   2 = ASI / SI (Investigating Officer)
 *   3 = PI / DySP (SHO / Sub-Inspector level)
 *   4 = SP / DCP (Superintendent / District level)
 *   5 = IGP / ADGP (Zone / Range level)
 *   6 = DGP / HQ_ANALYST (State-wide)
 */

'use strict';

/**
 * PII mask tiers:
 *   0 = No access to PII fields
 *   1 = Partial: mask name to initials, mask phone, mask address
 *   2 = Standard: show name, mask phone and Aadhaar
 *   3 = Full: all fields visible
 */
const PII_MASK_TIERS = {
  FULL_REDACT: 0,
  PARTIAL: 1,
  STANDARD: 2,
  UNMASKED: 3,
};

/**
 * Case scope levels:
 *   'OWN_CASES_ONLY'    — only cases where PolicePersonID = this officer
 *   'OWN_UNIT'          — all cases where PoliceStationID = officer's UnitID
 *   'DISTRICT'          — all cases in officer's DistrictID
 *   'ZONE'              — all cases across zone (unit hierarchy)
 *   'STATE_WIDE'        — all cases, no restriction
 */
const CASE_SCOPE = {
  OWN_CASES_ONLY: 'OWN_CASES_ONLY',
  OWN_UNIT: 'OWN_UNIT',
  DISTRICT: 'DISTRICT',
  ZONE: 'ZONE',
  STATE_WIDE: 'STATE_WIDE',
};

/**
 * Core RBAC policy.
 * Role keys map directly to values returned by the JWT / Catalyst auth context.
 */
const RBAC_POLICY = {
  CONSTABLE: {
    clearanceLevel: 1,
    caseScope: CASE_SCOPE.OWN_UNIT,
    piiMaskTier: PII_MASK_TIERS.FULL_REDACT,
    allowedEndpoints: [
      'GET /api/health',
      'GET /api/v1/cases',              // limited columns, own unit only
    ],
    analyticsAccess: false,
    copilotAccess: false,
    legalLayerAccess: false,
    operationPlanAccess: 'READ',
    auditWrite: true,
  },
  IO: {
    clearanceLevel: 2,
    caseScope: CASE_SCOPE.OWN_UNIT,
    piiMaskTier: PII_MASK_TIERS.PARTIAL,
    allowedEndpoints: [
      'GET /api/health',
      'GET /api/v1/cases',
      'GET /api/v1/cases/:id',
      'POST /api/v1/cases/:id/auditlog',
      'GET /api/v1/analytics/victim-journey/:id',
    ],
    analyticsAccess: 'UNIT_ONLY',
    copilotAccess: true,
    legalLayerAccess: true,
    operationPlanAccess: 'READ',
    auditWrite: true,
  },
  SHO: {
    clearanceLevel: 3,
    caseScope: CASE_SCOPE.OWN_UNIT,
    piiMaskTier: PII_MASK_TIERS.STANDARD,
    allowedEndpoints: [
      'GET /api/health',
      'GET /api/v1/cases',
      'GET /api/v1/cases/:id',
      'GET /api/v1/cases/search',
      'POST /api/v1/cases/:id/auditlog',
      'GET /api/v1/analytics/snapshot',
      'GET /api/v1/analytics/chargesheet-lag',
      'GET /api/v1/analytics/arrest-performance',
      'GET /api/v1/analytics/victim-journey/:id',
      'POST /api/v1/operations/plan',
      'GET /api/v1/operations/plans',
      'POST /api/chat',
      'GET /api/hotspots/forecast',
    ],
    analyticsAccess: 'UNIT_ONLY',
    copilotAccess: true,
    legalLayerAccess: true,
    operationPlanAccess: 'READ_WRITE',
    auditWrite: true,
  },
  DCP: {
    clearanceLevel: 4,
    caseScope: CASE_SCOPE.DISTRICT,
    piiMaskTier: PII_MASK_TIERS.STANDARD,
    allowedEndpoints: [
      'GET /api/health',
      'GET /api/v1/cases',
      'GET /api/v1/cases/:id',
      'GET /api/v1/cases/search',
      'POST /api/v1/cases/:id/auditlog',
      'GET /api/v1/analytics/snapshot',
      'GET /api/v1/analytics/chargesheet-lag',
      'GET /api/v1/analytics/arrest-performance',
      'GET /api/v1/analytics/victim-journey/:id',
      'GET /api/v1/operations/plans',
      'POST /api/chat',
      'GET /api/hotspots/forecast',
      'POST /api/graph/story',
    ],
    analyticsAccess: 'DISTRICT',
    copilotAccess: true,
    legalLayerAccess: true,
    operationPlanAccess: 'READ',
    auditWrite: true,
  },
  IGP: {
    clearanceLevel: 5,
    caseScope: CASE_SCOPE.ZONE,
    piiMaskTier: PII_MASK_TIERS.STANDARD,
    allowedEndpoints: ['*'],  // all endpoints, zone-scoped data
    analyticsAccess: 'ZONE',
    copilotAccess: true,
    legalLayerAccess: true,
    operationPlanAccess: 'READ',
    auditWrite: true,
  },
  ADGP: {
    clearanceLevel: 5,
    caseScope: CASE_SCOPE.ZONE,
    piiMaskTier: PII_MASK_TIERS.UNMASKED,
    allowedEndpoints: ['*'],
    analyticsAccess: 'ZONE',
    copilotAccess: true,
    legalLayerAccess: true,
    operationPlanAccess: 'READ',
    auditWrite: true,
  },
  DGP: {
    clearanceLevel: 6,
    caseScope: CASE_SCOPE.STATE_WIDE,
    piiMaskTier: PII_MASK_TIERS.UNMASKED,
    allowedEndpoints: ['*'],
    analyticsAccess: 'STATE_WIDE',
    copilotAccess: true,
    legalLayerAccess: true,
    operationPlanAccess: 'READ',
    auditWrite: true,
  },
  HQ_ANALYST: {
    clearanceLevel: 6,
    caseScope: CASE_SCOPE.STATE_WIDE,
    piiMaskTier: PII_MASK_TIERS.UNMASKED,
    allowedEndpoints: ['*'],
    analyticsAccess: 'STATE_WIDE',
    copilotAccess: true,
    legalLayerAccess: true,
    operationPlanAccess: 'READ_WRITE',
    auditWrite: true,
  },
  // Legacy roles preserved for backward compatibility with existing callers
  COMMISSIONER: {
    clearanceLevel: 6,
    caseScope: CASE_SCOPE.STATE_WIDE,
    piiMaskTier: PII_MASK_TIERS.UNMASKED,
    allowedEndpoints: ['*'],
    analyticsAccess: 'STATE_WIDE',
    copilotAccess: true,
    legalLayerAccess: true,
    operationPlanAccess: 'READ_WRITE',
    auditWrite: true,
  },
  ANALYST: {
    clearanceLevel: 6,
    caseScope: CASE_SCOPE.STATE_WIDE,
    piiMaskTier: PII_MASK_TIERS.UNMASKED,
    allowedEndpoints: ['*'],
    analyticsAccess: 'STATE_WIDE',
    copilotAccess: true,
    legalLayerAccess: true,
    operationPlanAccess: 'READ_WRITE',
    auditWrite: true,
  },
  PATROL_OFFICER: {
    clearanceLevel: 2,
    caseScope: CASE_SCOPE.OWN_UNIT,
    piiMaskTier: PII_MASK_TIERS.PARTIAL,
    allowedEndpoints: [
      'GET /api/health',
      'GET /api/hotspots/forecast',
      'POST /api/chat',
    ],
    analyticsAccess: false,
    copilotAccess: true,
    legalLayerAccess: true,
    operationPlanAccess: 'READ',
    auditWrite: true,
  },
  STATION_HOUSE_OFFICER: {  // alias for SHO
    clearanceLevel: 3,
    caseScope: CASE_SCOPE.OWN_UNIT,
    piiMaskTier: PII_MASK_TIERS.STANDARD,
    allowedEndpoints: ['*'],
    analyticsAccess: 'UNIT_ONLY',
    copilotAccess: true,
    legalLayerAccess: true,
    operationPlanAccess: 'READ_WRITE',
    auditWrite: true,
  },
  BEAT_OFFICER: {  // alias for CONSTABLE
    clearanceLevel: 1,
    caseScope: CASE_SCOPE.OWN_UNIT,
    piiMaskTier: PII_MASK_TIERS.FULL_REDACT,
    allowedEndpoints: ['GET /api/health', 'GET /api/v1/cases'],
    analyticsAccess: false,
    copilotAccess: false,
    legalLayerAccess: false,
    operationPlanAccess: 'READ',
    auditWrite: true,
  },
};

/**
 * Returns the RBAC policy for a given role.
 * Falls back to the most restrictive policy if role is unknown.
 * @param {string} role
 * @returns {object} Policy object
 */
function getRolePolicy(role) {
  return RBAC_POLICY[role] || RBAC_POLICY.CONSTABLE;
}

/**
 * Builds a SQL WHERE fragment to scope queries to the officer's jurisdiction.
 * @param {object} employeeContext - { employeeID, unitID, districtID, role }
 * @returns {object} { clause: string, params: any[] }
 */
function buildScopeClause(employeeContext) {
  const policy = getRolePolicy(employeeContext.role);

  switch (policy.caseScope) {
    case CASE_SCOPE.OWN_CASES_ONLY:
      return {
        clause: 'cm.PolicePersonID = $1',
        params: [employeeContext.employeeID],
      };
    case CASE_SCOPE.OWN_UNIT:
      return {
        clause: 'cm.PoliceStationID = $1',
        params: [employeeContext.unitID],
      };
    case CASE_SCOPE.DISTRICT:
      return {
        clause: 'u.DistrictID = $1',
        params: [employeeContext.districtID],
      };
    case CASE_SCOPE.ZONE:
      // Zone = all units whose parent unit chain includes the officer's unit
      // Simplified: district-level scope for MVP; full hierarchy traversal in v2
      return {
        clause: 'u.DistrictID = $1',
        params: [employeeContext.districtID],
      };
    case CASE_SCOPE.STATE_WIDE:
    default:
      return { clause: '1=1', params: [] };
  }
}

/**
 * Checks whether a given role is allowed to access a specific endpoint.
 * @param {string} role
 * @param {string} method  - HTTP method (GET, POST, etc.)
 * @param {string} path    - API path (e.g. /api/v1/cases)
 * @returns {boolean}
 */
function isEndpointAllowed(role, method, path) {
  const policy = getRolePolicy(role);
  if (policy.allowedEndpoints.includes('*')) return true;
  const requestKey = `${method} ${path}`;
  // Check for exact match or pattern match (path params)
  return policy.allowedEndpoints.some(allowed => {
    if (allowed === requestKey) return true;
    // Normalize path params (e.g. /api/v1/cases/:id matches /api/v1/cases/123)
    const pattern = allowed.replace(/:[\w]+/g, '[^/]+');
    return new RegExp(`^${pattern}$`).test(requestKey);
  });
}

module.exports = {
  RBAC_POLICY,
  PII_MASK_TIERS,
  CASE_SCOPE,
  getRolePolicy,
  buildScopeClause,
  isEndpointAllowed,
};
