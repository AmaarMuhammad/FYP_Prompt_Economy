import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              The Decentralized Marketplace for <span className="gradient-text">AI Prompts</span>
            </h1>
            <p className="hero-subtitle">
              Buy, sell, and discover high-quality prompts for Large Language Models. 
              Built on blockchain for transparency, security, and fair compensation.
            </p>
            <div className="hero-buttons">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="btn btn-secondary">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Prompt Economy?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Blockchain Powered</h3>
              <p>Transparent transactions and immutable records on Ethereum/Polygon blockchain</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Secure & Decentralized</h3>
              <p>Your wallet, your control. Connect with MetaMask for secure authentication</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Fair Compensation</h3>
              <p>Smart contracts ensure creators get paid fairly and automatically</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Quality Assurance</h3>
              <p>Community-driven ratings and reviews for verified, high-quality prompts</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Easy to Use</h3>
              <p>Simple interface for buying and selling prompts in just a few clicks</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Global Marketplace</h3>
              <p>Access prompts from creators worldwide, paid in cryptocurrency</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <h3 className="stat-number">1000+</h3>
              <p className="stat-label">Active Users</p>
            </div>
            <div className="stat-card">
              <h3 className="stat-number">5000+</h3>
              <p className="stat-label">Prompts Available</p>
            </div>
            <div className="stat-card">
              <h3 className="stat-number">$50K+</h3>
              <p className="stat-label">Paid to Creators</p>
            </div>
            <div className="stat-card">
              <h3 className="stat-number">4.8/5</h3>
              <p className="stat-label">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of AI enthusiasts and developers</p>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-primary">
                Create Your Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Prompt Economy. All rights reserved.</p>
          <p>Iteration 2 - Complete Marketplace with Buy/Sell Functionality</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
