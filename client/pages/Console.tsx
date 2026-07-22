import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface Preset {
  provider: string;
  price: number;
  category: string;
}

const PRESETS: Record<string, Preset> = {
  established: { provider: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', price: 40, category: 'code_generation' },
  price_spike: { provider: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', price: 150, category: 'code_generation' },
  wash_trading: { provider: '0x9999999999999999999999999999999999999999', price: 25, category: 'trading_signal' },
  thin_history: { provider: '0x0000000000000000000000000000000000000001', price: 30, category: 'general' },
};

interface VerdictData {
  verdict: string;
  reasoning: string[];
  recommended_payment: string;
  split_ratio?: string;
  metrics?: {
    wallet_age_days: number;
    total_tx_count: number;
    price_deviation_ratio: number;
    wash_trading_detected: boolean;
    is_thin_history: boolean;
  };
}

export default function Console() {
  const { address, isConnected } = useAccount();
  const [activePreset, setActivePreset] = useState('established');
  const [providerWallet, setProviderWallet] = useState(PRESETS.established.provider);
  const [buyerWallet, setBuyerWallet] = useState('');
  const [servicePrice, setServicePrice] = useState(PRESETS.established.price);
  const [serviceCategory, setServiceCategory] = useState(PRESETS.established.category);
  const [verdict, setVerdict] = useState<VerdictData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) setBuyerWallet(address);
  }, [address]);

  const runCheck = useCallback(async (provider: string, buyer: string, price: number, category: string) => {
    if (!buyer) return;
    setLoading(true);
    try {
      const res = await fetch('/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_wallet: provider,
          buyer_wallet: buyer,
          service_price: price,
          service_category: category,
        }),
      });
      const data = await res.json();
      setVerdict(data);
    } catch (err) {
      console.error('Custos API error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleX402Test = async () => {
    setLoading(true);
    try {
      const res = await fetch('/approve?x402=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_wallet: providerWallet,
          buyer_wallet: buyerWallet || '0x1234567890abcdef1234567890abcdef12345678',
          service_price: servicePrice,
          service_category: serviceCategory,
        }),
      });
      const data = await res.json();
      setVerdict({
        verdict: 'HTTP 402',
        recommended_payment: 'x402 Challenge Required',
        reasoning: [
          'HTTP 402 Payment Required — ASP endpoint requires pay-per-call header.',
          `Recipient Wallet: ${data.x402?.recipient || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'}`,
          `Pay-per-call Fee: ${data.x402?.amount_usdt || '0.01'} USDT on X Layer (Chain 1952)`,
          'Required Header: X-Payment-Auth (signed EIP-712 payload)',
        ],
        metrics: {
          wallet_age_days: 0,
          total_tx_count: 0,
          price_deviation_ratio: 0.01,
          wash_trading_detected: false,
          is_thin_history: false,
        },
      });
    } catch (err) {
      console.error('x402 test error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      runCheck(providerWallet, address, servicePrice, serviceCategory);
    }
  }, [isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePresetChange = (key: string) => {
    const p = PRESETS[key];
    if (!p) return;
    setActivePreset(key);
    setProviderWallet(p.provider);
    setServicePrice(p.price);
    setServiceCategory(p.category);
    const targetBuyer = buyerWallet || address || '';
    if (targetBuyer) {
      runCheck(p.provider, targetBuyer, p.price, p.category);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const targetBuyer = buyerWallet || address || '';
    if (targetBuyer) {
      runCheck(providerWallet, targetBuyer, servicePrice, serviceCategory);
    }
  };

  const formatAddr = (a: string) => a ? `${a.slice(0, 6)}...${a.slice(-4)}` : '';
  const isApproved = verdict?.verdict === 'APPROVED';

  /* ── Wallet Gate ── */
  if (!isConnected) {
    return (
      <div className="wallet-gate">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
        <h2>Connect Your Wallet</h2>
        <p>Connect your X Layer Testnet wallet to access the Custos decision engine console.</p>
        <ConnectButton />
      </div>
    );
  }

  /* ── Connected Console ── */
  return (
    <div className="console-page">
      {/* Header */}
      <div className="console-header">
        <h2>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
          {' '}Decision Console
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <span className="connected-badge">
            <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#10b981"/></svg>
            {formatAddr(address!)}
          </span>
          <span className="connected-badge">X Layer Testnet (1952)</span>
        </div>
      </div>

      {/* Scenario Pills */}
      <div className="scenario-pills">
        {([
          ['established', 'Established', 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M9 11l3 3L22 4'],
          ['price_spike', 'Price Spike', 'M13 2l-2 9h7L11 22'],
          ['wash_trading', 'Wash Trade', 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01'],
          ['thin_history', 'Thin History', 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2'],
        ] as const).map(([key, label, paths]) => (
          <button
            key={key}
            className={`pill ${activePreset === key ? 'active' : ''}`}
            onClick={() => handlePresetChange(key)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {paths.split(' M').map((p, i) => (
                <path key={i} d={i === 0 ? p : `M${p}`} />
              ))}
            </svg>
            {label}
          </button>
        ))}
      </div>

      {/* Two Column Grid */}
      <div className="console-grid">
        {/* ── Left: Input ── */}
        <div className="console-input">
          <div className="col-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
            <h3>Transaction Input</h3>
            <span className="method-badge">POST /approve</span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
            <div className="field">
              <label>Provider Wallet</label>
              <input type="text" value={providerWallet} onChange={e => setProviderWallet(e.target.value)} />
            </div>
            <div className="field">
              <label>Buyer Wallet (your connected address)</label>
              <input type="text" value={buyerWallet} onChange={e => setBuyerWallet(e.target.value)} />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Price (OKB)</label>
                <input type="number" step="0.1" value={servicePrice} onChange={e => setServicePrice(Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Category</label>
                <select value={serviceCategory} onChange={e => setServiceCategory(e.target.value)}>
                  <option value="code_generation">Code Generation</option>
                  <option value="audit">Security Audit</option>
                  <option value="trading_signal">Trading Signal</option>
                  <option value="data_feed">Data Feed</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
            <div className="form-btns">
              <button type="submit" className="run-btn" disabled={loading}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>
                {loading ? 'Scanning…' : 'Execute Check'}
              </button>
              <button type="button" className="x402-btn" onClick={handleX402Test}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>
                x402 Test
              </button>
            </div>
          </form>
        </div>

        {/* ── Right: Output ── */}
        <div className="console-output">
          <div className="col-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <h3>Decision Verdict</h3>
            {loading && (
              <div className="scan-ind">
                <span className="scan-dot" /> Scanning
              </div>
            )}
          </div>

          {verdict ? (
            <>
              {/* Verdict Banner */}
              <div className={`verdict-banner ${isApproved ? 'approved' : 'caution'}`}>
                <div className="vb-left">
                  <span className="vb-label">VERDICT</span>
                  <div className="vb-title-row">
                    {isApproved ? (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    )}
                    <h2>{verdict.verdict}</h2>
                  </div>
                </div>
                <div className="vb-right">
                  <span className="vb-rec-label">Payment Structure</span>
                  <strong>{verdict.recommended_payment}</strong>
                  {verdict.split_ratio && (
                    <span className="split-badge">{verdict.split_ratio}</span>
                  )}
                </div>
              </div>

              {/* Reasoning Signals */}
              <div className="signals-box">
                <h4>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  Verifiable Signal Reasoning
                </h4>
                <ul className="signal-list">
                  {verdict.reasoning.map((r, i) => {
                    const isWarn = /DEVIATION|WASH|CAUTION|Escrow|escrow|MODERATE|thin/i.test(r);
                    return (
                      <li key={i} className={isWarn ? 'warn' : ''} style={{ animationDelay: `${i * 0.06}s` }}>
                        {r}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Metrics Row */}
              {verdict.metrics && (
                <div className="metrics-row">
                  <div className="mcard">
                    <span className="mc-label">Wallet Age</span>
                    <strong className="mc-val">{verdict.metrics.wallet_age_days}d</strong>
                  </div>
                  <div className="mcard">
                    <span className="mc-label">Tx Count</span>
                    <strong className="mc-val">{verdict.metrics.total_tx_count}</strong>
                  </div>
                  <div className="mcard">
                    <span className="mc-label">Price Dev.</span>
                    <strong className="mc-val">{verdict.metrics.price_deviation_ratio}x</strong>
                  </div>
                  <div className="mcard">
                    <span className="mc-label">Wash Trade</span>
                    <strong className="mc-val" style={{ color: verdict.metrics.wash_trading_detected ? '#f43f5e' : '#10b981' }}>
                      {verdict.metrics.wash_trading_detected ? 'DETECTED' : 'CLEAR'}
                    </strong>
                  </div>
                </div>
              )}

              {/* JSON Inspector */}
              <details className="json-detail">
                <summary>Raw JSON Response <span className="chevron">›</span></summary>
                <pre><code>{JSON.stringify(verdict, null, 2)}</code></pre>
              </details>
            </>
          ) : (
            <div style={{ color: '#475569', textAlign: 'center', marginTop: '3rem' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" style={{ marginBottom: '.75rem' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <p>Run a check to see the verdict…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
