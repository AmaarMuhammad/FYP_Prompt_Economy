import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import './PromptDetail.css';

const PromptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getPromptById, purchasePrompt, deletePrompt, loading } = useMarketplace();

  const [prompt, setPrompt] = useState(null);
  const [promptLoading, setPromptLoading] = useState(true);
  const [showFullContent, setShowFullContent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadPrompt();
  }, [id]);

  const loadPrompt = async () => {
    setPromptLoading(true);
    const data = await getPromptById(id);
    if (data) {
      setPrompt(data);
      // Check if user is owner or has purchased
      const isUserOwner = user && data.creator?._id === (user._id || user.id);
      const purchased = data.hasPurchased === true;
      const hasAccess = isUserOwner || purchased;
      console.log('Access check:', { isUserOwner, purchased, hasAccess, data });
      setShowFullContent(hasAccess);
    }
    setPromptLoading(false);
  };

  const handlePurchase = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const success = await purchasePrompt(prompt);
    if (success) {
      // Reload prompt to show content
      await loadPrompt();
    }
  };

  const handleDelete = async () => {
    const success = await deletePrompt(id);
    if (success) {
      navigate('/marketplace');
    }
    setShowDeleteConfirm(false);
  };

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
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (promptLoading) {
    return (
      <div className="detail-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading prompt...</p>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="detail-container">
        <div className="error-container">
          <h2>Prompt Not Found</h2>
          <p>The prompt you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/marketplace')} className="back-button">
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user && prompt.creator?._id === (user._id || user.id);
  const hasPurchased = Boolean(prompt.hasPurchased);
  const hasContent = Boolean(prompt.content && prompt.content.trim() !== '');
  const canViewContent = (isOwner || hasPurchased) && hasContent;
  
  // If owner or purchased but no content, it means backend didn't send it
  const shouldShowContent = isOwner || hasPurchased;

  console.log('Content Debug:', {
    isOwner,
    hasPurchased,
    hasContent,
    canViewContent,
    shouldShowContent,
    contentLength: prompt.content?.length,
    userId: user?._id || user?.id,
    creatorId: prompt.creator?._id,
    promptData: prompt
  });

  return (
    <div className="detail-container">
      <button onClick={() => navigate('/marketplace')} className="back-link">
        ← Back to Marketplace
      </button>

      <div className="detail-content">
        {/* Main Content */}
        <div className="main-section">
          {/* Header */}
          <div className="prompt-header">
            <div className="header-top">
              <span className="prompt-category">{prompt.category}</span>
              {prompt.isVerified && (
                <span className="verified-badge">✓ Verified</span>
              )}
              {isOwner && (
                <span className="owner-badge">Your Prompt</span>
              )}
              {hasPurchased && !isOwner && (
                <span className="purchased-badge">✓ Purchased</span>
              )}
              {hasPurchased && !isOwner && (
                <span className="purchased-badge">✓ Purchased</span>
              )}
            </div>
            <h1 className="prompt-title">{prompt.title}</h1>
            <p className="prompt-meta-info">
              Posted on {formatDate(prompt.createdAt)} • {prompt.viewCount || 0} views • {prompt.purchaseCount || 0} sales
            </p>
          </div>

          {/* Description */}
          <div className="section-card">
            <h2 className="section-title">Description</h2>
            <p className="prompt-description">{prompt.description}</p>
          </div>

          {/* Metadata */}
          <div className="section-card metadata-section">
            <h2 className="section-title">Prompt Details</h2>
            <div className="metadata-grid">
              <div className="metadata-item">
                <span className="metadata-label">AI Model</span>
                <span className="metadata-value">{prompt.aiModel}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Difficulty</span>
                <span className="metadata-value">{prompt.difficulty}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Language</span>
                <span className="metadata-value">{prompt.language}</span>
              </div>
              {prompt.rating > 0 && (
                <div className="metadata-item">
                  <span className="metadata-label">Rating</span>
                  <span className="metadata-value">⭐ {prompt.rating.toFixed(1)} ({prompt.reviewCount} reviews)</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="section-card">
              <h2 className="section-title">Tags</h2>
              <div className="tags-container">
                {prompt.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Sample Output */}
          {prompt.sampleOutput && (
            <div className="section-card">
              <h2 className="section-title">Sample Output</h2>
              <div className="sample-output">
                <pre>{prompt.sampleOutput}</pre>
              </div>
            </div>
          )}

          {/* Prompt Content */}
          <div className="section-card content-section">
            <h2 className="section-title">Prompt Content</h2>
            {shouldShowContent ? (
              hasContent ? (
                <div className="prompt-content">
                  <div className="content-header">
                    <span className="access-badge">✓ Full Access</span>
                    <button 
                      onClick={() => {
                        if (prompt.content) {
                          navigator.clipboard.writeText(prompt.content);
                          toast.success('Copied to clipboard!');
                        }
                      }}
                      className="copy-button"
                    >
                      📋 Copy to Clipboard
                    </button>
                  </div>
                  <pre className="content-text">{prompt.content}</pre>
                </div>
              ) : (
                <div className="locked-content">
                  <div className="lock-icon">⚠️</div>
                  <h3>Content Not Available</h3>
                  <p>The content for this prompt is missing. Please contact support.</p>
                </div>
              )
            ) : (
              <div className="locked-content">
                <div className="lock-icon">🔒</div>
                <h3>Content Locked</h3>
                <p>Purchase this prompt to access the full content</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar-section">
          {/* Price Card */}
          <div className="price-card">
            <div className="price-info">
              <span className="price-label">Price</span>
              <span className="price-value">{formatPrice(prompt.price)} MATIC</span>
            </div>

            {!isOwner && !hasPurchased && (
              <button
                onClick={handlePurchase}
                disabled={loading || !prompt.isActive}
                className="purchase-button"
              >
                {loading ? 'Processing...' : 'Purchase Prompt'}
              </button>
            )}

            {hasPurchased && !isOwner && (
              <div className="purchased-info">
                <svg className="check-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Already Purchased</span>
              </div>
            )}

            {isOwner && (
              <div className="purchased-info">
                <svg className="check-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>You Own This</span>
              </div>
            )}

            {isOwner && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="delete-button"
                disabled={loading}
              >
                Delete Prompt
              </button>
            )}

            {showDeleteConfirm && (
              <div className="delete-confirm">
                <p>Are you sure you want to delete this prompt?</p>
                <div className="confirm-buttons">
                  <button
                    onClick={handleDelete}
                    className="confirm-delete-btn"
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="cancel-delete-btn"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="purchase-info">
              <p className="info-text">
                <svg className="info-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                Instant access after purchase
              </p>
              <p className="info-text">
                <svg className="info-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Secured by blockchain
              </p>
            </div>
          </div>

          {/* Creator Card */}
          <div className="creator-card">
            <h3 className="card-title">Creator</h3>
            <div className="creator-profile">
              <div className="creator-avatar-large">
                {prompt.creator?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="creator-details">
                <h4 className="creator-name">{prompt.creator?.username || 'Anonymous'}</h4>
                <p className="creator-wallet">
                  {prompt.creator?.walletAddress
                    ? `${prompt.creator.walletAddress.slice(0, 6)}...${prompt.creator.walletAddress.slice(-4)}`
                    : 'No wallet'}
                </p>
                {prompt.creator?.reputation > 0 && (
                  <div className="creator-reputation">
                    ⭐ Reputation: {prompt.creator.reputation}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="stats-card">
            <h3 className="card-title">Statistics</h3>
            <div className="stats-list">
              <div className="stat-row">
                <span className="stat-label">Views</span>
                <span className="stat-value">{prompt.viewCount || 0}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Sales</span>
                <span className="stat-value">{prompt.purchaseCount || 0}</span>
              </div>
              {prompt.rating > 0 && (
                <div className="stat-row">
                  <span className="stat-label">Rating</span>
                  <span className="stat-value">⭐ {prompt.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptDetail;
