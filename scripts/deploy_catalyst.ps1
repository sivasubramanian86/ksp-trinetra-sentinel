# Zoho Catalyst Deployment Script (Windows PowerShell)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "[+] Building and Deploying KSP Trinetra Sentinel to Catalyst" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Step 1: Build Next.js static client export
Write-Host "[1/3] Building Next.js static client export..." -ForegroundColor Yellow
npm run build --prefix client
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Client build failed. Aborting deployment." -ForegroundColor Red
    exit 1
}

# Step 2: Verify client/out bundle
if (Test-Path "client/out") {
    Write-Host "[OK] Verified static export bundle in client/out" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Directory client/out missing. Aborting." -ForegroundColor Red
    exit 1
}

# Step 3: Execute Catalyst Deploy
Write-Host "[3/3] Deploying functions and client to Zoho Catalyst..." -ForegroundColor Yellow
catalyst deploy

Write-Host ""
Write-Host "[OK] Production Deployment Complete!" -ForegroundColor Green
