import React from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import './PromptCard.css';

const PromptCard = ({ prompt }) => {
  const formatPrice = (priceInWei) => {
    try {
      const priceInMatic = ethers.formatEther(priceInWei);
      return parseFloat(priceInMatic).toFixed(4);
    } catch {
      return '0.0000';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Writing': '#3B82F6',
      'Marketing': '#10B981',
      'Coding': '#8B5CF6',
      'Design': '#EC4899',
      'Business': '#F59E0B',
      'Education': '#06B6D4',
      'Entertainment': '#EF4444',
      'Productivity': '#14B8A6',
      'Research': '#6366F1',
      'Other': '#6B7280'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <Link to={`/prompts/${prompt._id}`} className="prompt-card-link">
      <div className="prompt-card">
        <div className="prompt-card-header">
          <span 
            className="prompt-category" 
            style={{ backgroundColor: getCategoryColor(prompt.category) }}
          >
            {prompt.category}
          </span>
          {prompt.isVerified && (
            <span className="verified-badge" title="Verified Prompt">✓</span>
          )}
        </div>

        <h3 className="prompt-title">{prompt.title}</h3>
        
        <p className="prompt-description">
          {prompt.description.length > 120 
            ? `${prompt.description.substring(0, 120)}...` 
            : prompt.description}
        </p>

        <div className="prompt-meta">
          <div className="meta-item">
            <span className="meta-label">AI Model:</span>
            <span className="meta-value">{prompt.aiModel}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Difficulty:</span>
            <span className="meta-value">{prompt.difficulty}</span>
          </div>
        </div>

        <div className="prompt-stats">
          <div className="stat-item">
            <svg className="stat-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
            <span>{prompt.viewCount || 0} views</span>
          </div>
          
          <div className="stat-item">
            <svg className="stat-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"/>
            </svg>
            <span>{prompt.purchaseCount || 0} sales</span>
          </div>

          {prompt.rating > 0 && (
            <div className="stat-item">
              <svg className="stat-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span>{prompt.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="prompt-creator">
          <div className="creator-info">
            <div className="creator-avatar">
              {prompt.creator?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="creator-name">{prompt.creator?.username || 'Anonymous'}</p>
              <p className="creator-date">{formatDate(prompt.createdAt)}</p>
            </div>
          </div>
          {prompt.creator?.reputation > 0 && (
            <div className="creator-reputation">
              ⭐ {prompt.creator.reputation}
            </div>
          )}
        </div>

        <div className="prompt-footer">
          <div className="prompt-price">
            <span className="price-label">Price:</span>
            <span className="price-value">{formatPrice(prompt.price)} MATIC</span>
          </div>
          <button className="view-button">
            View Details →
          </button>
        </div>
      </div>
    </Link>
  );
};

export default PromptCard;
