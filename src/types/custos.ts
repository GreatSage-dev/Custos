/**
 * Custos — Pre-Transaction Decision Engine Type Definitions
 */

export type ServiceCategory =
  | 'audit'
  | 'code_generation'
  | 'trading_signal'
  | 'data_feed'
  | 'infrastructure'
  | 'general';

export type Verdict = 'APPROVED' | 'CAUTION';

export type PaymentRecommendation = 'full_upfront' | 'split' | 'escrow';

export interface ApproveInput {
  provider_wallet: string;
  buyer_wallet: string;
  service_price: number; // In native OKB / USDT
  service_category: ServiceCategory | string;
  deadline?: string;
}

export interface ApproveOutput {
  verdict: Verdict;
  reasoning: string[];
  recommended_payment: PaymentRecommendation;
  split_ratio?: string; // e.g. "20/80" or "50/50"
  metrics?: WalletMetricsSummary; // Verifiable computed metrics summary
}

export interface WalletMetricsSummary {
  wallet_address: string;
  first_tx_timestamp: string | null;
  wallet_age_days: number;
  total_tx_count: number;
  total_volume_okb: number;
  historical_avg_price_okb: number;
  category_median_price_okb: number;
  price_deviation_ratio: number;
  wash_trading_detected: boolean;
  top_counterparties_ratio: number;
  is_thin_history: boolean;
  onchain_verification_link: string;
}

export interface TransactionRecord {
  hash: string;
  from: string;
  to: string;
  value: number; // Value in OKB / native token
  timestamp: number; // Epoch seconds
  blockNumber: number;
}
