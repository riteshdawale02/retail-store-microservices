import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  isUpdating
}) {
  if (!isOpen) return null;

  const items = cart?.items || [];
  const totalAmount = Number(cart?.totalAmount || 0);
  const totalItems = cart?.totalItems || items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside
        id="cart-drawer-panel"
        className="drawer-panel glass-panel animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-box">
            <ShoppingBag size={20} className="drawer-icon" />
            <h2 className="drawer-title">Shopping Cart</h2>
            <span className="badge badge-purple">{totalItems} items</span>
          </div>
          <button
            id="close-cart-drawer"
            className="drawer-close-btn"
            onClick={onClose}
            title="Close Cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Redis speed indicator */}
        <div className="cart-cache-badge">
          <Zap size={14} className="text-emerald" />
          <span>Synced with Redis In-Memory Cache (Sub-10ms)</span>
        </div>

        {/* Item List / Empty State */}
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <div className="empty-cart-icon-box">
                <ShoppingBag size={48} />
              </div>
              <h3>Your cart is empty</h3>
              <p>Explore our catalog of cloud-native hardware and high-tech gear.</p>
              <button
                className="btn btn-primary"
                onClick={onClose}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => {
                const subtotal = Number(item.subtotal || item.unitPrice * item.quantity);
                return (
                  <div key={item.productId} className="cart-item-row glass-card">
                    {/* Thumbnail */}
                    <div className="item-thumbnail">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=80'}
                        alt={item.productName}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="item-details">
                      <h4 className="item-name" title={item.productName}>
                        {item.productName}
                      </h4>
                      <div className="item-unit-price">
                        ${Number(item.unitPrice).toFixed(2)} each
                      </div>

                      {/* Quantity Controls */}
                      <div className="item-controls-row">
                        <div className="quantity-selector">
                          <button
                            id={`decrease-qty-${item.productId}`}
                            className="qty-btn"
                            disabled={isUpdating}
                            onClick={() => {
                              if (item.quantity > 1) {
                                onUpdateQuantity(item.productId, item.quantity - 1);
                              } else {
                                onRemoveItem(item.productId);
                              }
                            }}
                            title="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            id={`increase-qty-${item.productId}`}
                            className="qty-btn"
                            disabled={isUpdating}
                            onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                            title="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="item-subtotal-price">
                          ${subtotal.toFixed(2)}
                        </div>

                        <button
                          id={`remove-item-${item.productId}`}
                          className="item-delete-btn"
                          disabled={isUpdating}
                          onClick={() => onRemoveItem(item.productId)}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="drawer-footer glass-panel">
            <div className="cart-summary-breakdown">
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Shipping</span>
                <span className="summary-value text-emerald">FREE</span>
              </div>
              <div className="summary-row total-row">
                <span className="summary-label">Estimated Total</span>
                <span className="summary-value total-price">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="drawer-footer-actions">
              <button
                id="checkout-cta-btn"
                className="btn btn-primary btn-checkout"
                disabled={isUpdating}
                onClick={onProceedToCheckout}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>

              <button
                id="clear-cart-btn"
                className="btn btn-secondary btn-clear-cart"
                disabled={isUpdating}
                onClick={onClearCart}
              >
                Clear Cart
              </button>
            </div>

            <div className="checkout-trust-badge">
              <ShieldCheck size={14} className="text-emerald" />
              <span>ACID-Compliant Order Processing & Instant Stock Lock</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
