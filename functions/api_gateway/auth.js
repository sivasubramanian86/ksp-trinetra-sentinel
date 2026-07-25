/**
 * Role-Based Access Control (RBAC) & DPDP PII Masking Middleware
 * KSP Trinetra Sentinel — Version 2.0 (FIR Schema Anchored)
 *
 * All original exports (ROLES, authenticate, requireRole, maskPII) are preserved
 * for full backward compatibility with existing callers in index.js, mcp_server.js, etc.
 *
 * New additions:
 *   - authenticateFromCatalyst()  — reads Zoho Catalyst JWT, extracts EmployeeID/UnitID/RankID
 *   - scopeToUnit()               — returns SQL WHERE fragment for RBAC-scoped DB queries
 *   - enrichContext()             — merges legacy header-based context with new RBAC policy
 */

'use strict';

const { getRolePolicy, buildScopeClause, isEndpointAllowed, PII_MASK_TIERS } = require('./rbac_policy');

// ─── Legacy Role Map (preserved for backward compatibility) ──────────────────
const ROLES = {
  BEAT_OFFICER: 1,
  PATROL_OFFICER: 1,
  CONSTABLE: 1,
  IO: 2,
  STATION_HOUSE_OFFICER: 2,
  SHO: 2,
  DCP: 4,
  IGP: 5,
  ADGP: 5,
  DGP: 6,
  COMMISSIONER: 6,
  HQ_ANALYST: 6,
  ANALYST: 6,
};

// ─── Authentication Middleware ───────────────────────────────────────────────

/**
 * Primary authentication middleware.
 * Reads user identity from:
 *   1. Zoho Catalyst JWT token (production path)
 *   2. Request headers (local development / fallback)
 * Sets req.user with full identity + RBAC policy context.
 */
function authenticate(req, res, next) {
  // Attempt Catalyst JWT extraction first
  const catalystContext = _extractCatalystJWT(req);

  if (catalystContext) {
    req.user = catalystContext;
  } else {
    // Fallback: header-based context (dev/local mode)
    const roleHeader = req.headers['x-user-role'] || 'COMMISSIONER';
    const validRole = ROLES[roleHeader] !== undefined ? roleHeader : 'COMMISSIONER';

    req.user = {
      id: req.headers['x-user-id'] || 'USR-SYNTHETIC-99',
      employeeID: parseInt(req.headers['x-employee-id'] || '99', 10),
      unitID: parseInt(req.headers['x-unit-id'] || '1', 10),
      districtID: parseInt(req.headers['x-district-id'] || '1', 10),
      rankID: parseInt(req.headers['x-rank-id'] || '11', 10),
      role: validRole,
      clearanceLevel: ROLES[validRole] || 3,
      division: req.headers['x-user-division'] || 'BENGALURU_CENTRAL',
      authMode: 'HEADER_FALLBACK',
    };
  }

  // Attach RBAC policy to user context
  req.user.policy = getRolePolicy(req.user.role);
  next();
}

/**
 * Zoho Catalyst JWT extraction.
 * In Catalyst Advanced I/O functions, the authenticated user context is
 * available via the x-catalyst-auth header (base64-encoded JSON).
 * @private
 */
function _extractCatalystJWT(req) {
  const catalystAuthHeader = req.headers['x-catalyst-auth'];
  if (!catalystAuthHeader) return null;

  try {
    const decoded = Buffer.from(catalystAuthHeader, 'base64').toString('utf8');
    const catalystUser = JSON.parse(decoded);

    // Map Catalyst user attributes to KSP identity model
    // Catalyst user object shape: { user_id, email, first_name, last_name, role_details }
    const roleFromCatalyst = _mapCatalystRoleToKSP(catalystUser.role_details);
    return {
      id: String(catalystUser.user_id || 'USR-CATALYST'),
      email: catalystUser.email,
      employeeID: catalystUser.employee_id || catalystUser.user_id,
      unitID: catalystUser.unit_id || 1,
      districtID: catalystUser.district_id || 1,
      rankID: catalystUser.rank_id || 5,
      role: roleFromCatalyst,
      clearanceLevel: ROLES[roleFromCatalyst] || 2,
      division: catalystUser.division || 'UNKNOWN',
      authMode: 'CATALYST_JWT',
    };
  } catch (e) {
    console.warn('[Auth] Catalyst JWT parse failed, falling back to headers:', e.message);
    return null;
  }
}

/**
 * Maps Catalyst role string to KSP RBAC role.
 * @private
 */
function _mapCatalystRoleToKSP(roleDetails) {
  if (!roleDetails) return 'IO';
  const roleName = (roleDetails.role_name || '').toUpperCase();
  const knownRoles = Object.keys(ROLES);
  return knownRoles.find(r => roleName.includes(r)) || 'IO';
}

// ─── Alias for backward compatibility ────────────────────────────────────────
/**
 * authenticateFromCatalyst is the same as authenticate but named explicitly
 * for clarity in new code that imports it directly.
 */
const authenticateFromCatalyst = authenticate;

// ─── Role Verification Middleware ─────────────────────────────────────────────

/**
 * Middleware factory: require one of the specified roles.
 * Preserved: original signature `verifyRole(allowedRoles)`.
 * Added: also checks isEndpointAllowed() from RBAC policy for finer control.
 */
