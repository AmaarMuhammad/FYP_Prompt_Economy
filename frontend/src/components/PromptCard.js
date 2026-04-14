import React, { useState } from 'react';
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

  // Determine if this is an image prompt based on the AI model or if sampleOutput is a URL
  const imageModels = ['Midjourney', 'DALL-E', 'Stable Diffusion'];
  const isImageModel = imageModels.includes(prompt.aiModel);
  const hasImageUrl = prompt.sampleOutput && prompt.sampleOutput.match(/^https?:\/\//i);
  const showImagePreview = isImageModel && hasImageUrl;
  
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <Link to={`/prompts/${prompt._id}`} className="prompt-card-link">
        <div className="prompt-card">
          
          {/* NEW: Dynamic Image Header */}
          {showImagePreview && (
            <div 
              className="prompt-card-image-container"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <img 
                src={prompt.sampleOutput} 
                alt={`${prompt.title} preview`} 
                className="prompt-preview-image"
                onError={(e) => {
                  e.target.style.display = 'none'; // Hide broken images gracefully
                }}
              />
              <div className="image-overlay-badges">
                <span className="prompt-category overlay-category" style={{ backgroundColor: getCategoryColor(prompt.category) }}>
                  {prompt.category}
                </span>
                {prompt.isVerified && <span className="verified-badge small">✓</span>}
              </div>
            </div>
          )}

          {/* Content Wrapper */}
          <div className="prompt-card-content">
            
            {/* Only show standard header if there is NO image */}
            {!showImagePreview && (
              <div className="prompt-card-header">
                <span className="prompt-category" style={{ backgroundColor: getCategoryColor(prompt.category) }}>
                  {prompt.category}
                </span>
                {prompt.isVerified && <span className="verified-badge" title="Verified Prompt">✓</span>}
              </div>
            )}

            <h3 className="prompt-title">{prompt.title}</h3>
            
            <p className="prompt-description">
              {prompt.description.length > 100 
                ? `${prompt.description.substring(0, 100)}...` 
                : prompt.description}
            </p>

            <div className="prompt-meta">
              <div className="meta-item">
                <span className="meta-label">AI Model</span>
                <span className="meta-value">{prompt.aiModel}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Difficulty</span>
                <span className="meta-value">{prompt.difficulty}</span>
              </div>
            </div>

            <div className="prompt-stats">
              <div className="stat-item">
                <svg className="stat-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
                <span>{prompt.viewCount || 0}</span>
              </div>
              
              <div className="stat-item">
                <svg className="stat-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"/>
                </svg>
                <span>{prompt.purchaseCount || 0}</span>
              </div>

              {prompt.rating > 0 && (
                <div className="stat-item">
                  <span>⭐ {prompt.rating.toFixed(1)}</span>
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
            </div>

            <div className="prompt-footer">
              <div className="prompt-price">
                <span className="price-value">{formatPrice(prompt.price)} <span>MATIC</span></span>
              </div>
              <button className="view-button">
                View →
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* NEW: The floating pop-out that escapes the card's boundaries */}
      {isHovered && showImagePreview && (
        <div className="image-hover-popout">
          <img src={prompt.sampleOutput} alt="Full preview" />
        </div>
      )}
    </>
  );
};

export default PromptCard;