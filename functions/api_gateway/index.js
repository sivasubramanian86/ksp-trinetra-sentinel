const express = require('express');
const cors = require('cors');
const catalyst = require('zcatalyst-sdk-node');
const { getThreatVector, traceSyndicateNetwork, analyzeMultimodalEvidence, queryKspLegalSops } = require('./mcp_server');
const { handleRAGQuery } = require('./rag_orchestrator');
const { verifyRole, authenticate } = require('./auth');

const app = express();
app.use(cors());

app.use((req, res, next) => {
  if (req.url.startsWith('/server/api_gateway')) {
    req.url = req.url.replace('/server/api_gateway', '') || '/';
  }
  next();
});

app.use(express.json());


// Initialize Zoho Catalyst Cache Segment for Context & Forecast Caching
let cacheSegment = null;
try {
  const catalystApp = catalyst.initialize();
  cacheSegment = catalystApp.cache().segment('ksp_context_cache');
  console.log('[+] Catalyst Cache segment initialized: ksp_context_cache');

  // Seed default context caching items into Catalyst Cache
  cacheSegment.put('ksp_bns_2023_legal_sops', JSON.stringify({
    act: "Bharatiya Nyaya Sanhita (BNS 2023)",
    section: "Section 304 (Snatching / Robbery)",
    guidelines: "Deploy 2 Hoysala patrol units immediately. Anonymize complainant PII."
  }), 86400).catch(e => console.log(e.message));

  cacheSegment.put('hotspot_baseline_indiranagar', JSON.stringify({
    beat: "BNG-INDIRANAGAR-B1",
    baselineRisk: 78.5,
    lastScanned: new Date().toISOString()
  }), 86400).catch(e => console.log(e.message));

} catch (e) {
  console.log('[*] Operating in local memory cache fallback mode');
}

const memoryCache = new Map();

// Context Caching Helper
async function getCachedOrFetch(key, ttlSeconds, fetcherFn) {
  if (cacheSegment) {
    try {
      const cachedVal = await cacheSegment.get(key);
      if (cachedVal) {
        console.log(`[Cache Hit] Catalyst Cache key: ${key}`);
        return JSON.parse(cachedVal);
      }
    } catch (err) {
      console.log(`[*] Catalyst Cache read error: ${err.message}`);
    }
  }

  if (memoryCache.has(key)) {
    const item = memoryCache.get(key);
    if (Date.now() < item.expiry) {
      return item.data;
    }
  }

  const freshData = await fetcherFn();

  if (cacheSegment) {
    try {
      await cacheSegment.put(key, JSON.stringify(freshData), ttlSeconds);
    } catch (err) {
      console.log(`[*] Catalyst Cache write error: ${err.message}`);
    }
  }

  memoryCache.set(key, {
    data: freshData,
    expiry: Date.now() + ttlSeconds * 1000,
  });

  return freshData;
}

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'KSP Trinetra Sentinel API Gateway',
    catalystCache: cacheSegment ? 'ENABLED' : 'MEMORY_FALLBACK',
    timestamp: new Date().toISOString(),
  });
});

// 1. Spatio-Temporal Hotspot Risk Forecast (Cached for 15 minutes)
app.get('/api/hotspots/forecast', verifyRole(['COMMISSIONER', 'ANALYST', 'PATROL_OFFICER']), async (req, res) => {
  try {
    const lat = req.query.lat || 12.9716;
    const lon = req.query.lon || 77.5946;
    const cacheKey = `forecast_${lat}_${lon}`;

    const forecast = await getCachedOrFetch(cacheKey, 900, async () => {
      return await getThreatVector(lat, lon);
    });

    res.json({ success: true, forecast });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Multi-Hop Syndicate Network Graph Traversal
app.post('/api/graph/story', verifyRole(['COMMISSIONER', 'ANALYST']), async (req, res) => {
  try {
    const { entityId, hops = 3 } = req.body;
    const cacheKey = `graph_${entityId}_${hops}`;

    const syndicateGraph = await getCachedOrFetch(cacheKey, 600, async () => {
      return await traceSyndicateNetwork(entityId, hops);
    });

    res.json({ success: true, graph: syndicateGraph });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Multimodal CCTV ANPR & Voice Evidence Analysis
app.post('/api/multimodal/analyze', verifyRole(['COMMISSIONER', 'ANALYST', 'PATROL_OFFICER']), async (req, res) => {
  try {
    const { mediaType, mediaUrl } = req.body;
    const analysis = await analyzeMultimodalEvidence(mediaType, mediaUrl);
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Zia GraphRAG Law Enforcement Copilot (Kannada + English with Context Caching)
app.post('/api/chat', verifyRole(['COMMISSIONER', 'ANALYST', 'PATROL_OFFICER']), async (req, res) => {
  try {
    const { query, language = 'en' } = req.body;
    const cacheKey = `rag_${Buffer.from(query).toString('base64').substring(0, 32)}_${language}`;

    const briefing = await getCachedOrFetch(cacheKey, 300, async () => {
      return await handleRAGQuery(query, language);
    });

    res.json({ success: true, briefing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[+] API Gateway running on port ${PORT}`);
  });
}

module.exports = app;
