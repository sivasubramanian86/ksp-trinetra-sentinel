/**
 * Test script for Zoho QuickML GLM-4.7-Flash OAuth & Chat API
 * KSP Trinetra Sentinel
 */

const fs = require('fs');
const path = require('path');

// 1. Load .env file manually if present
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log('[+] Reading credentials from .env file...');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      let value = parts.slice(1).join('=').trim();
      // Remove outer quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

const clientId = process.env.CATALYST_CLIENT_ID;
const clientSecret = process.env.CATALYST_CLIENT_SECRET;
const grantCode = process.env.CATALYST_GRANT_CODE;
const refreshToken = process.env.CATALYST_REFRESH_TOKEN;
const directToken = process.env.CATALYST_GLM_TOKEN;
const dcDomain = process.env.ZOHO_DC_DOMAIN || 'accounts.zoho.in';
const orgId = process.env.CATALYST_ORG_ID || '60079971646';

console.log('--- Environment Check ---');
console.log('CATALYST_CLIENT_ID:', clientId ? `SET (${clientId.substring(0, 10)}...)` : 'NOT SET');
console.log('CATALYST_CLIENT_SECRET:', clientSecret ? 'SET (******)' : 'NOT SET');
console.log('CATALYST_GRANT_CODE:', grantCode ? `SET (${grantCode.substring(0, 10)}...)` : 'NOT SET');
console.log('CATALYST_REFRESH_TOKEN:', refreshToken ? `SET (${refreshToken.substring(0, 10)}...)` : 'NOT SET');
console.log('CATALYST_GLM_TOKEN:', directToken ? `SET (${directToken.substring(0, 10)}...)` : 'NOT SET');
console.log('ZOHO_DC_DOMAIN:', dcDomain);
console.log('-------------------------\n');

async function getAccessToken() {
  if (directToken) {
    console.log('[✓] Using direct CATALYST_GLM_TOKEN from environment.');
    return directToken;
  }

  if (!clientId || !clientSecret) {
    throw new Error('CATALYST_CLIENT_ID and CATALYST_CLIENT_SECRET are required for OAuth token exchange.');
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
    throw new Error('Neither CATALYST_REFRESH_TOKEN, CATALYST_GRANT_CODE, nor CATALYST_GLM_TOKEN is set.');
  }

  const tokenUrl = `https://${dcDomain}/oauth/v2/token`;
  console.log(`[HTTP POST] ${tokenUrl}`);

  const authRes = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: bodyParams.toString(),
  });

  const authData = await authRes.json();

  if (!authRes.ok || authData.error) {
    console.error('❌ OAuth Token Exchange Failed:', JSON.stringify(authData, null, 2));
    throw new Error(`OAuth Error: ${authData.error || authRes.statusText}`);
  }

  console.log('✅ Access Token Obtained Successfully!');
  console.log('   Access Token:', `${authData.access_token.substring(0, 15)}...`);
  console.log('   Expires In:', `${authData.expires_in} seconds`);

  if (authData.refresh_token) {
    console.log('   Refresh Token:', `${authData.refresh_token.substring(0, 15)}...`);
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


async function testQuickMLGLM(accessToken) {
  const glmUrl = 'https://api.catalyst.zoho.in/quickml/v1/project/45111000000013054/glm/chat';
  console.log(`\n[→] Calling QuickML GLM-4.7-Flash API at: ${glmUrl}`);

  const payload = {
    model: 'crm-di-glm47b_30b_it',
    messages: [
      {
        role: 'system',
        content: 'You are NammaRaksha AI Copilot for Karnataka State Police officers. Provide concise tactical law enforcement guidance.',
      },
      {
        role: 'user',
        content: 'Provide a brief tactical briefing on section IPC 420 vs BNS Section 318 for cheating cases.',
      },
    ],
    max_tokens: 300,
    temperature: 0.2,
    stream: false,
    chat_template_kwargs: {
      enable_thinking: true,
    },
  };

  const headerCombinations = [
    {
      name: 'Bearer + ORG',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'CATALYST-ORG': orgId,
      },
    },
    {
      name: 'Zoho-oauthtoken + ORG',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'CATALYST-ORG': orgId,
      },
    },
    {
      name: 'Bearer + ORG + ENV Development',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'CATALYST-ORG': orgId,
        'CATALYST-ENV': 'Development',
        'environment': 'Development',
      },
    },
    {
      name: 'Bearer + ORG + PROJECT-ID',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'CATALYST-ORG': orgId,
        'CATALYST-PROJECT-ID': '45111000000013054',
      },
    },
  ];

  for (const combo of headerCombinations) {
    console.log(`\n--- Testing Header Combo: ${combo.name} ---`);
    const t0 = Date.now();
    const res = await fetch(glmUrl, {
      method: 'POST',
      headers: combo.headers,
      body: JSON.stringify(payload),
    });

    const durationMs = Date.now() - t0;
    console.log(`[HTTP Response Status]: ${res.status} (${durationMs}ms)`);

    const responseText = await res.text();
    console.log(`[HTTP Response Body]:`, responseText);

    if (res.ok) {
      console.log(`\n======================================================`);
      console.log(`🎉 SUCCESS with header combo: ${combo.name}!`);
      console.log(`======================================================`);
      try {
        const json = JSON.parse(responseText);
        const choice = json?.choices?.[0];
        if (choice?.message?.reasoning_content) {
          console.log('\n🧠 GLM Chain-of-Thought Reasoning:\n', choice.message.reasoning_content);
        }
        if (choice?.message?.content) {
          console.log('\n💬 GLM Tactical Response:\n', choice.message.content);
        }
      } catch (e) {}
      return;
    }
  }
}



async function runTest() {
  try {
    const token = await getAccessToken();
    await testQuickMLGLM(token);
  } catch (err) {
    console.error('\n❌ Test Script Failed:', err.message);
    process.exit(1);
  }
}

runTest();
