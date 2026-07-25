/**
 * Zia LLM & Multi-Agent Verification Script (Node.js)
 * KSP Trinetra Sentinel - API Gateway Tests
 */

const http = require('http');

function postJson(path, payload) {
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'x-user-role': 'COMMISSIONER',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ status: 503, error: err.message });
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('==================================================================');
  console.log('👁️🛡️ KSP TRINETRA SENTINEL - NODE.JS ZIA AGENT TESTER');
  console.log('==================================================================\n');

  console.log('[Test 1] Testing Zia Copilot English Chat (POST /api/chat)...');
  const chatRes = await postJson('/api/chat', {
    query: 'Suggest patrol deployments for Indiranagar two-wheeler thefts tonight',
    language: 'en',
  });
  console.log('Response Status:', chatRes.status);
  console.log('Output Payload:\n', JSON.stringify(chatRes.data || chatRes.error, null, 2));

  console.log('\n[Test 2] Testing Forensic Report Dissection (POST /api/forensics/dissect)...');
  const forensicRes = await postJson('/api/forensics/dissect', { case_id: 'CASE-2026-IND-88' });
  console.log('Response Status:', forensicRes.status);
  console.log('Output Payload:\n', JSON.stringify(forensicRes.data || forensicRes.error, null, 2));

  console.log('\n==================================================================');
  console.log('✅ TEST COMPLETED!');
  console.log('==================================================================');
}

main();
