import React, { useState } from 'react';
import { X, Lock, CheckCircle2, AlertCircle, PackageCheck, Truck, CreditCard, Smartphone, Banknote, ShieldCheck } from 'lucide-react';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  userId,
  currentUser = null,
  onOrderSuccess
}) {
  const [formData, setFormData] = useState(() => ({
    customerName: currentUser?.name || '',
    customerEmail: currentUser?.email || '',
    shippingAddress: currentUser?.address || '',
    paymentMethod: 'CARD', // 'CARD', 'UPI', 'COD'
    cardNumber: '4532 •••• •••• 8891',
    cardExpiry: '12/28',
    cardCvv: '889',
    upiId: 'user@upi'
  }));
  const [prevUser, setPrevUser] = useState(currentUser);
  if (currentUser !== prevUser) {
    setPrevUser(currentUser);
    setFormData((prev) => ({
      ...prev,
      customerName: currentUser?.name || '',
      customerEmail: currentUser?.email || '',
      shippingAddress: currentUser?.address || ''
    }));
  }
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
    setProcessingStep('Authorizing payment...');

    try {
      setProcessingStep('Authorizing payment & confirming order...');

      const payload = {
        userId,
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        shippingAddress: formData.shippingAddress.trim(),
        paymentMethod: formData.paymentMethod,
        items: items.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          unitPrice: Number(it.unitPrice),
          quantity: it.quantity,
          imageUrl: it.imageUrl
        }))
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
        className="modal-box glass-panel animate-fade checkout-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <Lock size={20} className="text-primary" />
            <h2 className="modal-title">Secure Checkout</h2>
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
          <div className="checkout-grid">
            {/* Left Column: Customer Information & Payment */}
            <div className="checkout-left-col">
              <div className="checkout-section-header">
                <Truck size={17} className="text-primary" />
                <h3>Shipping Details</h3>
              </div>

              <div className="form-group">
                <label htmlFor="customer-name-input">Full Name *</label>
                <input
                  id="customer-name-input"
                  type="text"
                  required
                  placeholder="Enter your full name"
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
                  placeholder="Enter your email address"
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
                  placeholder="Street address, apartment/suite, city, state, postal code"
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              {/* Payment Gateway Method Selection */}
              <div className="checkout-payment-section">
                <div className="checkout-section-header">
                  <ShieldCheck size={17} className="text-primary" />
                  <h3>Payment Method</h3>
                </div>

                <div className="checkout-payment-selector">
                  <button
                    type="button"
                    className={`checkout-payment-tab ${formData.paymentMethod === 'CARD' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, paymentMethod: 'CARD' })}
                  >
                    <CreditCard size={15} />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    className={`checkout-payment-tab ${formData.paymentMethod === 'UPI' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, paymentMethod: 'UPI' })}
                  >
                    <Smartphone size={15} />
                    <span>UPI / QR</span>
                  </button>
                  <button
                    type="button"
                    className={`checkout-payment-tab ${formData.paymentMethod === 'COD' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                  >
                    <Banknote size={15} />
                    <span>COD</span>
                  </button>
                </div>

                {formData.paymentMethod === 'CARD' && (
                  <div className="checkout-payment-box">
                    <div className="form-group">
                      <label htmlFor="card-number-input">Card Number</label>
                      <input
                        id="card-number-input"
                        type="text"
                        placeholder="4532 •••• •••• 8891"
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="checkout-card-row">
                      <div className="form-group">
                        <label htmlFor="card-expiry-input">Expiry (MM/YY)</label>
                        <input
                          id="card-expiry-input"
                          type="text"
                          placeholder="12/28"
                          value={formData.cardExpiry}
                          onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="card-cvv-input">CVV</label>
                        <input
                          id="card-cvv-input"
                          type="password"
                          placeholder="889"
                          value={formData.cardCvv}
                          maxLength={4}
                          onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value })}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'UPI' && (
                  <div className="checkout-payment-box">
                    <div className="form-group">
                      <label htmlFor="upi-id-input">Virtual Payment Address (VPA)</label>
                      <input
                        id="upi-id-input"
                        type="text"
                        placeholder="e.g. user@okhdfcbank"
                        value={formData.upiId}
                        onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'COD' && (
                  <div className="checkout-payment-box checkout-cod-note">
                    <span>Cash or UPI will be collected upon doorstep delivery.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary & Action */}
            <div className="checkout-right-col">
              <div className="checkout-summary-card">
                <div className="checkout-summary-header">
                  <div className="summary-title-group">
                    <PackageCheck size={17} className="text-primary" />
                    <h3>Order Summary</h3>
                  </div>
                  <span className="summary-count-badge">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="checkout-items-preview">
                  {items.map((item) => (
                    <div key={item.productId} className="checkout-item-preview-row">
                      <div className="preview-item-info">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.productName} className="checkout-item-thumb" />
                        )}
                        <div className="preview-item-texts">
                          <span className="preview-name">{item.productName}</span>
                          <span className="preview-qty">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="preview-price">
                        ${Number(item.subtotal || item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="checkout-price-divider"></div>

                <div className="checkout-subtotal-row">
                  <span>Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="checkout-subtotal-row">
                  <span>Shipping</span>
                  <span className={totalAmount >= 50 ? 'text-emerald' : ''}>
                    {totalAmount >= 50 ? 'FREE' : '$4.99'}
                  </span>
                </div>
                <div className="checkout-subtotal-row">
                  <span>Estimated Tax (8%)</span>
                  <span>${(totalAmount * 0.08).toFixed(2)}</span>
                </div>

                <div className="checkout-price-divider"></div>

                <div className="checkout-total-row">
                  <span className="total-label">Total Due</span>
                  <span className="total-amount">
                    ${(totalAmount + (totalAmount >= 50 ? 0 : 4.99) + (totalAmount * 0.08)).toFixed(2)}
                  </span>
                </div>

                <div className="checkout-cta-group">
                  <button
                    id="confirm-place-order-btn"
                    type="submit"
                    className="btn btn-primary checkout-submit-btn"
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
                        <span>Pay & Place Order (${(totalAmount + (totalAmount >= 50 ? 0 : 4.99) + (totalAmount * 0.08)).toFixed(2)})</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="checkout-cancel-link"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel and return to store
                  </button>
                </div>

                <div className="checkout-telemetry-note">
                  <ShieldCheck size={14} className="text-emerald" />
                  <span>Secure 256-Bit Encrypted Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
