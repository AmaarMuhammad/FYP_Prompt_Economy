import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios'; // ✅ Added axios
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import toast from 'react-hot-toast';
import './PromptDetail.css';

// You might need to adjust this depending on how you export your API URL in other files
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PromptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getPromptById, purchasePrompt, delistAndDeletePrompt, stakeOnPrompt, contract, loading } = useMarketplace();

  const [prompt, setPrompt] = useState(null);
  const [promptLoading, setPromptLoading] = useState(true);

  // ✅ New State for Reviews
  const [reviews, setReviews] = useState([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // ✅ New State for Staking
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [liveStaked, setLiveStaked] = useState("0");

  const loadPrompt = useCallback(async () => {
    setPromptLoading(true);
    const data = await getPromptById(id);
    if (data) {
      setPrompt(data);
      
      // ✅ Fetch live staking data directly from Sepolia!
      if (contract && data.blockchainId) {
        try {
          const onChainPrompt = await contract.getPrompt(data.blockchainId);
          setLiveStaked(ethers.formatEther(onChainPrompt.totalStaked.toString()));
        } catch (err) {
          console.error("Could not fetch on-chain staking data", err);
        }
      }
    }
    setPromptLoading(false);
  }, [getPromptById, id, contract]);

  // ✅ New Function: Fetch Reviews
  const fetchReviews = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/prompts/${id}/reviews`);
      setReviews(res.data.data);
    } catch (error) {
      console.error("Could not fetch reviews", error);
    }
  }, [id]);

  useEffect(() => {
    loadPrompt();
    fetchReviews();
  }, [loadPrompt, fetchReviews]);

  // ✅ Check if the current user has already left a review
  useEffect(() => {
    if (user && reviews.length > 0) {
      const alreadyReviewed = reviews.some(
        (r) => r.user._id === user.id || r.user._id === user._id
      );
      setHasReviewed(alreadyReviewed);
    }
  }, [user, reviews]);

  const handlePurchase = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const success = await purchasePrompt(prompt);
    if (success) {
      await loadPrompt();
    }
  };

  const handleDelist = async () => {
    if (!prompt) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const ok = window.confirm('Delist this prompt from the marketplace? This will hide it for new buyers.');
    if (!ok) return;

    if (!prompt.blockchainId) {
      toast.error('Missing blockchainId for this prompt');
      return;
    }

    const success = await delistAndDeletePrompt({
      mongoId: prompt._id,
      blockchainId: prompt.blockchainId
    });

    if (success) {
      await loadPrompt();
    }
  };

  const handleStakeSubmit = async (e) => {
    e.preventDefault();
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Please enter a valid MATIC amount');
      return;
    }
    
    setIsStaking(true);
    const success = await stakeOnPrompt(prompt.blockchainId, stakeAmount);
    if (success) {
      setStakeAmount('');
      await loadPrompt(); // Refresh to show the new staked amount
    }
    setIsStaking(false);
  };

  // ✅ New Function: Submit Review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      return toast.error('Please write a comment');
    }

    try {
      setSubmittingReview(true);
      const token = localStorage.getItem('token'); // Get user's JWT
      
      await axios.post(
        `${API_URL}/prompts/${id}/reviews`,
        reviewForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Review submitted successfully!');
      setReviewForm({ rating: 5, comment: '' });
      fetchReviews(); // Refresh review list
      loadPrompt(); // Refresh prompt data to update the star average!
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
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
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
          <button onClick={() => navigate('/marketplace')} className="back-button">Back to Marketplace</button>
        </div>
      </div>
    );
  }

  const isOwner = user && prompt.creator && (
    prompt.creator._id === user.id || 
    prompt.creator._id === user._id || 
    prompt.creator.walletAddress?.toLowerCase() === user.walletAddress?.toLowerCase()
  );
  
  const hasPurchased = prompt.hasPurchased === true;
  const canViewContent = isOwner || hasPurchased;

  const isImageModel = ['Midjourney', 'DALL-E', 'Stable Diffusion'].includes(prompt.aiModel);
  const isSampleOutputImage = isImageModel && prompt.sampleOutput?.match(/^https?:\/\//i);
  
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
              {prompt.isVerified && <span className="verified-badge">✓ Verified</span>}
              {isOwner && <span className="owner-badge">You are the creator</span>}
              {hasPurchased && !isOwner && <span className="purchased-badge">✅ You own this prompt</span>}
            </div>
            <h1 className="prompt-title">{prompt.title}</h1>
            <p className="prompt-meta-info">
              Posted on {formatDate(prompt.createdAt)} • {prompt.viewCount || 0} views • {prompt.purchaseCount || 0} sales
            </p>
          </div>

          {canViewContent && (
            <div className={`ownership-banner ${isOwner ? 'creator' : 'owned'}`}>
              <div className="ownership-banner-title">
                {isOwner ? 'You are the creator' : '✅ You own this prompt'}
              </div>
              <div className="ownership-banner-subtitle">
                Full access is unlocked. {isOwner ? 'Manage your listing below.' : 'You can copy and use it anytime.'}
              </div>
            </div>
          )}

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
              <h2 className="section-title">{isSampleOutputImage ? 'Sample Image' : 'Sample Output'}</h2>
              <div className="sample-output">
                {isSampleOutputImage ? (
                  <img 
                    src={prompt.sampleOutput} 
                    alt="Sample Generation" 
                    style={{
                      maxWidth: '100%', maxHeight: '600px', borderRadius: '12px',
                      border: '1px solid rgba(102, 126, 234, 0.3)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      display: 'block', margin: '0 auto' 
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <pre>{prompt.sampleOutput}</pre>
                )}
              </div>
            </div>
          )}

          {/* Prompt Content */}
          <div className="section-card content-section">
            <h2 className="section-title">Prompt Content</h2>
            {canViewContent ? (
              <div className="prompt-content">
                <div className="content-header">
                  <span className="access-badge">✓ Full Access</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(prompt.content)}
                    className="copy-button"
                  >
                    📋 Copy to Clipboard
                  </button>
                </div>
                <pre className="content-text">{prompt.content}</pre>
              </div>
            ) : (
              <div className="locked-content">
                <div className="lock-icon">🔒</div>
                <h3>Content Locked</h3>
                <p>Purchase this prompt to access the full content</p>
              </div>
            )}
          </div>

          {/* ✅ NEW: Community Reviews Section */}
          <div className="section-card reviews-section">
            <h2 className="section-title">Community Reviews</h2>
            
            {/* Review Form (Only for buyers who haven't reviewed yet) */}
            {hasPurchased && !isOwner && !hasReviewed && (
              <form onSubmit={handleReviewSubmit} className="review-form">
                <h4>Leave a Review</h4>
                <div className="rating-select">
                  <label>Rating:</label>
                  <select 
                    value={reviewForm.rating} 
                    onChange={(e) => setReviewForm({...reviewForm, rating: Number(e.target.value)})}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value="4">⭐⭐⭐⭐ (4/5)</option>
                    <option value="3">⭐⭐⭐ (3/5)</option>
                    <option value="2">⭐⭐ (2/5)</option>
                    <option value="1">⭐ (1/5)</option>
                  </select>
                </div>
                <textarea
                  placeholder="What did you think of this prompt?"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                  rows="3"
                  maxLength="500"
                  required
                />
                <button type="submit" disabled={submittingReview} className="submit-review-btn">
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            )}

            {/* Display Reviews */}
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to try it!</p>
            ) : (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review._id} className="review-card">
                    <div className="review-header">
                      <div className="review-user-info">
                        <div className="review-avatar">
                          {review.user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="review-username">{review.user?.username || 'Anonymous'}</span>
                      </div>
                      <div className="review-stars">
                        {'⭐'.repeat(review.rating)}
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    <span className="review-date">{formatDate(review.createdAt)}</span>
                  </div>
                ))}
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

            {!canViewContent && (
              <button
                onClick={handlePurchase}
                disabled={loading || !prompt.isActive}
                className="purchase-button"
              >
                {loading ? 'Processing...' : 'Purchase Prompt'}
              </button>
            )}

            {isOwner && (
              <>
                <button onClick={() => navigate(`/prompts/${prompt._id}/edit`)} className="edit-button">
                  Edit Prompt
                </button>
                <button onClick={handleDelist} disabled={loading || !prompt.isActive} className="delist-button">
                  {loading ? 'Processing...' : 'Delist Prompt'}
                </button>
              </>
            )}

            <div className="purchase-info">
              <p className="info-text">
                <svg className="info-icon" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                Instant access after purchase
              </p>
              <p className="info-text">
                <svg className="info-icon" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
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

          {/* Community Validation Card */}
          <div className="validation-card">
            <h3 className="card-title">Community Validation</h3>
            <div className="staked-amount">
              <span className="staked-icon">🛡️</span>
              <div className="staked-info">
                <span className="staked-value">{parseFloat(liveStaked).toFixed(4)} MATIC</span>
                <span className="staked-label">Total Staked</span>
              </div>
            </div>
            
            {/* Hide the staking form from the creator */}
            {!isOwner && (
              <form onSubmit={handleStakeSubmit} className="stake-form">
                <p className="stake-description">Stake MATIC to vouch for this prompt's quality.</p>
                <div className="stake-input-group">
                  <input 
                    type="number" 
                    step="0.001" 
                    min="0"
                    placeholder="0.00" 
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    disabled={isStaking}
                  />
                  <span className="currency-badge">MATIC</span>
                </div>
                <button type="submit" disabled={isStaking || loading} className="stake-button">
                  {isStaking ? 'Staking...' : 'Stake to Validate'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptDetail;