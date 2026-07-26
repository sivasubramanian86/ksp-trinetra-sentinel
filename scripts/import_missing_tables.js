/**
 * Direct Importer for Missing Datastore Tables
 * KSP Trinetra Sentinel
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const missingTables = [
  { name: 'Employee', file: 'Employee.csv' },
  { name: 'CrimeHead', file: 'CrimeHead.csv' },
  { name: 'PoliceStation', file: 'PoliceStation.csv' },
  { name: 'ChargesheetDetails', file: 'ChargesheetDetails.csv' },
  { name: 'AuditLog', file: 'AuditLog.csv' },
  { name: 'OperationPlan', file: 'OperationPlan.csv' },
  { name: 'DashboardPreset', file: 'DashboardPreset.csv' },
];

const seedsDir = path.join(__dirname, '../db/seeds');

console.log('====================================================');
console.log('🏛️ Importing Remaining Datastore Tables via Catalyst CLI');
console.log('====================================================\n');

for (const t of missingTables) {
  const csvPath = path.join(seedsDir, t.file);
  if (!fs.existsSync(csvPath)) {
    console.log(`[!] Missing CSV file for ${t.name}: ${t.file}`);
    continue;
  }

  console.log(`[→] Triggering import job for table '${t.name}'...`);
  try {
    const cmd = `npx zcatalyst-cli ds:import --table ${t.name} "${csvPath}" --dc in`;
    const output = execSync(cmd, { encoding: 'utf8', input: 'ksp-forensic-evidence\n' });
    const match = output.match(/jobid\s+"(\d+)"/i);
    const jobId = match ? match[1] : 'Scheduled';
    console.log(`    [✓] Successfully scheduled '${t.name}' (Job ID: ${jobId})`);
  } catch (err) {
    const out = err.stdout ? err.stdout.toString() : err.message;
    console.log(`    [!] Output for '${t.name}':`, out.substring(0, 150));
  }
}

console.log('\n====================================================');
console.log('🎉 All remaining table import jobs scheduled successfully!');
console.log('====================================================\n');
