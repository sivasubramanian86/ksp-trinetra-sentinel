/**
 * Constitutional & DPDP Act Ethics Guardrail Interceptor
 */

const legalEthicsAgent = require('./agents/legal_ethics_agent');

async function auditRequest(req, res, next) {
  const queryText = req.body.query || req.body.text || '';
  const audit = await legalEthicsAgent.auditQuery(queryText, req.user);

  if (!audit.allowed) {
    return res.status(400).json({
      error: 'ETHICS_GUARD_INTERCEPTED',
      notice: audit.reasonNotice,
      complianceStandard: 'DPDP Act 2023 & Constitution of India Article 15',
    });
  }

  next();
}

module.exports = {
  auditRequest,
};
