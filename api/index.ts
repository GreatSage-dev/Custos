import express, { Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { CONFIG } from '../src/config';
import { DecisionEngine } from '../src/services/decisionEngine';
import { x402Middleware } from '../src/middleware/x402';
import { errorHandler } from '../src/middleware/errorHandler';

const app = express();
const decisionEngine = new DecisionEngine();

app.use(cors());
app.use(express.json());
app.use(x402Middleware);

const approveSchema = z.object({
  provider_wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid provider wallet EVM address'),
  buyer_wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid buyer wallet EVM address'),
  service_price: z.number().positive('Service price must be greater than zero'),
  service_category: z.string().min(1, 'Service category is required'),
  deadline: z.string().optional(),
});

app.get(['/health', '/api/health', '/api', '/api/index'], (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    asp_name: 'Custos',
    asp_category: 'Finance Copilot',
    description: 'Pre-Transaction Decision Engine for OKX.AI (X Layer Network)',
    version: '1.0.0',
    chain_id: CONFIG.XLAYER_CHAIN_ID,
    rpc_endpoint: CONFIG.XLAYER_RPC_URL,
    x402_supported: true,
    x402_payment_wallet: CONFIG.X402_PAYMENT_WALLET,
    endpoints: {
      approve: 'POST /approve',
      mcp_tools: ['custos_approve_transaction'],
    },
  });
});

app.post(['/approve', '/api/approve', '/api', '/api/index'], async (req: Request, res: Response, next) => {
  try {
    const parseResult = approveSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid input parameters',
        details: parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      });
    }

    const decision = await decisionEngine.evaluate(parseResult.data);
    return res.json(decision);
  } catch (error) {
    return next(error);
  }
});

app.use(errorHandler);

export default function handler(req: any, res: any) {
  return app(req, res);
}
