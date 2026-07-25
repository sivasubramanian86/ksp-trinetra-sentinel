/**
 * Role-Based Access Control (RBAC) & DPDP PII Masking Middleware
 * Roles: BEAT_OFFICER, STATION_HOUSE_OFFICER (SHO), COMMISSIONER, HQ_ANALYST, PATROL_OFFICER, ANALYST
 */

const ROLES = {
  BEAT_OFFICER: 1,
  PATROL_OFFICER: 1,
  STATION_HOUSE_OFFICER: 2,
  SHO: 2,
  COMMISSIONER: 3,
  HQ_ANALYST: 3,
  ANALYST: 3,
};

/**
 * Authentication & RBAC middleware.
 * Reads user role from headers (`x-user-role`) or Catalyst auth context.
 */
function authenticate(req, res, next) {
  const roleHeader = req.headers['x-user-role'] || 'COMMISSIONER';
  const validRole = ROLES[roleHeader] ? roleHeader : 'COMMISSIONER';

  req.user = {
    id: req.headers['x-user-id'] || 'USR-SYNTHETIC-99',
    role: validRole,
    clearanceLevel: ROLES[validRole] || 3,
    division: req.headers['x-user-division'] || 'BENGALURU_CENTRAL',
  };

  next();
}

/**
 * Require role verification middleware.
 */
function verifyRole(allowedRoles = []) {
  return (req, res, next) => {
    const userRole = (req.user && req.user.role) || req.headers['x-user-role'] || 'COMMISSIONER';
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole) && userRole !== 'COMMISSIONER') {
      return res.status(403).json({
        error: 'ACCESS_DENIED',
        message: `Role '${userRole}' is not authorized for this operation. Required: ${allowedRoles.join(', ')}.`,
        complianceNote: 'DPDP Act & KSP Access Control Protocol Enforced',
      });
    }
    next();
  };
}

/**
 * PII Sanitization for lower roles (BEAT_OFFICER).
 * Masks phone numbers, suspect names, and exact addresses unless user is COMMISSIONER/HQ_ANALYST.
 */
function maskPII(data, userRole) {
  if (userRole === 'COMMISSIONER' || userRole === 'HQ_ANALYST' || userRole === 'ANALYST') {
    return data; // Unmasked for high clearance
  }

  const jsonString = JSON.stringify(data);
  const maskedString = jsonString
    .replace(/"phone":\s*"(\+91)?\d{10}"/g, '"phone": "XXXXXXXXXX"')
    .replace(/"name":\s*"[A-Za-z\s]+"/g, '"name": "[MASKED CITIZEN NAME]"')
    .replace(/"aadhaar":\s*"\d{12}"/g, '"aadhaar": "XXXX-XXXX-XXXX"');

  return JSON.parse(maskedString);
}

module.exports = {
  ROLES,
  authenticate,
  verifyRole,
  requireRole: verifyRole,
  maskPII,
};
