import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Shield, Store, ShoppingBag, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
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
        {/* Ambient Top Glow from Stitch */}
        <div className="auth-ambient-top-glow"></div>

        {/* Modal Header */}
        <div className="modal-header auth-modal-header">
          <div className="modal-title-row">
            <div className="auth-header-icon-box">
              <Lock size={18} className="text-indigo" />
            </div>
            <div>
              <div className="auth-title-cluster">
                <h2 className="modal-title auth-title">
                  {currentUser && !isSwitchingAccount
                    ? 'User Profile'
                    : mode === 'login'
                    ? 'CloudRetail Identity'
                    : 'Create Cloud Account'}
                </h2>
                <span className="auth-gateway-badge">
                  <span className="beacon-indicator">
                    <span className="beacon-ping"></span>
                    <span className="beacon-core"></span>
                  </span>
                  GATEWAY v4.2
                </span>
              </div>
              <p className="auth-subtitle">
                Zero-trust federated developer &amp; retail authentication
              </p>
            </div>
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
                  {currentUser.role === 'RETAILER' ? '👑 Retailer Merchant' : '🛍️ Verified Customer'}
                </div>
                {currentUser.userId && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
                    User ID: {currentUser.userId}
                  </p>
                )}
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
                  Switch or Sign In to Another Account
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tab switchers */}
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

              {/* Quick Demo Credentials */}
              <div className="demo-accounts-card">
                <div className="demo-header">
                  <Shield size={14} className="text-cyan" />
                  <span>1-CLICK SEEDED DEMO CREDENTIALS</span>
                </div>
                <div className="demo-buttons-grid">
                  <button
                    type="button"
                    className="btn-demo retailer"
                    onClick={() => handleQuickDemoLogin('retailer@cloudretail.io', 'password123')}
                    disabled={isSubmitting}
                  >
                    <Store size={15} />
                    <span>Merchant Demo (Seller)</span>
                  </button>
                  <button
                    type="button"
                    className="btn-demo customer"
                    onClick={() => handleQuickDemoLogin('user@cloudretail.io', 'password123')}
                    disabled={isSubmitting}
                  >
                    <ShoppingBag size={15} />
                    <span>Customer Demo (Shopper)</span>
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="alert-box alert-error">
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="auth-form">
                {mode === 'signup' && (
                  <div className="form-group">
                    <label htmlFor="auth-name">Full Name *</label>
                    <div className="input-with-icon auth-input-wrapper">
                      <User size={16} className="input-icon" />
                      <input
                        id="auth-name"
                        type="text"
                        required
                        placeholder="e.g. Samir Dhavane"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="auth-email">Developer / Work Email *</label>
                  <div className="input-with-icon auth-input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      id="auth-email"
                      type="email"
                      required
                      placeholder="dev@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="auth-label-row">
                    <label htmlFor="auth-password">Password *</label>
                    {mode === 'login' && (
                      <a href="#forgot" className="auth-forgot-link" onClick={(e) => { e.preventDefault(); alert('Demo password is: password123'); }}>
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
                    {/* Role selector */}
                    <div className="form-group">
                      <label>Select Your Account Type *</label>
                      <div className="role-selector-grid">
                        <div
                          className={`role-option-card ${formData.role === 'USER' ? 'selected' : ''}`}
                          onClick={() => setFormData({ ...formData, role: 'USER' })}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="role-card-top">
                            <div className="role-badge-icon customer-icon">
                              <ShoppingBag size={18} />
                            </div>
                            <div className="role-title-box">
                              <strong>Customer</strong>
                              <span className="role-sublabel">Shopper</span>
                            </div>
                            <div className="role-radio-circle">
                              {formData.role === 'USER' && <div className="role-radio-dot" />}
                            </div>
                          </div>
                          <p className="role-desc">
                            Browse catalog, manage shopping cart, checkout &amp; track orders.
                          </p>
                        </div>

                        <div
                          className={`role-option-card ${formData.role === 'RETAILER' ? 'selected' : ''}`}
                          onClick={() => setFormData({ ...formData, role: 'RETAILER' })}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="role-card-top">
                            <div className="role-badge-icon retailer-icon">
                              <Store size={18} />
                            </div>
                            <div className="role-title-box">
                              <strong>Retailer</strong>
                              <span className="role-sublabel">Merchant</span>
                            </div>
                            <div className="role-radio-circle">
                              {formData.role === 'RETAILER' && <div className="role-radio-dot" />}
                            </div>
                          </div>
                          <p className="role-desc">
                            Publish products, manage stock quantities, and remove listings.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="auth-address">
                        {formData.role === 'RETAILER' ? 'Store / Business Location' : 'Delivery / Shipping Address'}
                      </label>
                      <div className="auth-input-wrapper">
                        <input
                          id="auth-address"
                          type="text"
                          placeholder={formData.role === 'RETAILER' ? 'Shop Name, Commercial Street, City' : 'Street Address, City, Postal Code'}
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Remember me row for login */}
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
                    <span className="auth-tls-badge">
                      <CheckCircle2 size={13} className="text-emerald" />
                      TLS 1.3 Strict
                    </span>
                  </div>
                )}

                <div className="modal-footer" style={{ marginTop: '16px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    id="auth-submit-btn"
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{ flex: 1 }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-small"></span>
                        <span>{mode === 'login' ? 'Authenticating...' : 'Registering...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{mode === 'login' ? 'Sign In to CloudRetail' : 'Create Cloud Account'}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Modal Status Footer Bar from Stitch */}
        <div className="auth-status-footer-bar">
          <div className="auth-footer-status-item">
            <span className="beacon-indicator">
              <span className="beacon-core"></span>
            </span>
            <span>Zero-Trust Auth Tokenizer active</span>
          </div>
          <div className="auth-footer-status-item">
            <span>FIDO2 / WebAuthn ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
