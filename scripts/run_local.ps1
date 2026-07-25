# Local Execution Launcher for KSP Trinetra Sentinel (Windows PowerShell)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "[+] Launching KSP Trinetra Sentinel Full-Stack Local Engine" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Step 0: Kill any existing processes running on Ports 8000, 3001, 3000
Write-Host "[0/3] Cleaning up any active processes on Ports 8000, 3001, 3000..." -ForegroundColor Yellow
foreach ($port in @(8000, 8002, 3001, 3000, 3002)) {
    try {
        $pids = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($p in $pids) {
            if ($p -and $p -gt 0) {
                Write-Host "  -> Terminating stale process on Port $port (PID: $p)..." -ForegroundColor Gray
                Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {
        # Ignore port lookup exceptions
    }
}
Start-Sleep -Seconds 1

# Start Python Microservices Engine on Port 8000
Write-Host "[1/3] Starting Python ML Microservices Engine (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location backend/python-services; uvicorn api.main:app --reload --port 8000"

# Start Catalyst API Gateway on Port 3001
Write-Host "[2/3] Starting Zoho Catalyst API Gateway (Port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location functions/api_gateway; npm start"

# Start Next.js Command Center UI on Port 3000
Write-Host "[3/3] Starting Next.js Command Center UI (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location client; npm run dev"

Write-Host ""
Write-Host "[OK] All services launched cleanly in separate windows!" -ForegroundColor Green
Write-Host "[*] Command Center UI : http://localhost:3000" -ForegroundColor Cyan
Write-Host "[*] API Gateway Status : http://localhost:3001/api/health" -ForegroundColor Cyan
Write-Host "[*] Python ML API Docs : http://localhost:8000/docs" -ForegroundColor Cyan
