import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Store, ShoppingBag, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser = null,
  onLogout
}) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER', // 'USER' or 'RETAILER'
    address: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const data = await api.login({
          email: formData.email.trim(),
          password: formData.password
        });
        onLoginSuccess(data);
        onClose();
      } else {
        const data = await api.register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
          address: formData.address.trim(),
          phone: formData.phone.trim()
        });
        onLoginSuccess(data);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPassword) => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const data = await api.login({ email: demoEmail, password: demoPassword });
      onLoginSuccess(data);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay auth-overlay" onClick={onClose}>
      <div
        id="auth-modal-panel"
        className="modal-box auth-modal-card animate-fade auth-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header auth-modal-header">
          <div>
            <h2 className="modal-title auth-title">
              {currentUser && !isSwitchingAccount
                ? 'My Account'
                : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
            </h2>
            <p className="auth-subtitle">
              {currentUser && !isSwitchingAccount
                ? 'Manage your active session and details'
                : mode === 'login'
                ? 'Welcome back. Enter your details to continue.'
                : 'Join our store to track orders and checkout faster.'}
            </p>
          </div>
          <button
            id="close-auth-modal"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close authentication dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="auth-modal-body">
          {currentUser && !isSwitchingAccount ? (
            <div className="auth-profile-view">
              <div className="auth-profile-card">
                <div className="auth-profile-avatar">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
                <h3 className="auth-profile-name">{currentUser.name}</h3>
                <p className="auth-profile-email">{currentUser.email}</p>
                <div className="auth-profile-role-badge">
                  {currentUser.role === 'RETAILER' ? 'Merchant / Seller' : 'Customer'}
                </div>
              </div>

              <div className="auth-profile-actions">
                <button
                  id="modal-sign-out-btn"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    if (onLogout) onLogout();
                    onClose();
                  }}
                >
                  Sign Out
                </button>
                <button
                  id="modal-switch-account-btn"
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setIsSwitchingAccount(true)}
                >
                  Switch Account
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tab Switcher */}
              <div className="auth-tab-row">
                <button
                  type="button"
                  id="tab-signin-btn"
                  className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  id="tab-signup-btn"
                  className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage('');
                  }}
                >
                  Create Account
                </button>
              </div>

              {/* Minimal Demo Helper Bar */}
              <div className="auth-demo-bar">
                <span className="demo-bar-label">Quick Demo:</span>
                <div className="demo-chips-group">
                  <button
                    type="button"
                    className="demo-chip-btn"
                    onClick={() => handleQuickDemoLogin('user@cloudretail.io', 'password123')}
                    disabled={isSubmitting}
                  >
                    <ShoppingBag size={12} />
                    <span>Customer</span>
                  </button>
                  <button
                    type="button"
                    className="demo-chip-btn"
                    onClick={() => handleQuickDemoLogin('retailer@cloudretail.io', 'password123')}
                    disabled={isSubmitting}
                  >
                    <Store size={12} />
                    <span>Merchant</span>
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="alert-box alert-error">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="auth-form">
                {mode === 'signup' && (
                  <div className="form-group">
                    <label htmlFor="auth-name">Full Name</label>
                    <div className="input-with-icon auth-input-wrapper">
                      <User size={16} className="input-icon" />
                      <input
                        id="auth-name"
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="auth-email">Email Address</label>
                  <div className="input-with-icon auth-input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      id="auth-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="auth-label-row">
                    <label htmlFor="auth-password">Password</label>
                    {mode === 'login' && (
                      <a
                        href="#forgot"
                        className="auth-forgot-link"
                        onClick={(e) => {
                          e.preventDefault();
                          alert('Demo password is: password123');
                        }}
                      >
                        Forgot password?
                      </a>
                    )}
                  </div>
                  <div className="input-with-icon auth-input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="auth-password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Sign Up Mode Extras: Role Selection */}
                {mode === 'signup' && (
                  <>
                    <div className="form-group">
                      <label>Account Type</label>
                      <div className="role-segmented-control">
                        <button
                          type="button"
                          className={`role-segment-btn ${formData.role === 'USER' ? 'active' : ''}`}
                          onClick={() => setFormData({ ...formData, role: 'USER' })}
                        >
                          <ShoppingBag size={14} />
                          <span>Customer (Shopper)</span>
                        </button>
                        <button
                          type="button"
                          className={`role-segment-btn ${formData.role === 'RETAILER' ? 'active' : ''}`}
                          onClick={() => setFormData({ ...formData, role: 'RETAILER' })}
                        >
                          <Store size={14} />
                          <span>Merchant (Seller)</span>
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="auth-address">
                        {formData.role === 'RETAILER' ? 'Store Location' : 'Shipping Address'}
                      </label>
                      <div className="auth-input-wrapper">
                        <input
                          id="auth-address"
                          type="text"
                          placeholder={formData.role === 'RETAILER' ? 'City, State' : 'Street address, City, ZIP'}
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Remember Me Checkbox */}
                {mode === 'login' && (
                  <div className="auth-remember-row">
                    <label className="auth-remember-label">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="auth-checkbox"
                      />
                      <span>Remember this session</span>
                    </label>
                  </div>
                )}

                <div className="modal-footer auth-footer-actions">
                  <button
                    type="button"
                    className="btn btn-secondary auth-cancel-btn"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    id="auth-submit-btn"
                    type="submit"
                    className="btn btn-primary auth-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-small"></span>
                        <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
