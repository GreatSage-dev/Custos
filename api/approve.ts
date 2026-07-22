import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { DecisionEngine } from '../src/services/decisionEngine';

const decisionEngine = new DecisionEngine();

const approveSchema = z.object({
  provider_wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid provider wallet EVM address'),
  buyer_wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid buyer wallet EVM address'),
  service_price: z.number().positive('Service price must be greater than zero'),
  service_category: z.string().min(1, 'Service category is required'),
  deadline: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Payment-Auth, X-Payment-Proof');
  res.setHeader('X-402-Supported', 'true');
  res.setHeader('X-ASP-Category', 'Finance Copilot');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const parseResult = approveSchema.safeParse(body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid input parameters',
        details: parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      });
    }

    const decision = await decisionEngine.evaluate(parseResult.data);
    return res.status(200).json(decision);
  } catch (error: any) {
    console.error('Custos decision error:', error);
    return res.status(500).json({
      error: 'Internal Server Error during evaluation',
      message: error?.message || String(error),
    });
  }
}
