import { createClient } from 'redis';

const STATE_KEY = 'betha:organograma:state:v1';
let redisClient = null;

async function getRedisClient() {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL não configurada.');
  }

  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (err) => console.error('[Redis] Erro:', err));
  }

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  return redisClient;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (!process.env.REDIS_URL) {
    return res.status(503).json({
      error: 'Banco de dados não configurado na Vercel (REDIS_URL ausente).'
    });
  }

  try {
    const redis = await getRedisClient();

    if (req.method === 'GET') {
      const raw = await redis.get(STATE_KEY);
      const state = raw ? JSON.parse(raw) : null;

      return res.status(200).json({
        configured: true,
        requiresPin: Boolean(process.env.ADMIN_PIN),
        state
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

      await redis.set(STATE_KEY, JSON.stringify(payloadToStore));
      return res.status(200).json({ ok: true, updatedAt: payloadToStore.updatedAt });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (err) {
    console.error('[api/organograma] Erro:', err);
    return res.status(500).json({ error: 'Erro interno ao processar dados do organograma.' });
  }
}
