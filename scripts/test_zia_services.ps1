# PowerShell Script to Test Deployed Zoho Zia AI/ML Services
# Endpoints: OCR, Barcode Scanner, Image Moderation, Face Detection

param(
    [string]$BaseUrl = "https://ksp-trinetra-sentinel-60079971646.development.catalystserverless.in/server/catalyst-zia-services",
    [string]$SecretKey = "CODELIB_FAKE_KEY"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "[+] Testing Deployed Zoho Zia AI/ML Services" -ForegroundColor Cyan
Write-Host "Target URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Ensure test images exist
if (-not (Test-Path "scripts/sample_test_images/ocr_test_plate.png")) {
    Write-Host "[*] Generating sample test images..." -ForegroundColor Yellow
    python scripts/generate_test_images.py
}

# 1. Test Zia OCR Endpoint (/ocr)
Write-Host "`n[1/3] Testing Zia OCR (Optical Character Recognition)..." -ForegroundColor Yellow
$ocrImagePath = (Resolve-Path "scripts/sample_test_images/document_test.png").Path

try {
    $response = curl.exe -s -X POST "$BaseUrl/ocr" `
        -H "catalyst-codelib-secret-key: $SecretKey" `
        -F "image=@$ocrImagePath"
    
    Write-Host "[OK] Zia OCR Response Received:" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "[ERROR] Zia OCR call failed: $_" -ForegroundColor Red
}

# 2. Test Zia Barcode Scanner Endpoint (/barcode)
Write-Host "`n[2/3] Testing Zia Barcode Scanner..." -ForegroundColor Yellow
$barcodeImagePath = (Resolve-Path "scripts/sample_test_images/barcode_test.png").Path

try {
    $response = curl.exe -s -X POST "$BaseUrl/barcode" `
        -H "catalyst-codelib-secret-key: $SecretKey" `
        -F "image=@$barcodeImagePath"
    
    Write-Host "[OK] Zia Barcode Response Received:" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "[ERROR] Zia Barcode call failed: $_" -ForegroundColor Red
}

# 3. Test Zia PAN Card OCR Endpoint (/pan)
Write-Host "`n[3/3] Testing Zia PAN Card OCR..." -ForegroundColor Yellow
$plateImagePath = (Resolve-Path "scripts/sample_test_images/ocr_test_plate.png").Path

try {
    $response = curl.exe -s -X POST "$BaseUrl/pan" `
        -H "catalyst-codelib-secret-key: $SecretKey" `
        -F "image=@$plateImagePath"
    
    Write-Host "[OK] Zia PAN OCR Response Received:" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "[ERROR] Zia PAN OCR call failed: $_" -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "[+] Zia AI Services Verification Completed!" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
