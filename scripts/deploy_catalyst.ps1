# Zoho Catalyst Deployment Script (Windows PowerShell)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "[+] Building and Deploying KSP Trinetra Sentinel to Catalyst (India DC: --dc in)" -ForegroundColor Cyan
Write-Host "Project ID: 45111000000013054 (KSP-Trinetra-Sentinel)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Step 1: Build Next.js static client export
Write-Host "[1/3] Building Next.js static client export..." -ForegroundColor Yellow
npm run build --prefix client
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Client build failed. Aborting deployment." -ForegroundColor Red
    exit 1
}

# Step 2: Ensure client-package.json exists in client/out
if (Test-Path "client/out") {
    Copy-Item "client/client-package.json" "client/out/client-package.json" -Force
    Write-Host "[OK] Verified static export bundle & client-package.json in client/out" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Directory client/out missing. Aborting." -ForegroundColor Red
    exit 1
}

# Step 3: Execute Catalyst Deploy to India DC (--dc in) for client AND functions
Write-Host "[3/3] Deploying Web Client & Express Gateway Functions to Zoho Catalyst India Data Center (--dc in)..." -ForegroundColor Yellow
catalyst deploy --dc in --project 45111000000013054

Write-Host ""
Write-Host "[OK] Production Deployment to Zoho Catalyst India DC Complete!" -ForegroundColor Green
