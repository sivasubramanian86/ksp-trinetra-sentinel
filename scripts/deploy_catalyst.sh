#!/usr/bin/env bash
# Zoho Catalyst Deployment Script (Linux/macOS)

echo "=========================================================="
echo "[+] Building and Deploying KSP Trinetra Sentinel to Catalyst (India DC: --dc in)"
echo "Project ID: 45111000000013054 (KSP-Trinetra-Sentinel)"
echo "=========================================================="

# Step 1: Build Next.js static client export
echo "[1/3] Building Next.js static client export..."
npm run build --prefix client

# Step 2: Ensure client-package.json exists in client/out
if [ -d "client/out" ]; then
    cp client/client-package.json client/out/client-package.json
    echo "[OK] Verified static export bundle & client-package.json in client/out"
else
    echo "[ERROR] Directory client/out missing. Aborting."
    exit 1
fi

# Step 3: Execute Catalyst Deploy to India DC (--dc in) for client AND functions
echo "[3/3] Deploying Web Client & Express Gateway Functions to Zoho Catalyst India Data Center (--dc in)..."
catalyst deploy --dc in --project 45111000000013054

echo ""
echo "[OK] Production Deployment to Zoho Catalyst India DC Complete!"
