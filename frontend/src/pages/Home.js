import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home glow-wrapper">
      {/* Ambient Background Globs */}
      <div className="glow-blob blob-blue"></div>
      <div className="glow-blob blob-purple"></div>
      <div className="glow-blob blob-teal"></div>

      <section className="hero">
        <div className="container">
          <div className="hero-shell">
            <h1 className="hero-title">
              The Only Prompt Marketplace
              <br />
              That Understands <span className="hero-highlight">Creators</span>
            </h1>

            <p className="hero-subtitle">
              Prompt Economy turns prompts into on‑chain assets. Securely list, discover, and trade
              high‑quality AI prompts with instant payouts, transparent ownership, and wallet‑native access.
            </p>

            <div className="hero-actions">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="btn btn-primary hero-primary">
                    Go to Dashboard
                  </Link>
                  <Link to="/marketplace" className="btn btn-ghost hero-secondary">
                    Browse Marketplace
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary hero-primary">
                    Start Selling Prompts
                  </Link>
                  <Link to="/marketplace" className="btn btn-ghost hero-secondary">
                    Explore Marketplace
                  </Link>
                </>
              )}
            </div>

            <div className="hero-meta">
              <span>Non‑custodial • Wallet login • Polygon‑powered payouts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core value props */}
      <section className="value-section">
        <div className="container">
          <h2 className="section-title center">
            One marketplace. <span className="section-highlight">Three problems solved.</span>
          </h2>
          <p className="section-subtitle">
            Prompt Economy helps you create, monetize, and operationalize prompts without losing control
            of your work.
          </p>

          <div className="value-grid">
            <div className="value-card">
              <div className="value-icon blue">✏️</div>
              <h3>Create & list prompts in minutes</h3>
              <p>
                Turn your best prompt workflows into on‑chain listings with versioning, metadata,
                and transparent pricing in MATIC.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon amber">🛒</div>
              <h3>Discover production‑ready prompts</h3>
              <p>
                Search by model, use‑case, and difficulty to find prompts with real performance
                data and on‑chain purchase history.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon green">📈</div>
              <h3>Track on‑chain earnings</h3>
              <p>
                Every purchase settles through smart contracts, giving you instant payouts and
                verifiable earnings across your catalog.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow spotlight with Terminal UI */}
      <section className="workflow-section">
        <div className="container">
          <div className="workflow-card">
            <h2>When prompts become products</h2>
            <p>
              Most prompt marketplaces stop at file downloads. Prompt Economy keeps prompts verifiable,
              tokenless, and directly tied to creator wallets so every transaction is transparent.
            </p>

            {/* The new Terminal Window */}
            <div className="terminal-window">
              <div className="terminal-header">
                <span className="term-dot dot-red"></span>
                <span className="term-dot dot-yellow"></span>
                <span className="term-dot dot-green"></span>
                <span className="terminal-title">fetch_prompt.js</span>
              </div>
              <div className="terminal-body">
                <pre>
                  <code className="code-comment">// 1. Authenticate via MetaMask & Verify NFT Ownership</code><br/>
                  <code className="code-keyword">const</code> prompt = <code className="code-keyword">await</code> <code className="code-object">PromptEconomy</code>.<code className="code-function">unlock</code>(&#123;<br/>
                  &nbsp;&nbsp;assetId: <code className="code-string">"0x7f3...a1b"</code>,<br/>
                  &nbsp;&nbsp;buyer: <code className="code-variable">user.walletAddress</code><br/>
                  &#125;);<br/><br/>
                  <code className="code-comment">// 2. Smart Contract instantly splits MATIC to creator</code><br/>
                  <code className="code-keyword">await</code> <code className="code-object">SmartContract</code>.<code className="code-function">distributeRoyalties</code>();<br/><br/>
                  <code className="code-comment">// 3. Decrypt IPFS payload</code><br/>
                  <code className="code-keyword">return</code> prompt.decryptedContent;
                </pre>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="steps-section">
        <div className="container">
          <h2 className="section-title center">
            Get started in <span className="section-highlight">3 simple steps</span>
          </h2>
          <div className="steps-grid">
            <div className="step-card step-blue">
              <div className="step-label">Step 01</div>
              <h3>Connect your wallet</h3>
              <p>
                Sign in with MetaMask and link your creator profile. No passwords, no accounts
                to manage.
              </p>
            </div>
            <div className="step-card step-amber">
              <div className="step-label">Step 02</div>
              <h3>Publish your prompts</h3>
              <p>
                Upload descriptions, content, and sample outputs. Set pricing in MATIC and list
                on‑chain with a single transaction.
              </p>
            </div>
            <div className="step-card step-green">
              <div className="step-label">Step 03</div>
              <h3>Earn as others build</h3>
              <p>
                Buyers unlock full content, you earn automatically. Track sales and earnings
                from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations + trust */}
      <section className="integrations-section">
        <div className="container">
          <h2 className="section-title center">Integrates with your AI stack</h2>
          <p className="section-subtitle">
            Designed for modern AI workflows — from solo builders to product teams.
          </p>
          <div className="integrations-row">
            <div className="integration-pill">ChatGPT / GPT‑4</div>
            <div className="integration-pill">Claude</div>
            <div className="integration-pill">Midjourney</div>
            <div className="integration-pill">DALL·E / SD</div>
          </div>
        </div>
      </section>

      <section className="security-section">
        <div className="container">
          <div className="security-grid">
            <div className="security-item">
              <span className="security-label">Non‑custodial</span>
              <span className="security-value">Wallet‑owned prompts</span>
            </div>
            <div className="security-item">
              <span className="security-label">Transparent</span>
              <span className="security-value">On‑chain purchases</span>
            </div>
            <div className="security-item">
              <span className="security-label">Creator‑first</span>
              <span className="security-value">Fair revenue share</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA + footer */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to launch your prompt business?</h2>
            <p>Ship faster, earn on‑chain, and stay in control of your work.</p>
            {isAuthenticated ? (
              <Link to="/upload" className="btn btn-primary hero-primary">
                List a Prompt
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary">
                Create Creator Account
              </Link>
            )}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <span className="gradient-text footer-logo">Prompt Economy</span>
              <p className="footer-copy">
                The on‑chain marketplace for serious prompt creators and AI teams.
              </p>
            </div>
            <div className="footer-column">
              <h4>Product</h4>
              <Link to="/marketplace">Marketplace</Link>
              <Link to="/upload">Sell Prompts</Link>
              <Link to="/dashboard">Creator Dashboard</Link>
            </div>
            <div className="footer-column">
              <h4>Resources</h4>
              <a href="https://github.com" target="_blank" rel="noreferrer">
                Docs (API & Contracts)
              </a>
              <a href="mailto:support@prompteconomy.app">Support</a>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <span>&copy; 2025 Prompt Economy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;