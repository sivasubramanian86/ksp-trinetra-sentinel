/**
 * Legal Compliance & DPDP Ethics Guardrail Sub-Agent
 * Bharatiya Nyaya Sanhita (BNS) 2023 RAG & Anti-Algorithmic-Profiling Interceptor
 */

const BNS_SECTIONS = [
  { section: 'BNS Section 303', title: 'Theft & Vehicle Snatching', punishment: 'Rigorous imprisonment up to 3 years', SOP: 'Form checkpoint at beat perimeter, inspect registration tags.' },
  { section: 'BNS Section 304', title: 'Snatching with Threat of Violence', punishment: 'Rigorous imprisonment up to 7 years', SOP: 'Dispatch 2 Hoysala patrol units immediately, initiate ANPR camera scan.' },
  { section: 'BNS Section 318', title: 'Cheating & Financial Cyber Crime', punishment: 'Imprisonment up to 5 years', SOP: 'Issue immediate freeze request on linked UPI Mule accounts via 1930 Cyber Cell.' },
];

class LegalEthicsSubAgent {
  async auditQuery(queryText, userContext) {
    if (!queryText) return { allowed: true };

    const lower = queryText.toLowerCase();
    const bannedProfilingTerms = ['caste', 'religion', 'community profiling', 'ethnicity filter'];

    for (const term of bannedProfilingTerms) {
      if (lower.includes(term)) {
        return {
          allowed: false,
          reasonNotice: {
            code: 'CONSTITUTIONAL_DPDP_VIOLATION',
            message: `Request blocked by Trinetra Ethics Guardrail. Algorithmic profiling based on '${term}' violates DPDP Act 2023 & Article 15 of the Constitution of India.`,
          },
        };
      }
    }

    return { allowed: true };
  }

  async retrieveBNSSections(queryText) {
    if (!queryText) return [BNS_SECTIONS[0]];
    const lower = queryText.toLowerCase();

    if (lower.includes('cyber') || lower.includes('upi') || lower.includes('mule')) {
      return [BNS_SECTIONS[2]];
    } else if (lower.includes('snatching') || lower.includes('chain')) {
      return [BNS_SECTIONS[1]];
    }

    return [BNS_SECTIONS[0], BNS_SECTIONS[1]];
  }
}

module.exports = new LegalEthicsSubAgent();