function verifyRole(allowedRoles = []) {
  return (req, res, next) => {
    // Ensure authenticate() ran first
    const userRole = (req.user && req.user.role) || req.headers['x-user-role'] || 'COMMISSIONER';
    const policy = getRolePolicy(userRole);

    // Endpoint-level check using RBAC policy (new)
    const method = req.method.toUpperCase();
    const path = req.path;
    const endpointAllowed = policy.allowedEndpoints.includes('*') ||
      isEndpointAllowed(userRole, method, path);

    // Legacy role-list check (preserved)
    const roleListAllowed = allowedRoles.length === 0 ||
      allowedRoles.includes(userRole) ||
      userRole === 'COMMISSIONER' ||
      userRole === 'DGP' ||
      userRole === 'HQ_ANALYST';

    if (!endpointAllowed || !roleListAllowed) {
      return res.status(403).json({
        error: 'ACCESS_DENIED',
        message: `Role '${userRole}' (clearance ${policy.clearanceLevel}) is not authorized for ${method} ${path}.`,
        requiredRoles: allowedRoles,
        complianceNote: 'KSP RBAC Policy v2.0 — DPDP Act & KSP Access Control Protocol Enforced',
      });
    }

    next();
  };
}

// ─── SQL Scope Helper ─────────────────────────────────────────────────────────

/**
 * Returns a parameterized SQL WHERE fragment scoped to the officer's jurisdiction.
 * Used in all FIR query builders to enforce data-layer RBAC.
 *
 * @param {object} req - Express request (after authenticate() ran)
 * @returns {{ clause: string, params: any[], offset: number }}
 *   offset = next $N index to use in query params (scope params come first)
 *
 * @example
 *   const { clause, params, offset } = scopeToUnit(req);
 *   const sql = `SELECT * FROM CaseMaster cm JOIN Unit u ON cm.PoliceStationID = u.UnitID
 *                WHERE ${clause} AND cm.GravityOffenceID = $${offset}`;
 *   const result = await db.query(sql, [...params, gravityID]);
 */
function scopeToUnit(req) {
  const user = req.user || {};
  const scopeResult = buildScopeClause({
    employeeID: user.employeeID || 99,
    unitID: user.unitID || 1,
    districtID: user.districtID || 1,
    role: user.role || 'COMMISSIONER',
  });

  return {
    clause: scopeResult.clause,
    params: scopeResult.params,
    offset: scopeResult.params.length + 1,  // next available $N index
  };
}

// ─── PII Masking ──────────────────────────────────────────────────────────────

/**
 * PII Sanitization based on RBAC policy mask tier.
 * Preserved: original signature `maskPII(data, userRole)`.
 * Enhanced: uses PII_MASK_TIERS from rbac_policy.js for consistent behavior.
 *
 * @param {object|array} data  - Raw response data
 * @param {string} userRole    - The officer's role
 * @returns {object|array}     - PII-masked response
 */
function maskPII(data, userRole) {
  const policy = getRolePolicy(userRole);
  const tier = policy.piiMaskTier;

  // Tier 3 = Unmasked (senior officers / HQ)
  if (tier === PII_MASK_TIERS.UNMASKED) {
    return data;
  }

  const jsonString = JSON.stringify(data);
  let masked = jsonString;

  if (tier === PII_MASK_TIERS.FULL_REDACT) {
    // Tier 0: redact all person-identifying fields
    masked = masked
      .replace(/"(VictimName|AccusedName|ComplainantName)":\s*"[^"]+"/g, '"$1": "[IDENTITY PROTECTED]"')
      .replace(/"phone":\s*"(\+91)?\d{10}"/g, '"phone": "XXXXXXXXXX"')
      .replace(/"aadhaar":\s*"\d{12}"/g, '"aadhaar": "XXXX-XXXX-XXXX"')
      .replace(/"address":\s*"[^"]+"/g, '"address": "[ADDRESS PROTECTED]"')
      .replace(/"BriefFacts":\s*"[^"]+"/g, '"BriefFacts": "[CASE NARRATIVE RESTRICTED]"');

  } else if (tier === PII_MASK_TIERS.PARTIAL) {
    // Tier 1: initials only for names, mask phone/aadhaar
    masked = masked
      .replace(/"(VictimName|AccusedName|ComplainantName)":\s*"([A-Za-z])([^"]+)"/g,
        (_, field, initial) => `"${field}": "${initial}***"`)
      .replace(/"phone":\s*"(\+91)?(\d{4})\d{6}"/g, '"phone": "$2XXXXXX"')
      .replace(/"aadhaar":\s*"\d{12}"/g, '"aadhaar": "XXXX-XXXX-XXXX"')
      .replace(/"address":\s*"[^"]+"/g, '"address": "[ADDRESS RESTRICTED]"');

  } else if (tier === PII_MASK_TIERS.STANDARD) {
    // Tier 2: show names, mask phone and aadhaar only
    masked = masked
      .replace(/"phone":\s*"(\+91)?\d{10}"/g, '"phone": "XXXXXXXXXX"')
      .replace(/"aadhaar":\s*"\d{12}"/g, '"aadhaar": "XXXX-XXXX-XXXX"');
  }

  try {
    return JSON.parse(masked);
  } catch {
    return data; // safe fallback: return original if JSON parse fails
  }
}

/**
 * Enriches req.user with a complete KSP officer context.
 * Useful for new endpoints that need richer context than the legacy format.
 * @param {object} req
 * @returns {object} Enriched context
 */
function enrichContext(req) {
  const user = req.user || {};
  return {
    ...user,
    policy: user.policy || getRolePolicy(user.role || 'IO'),
    scopeClause: scopeToUnit(req),
  };
}

module.exports = {
  // ── Preserved Legacy Exports ──────────────────────────────────────────────
  ROLES,
  authenticate,
  requireRole: verifyRole,
  verifyRole,
  maskPII,
  // ── New Exports ──────────────────────────────────────────────────────────
  authenticateFromCatalyst,
  scopeToUnit,
  enrichContext,
};
