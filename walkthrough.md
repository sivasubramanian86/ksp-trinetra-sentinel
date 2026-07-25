# Walkthrough - KSP Trinetra Sentinel 👁️🛡️

> **Karnataka State Police Datathon 2026 - Multi-Layer City Brain**

KSP Trinetra Sentinel has been fully scaffolded, engineered, and verified with all sub-agents, multi-lingual (Kannada/English) support, multi-modal features, NammaRaksha Copilot, TASK 06 Forensic Triage Engine, and **Dual Theme Support (Light ☀️ / Dark 🌙)**.

---

## 🎨 Dual Theme (Light ☀️ & Dark 🌙) & UI Enhancements

1. **Theme Switcher**: Added interactive Sun ☀️ / Moon 🌙 toggle button in the Navbar ([`Navbar.tsx`](file:///d:/Siva/Books/CAREER/HACKATHON/ksp-trinetra-sentinel/client/src/components/layout/Navbar.tsx)).
2. **Design Tokens & Fonts ([`globals.css`](file:///d:/Siva/Books/CAREER/HACKATHON/ksp-trinetra-sentinel/client/src/app/globals.css))**:
   - Increased typography hierarchy (`text-2xl`, `text-3xl` headings; `text-base`, `text-lg` body text).
   - Glassmorphic frosted card utility classes (`glass-card`, `glass-card-glow`) working across both Dark (`#060913`) and Light (`#f8fafc`) modes.
3. **Module Refinement**:
   - [`GeoMap.tsx`](file:///d:/Siva/Books/CAREER/HACKATHON/ksp-trinetra-sentinel/client/src/components/map/GeoMap.tsx): Threat Vectors Time Machine with dark/light beat polygon cards & glowing slider.
   - [`MindPalaceGraph.tsx`](file:///d:/Siva/Books/CAREER/HACKATHON/ksp-trinetra-sentinel/client/src/components/graph/MindPalaceGraph.tsx): Sherlock Mind Palace syndicate graph with themed node cards.
   - [`TacticalPanel.tsx`](file:///d:/Siva/Books/CAREER/HACKATHON/ksp-trinetra-sentinel/client/src/components/advisory/TacticalPanel.tsx): Advisory cards with BNS section pills & interactive counterfactual simulation toggle.
   - [`NammaRakshaCopilot.tsx`](file:///d:/Siva/Books/CAREER/HACKATHON/ksp-trinetra-sentinel/client/src/components/chat/NammaRakshaCopilot.tsx): Bilingual copilot chat feed supporting dark & light contrast.
   - [`ForensicLabModal.tsx`](file:///d:/Siva/Books/CAREER/HACKATHON/ksp-trinetra-sentinel/client/src/components/forensics/ForensicLabModal.tsx): Forensic triage drag-and-drop zone & timeline contradiction highlights.

---

## 🧪 Verification Proof

### Pytest Forensic Suite Execution
Ran `python -m pytest tests/test_forensics.py` in `backend/python-services/`:

```text
============================= test session starts =============================
platform win32 -- Python 3.12.10, pytest-9.0.3, pluggy-1.6.0
collected 4 items

tests\test_forensics.py ....                                             [100%]

============================== 4 passed in 0.58s ==============================
```

### Next.js Client Production Build Verification
Ran `npm run build --prefix client`:

```text
✓ Compiled successfully
✓ Generating static pages (4/4)
Route (app)                              Size     First Load JS
┌ ○ /                                    13.9 kB         101 kB
└ ○ /_not-found                          871 B          87.9 kB
```

---

## 🚀 Local Execution Instructions

### 1. Next.js Command Center UI
```bash
cd client
npm run dev
# Open http://localhost:3000 -> Click Sun/Moon button to toggle theme
```

### 2. Catalyst API Gateway Functions
```bash
cd functions/api_gateway
npm start
# Health Check: http://localhost:3001/api/health
```

### 3. Python ML & Forensic Microservices Engine
```bash
cd backend/python-services
python -m pytest tests/test_forensics.py
uvicorn api.main:app --reload --port 8000
# OpenAPI Docs: http://localhost:8000/docs
```

### 4. Deploy to Zoho Catalyst Cloud
```bash
catalyst deploy
```
