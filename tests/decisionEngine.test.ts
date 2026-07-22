import { describe, it, expect } from 'vitest';
import { DecisionEngine } from '../src/services/decisionEngine';

describe('Custos DecisionEngine Unit & Integration Tests', () => {
  const engine = new DecisionEngine();

  it('should approve an established wallet with normal price alignment', async () => {
    const output = await engine.evaluate({
      provider_wallet: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      buyer_wallet: '0x1234567890abcdef1234567890abcdef12345678',
      service_price: 40.0,
      service_category: 'code_generation',
    });

    expect(output.verdict).toBe('APPROVED');
    expect(output.recommended_payment).toBe('full_upfront');
    expect(output.reasoning.length).toBeGreaterThan(0);
    expect(output.metrics).toBeDefined();
    expect(output.metrics?.wallet_address).toBe('0x742d35cc6634c0532925a3b844bc454e4438f44e');
  });

  it('should flag CAUTION and recommend split 20/80 when service price significantly exceeds category benchmark', async () => {
    const output = await engine.evaluate({
      provider_wallet: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      buyer_wallet: '0x1234567890abcdef1234567890abcdef12345678',
      service_price: 150.0,
      service_category: 'code_generation',
    });

    expect(output.verdict).toBe('CAUTION');
    expect(output.recommended_payment).toBe('split');
    expect(output.split_ratio).toBe('20/80');
    expect(output.reasoning.some((r) => r.includes('PRICE DEVIATION') || r.includes('ELEVATION'))).toBe(true);
  });

  it('should detect wash-trading patterns and mandate escrow payment', async () => {
    const output = await engine.evaluate({
      provider_wallet: '0x9999999999999999999999999999999999999999',
      buyer_wallet: '0x1234567890abcdef1234567890abcdef12345678',
      service_price: 25.0,
      service_category: 'trading_signal',
    });

    expect(output.verdict).toBe('CAUTION');
    expect(output.recommended_payment).toBe('escrow');
    expect(output.metrics?.wash_trading_detected).toBe(true);
    expect(output.reasoning.some((r) => r.includes('WASH TRADING PATTERN DETECTED'))).toBe(true);
  });

  it('should apply fallback reasoning for thin-history wallets without fabricated data', async () => {
    const output = await engine.evaluate({
      provider_wallet: '0x0000000000000000000000000000000000000001',
      buyer_wallet: '0x1234567890abcdef1234567890abcdef12345678',
      service_price: 25.0,
      service_category: 'general',
    });

    expect(output.verdict).toBe('CAUTION');
    expect(output.recommended_payment).toBe('split');
    expect(output.metrics?.is_thin_history).toBe(true);
    expect(output.reasoning.some((r) => r.includes('thin-history'))).toBe(true);
  });
});
