import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          {' '}OKX.AI Genesis Hackathon • Finance Copilot
        </div>
        <h1 className="hero-title">
          Secure Every AI Agent Transaction with <span className="hero-accent">Custos</span>
        </h1>
        <p className="hero-sub">
          The pre-transaction decision engine for OKX.AI. Custos evaluates provider history, price deviation, and sybil patterns before your agent executes payment.
        </p>
        <div className="hero-actions">
          <Link to="/console" className="btn-primary" style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
            Enter Console
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </Link>
          <a href="#features" className="btn-outline" style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
            Explore Features
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
          </a>
        </div>
      </section>

      {/* Verdict Preview Section */}
      <section className="verdict-preview-section">
        <div className="verdict-preview-card glass-card">
          <div className="browser-chrome">
            <div className="browser-dots">
              <span className="dot-r"></span>
              <span className="dot-y"></span>
              <span className="dot-g"></span>
            </div>
          </div>
          <div className="vp-banner approved">
            <div className="vp-title-row">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <h2>APPROVED</h2>
            </div>
            <span className="vp-payment-structure">Payment: full_upfront</span>
          </div>
          <ul className="vp-reasoning">
            <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Provider has an established history on X Layer.</li>
            <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Service price is within the 10% expected deviation.</li>
            <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> No wash trading or sybil characteristics detected.</li>
          </ul>
          <div className="vp-metrics">
            <div className="vp-mcard">
              <span className="label">Wallet Age</span>
              <span className="value">120d</span>
            </div>
            <div className="vp-mcard">
              <span className="label">Tx Count</span>
              <span className="value">48</span>
            </div>
            <div className="vp-mcard">
              <span className="label">Price Dev</span>
              <span className="value">1.03x</span>
            </div>
            <div className="vp-mcard">
              <span className="label">Wash Trade</span>
              <span className="value">CLEAR</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="features-section">
        <div className="feat-header">
          <span className="feat-tag">PLATFORM CAPABILITIES</span>
          <h2 className="feat-title">Intelligence Built for Agents</h2>
          <p className="feat-sub">Every dimension of transaction risk is analyzed in milliseconds before your agent authorizes payment.</p>
        </div>
        <div className="features-grid">
          <div className="feat-card">
            <div className="fc-icon-wrap purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
            </div>
            <h3>Pre-Payment Risk Engine</h3>
            <p>Intercepts transactions before they broadcast, ensuring absolute safety for autonomous budgets.</p>
          </div>
          <div className="feat-card">
            <div className="fc-icon-wrap pink">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <h3>Wash-Trade Sybil Detection</h3>
            <p>Identifies cyclic transactions and isolated bot networks farming volume or reputation on X Layer.</p>
          </div>
          <div className="feat-card">
            <div className="fc-icon-wrap blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3>Price Deviation Analysis</h3>
            <p>Detects anomalous service pricing by tracking category-wide moving averages.</p>
          </div>
          <div className="feat-card feat-card-wide">
            <div className="fc-icon-wrap emerald">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><polyline points="9 15 11 17 15 13"></polyline></svg>
            </div>
            <h3>Smart Payment Structure</h3>
            <p>Dynamically recommends streaming payments, milestones, or upfront settlement based on the provider's trust score and historical completion rate.</p>
          </div>
          <div className="feat-card">
            <div className="fc-icon-wrap amber">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </div>
            <h3>A2MCP & x402 Native</h3>
            <p>Seamlessly integrates with Agent-to-Machine Communication Protocols for rapid machine API negotiation.</p>
          </div>
        </div>
      </section>

      {/* SDK Preview Section */}
      <section className="sdk-section">
        <div className="sdk-block">
          <div className="sdk-toolbar">
            <div className="browser-dots">
              <span className="dot-r"></span>
              <span className="dot-y"></span>
              <span className="dot-g"></span>
            </div>
            <span>agent.ts</span>
          </div>
          <pre className="sdk-code">
            <code>{`import { custos } from 'custos-okx-asp';

// Single-line guard: runs Custos check before paying ASP provider
const { decision, paymentResult } = await custos.guard(
  {
    provider_wallet: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    buyer_wallet:    "0x1234567890abcdef1234567890abcdef12345678",
    service_price:   40.0,
    service_category:"code_generation"
  },
  async (verdict) => {
    // Automatically routes via recommended structure (Escrow / Split / Full)
    return await executeOnChainPayment(verdict.recommended_payment);
  }
);`}</code>
          </pre>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <strong>Custos</strong>
            <span>OKX.AI Genesis Hackathon 2024</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
