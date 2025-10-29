import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'wallet'

  const { login, walletLogin } = useAuth();
  const { account, connectWallet } = useWallet();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleWalletLogin = async () => {
    if (!account) {
      const address = await connectWallet();
      if (!address) return;
    }

    setLoading(true);

    const result = await walletLogin();

    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else if (result.requiresRegistration) {
      navigate('/register');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Login to your Prompt Economy account</p>

          {/* Login Method Toggle */}
          <div className="login-method-toggle">
            <button
              className={`toggle-btn ${loginMethod === 'email' ? 'active' : ''}`}
              onClick={() => setLoginMethod('email')}
            >
              Email Login
            </button>
            <button
              className={`toggle-btn ${loginMethod === 'wallet' ? 'active' : ''}`}
              onClick={() => setLoginMethod('wallet')}
            >
              Wallet Login
            </button>
          </div>

          {loginMethod === 'email' ? (
            <form onSubmit={handleEmailLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary full-width"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <div className="wallet-login-section">
              <p className="wallet-login-info">
                Connect your wallet to login securely using blockchain authentication
              </p>
              
              {account ? (
                <div className="wallet-info-box">
                  <p>Connected Wallet:</p>
                  <p className="wallet-address-display">{account}</p>
                  <button 
                    className="btn btn-primary full-width"
                    onClick={handleWalletLogin}
                    disabled={loading}
                  >
                    {loading ? 'Authenticating...' : 'Sign Message to Login'}
                  </button>
                </div>
              ) : (
                <button 
                  className="btn btn-primary full-width"
                  onClick={connectWallet}
                >
                  🔗 Connect Wallet
                </button>
              )}
            </div>
          )}

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
