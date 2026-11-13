import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

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
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        aria-label="Shopping Cart Drawer"
      >
        {/* Stitch Mobile Sheet Drag Handle */}
        <div className="mobile-sheet-pull-handle hide-on-desktop"></div>

        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-box">
            <ShoppingBag size={19} />
            <h2 className="drawer-title">Shopping Cart</h2>
            <span className="cart-count-pill">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
          </div>
          <button
            id="close-cart-drawer"
            className="drawer-close-btn"
            onClick={onClose}
            title="Close Cart"
            aria-label="Close cart drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free shipping progress indicator */}
        <div className="cart-shipping-banner">
          {totalAmount >= 50 ? (
            <span>You qualify for <strong>Free Standard Shipping</strong>!</span>
          ) : (
            <span>Add <strong>${(50 - totalAmount).toFixed(2)}</strong> more to get Free Shipping</span>
          )}
        </div>

        {/* Item List / Empty State */}
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <div className="empty-cart-icon-box">
                <ShoppingBag size={44} strokeWidth={1.5} />
              </div>
              <h3>Your cart is empty</h3>
              <p>Explore our catalog to find items you love.</p>
              <button
                className="btn btn-primary"
                onClick={onClose}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.productId} className="cart-item-row">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="cart-item-thumb"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=80';
                    }}
                  />

                  <div className="cart-item-details">
                    <h4 className="cart-item-title">{item.productName}</h4>
                    <span className="cart-item-unit-price">${Number(item.unitPrice).toFixed(2)}</span>

                    <div className="cart-item-actions">
                      {/* Quantity Stepper */}
                      <div className="quantity-stepper">
                        <button
                          className="stepper-btn"
                          disabled={isUpdating || item.quantity <= 1}
                          onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                          title="Decrease quantity"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="stepper-count">{item.quantity}</span>
                        <button
                          className="stepper-btn"
                          disabled={isUpdating}
                          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                          title="Increase quantity"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        className="item-remove-btn"
                        disabled={isUpdating}
                        onClick={() => onRemoveItem(item.productId)}
                        title="Remove item"
                        aria-label="Remove item from cart"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-total">
                    ${Number(item.subtotal || item.unitPrice * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Summary */}
        {items.length > 0 && (
          <div className="drawer-footer">
            <div className="drawer-summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className={totalAmount >= 50 ? 'text-emerald' : ''}>
                  {totalAmount >= 50 ? 'FREE' : '$4.99'}
                </span>
              </div>
              <div className="summary-row">
                <span>Estimated Tax (8%)</span>
                <span>${(totalAmount * 0.08).toFixed(2)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row summary-total">
                <strong>Total</strong>
                <strong>${(totalAmount + (totalAmount >= 50 ? 0 : 4.99) + (totalAmount * 0.08)).toFixed(2)}</strong>
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
                <ArrowRight size={16} />
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
              <span>Secure Checkout & Buyer Protection</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
