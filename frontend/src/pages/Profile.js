import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const { account, disconnectWallet } = useWallet();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || ''
    });
    setIsEditing(false);
  };

  const handleDisconnectWallet = async () => {
    try {
      disconnectWallet();
      await logout();
      navigate('/login');
      toast.success('Wallet disconnected and logged out');
    } catch (error) {
      toast.error('Error disconnecting wallet');
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-container">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="profile-header-info">
              <h1>{user.username}</h1>
              <p className="profile-role">{user.role}</p>
              <div className="reputation-badge">
                <span className="reputation-icon">⭐</span>
                <span>{user.reputation} Reputation</span>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="profile-form-section">
            <div className="section-header">
              <h2>Profile Information</h2>
              {!isEditing && (
                <button
                  className="edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button
                    type="submit"
                    className="save-btn"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Wallet Section */}
          <div className="wallet-section">
            <h2>Wallet Information</h2>
            <div className="wallet-details">
              <div className="wallet-item">
                <span className="wallet-label">Wallet Address:</span>
                <span className="wallet-value">{user.walletAddress}</span>
              </div>
              <div className="wallet-item">
                <span className="wallet-label">Connected Account:</span>
                <span className="wallet-value">{account || 'Not Connected'}</span>
              </div>
              <div className="wallet-item">
                <span className="wallet-label">Network:</span>
                <span className="wallet-value">Ethereum (Sepolia)</span>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="account-stats">
            <h2>Account Statistics</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Member Since</span>
                <span className="stat-value">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Last Login</span>
                <span className="stat-value">
                  {new Date(user.lastLogin || user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Account Status</span>
                <span className={`stat-value ${user.isVerified ? 'verified' : 'pending'}`}>
                  {user.isVerified ? '✓ Verified' : '⏳ Pending'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Prompts</span>
                <span className="stat-value">{user.totalPrompts || 0}</span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="danger-zone">
            <h2>Danger Zone</h2>
            <div className="danger-actions">
              <button
                className="disconnect-btn"
                onClick={handleDisconnectWallet}
              >
                Disconnect Wallet & Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
