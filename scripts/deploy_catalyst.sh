#!/usr/bin/env bash
# Zoho Catalyst Deployment Script (Linux/macOS Bash)

set -e

echo "=========================================================="
echo "📦 Building and Deploying KSP Trinetra Sentinel to Catalyst"
echo "=========================================================="

echo "[1/3] Building Next.js static client export..."
npm run build --prefix client

if [ -d "client/out" ]; then
    echo "✓ Verified static export bundle in client/out"
else
    echo "❌ Directory client/out missing. Aborting."
    exit 1
fi

echo "[3/3] Deploying functions and client to Zoho Catalyst..."
catalyst deploy

echo ""
echo "🎉 Production Deployment Complete!"
