import { RpcFetcher } from './rpcFetcher';
import { OklinkFetcher } from './oklinkFetcher';
import { CONFIG } from '../config';
import {
  ApproveInput,
  ApproveOutput,
  WalletMetricsSummary,
  TransactionRecord,
  Verdict,
  PaymentRecommendation,
} from '../types/custos';

export class DecisionEngine {
  private rpcFetcher: RpcFetcher;
  private oklinkFetcher: OklinkFetcher;

  constructor() {
    this.rpcFetcher = new RpcFetcher();
    this.oklinkFetcher = new OklinkFetcher();
  }

  /**
   * Main entrypoint for pre-transaction evaluation
   */
  async evaluate(input: ApproveInput): Promise<ApproveOutput> {
    const providerAddr = input.provider_wallet.toLowerCase();
    const buyerAddr = input.buyer_wallet.toLowerCase();
    const price = input.service_price;
    const category = (input.service_category || 'general').toLowerCase();

    // 1. Fetch RPC facts & OKLink wallet history
    const [rpcInfo, oklinkHistory, currentTimestamp] = await Promise.all([
      this.rpcFetcher.getWalletRpcInfo(providerAddr),
      this.oklinkFetcher.getWalletHistory(providerAddr),
      this.rpcFetcher.getLatestBlockTimestamp(),
    ]);

    // Consolidate real transaction metrics
    const txCount = Math.max(rpcInfo.txCount, oklinkHistory.totalTxCount);
    const transactions = oklinkHistory.transactions;

    // Calculate Wallet Age
    let walletAgeDays = 0;
    let firstTxDateStr: string | null = null;

    if (oklinkHistory.firstTxTimestamp && oklinkHistory.firstTxTimestamp > 0) {
      const ageSeconds = Math.max(0, currentTimestamp - oklinkHistory.firstTxTimestamp);
      walletAgeDays = Math.floor(ageSeconds / 86400);
      firstTxDateStr = new Date(oklinkHistory.firstTxTimestamp * 1000).toISOString().split('T')[0];
    }

    // Calculate Historical Average Price
    const historicalPrices = transactions
      .filter((t) => t.to === providerAddr && t.value > 0)
      .map((t) => t.value);

    const historicalAvgPrice =
      historicalPrices.length > 0
        ? historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length
        : 0;

    // Category Median Price
    const categoryMedianPrice = CONFIG.CATEGORY_MEDIANS[category] || CONFIG.CATEGORY_MEDIANS['general'];

    // Price Deviation Ratio
    const benchmarkPrice = historicalAvgPrice > 0 ? historicalAvgPrice : categoryMedianPrice;
    const priceDeviationRatio = benchmarkPrice > 0 ? parseFloat((price / benchmarkPrice).toFixed(2)) : 1.0;

    // Wash-Trading Pattern Analysis
    const washTradingResult = this.detectWashTrading(providerAddr, transactions);

    // Is Thin History (< 5 transactions)
    const isThinHistory = txCount < 5;

    // Build plain-language reasoning tracing 100% to real signals
    const reasoning: string[] = [];
    let cautionFlags = 0;

    // Signal 1: Wallet Age & History Depth
    if (walletAgeDays > 0) {
      reasoning.push(
        `Provider wallet first active on-chain ${firstTxDateStr} (${walletAgeDays} days ago) with ${txCount} recorded transactions.`
      );
      if (walletAgeDays < 7) {
        cautionFlags++;
        reasoning.push(`Wallet age is under 7 days (${walletAgeDays} days old).`);
      }
    } else if (isThinHistory) {
      reasoning.push(
        `Provider wallet has thin on-chain history (${txCount} recorded transactions on X Layer).`
      );
    } else {
      reasoning.push(`Provider wallet transaction count verified at ${txCount} transactions on X Layer.`);
    }

    // Signal 2: Price Deviation Evaluation
    if (historicalAvgPrice > 0) {
      reasoning.push(
        `Requested service price (${price} OKB) is ${priceDeviationRatio}x relative to provider's historical average transaction value (${historicalAvgPrice.toFixed(1)} OKB).`
      );
    } else {
      reasoning.push(
        `Requested service price (${price} OKB) evaluated against ${category} category benchmark median (${categoryMedianPrice} OKB).`
      );
    }

    if (priceDeviationRatio >= 3.0) {
      cautionFlags++;
      reasoning.push(
        `PRICE DEVIATION: Service price is significantly higher (>= 3.0x) than expected benchmark pricing.`
      );
    } else if (priceDeviationRatio >= 2.0) {
      cautionFlags++;
      reasoning.push(
        `MODERATE PRICE ELEVATION: Service price exceeds 2.0x expected benchmark pricing.`
      );
    }

    // Signal 3: Wash-Trading Patterns
    if (washTradingResult.detected) {
      cautionFlags += 2;
      reasoning.push(
        `WASH TRADING PATTERN DETECTED: ${washTradingResult.reason}`
      );
    } else if (transactions.length > 5) {
      reasoning.push(
        `Counterparty diversity verified: transaction graph shows normal distribution across multiple distinct addresses.`
      );
    }

    // Signal 4: Thin-History Fallback Handling
    if (isThinHistory) {
      reasoning.push(
        `Fallback applied for thin-history wallet: listing metadata and category median pricing applied instead of rejecting as insufficient data.`
      );
    }

    // Determine Verdict & Recommended Payment Structure
    let verdict: Verdict = 'APPROVED';
    let recommended_payment: PaymentRecommendation = 'full_upfront';
    let split_ratio: string | undefined = undefined;

    if (washTradingResult.detected || cautionFlags >= 2) {
      verdict = 'CAUTION';
      recommended_payment = 'escrow';
      reasoning.push(
        `Recommendation: Escrow payment structure mandatory due to elevated risk signals.`
      );
    } else if (cautionFlags === 1 || isThinHistory) {
      verdict = 'CAUTION';
      recommended_payment = 'split';
      split_ratio = '20/80';
      reasoning.push(
        `Recommendation: Split payment (20% upfront, 80% upon completion/verification) recommended to mitigate initial counterpart risk.`
      );
    } else {
      verdict = 'APPROVED';
      recommended_payment = 'full_upfront';
      reasoning.push(
        `Recommendation: Full upfront payment approved based on verified on-chain history and pricing alignment.`
      );
    }

    const metricsSummary: WalletMetricsSummary = {
      wallet_address: providerAddr,
      first_tx_timestamp: firstTxDateStr,
      wallet_age_days: walletAgeDays,
      total_tx_count: txCount,
      total_volume_okb: oklinkHistory.totalVolumeOkb,
      historical_avg_price_okb: historicalAvgPrice,
      category_median_price_okb: categoryMedianPrice,
      price_deviation_ratio: priceDeviationRatio,
      wash_trading_detected: washTradingResult.detected,
      top_counterparties_ratio: washTradingResult.topCounterpartyRatio,
      is_thin_history: isThinHistory,
      onchain_verification_link: `https://www.oklink.com/xlayer-testnet/address/${providerAddr}`,
    };

    return {
      verdict,
      reasoning,
      recommended_payment,
      ...(split_ratio ? { split_ratio } : {}),
      metrics: metricsSummary,
    };
  }

