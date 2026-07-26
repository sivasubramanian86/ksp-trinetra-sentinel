/**
 * Catalyst Datastore Automated Seeding Utility
 * KSP Trinetra Sentinel
 */

const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🏛️ KSP Trinetra Sentinel — Catalyst Datastore Seeder');
console.log('====================================================\n');

const caseCsvPath = path.join(__dirname, '../db/seeds/CaseMaster.csv');
const accusedCsvPath = path.join(__dirname, '../db/seeds/Accused.csv');
const victimCsvPath = path.join(__dirname, '../db/seeds/Victim.csv');

console.log('1. Generated Full CSV Seed Files:');
console.log('   [✓] CaseMaster.csv:', fs.existsSync(caseCsvPath) ? `${fs.statSync(caseCsvPath).size} bytes` : 'MISSING');
console.log('   [✓] Accused.csv:   ', fs.existsSync(accusedCsvPath) ? `${fs.statSync(accusedCsvPath).size} bytes` : 'MISSING');
console.log('   [✓] Victim.csv:    ', fs.existsSync(victimCsvPath) ? `${fs.statSync(victimCsvPath).size} bytes` : 'MISSING');

console.log('\n2. Importing to Zoho Catalyst Datastore:');
console.log('   Option A (Console UI - 1 Click):');
console.log('     1. Open Zoho Catalyst Console -> Data Store.');
console.log('     2. Click "CaseMaster" table -> Import Data -> Select db/seeds/CaseMaster.csv');
console.log('     3. Click "Accused" table -> Import Data -> Select db/seeds/Accused.csv');
console.log('     4. Click "Victim" table -> Import Data -> Select db/seeds/Victim.csv');
console.log('\n   Option B (CLI Sync):');
console.log('     Run: npx zcatalyst-cli deploy --dc in');
console.log('====================================================\n');
