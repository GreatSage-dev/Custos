import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Payment-Auth, X-Payment-Proof');
  res.setHeader('X-402-Supported', 'true');
  res.setHeader('X-ASP-Category', 'Finance Copilot');

  return res.status(200).json({
    status: 'ok',
    asp_name: 'Custos',
    asp_category: 'Finance Copilot',
    description: 'Pre-Transaction Decision Engine for OKX.AI (X Layer Network)',
    version: '1.0.0',
    chain_id: 1952,
    rpc_endpoint: 'https://testrpc.xlayer.tech',
    x402_supported: true,
    x402_payment_wallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    endpoints: {
      approve: 'POST /approve',
      mcp_tools: ['custos_approve_transaction'],
    },
  });
}
