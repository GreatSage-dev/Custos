import { Request, Response, NextFunction } from 'express';
import { CONFIG } from '../config';

export interface X402Challenge {
  status: 402;
  message: string;
  x402: {
    protocol: 'x402';
    version: '1.0';
    recipient: string;
    amount_usdt: string;
    chain_id: number;
    network: string;
    accepted_tokens: string[];
    payment_header_required: string;
  };
}

export function x402Middleware(req: Request, res: Response, next: NextFunction) {
  const paymentHeader = req.headers['x-payment-auth'] || req.headers['x-payment-proof'];
  const enforceX402 = req.query.x402 === 'true' || req.headers['x-require-payment'] === 'true';

  if (enforceX402 && !paymentHeader) {
    const challenge: X402Challenge = {
      status: 402,
      message: 'Payment Required: Custos ASP pre-transaction inspection fee',
      x402: {
        protocol: 'x402',
        version: '1.0',
        recipient: CONFIG.X402_PAYMENT_WALLET,
        amount_usdt: CONFIG.X402_PRICE_USDT,
        chain_id: CONFIG.XLAYER_CHAIN_ID,
        network: 'X Layer Testnet (Chain ID 195)',
        accepted_tokens: ['OKB', 'USDT', 'USDC'],
        payment_header_required: 'X-Payment-Auth',
      },
    };

    res.set({
      'WWW-Authenticate': `x402 realm="Custos Pre-Transaction Engine", payment_address="${CONFIG.X402_PAYMENT_WALLET}", price="${CONFIG.X402_PRICE_USDT} USDT", chain_id="${CONFIG.XLAYER_CHAIN_ID}"`,
      'X-402-Price': `${CONFIG.X402_PRICE_USDT} USDT`,
      'X-402-Payment-Address': CONFIG.X402_PAYMENT_WALLET,
    });

    return res.status(402).json(challenge);
  }

  res.setHeader('X-402-Supported', 'true');
  res.setHeader('X-ASP-Category', 'Finance Copilot');
  next();
}
