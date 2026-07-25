# Security & Compliance Policy - KSP Trinetra Sentinel 👁️🛡️

> **Karnataka State Police Datathon 2026**

## 1. Secret Management (Google Secret Manager Equivalent)

In **Zoho Catalyst**, **Zoho Catalyst Vault / Environment Variables** serves as the enterprise equivalent to Google Secret Manager or AWS Secrets Manager.

- **Node.js Gateway**: [`functions/api_gateway/secrets_vault.js`](file:///d:/Siva/Books/CAREER/HACKATHON/ksp-trinetra-sentinel/functions/api_gateway/secrets_vault.js) retrieves secret tokens (`POSTGRES_DB_URI`, `ZIA_API_KEY`, `DPDP_SALT_KEY`) securely via `zcatalyst-sdk-node`'s `secretStore()` API.
- **Python Microservices**: [`backend/python-services/core/secrets_vault.py`](file:///d:/Siva/Books/CAREER/HACKATHON/ksp-trinetra-sentinel/backend/python-services/core/secrets_vault.py) reads secure environment variables.

---

## 2. DPDP Act 2023 Compliance & Data Anonymization

- **PII Scrubbing**: All names, phone numbers (`+91...`), Aadhaar numbers, and PAN cards are anonymized in [`PIIScrubber`](file:///d:/Siva/Books/CAREER/HACKATHON/ksp-trinetra-sentinel/backend/python-services/core/dpdp_scrubber.py).
- **Salted SHA-256 Hashing**: Identifiers are hashed with a secret salt key before graph linkage.
- **Ethics Interceptor**: Prompts attempting algorithmic demographic profiling (caste, religion) are blocked by [`ethics_guard.js`](file:///d:/Siva/Books/CAREER/HACKATHON/ksp-trinetra-sentinel/functions/api_gateway/ethics_guard.js) under Article 15 & DPDP mandates.

---

## 3. CORS & OWASP Security Headers

- **Strict CORS Policy**: Restricted to trusted origins (`http://localhost:3000`, `http://localhost:3001`, `https://*.catalystserverless.com`).
- **HTTP Security Headers**: Injecting `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and `Strict-Transport-Security`.

---

## 4. Reporting Vulnerabilities

If you discover a security vulnerability, please report it immediately to the security team. Do not open public issues for sensitive security findings.
