import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { account } = useWallet();

  if (!user) return null;

  return (
    <div className="dashboard">
      <div className="container">
        {/* Welcome Section */}
        <div className="dashboard-header">
          <h1>Welcome back, {user.username}!</h1>
          <p>Your Prompt Economy Dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-cards">
          <div className="stat-card-dashboard">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <h3>{user.reputation}</h3>
              <p>Reputation</p>
            </div>
          </div>

          <div className="stat-card-dashboard">
            <div className="stat-icon">📝</div>
            <div className="stat-info">
              <h3>{user.totalPrompts || 0}</h3>
              <p>Prompts Created</p>
            </div>
          </div>

          <div className="stat-card-dashboard">
            <div className="stat-icon">🛒</div>
            <div className="stat-info">
              <h3>{user.totalPurchases || 0}</h3>
              <p>Purchases Made</p>
            </div>
          </div>

          <div className="stat-card-dashboard">
            <div className="stat-icon">{user.isVerified ? '✓' : '⏳'}</div>
            <div className="stat-info">
              <h3>{user.isVerified ? 'Verified' : 'Pending'}</h3>
              <p>Account Status</p>
            </div>
          </div>
        </div>

        {/* Wallet Info */}
        <div className="wallet-info-section">
          <h2>Wallet Information</h2>
          <div className="info-card">
            <div className="info-row">
              <span className="info-label">Connected Wallet:</span>
              <span className="info-value wallet-address">
                {account || 'Not Connected'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Blockchain:</span>
              <span className="info-value">Ethereum (Sepolia Testnet)</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/upload" className="action-btn">
              <span className="action-icon">📤</span>
              <span>Upload Prompt</span>
              <span className="iteration-badge">Iteration 2</span>
            </Link>

            <Link to="/marketplace" className="action-btn">
              <span className="action-icon">🔍</span>
              <span>Browse Marketplace</span>
              <span className="iteration-badge">Iteration 2</span>
            </Link>

            <button className="action-btn" disabled>
              <span className="action-icon">💰</span>
              <span>View Transactions</span>
              <span className="coming-soon">Iteration 3</span>
            </button>

            <button className="action-btn" disabled>
              <span className="action-icon">📊</span>
              <span>Analytics</span>
              <span className="coming-soon">Iteration 3</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-card">
            <p className="no-activity">No recent activity</p>
            <p className="activity-hint">
              Start by connecting your wallet and exploring the marketplace
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
