#!/usr/bin/env bash
# Zoho Catalyst Deployment Script (Linux/macOS)

echo "=========================================================="
echo "[+] Building and Deploying KSP Trinetra Sentinel to Catalyst Project ID: 45111000000013054"
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

# Step 3: Execute Catalyst Deploy
echo "[3/3] Deploying Web Client to Zoho Catalyst..."
catalyst deploy --only client --project 45111000000013054

echo ""
echo "[OK] Production Deployment to Zoho Catalyst Complete!"