  /**
   * Detects wash trading patterns
   */
  private detectWashTrading(
    providerAddr: string,
    transactions: TransactionRecord[]
  ): { detected: boolean; reason: string; topCounterpartyRatio: number } {
    if (transactions.length < 4) {
      return { detected: false, reason: '', topCounterpartyRatio: 0 };
    }

    const incomingTxs = transactions.filter((t) => t.to === providerAddr);
    if (incomingTxs.length < 3) {
      return { detected: false, reason: '', topCounterpartyRatio: 0 };
    }

    const counterpartyCounts: Record<string, number> = {};
    const counterpartyTimestamps: Record<string, number[]> = {};

    for (const tx of incomingTxs) {
      const sender = tx.from;
      counterpartyCounts[sender] = (counterpartyCounts[sender] || 0) + 1;
      if (!counterpartyTimestamps[sender]) {
        counterpartyTimestamps[sender] = [];
      }
      counterpartyTimestamps[sender].push(tx.timestamp);
    }

    const totalIncoming = incomingTxs.length;
    const sortedSenders = Object.entries(counterpartyCounts).sort((a, b) => b[1] - a[1]);
    const top3Count = sortedSenders.slice(0, 3).reduce((acc, curr) => acc + curr[1], 0);
    const topCounterpartyRatio = parseFloat((top3Count / totalIncoming).toFixed(2));

    if (sortedSenders.length <= 3 && totalIncoming >= 6 && topCounterpartyRatio >= 0.6) {
      return {
        detected: true,
        reason: `${(topCounterpartyRatio * 100).toFixed(0)}% of incoming transactions originate from only ${sortedSenders.length} counterparty wallets.`,
        topCounterpartyRatio,
      };
    }

    for (const [sender, timestamps] of Object.entries(counterpartyTimestamps)) {
      if (timestamps.length >= 3) {
        const sortedTime = [...timestamps].sort((a, b) => a - b);
        const intervals: number[] = [];
        for (let i = 1; i < sortedTime.length; i++) {
          intervals.push(sortedTime[i] - sortedTime[i - 1]);
        }

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance =
          intervals.reduce((acc, val) => acc + Math.pow(val - avgInterval, 2), 0) / intervals.length;
        const stdDev = Math.sqrt(variance);

        if (avgInterval > 0 && stdDev < 60 && intervals.length >= 3) {
          return {
            detected: true,
            reason: `Unnaturally uniform time intervals (avg ${Math.round(avgInterval)}s ±${Math.round(stdDev)}s) detected from counterparty ${sender.substring(0, 8)}...`,
            topCounterpartyRatio,
          };
        }
      }
    }

    return { detected: false, reason: '', topCounterpartyRatio };
  }
}
