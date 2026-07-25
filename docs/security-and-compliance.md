# KSP Trinetra Sentinel - Security, CORS & Compliance Architecture

This document specifies the security governance, secret management, DPDP Act 2023 compliance, and CORS configurations implemented in **KSP Trinetra Sentinel**.

---

## 🔒 1. Secret Management (Google Secret Manager Equivalent for Zoho)

In Zoho Catalyst, **Zoho Catalyst Vault / Environment Variables** serves as the enterprise equivalent to Google Secret Manager / AWS Secrets Manager.

### Implementation:
- **Node.js API Gateway**: [`functions/api_gateway/secrets_vault.js`](file:///d:/Siva/Books/CAREER/HACKATHON/ksp-trinetra-sentinel/functions/api_gateway/secrets_vault.js) uses `zcatalyst-sdk-node`'s `secretStore()` API to retrieve sensitive values (`POSTGRES_DB_URI`, `ZIA_API_KEY`, `DPDP_SALT_KEY`) at runtime.
- **Python ML Microservices**: [`backend/python-services/core/secrets_vault.py`](file:///d:/Siva/Books/CAREER/HACKATHON/ksp-trinetra-sentinel/backend/python-services/core/secrets_vault.py) reads secure environment variables provisioned by Catalyst.

---

## 🌐 2. Cross-Origin Resource Sharing (CORS) Policy

Strict CORS rules are enforced across both serverless gateways and FastAPI microservices:

- **Allowed Origins**:
  - `http://localhost:3000` (Next.js Local Command Center)
  - `http://localhost:3001` (Catalyst Express API Gateway)
  - `https://*.catalystserverless.com` (Zoho Catalyst Production Hosting)
  - `https://*.zohocatalyst.com`
- **Allowed Methods**: `GET`, `POST`, `OPTIONS`
- **Allowed Headers**: `Content-Type`, `Authorization`, `x-user-role`, `x-catalyst-token`

---

## 🛡️ 3. OWASP Security Compliance & Headers

Both Express Gateway and FastAPI microservices inject mandatory HTTP security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

---

## ⚖️ 4. DPDP Act 2023 Compliance & Ethics Guard

- **PII Anonymization**: Phone numbers (`+91...`), Aadhaar numbers, and PAN cards are automatically scrubbed via regex matching in [`PIIScrubber`](file:///d:/Siva/Books/CAREER/HACKATHON/ksp-trinetra-sentinel/backend/python-services/core/dpdp_scrubber.py).
- **Ethics Interceptor**: Prompts attempting algorithmic demographic profiling (caste, religion) are intercepted by [`ethics_guard.js`](file:///d:/Siva/Books/CAREER/HACKATHON/ksp-trinetra-sentinel/functions/api_gateway/ethics_guard.js) under Article 15 & DPDP Act mandates.
