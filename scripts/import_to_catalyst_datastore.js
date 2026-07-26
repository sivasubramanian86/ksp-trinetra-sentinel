/**
 * Automated Zoho Catalyst Datastore REST API Seeder
 * KSP Trinetra Sentinel
 *
 * Uses Zoho OAuth Access Token to insert dataset records directly
 * into Catalyst Datastore tables via REST API.
 */

const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      let value = parts.slice(1).join('=').trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

const clientId = process.env.CATALYST_CLIENT_ID;
const clientSecret = process.env.CATALYST_CLIENT_SECRET;
const refreshToken = process.env.CATALYST_REFRESH_TOKEN;
const grantCode = process.env.CATALYST_GRANT_CODE;
const dcDomain = process.env.ZOHO_DC_DOMAIN || 'accounts.zoho.in';
const projectId = '60079971646'; // Project ID

async function getAccessToken() {
  if (process.env.CATALYST_GLM_TOKEN) return process.env.CATALYST_GLM_TOKEN;
  if (!clientId || !clientSecret) {
    throw new Error('CATALYST_CLIENT_ID and CATALYST_CLIENT_SECRET are required in .env');
  }

  let bodyParams;
  if (refreshToken) {
    console.log('[→] Exchanging Refresh Token for Access Token...');
    bodyParams = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    });
  } else if (grantCode) {
    console.log('[→] Exchanging Grant Code for Access Token & Refresh Token...');
    bodyParams = new URLSearchParams({
      code: grantCode,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
    });
  } else {
    throw new Error('Please set CATALYST_GRANT_CODE or CATALYST_REFRESH_TOKEN in .env');
  }

  const tokenUrl = `https://${dcDomain}/oauth/v2/token`;
  const authRes = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: bodyParams.toString(),
  });

  const authData = await authRes.json();
  if (!authRes.ok || authData.error) {
    throw new Error(`OAuth failed: ${authData.error || JSON.stringify(authData)}`);
  }

  if (authData.refresh_token) {
    console.log('💾 Automatically saving full CATALYST_REFRESH_TOKEN to .env...');
    try {
      let envTxt = fs.readFileSync(envPath, 'utf8');
      if (envTxt.includes('CATALYST_REFRESH_TOKEN=')) {
        envTxt = envTxt.replace(/CATALYST_REFRESH_TOKEN=.*$/m, `CATALYST_REFRESH_TOKEN="${authData.refresh_token}"`);
      } else {
        envTxt += `\nCATALYST_REFRESH_TOKEN="${authData.refresh_token}"\n`;
      }
      fs.writeFileSync(envPath, envTxt, 'utf8');
      console.log('✅ CATALYST_REFRESH_TOKEN saved to .env!');
    } catch (e) {
      console.warn('Could not auto-save refresh token to .env:', e.message);
    }
  }

  return authData.access_token;
}


async function probeTables(accessToken) {
  console.log('[→] Probing Catalyst Datastore Tables List URL patterns...');
  const patterns = [
    `https://api.catalyst.zoho.in/baas/v1/project/${projectId}/table`,
    `https://api.catalyst.zoho.in/baas/v1/project/${projectId}/datastore/table`,
    `https://console.catalyst.zoho.in/baas/v1/project/${projectId}/table`,
    `https://api.catalyst.zoho.in/baas/v1/project/${projectId}/datastore/tables`,
  ];

  for (const pat of patterns) {
    const res = await fetch(pat, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'CATALYST-ORG': projectId,
      },
    });
    const txt = await res.text();
    console.log(`[HTTP ${res.status}] Pattern: ${pat}`);
    console.log(`   Response:`, txt.substring(0, 150));
    if (res.ok) {
      console.log(`🎉 SUCCESS URL Pattern: ${pat}`);
      break;
    }
  }
}


async function insertRowsToTable(tableName, rows, accessToken) {
  if (!rows || rows.length === 0) return;
  console.log(`[→] Seeding ${rows.length} record(s) into Datastore table '${tableName}'...`);

  const url = `https://api.catalyst.zoho.in/baas/v1/project/${projectId}/table/${tableName}/row`;
  const chunk = rows.slice(0, 10); // test small chunk of 10

  const headerCombos = [
    {
      name: 'Zoho-oauthtoken + Environment',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Environment': 'Development',
      },
    },
    {
      name: 'Zoho-oauthtoken + Environment + CATALYST-ORG',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Environment': 'Development',
        'CATALYST-ORG': projectId,
      },
    },
    {
      name: 'Bearer + Environment',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Environment': 'Development',
      },
    },
  ];

  for (const combo of headerCombos) {
    console.log(`  [Testing Header Combo]: ${combo.name}`);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: combo.headers,
        body: JSON.stringify(chunk),
      });

      const resText = await res.text();
      console.log(`   [HTTP ${res.status}] Response:`, resText.substring(0, 200));

      if (res.ok) {
        console.log(`🎉 SUCCESSful datastore insert using header combo: ${combo.name}!`);
        return;
      }
    } catch (err) {
      console.warn(`   [Error]:`, err.message);
    }
  }
}





async function runDatastoreImporter() {
  console.log('====================================================');
  console.log('🏛️ KSP Trinetra Sentinel — Catalyst REST API Seeder');
  console.log('====================================================\n');

  try {
    const token = await getAccessToken();
    console.log('[✓] Obtained fresh Zoho OAuth Access Token');

    // Read FIR Dataset

    const datasetPath = path.join(__dirname, '../db/seeds/ksp_fir_dataset.json');
    if (!fs.existsSync(datasetPath)) {
      throw new Error(`Dataset file not found at ${datasetPath}`);
    }

    const data = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

    // 1. CaseMaster
    if (data.cases) {
      const caseRows = data.cases.map(c => ({
        CaseMasterID: c.CaseMasterID,
        CrimeNo: c.CrimeNo,
        CaseNo: c.CaseNo,
        CrimeRegisteredDate: c.CrimeRegisteredDate || new Date().toISOString(),
        PolicePersonID: c.PolicePersonID || 501,
        PoliceStationID: c.PoliceStationID || 1047,
        CrimeMajorHeadID: c.CrimeMajorHeadID || 1,
        CrimeMinorHeadID: c.CrimeMinorHeadID || 101,
        latitude: parseFloat(c.latitude || 12.9716),
        longitude: parseFloat(c.longitude || 77.5946),
        BriefFacts: c.BriefFacts || 'FIR Incident record',
      }));
      await insertRowsToTable('CaseMaster', caseRows, token);
    }

    // 2. Accused
    if (data.accused) {
      const accusedRows = data.accused.map(a => ({
        AccusedID: a.AccusedID || 1,
        CaseMasterID: a.CaseMasterID || 1,
        AccusedName: a.AccusedName || 'Unknown Accused',
        PersonID: String(a.PersonID || 'P-101'),
      }));
      await insertRowsToTable('Accused', accusedRows, token);
    }

    // 3. Victim
    if (data.victims) {
      const victimRows = data.victims.map(v => ({
        VictimID: v.VictimID || 1,
        CaseMasterID: v.CaseMasterID || 1,
        VictimName: v.VictimName || 'Unknown Victim',
      }));
      await insertRowsToTable('Victim', victimRows, token);
    }

    console.log('\n🎉 All Datastore tables seeded automatically via Catalyst REST API!');
  } catch (err) {
    console.error('\n❌ Seeder Error:', err.message);
  }
}

runDatastoreImporter();
