import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { prompts, loadPrompts, loading } = useMarketplace();
  
  const [myPrompts, setMyPrompts] = useState([]);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalSales: 0,
    totalEarnings: 0,
    avgRating: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Load all prompts to filter the user's creations
    loadPrompts();
  }, [user, navigate, loadPrompts]);

  useEffect(() => {
    if (prompts.length > 0 && user) {
      // Filter for only the prompts created by the logged-in user
      const userPrompts = prompts.filter(p => 
        p.creator?._id === user.id || 
        p.creator?._id === user._id || 
        p.creator?.walletAddress?.toLowerCase() === user.walletAddress?.toLowerCase()
      );
      
      setMyPrompts(userPrompts);

      // Calculate Analytics
      let views = 0;
      let sales = 0;
      let totalEarningsMatic = 0; // Use standard numbers instead of BigInt
      let totalRating = 0;
      let ratedPromptsCount = 0;

      userPrompts.forEach(p => {
        views += (p.viewCount || 0);
        sales += (p.purchaseCount || 0);
        
        if (p.price && p.purchaseCount > 0) {
          // Fix: Convert Wei to MATIC first, then multiply by number of sales
          const priceInMatic = parseFloat(ethers.formatEther(p.price.toString()));
          totalEarningsMatic += (priceInMatic * p.purchaseCount);
        }

        if (p.rating > 0) {
          totalRating += p.rating;
          ratedPromptsCount += 1;
        }
      });

      setStats({
        totalViews: views,
        totalSales: sales,
        totalEarnings: totalEarningsMatic, // Now it's a normal, accurate number!
        avgRating: ratedPromptsCount > 0 ? (totalRating / ratedPromptsCount).toFixed(1) : 0
      });
    }
  }, [prompts, user]);

  if (loading) return <div className="dashboard-loading"><div className="loading-spinner"></div></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Creator Analytics</h1>
        <p>Track your prompt performance and earnings</p>
      </div>

      {/* Analytics Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon views-icon">👁️</div>
          <div className="metric-data">
            <h3>Total Views</h3>
            <p>{stats.totalViews}</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon sales-icon">🛒</div>
          <div className="metric-data">
            <h3>Total Sales</h3>
            <p>{stats.totalSales}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon earnings-icon">💰</div>
          <div className="metric-data">
            <h3>Total Earnings</h3>
            <p>{parseFloat(stats.totalEarnings).toFixed(4)} <span>MATIC</span></p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon rating-icon">⭐</div>
          <div className="metric-data">
            <h3>Average Rating</h3>
            <p>{stats.avgRating} / 5.0</p>
          </div>
        </div>
      </div>

      {/* Your Prompts List */}
      <div className="dashboard-content">
        <div className="section-header">
          <h2>My Active Prompts ({myPrompts.length})</h2>
          <button onClick={() => navigate('/upload')} className="upload-new-btn">
            + Upload New
          </button>
        </div>

        {myPrompts.length === 0 ? (
          <div className="empty-dashboard">
            <p>You haven't uploaded any prompts yet.</p>
            <button onClick={() => navigate('/upload')}>Create Your First Prompt</button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Prompt</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Views</th>
                  <th>Sales</th>
                  <th>Rating</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myPrompts.map(prompt => (
                  <tr key={prompt._id}>
                    <td className="prompt-cell">
                      <strong>{prompt.title.length > 30 ? prompt.title.substring(0, 30) + '...' : prompt.title}</strong>
                    </td>
                    <td><span className="table-badge">{prompt.category}</span></td>
                    <td>{parseFloat(ethers.formatEther(prompt.price || "0")).toFixed(4)} MATIC</td>
                    <td>{prompt.viewCount || 0}</td>
                    <td>{prompt.purchaseCount || 0}</td>
                    <td>{prompt.rating > 0 ? `⭐ ${prompt.rating.toFixed(1)}` : 'N/A'}</td>
                    <td>
                      <Link to={`/prompts/${prompt._id}`} className="table-action-btn">View</Link>
                      <Link to={`/prompts/${prompt._id}/edit`} className="table-action-btn edit">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;