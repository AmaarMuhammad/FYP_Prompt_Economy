import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user, loadUser, token } = useAuth();
  const { account } = useWallet();
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Load recent activity
  useEffect(() => {
    const loadActivity = async () => {
      if (!token) return;
      
      try {
        const [promptsRes, purchasesRes] = await Promise.all([
          axios.get(`${API_URL}/prompts/my-prompts?limit=5`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/purchases/my-purchases?limit=5`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const prompts = (promptsRes.data.data || []).map(p => ({
          type: 'prompt',
          title: p.title,
          date: p.createdAt,
          id: p._id,
          icon: '📝'
        }));

        const purchases = (purchasesRes.data.data || []).map(p => ({
          type: 'purchase',
          title: p.prompt?.title || 'Unknown Prompt',
          date: p.createdAt,
          id: p.prompt?._id,
          icon: '🛒'
        }));

        const combined = [...prompts, ...purchases]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);

        setRecentActivity(combined);
      } catch (error) {
        console.error('Error loading activity:', error);
      } finally {
        setLoadingActivity(false);
      }
    };

    if (user) {
      loadActivity();
    }
  }, [user?.id, token]);

  // Sync counters on mount (fixes negative counter issue)
  useEffect(() => {
    const syncCounters = async () => {
      try {
        if (token && (user?.totalPrompts < 0 || user?.totalPurchases < 0)) {
          await axios.post(
            `${API_URL}/users/sync-counters`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          loadUser();
        }
      } catch (error) {
        console.error('Counter sync error:', error);
      }
    };
    
    if (user) {
      syncCounters();
    }
  }, [user?.id]);

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
          {loadingActivity ? (
            <div className="activity-card">
              <p className="no-activity">Loading activity...</p>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="activity-card">
              <p className="no-activity">No recent activity</p>
              <p className="activity-hint">
                Start by connecting your wallet and exploring the marketplace
              </p>
            </div>
          ) : (
            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <Link
                  key={index}
                  to={activity.id ? `/prompts/${activity.id}` : '#'}
                  className="activity-item"
                >
                  <span className="activity-icon">{activity.icon}</span>
                  <div className="activity-details">
                    <p className="activity-title">
                      {activity.type === 'prompt' ? 'Created: ' : 'Purchased: '}
                      {activity.title}
                    </p>
                    <p className="activity-date">
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
