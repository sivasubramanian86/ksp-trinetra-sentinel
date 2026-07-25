# Zia LLM & Multi-Agent Verification Script (Windows PowerShell)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "[+] KSP Trinetra Sentinel - Zia LLM PowerShell Tester" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$headers = @{
    "Content-Type" = "application/json"
    "x-user-role"  = "COMMISSIONER"
}

# Test 1: Health Check
Write-Host "`n[Test 1/3] Testing Gateway Healthcheck (GET /api/health)..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get -Headers $headers -TimeoutSec 3
    Write-Host "✓ Status: ONLINE" -ForegroundColor Green
    Write-Host "Active Agents: $($health.activeAgents -join ', ')" -ForegroundColor Gray
} catch {
    Write-Host "[Notice] Gateway not active on port 3001. Run .\scripts\run_local.ps1 to start services." -ForegroundColor Red
}

# Test 2: Zia Copilot Chat
Write-Host "`n[Test 2/3] Testing Zia Copilot Chat (POST /api/chat)..." -ForegroundColor Yellow
$chatBody = @{
    query    = "Suggest patrol deployments for Indiranagar two-wheeler thefts tonight"
    language = "en"
} | ConvertTo-Json

try {
    $chatRes = Invoke-RestMethod -Uri "http://localhost:3001/api/chat" -Method Post -Headers $headers -Body $chatBody -TimeoutSec 5
    Write-Host "✓ Response Title: $($chatRes.title)" -ForegroundColor Green
    Write-Host "DPDP Compliant: $($chatRes.dpdpCompliant)" -ForegroundColor Gray
} catch {
    Write-Host "Response Failed: $_" -ForegroundColor Red
}

# Test 3: Forensic Dissection Engine
Write-Host "`n[Test 3/3] Testing Forensic Dissection Engine (POST /api/forensics/dissect)..." -ForegroundColor Yellow
$forensicBody = @{ case_id = "CASE-2026-IND-88" } | ConvertTo-Json

try {
    $forensicRes = Invoke-RestMethod -Uri "http://localhost:3001/api/forensics/dissect" -Method Post -Headers $headers -Body $forensicBody -TimeoutSec 5
    Write-Host "✓ Case ID: $($forensicRes.case_id)" -ForegroundColor Green
    Write-Host "Contradictions Found: $($forensicRes.contradictions_found.Count)" -ForegroundColor Gray
} catch {
    Write-Host "Response Failed: $_" -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "[OK] Verification Complete!" -ForegroundColor Green
