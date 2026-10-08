import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, Store, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess
}) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        onLoginSuccess(data);
        onClose();
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            role: formData.role,
            address: formData.address.trim(),
            phone: formData.phone.trim()
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        onLoginSuccess(data);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPassword) => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      onLoginSuccess(data);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        id="auth-modal-panel"
        className="modal-box glass-panel animate-fade auth-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-row">
            <Lock size={20} className="text-primary" />
            <h2 className="modal-title">
              {mode === 'login' ? 'Account Sign In' : 'Create New Account'}
            </h2>
          </div>
          <button
            id="close-auth-modal"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="auth-tab-row">
          <button
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setErrorMessage('');
            }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Quick Demo Credentials */}
        <div className="demo-accounts-card glass-card">
          <div className="demo-header">
            <Shield size={14} className="text-cyan" />
            <span>Quick Demo Sign-In (MySQL Seeded)</span>
          </div>
          <div className="demo-buttons-grid">
            <button
              type="button"
              className="btn-demo retailer"
              onClick={() => handleQuickDemoLogin('retailer@cloudretail.io', 'password123')}
              disabled={isSubmitting}
            >
              <Store size={15} />
              <span>👑 Demo Retailer (Can Add Products)</span>
            </button>
            <button
              type="button"
              className="btn-demo customer"
              onClick={() => handleQuickDemoLogin('user@cloudretail.io', 'password123')}
              disabled={isSubmitting}
            >
              <ShoppingBag size={15} />
              <span>👤 Demo Customer (Shopper)</span>
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
              <div className="input-with-icon">
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
            <label htmlFor="auth-email">Email Address *</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                id="auth-email"
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password *</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Role selection for signup */}
          {mode === 'signup' && (
            <>
              <div className="form-group">
                <label>Select Your Role *</label>
                <div className="role-selector-grid">
                  <div
                    className={`role-option-card ${formData.role === 'USER' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, role: 'USER' })}
                  >
                    <div className="role-card-top">
                      <ShoppingBag size={18} className="text-primary" />
                      <strong>Customer (User)</strong>
                    </div>
                    <p>Browse products, cart management, checkout & track order status.</p>
                  </div>

                  <div
                    className={`role-option-card ${formData.role === 'RETAILER' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, role: 'RETAILER' })}
                  >
                    <div className="role-card-top">
                      <Store size={18} className="text-amber" />
                      <strong>Retailer (Merchant)</strong>
                    </div>
                    <p>Publish new products into catalog, manage stock, and delete listings.</p>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="auth-address">Shipping / Business Address</label>
                <input
                  id="auth-address"
                  type="text"
                  placeholder="Street, City, Postal Code"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}

          <div className="modal-footer" style={{ marginTop: '10px' }}>
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
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  <span>{mode === 'login' ? 'Authenticating...' : 'Registering in MySQL...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
