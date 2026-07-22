import { useState } from 'react';

export default function ApiDocs() {
  const [activeTab, setActiveTab] = useState<'curl' | 'ts' | 'python'>('curl');

  const snippets = {
    curl: `curl -X POST http://localhost:3000/approve \\
  -H "Content-Type: application/json" \\
  -d '{
    "provider_wallet": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "buyer_wallet": "0x1234567890abcdef1234567890abcdef12345678",
    "service_price": 40.0,
    "service_category": "code_generation"
  }'`,
    ts: `import { custos } from 'custos-okx-asp';

const { decision } = await custos.guard(
  {
    provider_wallet: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    buyer_wallet: "0x1234567890abcdef1234567890abcdef12345678",
    service_price: 40.0,
    service_category: "code_generation"
  },
  async (verdict) => executePayment(verdict.recommended_payment)
);`,
    python: `import requests

res = requests.post("http://localhost:3000/approve", json={
    "provider_wallet": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "buyer_wallet": "0x1234567890abcdef1234567890abcdef12345678",
    "service_price": 40.0,
    "service_category": "code_generation"
})

verdict = res.json()
print(verdict["verdict"], verdict["recommended_payment"])`,
  };

  return (
    <div className="api-docs-page" style={{ padding: '2rem 0 4rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="feat-tag">—— ASP DEVELOPER API ——</span>
        <h1 className="hero-title" style={{ fontSize: '2.5rem', margin: '.6rem 0' }}>
          Custos <span className="hero-accent">API & Specification</span>
        </h1>
        <p className="hero-sub" style={{ maxWidth: '640px', margin: '0 auto' }}>
          Integrate the pre-transaction decision engine into any AI agent, MCP client, or automated payment pipeline on X Layer.
        </p>
      </div>

      {/* Main Grid */}
      <div className="api-grid-2col" style={{ marginBottom: '2.5rem' }}>
        {/* Endpoint Details */}
        <div className="feat-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1rem' }}>
            <span className="method-badge" style={{ background: '#10b98122', color: '#10b981', fontSize: '.85rem', padding: '.3rem .6rem' }}>POST</span>
            <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--mono)' }}>/approve</h2>
          </div>
          <p style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '1.25rem' }}>
            Evaluates pre-transaction risk using real on-chain X Layer block data. Returns verdict, plain-language signal explanations, and recommended payment structure.
          </p>

          <h4 style={{ color: 'var(--purple-l)', fontSize: '.85rem', marginBottom: '.6rem' }}>REQUEST BODY (JSON)</h4>
          <pre style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '10px', fontFamily: 'var(--mono)', fontSize: '.78rem', border: '1px solid var(--border)', color: '#c084fc', marginBottom: '1.25rem' }}>
{`{
  "provider_wallet": "string (EVM address)",
  "buyer_wallet":    "string (EVM address)",
  "service_price":   number (in OKB/USDT),
  "service_category":"string (audit | code_generation | trading_signal | general)",
  "deadline":        "string (optional ISO timestamp)"
}`}
          </pre>

          <h4 style={{ color: 'var(--purple-l)', fontSize: '.85rem', marginBottom: '.6rem' }}>RESPONSE BODY (JSON)</h4>
          <pre style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '10px', fontFamily: 'var(--mono)', fontSize: '.78rem', border: '1px solid var(--border)', color: '#86efac' }}>
{`{
  "verdict": "APPROVED | CAUTION",
  "reasoning": [ "Array of verifiable signal explanations" ],
  "recommended_payment": "full_upfront | split | escrow",
  "split_ratio": "20/80 (optional)",
  "metrics": { ... }
}`}
          </pre>
        </div>

        {/* Code Snippet Switcher */}
        <div className="feat-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Integration Code</h3>
            <div style={{ display: 'flex', gap: '.3rem', background: 'rgba(255,255,255,0.04)', padding: '.25rem', borderRadius: '10px' }}>
              {(['curl', 'ts', 'python'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: activeTab === tab ? 'var(--purple)' : 'transparent',
                    color: activeTab === tab ? '#fff' : 'var(--text2)',
                    border: 'none',
                    padding: '.3rem .7rem',
                    borderRadius: '8px',
                    fontSize: '.78rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <pre style={{ background: 'rgba(0,0,0,0.5)', padding: '1.25rem', borderRadius: '12px', fontFamily: 'var(--mono)', fontSize: '.8rem', lineHeight: '1.6', border: '1px solid var(--border)', color: '#f1f5f9', overflowX: 'auto', minHeight: '280px' }}>
            <code>{snippets[activeTab]}</code>
          </pre>
        </div>
      </div>

      {/* Protocol Protocols: x402 & MCP */}
      <div className="api-grid-2col">
        <div className="feat-card" style={{ padding: '1.5rem' }}>
          <div className="fc-icon-wrap amber" style={{ marginBottom: '.75rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '.4rem' }}>x402 Protocol Support</h3>
          <p style={{ color: 'var(--text2)', fontSize: '.88rem', lineHeight: '1.6' }}>
            Unauthenticated requests return <code style={{ color: '#fbbf24' }}>HTTP 402 Payment Required</code> headers compliant with OKX ASP x402 spec. Agents include a signed <code style={{ color: '#a78bfa' }}>X-Payment-Auth</code> header to settle 0.01 USDT per query on X Layer.
          </p>
        </div>

        <div className="feat-card" style={{ padding: '1.5rem' }}>
          <div className="fc-icon-wrap purple" style={{ marginBottom: '.75rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '.4rem' }}>Model Context Protocol (MCP)</h3>
          <p style={{ color: 'var(--text2)', fontSize: '.88rem', lineHeight: '1.6' }}>
            Custos includes a stdio MCP server (`src/mcp/server.ts`) exposing the tool <code style={{ color: '#c084fc' }}>custos_approve_transaction</code> for Cursor, Claude Desktop, and OKX AI agent runners.
          </p>
        </div>
      </div>

      {/* Raw Health Discovery Manifest Link */}
      <div style={{ marginTop: '2.5rem', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
        <p style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '.75rem' }}>
          Looking for the raw machine-readable Agent Service Provider discovery manifest?
        </p>
        <a href="/health" target="_blank" rel="noreferrer" className="btn-outline" style={{ display: 'inline-flex', gap: '.4rem', alignItems: 'center', fontSize: '.85rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          View Raw /health JSON Manifest
        </a>
      </div>
    </div>
  );
}
