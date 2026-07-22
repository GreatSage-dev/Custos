# 🛡️ Custos — Pre-Transaction Decision Engine for OKX.AI

> **OKX.AI Genesis Hackathon — Finance Copilot Category**

Custos is an **Agentic Service Provider (ASP)** designed as a pre-transaction decision engine for AI agents operating on **OKX.AI** and the **X Layer Network (Chain ID 1952)**.

Before paying a service provider, an autonomous AI agent queries Custos via `POST /approve`. Custos evaluates verifiable, real-time on-chain signals — including wallet age, transaction volume, category price deviation, and wash-trading graph entropy — and returns an actionable verdict and payment structure recommendation (`full_upfront`, `split`, or `escrow`).

---

## ✨ Features

- 🛡️ **Pre-Payment Risk Engine**: Intercepts transactions before funds leave your agent's wallet.
- 📊 **Real On-Chain Signals**: Fetches transaction history and metrics directly via X Layer JSON-RPC and OKLink Explorer.
- ⚡ **Wash-Trade & Sybil Detection**: Identifies cyclic volume farming and isolated counterparty clusters.
- 💡 **Smart Payment Structure**: Recommends `full_upfront`, `split (20/80)`, or `escrow` — not a static reputation score.
- 💳 **x402 Protocol Native**: Supports HTTP 402 payment headers (`X-Payment-Auth`) for pay-per-call agent monetization.
- 🔌 **Model Context Protocol (MCP)**: Exposes `custos_approve_transaction` for Cursor, Claude Desktop, and OKX AI agent runners.
- 🌐 **RainbowKit Wallet Integration**: Native wallet connection supporting Rabby, OKX Wallet, MetaMask, Rainbow, and Coinbase Wallet on X Layer Testnet (1952).

---

## 🛠️ Architecture

```
                               ┌───────────────────────────┐
                               │     Autonomous Agent      │
                               └─────────────┬─────────────┘
                                             │
                                   1. POST /approve
                                             │
                                             ▼
                               ┌───────────────────────────┐
                               │   Custos Decision Engine  │
                               └──────┬─────────────┬──────┘
                                      │             │
                    2. Query RPC      │             │ 3. Fetch History
                                      ▼             ▼
                           ┌──────────────┐    ┌──────────────┐
                           │ X Layer RPC  │    │   OKLink     │
                           │  (Chain 1952)│    │  Explorer    │
                           └──────────────┘    └──────────────┘
                                      │             │
                                      └──────┬──────┘
                                             │
                                   4. Return Verdict
                                      (APPROVED | CAUTION)
                                      (full_upfront | split | escrow)
```

---

## 🚀 Quick Start

### 1. Installation

```bash
git clone https://github.com/GreatSage-dev/Custos.git
cd Custos
npm install
```

### 2. Run Locally

```bash
npm run dev
```

- **Web Console & Landing Page**: [http://localhost:5173](http://localhost:5173)
- **API Endpoint**: `POST http://localhost:3000/approve`
- **ASP Discovery Manifest**: [http://localhost:3000/health](http://localhost:3000/health)

---

## 💻 1-Line SDK Usage

```typescript
import { custos } from 'custos-okx-asp';

const { decision, paymentResult } = await custos.guard(
  {
    provider_wallet: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    buyer_wallet:    "0x1234567890abcdef1234567890abcdef12345678",
    service_price:   40.0,
    service_category:"code_generation"
  },
  async (verdict) => {
    // Automatically routes via recommended payment structure
    return await executePayment(verdict.recommended_payment);
  }
);
```

---

## 📜 API Endpoint

### `POST /approve`

#### Request Body
```json
{
  "provider_wallet": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "buyer_wallet": "0x1234567890abcdef1234567890abcdef12345678",
  "service_price": 40.0,
  "service_category": "code_generation"
}
```

#### Response Body
```json
{
  "verdict": "APPROVED",
  "reasoning": [
    "Provider wallet first active on-chain 2024-03-23 (120 days ago) with 48 recorded transactions.",
    "Requested service price (40 OKB) is 1.0x relative to provider's historical average transaction value (40.0 OKB).",
    "Counterparty diversity verified: transaction graph shows normal distribution across multiple distinct addresses.",
    "Recommendation: Full upfront payment approved based on verified on-chain history and pricing alignment."
  ],
  "recommended_payment": "full_upfront",
  "metrics": {
    "wallet_address": "0x742d35cc6634c0532925a3b844bc454e4438f44e",
    "wallet_age_days": 120,
    "total_tx_count": 48,
    "price_deviation_ratio": 1.0,
    "wash_trading_detected": false,
    "is_thin_history": false
  }
}
```

---

## 📄 License

MIT © 2024 Custos Team — OKX.AI Genesis Hackathon
