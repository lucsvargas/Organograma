const STATE_KEY = 'betha:organograma:state:v1';

function getRedisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return { url, token };
}

async function redisGet(url, token, key) {
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Redis GET falhou (${res.status})`);
  const data = await res.json();
  return data.result ? JSON.parse(data.result) : null;
}

async function redisSet(url, token, key, value) {
  const res = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(value)
  });
  if (!res.ok) throw new Error(`Redis SET falhou (${res.status})`);
  return res.json();
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const { url, token } = getRedisConfig();
  if (!url || !token) {
    return res.status(503).json({
      error: 'Banco de dados não configurado na Vercel (KV_REST_API_URL / UPSTASH_REDIS_REST_URL).'
    });
  }

  try {
    if (req.method === 'GET') {
      const state = await redisGet(url, token, STATE_KEY);
      return res.status(200).json({
        configured: true,
        requiresPin: Boolean(process.env.ADMIN_PIN),
        state: state || null
      });
    }

    if (req.method === 'POST') {
      const expectedPin = process.env.ADMIN_PIN;
      if (expectedPin) {
        const providedPin = req.headers['x-admin-pin'] || '';
        if (providedPin !== expectedPin) {
          return res.status(401).json({ error: 'PIN de administrador inválido ou ausente.' });
        }
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || typeof body.customOrgData !== 'object') {
        return res.status(400).json({ error: 'Payload inválido.' });
      }

      const payloadToStore = {
        customOrgData: body.customOrgData,
        deletedNodeIds: Array.isArray(body.deletedNodeIds) ? body.deletedNodeIds : [],
        tourConfig: body.tourConfig || null,
        updatedAt: new Date().toISOString()
      };

      await redisSet(url, token, STATE_KEY, payloadToStore);
      return res.status(200).json({ ok: true, updatedAt: payloadToStore.updatedAt });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (err) {
    console.error('[api/organograma] Erro:', err);
    return res.status(500).json({ error: 'Erro interno ao processar dados do organograma.' });
  }
}