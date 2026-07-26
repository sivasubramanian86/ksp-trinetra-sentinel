/**
 * Automated Catalyst CLI Data Store Bulk Importer
 * KSP Trinetra Sentinel
 *
 * Runs `catalyst ds:import` for all CSV files in db/seeds/
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('====================================================');
console.log('🏛️ KSP Trinetra Sentinel — Catalyst CLI Data Store Importer');
console.log('====================================================\n');

const seedsDir = path.join(__dirname, '../db/seeds');

// Tables to import (matching existing tables in Datastore)
const tables = [
  { name: 'CaseMaster', file: 'CaseMaster.csv' },
  { name: 'Accused', file: 'Accused.csv' },
  { name: 'Victim', file: 'Victim.csv' },
  { name: 'Person', file: 'Person.csv' },
  { name: 'ActSectionAssociation', file: 'ActSectionAssociation.csv' },
  { name: 'ChargesheetDetails', file: 'ChargesheetDetails.csv' },
  { name: 'PoliceStation', file: 'PoliceStation.csv' },
  { name: 'CrimeHead', file: 'CrimeHead.csv' },
  { name: 'Employee', file: 'Employee.csv' },
  { name: 'AuditLog', file: 'AuditLog.csv' },
  { name: 'OperationPlan', file: 'OperationPlan.csv' },
  { name: 'DashboardPreset', file: 'DashboardPreset.csv' },
];

for (const t of tables) {
  const csvPath = path.join(seedsDir, t.file);
  if (!fs.existsSync(csvPath)) {
    console.log(`[!] Skipping '${t.name}': ${t.file} not found.`);
    continue;
  }

  console.log(`[→] Importing '${t.name}' from ${t.file}...`);
  try {
    const cmd = `npx zcatalyst-cli ds:import --table ${t.name} "${csvPath}" --dc in`;
    // Send bucket selection input via stdin
    const output = execSync(cmd, { encoding: 'utf8', input: 'ksp-forensic-evidence\n' });
    const lines = output.trim().split('\n').filter(l => l.includes('Successfully') || l.includes('jobid'));
    console.log(`    [✓] Result: ${lines.join(' | ') || 'Scheduled'}`);
  } catch (err) {
    const stdout = err.stdout ? err.stdout.toString() : '';
    const stderr = err.stderr ? err.stderr.toString() : '';
    console.log(`    [!] Command output for '${t.name}':`, (stdout || stderr || err.message).substring(0, 150));
  }
}


console.log('\n====================================================');
console.log('🎉 Catalyst CLI Import Process Completed!');
console.log('====================================================\n');
