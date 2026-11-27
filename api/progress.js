const crypto = require('crypto');

const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const REQUIRED_PIN = process.env.SYNC_PIN || '';

async function upstashCommand(command) {
  const response = await fetch(REST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upstash HTTP ${response.status}: ${text}`);
  }

  return response.json();
}

function getStorageKey(rawKey) {
  const hash = crypto.createHash('sha256').update(`estudo-algoritmo:${rawKey}`).digest('hex');
  return `study:progress:${hash}`;
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (!REST_URL || !REST_TOKEN) {
    return res.status(503).json({
      error: 'database_not_configured',
      message: 'Conecte o Upstash Redis no painel da Vercel (Storage) e faça Redeploy.',
    });
  }

  const syncKey = String(req.headers['x-sync-key'] || '').trim();
  if (syncKey.length < 4 || syncKey.length > 128) {
    return res.status(400).json({
      error: 'invalid_sync_key',
      message: 'Informe uma chave de sincronização com pelo menos 4 caracteres.',
    });
  }

  if (REQUIRED_PIN && !safeEqual(syncKey, REQUIRED_PIN)) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Chave de sincronização incorreta.',
    });
  }

  const redisKey = getStorageKey(syncKey);

  try {
    if (req.method === 'GET') {
      const data = await upstashCommand(['GET', redisKey]);
      if (!data.result) {
        return res.status(200).json({ exists: false, state: null });
      }
      const parsed = JSON.parse(data.result);
      return res.status(200).json({ exists: true, state: parsed });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'invalid_body' });
      }

      const sanitized = {
        challenges: body.challenges && typeof body.challenges === 'object' ? body.challenges : {},
        videos: body.videos && typeof body.videos === 'object' ? body.videos : {},
        theory: body.theory && typeof body.theory === 'object' ? body.theory : {},
        notes: body.notes && typeof body.notes === 'object' ? body.notes : {},
        updatedAt: new Date().toISOString(),
      };

      const serialized = JSON.stringify(sanitized);
      if (serialized.length > 65536) {
        return res.status(413).json({ error: 'payload_too_large' });
      }

      await upstashCommand(['SET', redisKey, serialized]);
      return res.status(200).json({ ok: true, updatedAt: sanitized.updatedAt });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('Sync API error:', err);
    return res.status(500).json({ error: 'internal_error', message: 'Falha ao falar com o banco de dados.' });
  }
};
