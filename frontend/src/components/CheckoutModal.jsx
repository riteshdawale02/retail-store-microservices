import React, { useState } from 'react';
import { X, Lock, CheckCircle2, AlertCircle, PackageCheck, Truck, CreditCard, Smartphone, Banknote, ShieldCheck } from 'lucide-react';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  userId,
  onOrderSuccess
}) {
  const [formData, setFormData] = useState({
    customerName: 'Samir Dhavane',
    customerEmail: 'samir.dhavane@cloudretail.io',
    shippingAddress: '42 Cloud Architecture Way, Yavatmal, MH - 445001',
    paymentMethod: 'CARD', // 'CARD', 'UPI', 'COD'
    cardNumber: '4532 •••• •••• 8891',
    cardExpiry: '12/28',
    cardCvv: '889',
    upiId: 'samir@upi'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const items = cart?.items || [];
  const totalAmount = Number(cart?.totalAmount || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.customerName.trim() || !formData.customerEmail.trim() || !formData.shippingAddress.trim()) {
      setErrorMessage('Please fill in all required customer details.');
      return;
    }

    setIsSubmitting(true);
    setProcessingStep('Authorizing Payment Sandbox...');

    try {
      // Simulate bank transaction delay for realistic UX
      await new Promise((res) => setTimeout(res, 800));

      setProcessingStep('Reserving Inventory & Creating Order in MySQL...');

      const payload = {
        userId,
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        shippingAddress: formData.shippingAddress.trim(),
        paymentMethod: formData.paymentMethod
      };

      await onOrderSuccess(payload);
    } catch (err) {
      setErrorMessage(err.message || 'Checkout failed. Please check backend service logs.');
    } finally {
      setIsSubmitting(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        id="checkout-modal-container"
        className="modal-box glass-panel animate-fade"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <Lock size={20} className="text-primary" />
            <h2 className="modal-title">Secure Microservices Checkout</h2>
          </div>
          <button
            id="close-checkout-modal"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div className="alert-box alert-error">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-grid">
            {/* Customer Information */}
            <div className="form-section">
              <h3 className="section-subtitle">
                <Truck size={16} /> Shipping Details
              </h3>

              <div className="form-group">
                <label htmlFor="customer-name-input">Full Name *</label>
                <input
                  id="customer-name-input"
                  type="text"
                  required
                  placeholder="e.g. Samir Dhavane"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="customer-email-input">Email Address *</label>
                <input
                  id="customer-email-input"
                  type="email"
                  required
                  placeholder="e.g. samir@example.com"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="shipping-address-input">Shipping Address *</label>
                <textarea
                  id="shipping-address-input"
                  rows="2"
                  required
                  placeholder="Street address, city, state, postal code"
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              {/* Payment Gateway Method Selection */}
              <div style={{ marginTop: '1rem' }}>
                <h3 className="section-subtitle">
                  <ShieldCheck size={16} /> Payment Method (Sandbox)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <button
                    type="button"
                    className={`btn ${formData.paymentMethod === 'CARD' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.5rem 0.25rem', fontSize: '0.8rem', justifyContent: 'center' }}
                    onClick={() => setFormData({ ...formData, paymentMethod: 'CARD' })}
                  >
                    <CreditCard size={14} /> Card
                  </button>
                  <button
                    type="button"
                    className={`btn ${formData.paymentMethod === 'UPI' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.5rem 0.25rem', fontSize: '0.8rem', justifyContent: 'center' }}
                    onClick={() => setFormData({ ...formData, paymentMethod: 'UPI' })}
                  >
                    <Smartphone size={14} /> UPI / QR
                  </button>
                  <button
                    type="button"
                    className={`btn ${formData.paymentMethod === 'COD' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.5rem 0.25rem', fontSize: '0.8rem', justifyContent: 'center' }}
                    onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                  >
                    <Banknote size={14} /> COD
                  </button>
                </div>

                {formData.paymentMethod === 'CARD' && (
                  <div style={{ background: 'var(--bg-glass)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                      <label style={{ fontSize: '0.75rem' }}>Card Number</label>
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        disabled={isSubmitting}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={formData.cardExpiry}
                          onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                          disabled={isSubmitting}
                          style={{ fontSize: '0.85rem' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>CVV</label>
                        <input
                          type="password"
                          value={formData.cardCvv}
                          maxLength={4}
                          onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value })}
                          disabled={isSubmitting}
                          style={{ fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'UPI' && (
                  <div style={{ background: 'var(--bg-glass)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>Virtual Payment Address (VPA)</label>
                      <input
                        type="text"
                        value={formData.upiId}
                        onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                        disabled={isSubmitting}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'COD' && (
                  <div style={{ background: 'var(--bg-glass)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    💵 Cash will be collected by courier upon doorstep delivery.
                  </div>
                )}
              </div>
            </div>

            {/* Order Review */}
            <div className="form-section order-review-box glass-card">
              <h3 className="section-subtitle">
                <PackageCheck size={16} /> Order Summary ({items.length} items)
              </h3>

              <div className="checkout-items-preview">
                {items.map((item) => (
                  <div key={item.productId} className="checkout-item-preview-row">
                    <span className="preview-name">{item.productName} <span className="preview-qty">× {item.quantity}</span></span>
                    <span className="preview-price">${Number(item.subtotal || item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="checkout-price-divider"></div>

              <div className="checkout-total-row">
                <span className="total-label">Total Due</span>
                <span className="total-amount">${totalAmount.toFixed(2)}</span>
              </div>

              <div className="architecture-note">
                <p>
                  <strong>Microservices Flow:</strong> <code>order-service</code> verifies Redis cart, validates payment token, and atomically reserves inventory in MySQL.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              id="confirm-place-order-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  <span>{processingStep || 'Processing Order...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Pay & Place Order (${totalAmount.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
