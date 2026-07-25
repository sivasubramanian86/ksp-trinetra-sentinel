# Contributing Guidelines - KSP Trinetra Sentinel 👁️🛡️

Thank you for contributing to **KSP Trinetra Sentinel**!

## 1. Development Workflow

1. Fork & clone the repository.
2. Run local execution launcher:
   - **Windows**: `.\scripts\run_local.ps1`
   - **Linux/macOS**: `./scripts/run_local.sh`
3. Ensure all tests pass before submitting a pull request:
   - `node functions/api_gateway/tests/test_mcp_tools.js`
   - `python -m pytest backend/python-services/tests/test_forensics.py`
   - `npm run build --prefix client`

## 2. Code Style & Commit Conventions

- Follow **Conventional Commits**:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation updates
  - `refactor:` for code restructuring
- Maintain TypeScript strict mode in `client/`.
- Ensure Python code in `backend/python-services/` follows PEP 8.
