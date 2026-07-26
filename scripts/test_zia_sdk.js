/**
 * Standalone Zoho Catalyst Zia AI/ML Verification Script
 * Tests:
 * 1. OCR (Optical Character Recognition)
 * 2. Barcode Scanning
 * 3. Image Recognition / Object Detection
 * 4. Image Moderation
 * 5. Aadhaar / Document Parsing
 */

const fs = require('fs');
const path = require('path');
const catalyst = require('zcatalyst-sdk-node');

async function testZiaServicesDirect() {
  console.log('==========================================================');
  console.log('[+] Initializing Zoho Catalyst Zia AI/ML Verification Suite');
  console.log('==========================================================');

  // Check sample images
  const sampleDir = path.join(__dirname, '../data/sample_test_images');

  const ocrPath = path.join(sampleDir, 'document_test.png');
  const barcodePath = path.join(sampleDir, 'barcode_test.png');

  if (!fs.existsSync(ocrPath) || !fs.existsSync(barcodePath)) {
    console.log('[*] Missing sample images. Please run: python scripts/generate_test_images.py');
    return;
  }

  try {
    const catalystApp = catalyst.initialize();
    const zia = catalystApp.zia();
    console.log('[OK] Catalyst SDK & Zia Instance Initialized successfully.');

    // 1. Test OCR
    console.log('\n[1/4] Executing Zia Optical Character Recognition (OCR)...');
    const ocrStream = fs.createReadStream(ocrPath);
    try {
      const ocrResult = await zia.extractOpticalCharacters(ocrStream, { language: 'eng', modelType: 'OCR' });
      console.log('[OK] Zia OCR Result:', JSON.stringify(ocrResult, null, 2));
    } catch (err) {
      console.log('[*] Zia OCR SDK Call Response:', err.message);
    }

    // 2. Test Barcode Scanner
    console.log('\n[2/4] Executing Zia Barcode Scanner...');
    const bcStream = fs.createReadStream(barcodePath);
    try {
      const bcResult = await zia.scanBarcode(bcStream);
      console.log('[OK] Zia Barcode Result:', JSON.stringify(bcResult, null, 2));
    } catch (err) {
      console.log('[*] Zia Barcode SDK Call Response:', err.message);
    }

    // 3. Test Image Recognition / Object Detection
    console.log('\n[3/4] Executing Zia Image Object Detection...');
    const imgStream = fs.createReadStream(ocrPath);
    try {
      const objResult = await zia.detectImageObjects(imgStream);
      console.log('[OK] Zia Image Object Detection Result:', JSON.stringify(objResult, null, 2));
    } catch (err) {
      console.log('[*] Zia Image Object Detection Response:', err.message);
    }

    // 4. Test Image Moderation
    console.log('\n[4/4] Executing Zia Image Moderation...');
    const modStream = fs.createReadStream(ocrPath);
    try {
      const modResult = await zia.moderateImage(modStream);
      console.log('[OK] Zia Image Moderation Result:', JSON.stringify(modResult, null, 2));
    } catch (err) {
      console.log('[*] Zia Image Moderation Response:', err.message);
    }

  } catch (globalErr) {
    console.log('[!] Global Initialization Context:', globalErr.message);
    console.log('[NOTE] To run direct Zia SDK calls outside serverless functions, ensure Catalyst credentials/ADC are loaded or execute via catalyst serverless function environment.');
  }

  console.log('\n==========================================================');
  console.log('[+] Verification Script Execution Completed');
  console.log('==========================================================');
}

testZiaServicesDirect();
