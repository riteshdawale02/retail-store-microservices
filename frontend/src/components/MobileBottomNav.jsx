import React from 'react';
import { ShoppingBag, PackageCheck, User, Store, LayoutGrid } from 'lucide-react';

export default function MobileBottomNav({
  cartCount = 0,
  onOpenCart,
  onOpenOrders,
  currentUser,
  onOpenAuth,
  onScrollTop,
  onOpenCategories
}) {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <button
        id="mobile-nav-home"
        className="mobile-nav-item"
        onClick={onScrollTop}
        title="Store Home"
      >
        <Store size={20} />
        <span className="mobile-nav-label">Shop</span>
      </button>

      <button
        id="mobile-nav-categories"
        className="mobile-nav-item"
        onClick={onOpenCategories}
        title="Browse Categories"
      >
        <LayoutGrid size={20} />
        <span className="mobile-nav-label">Categories</span>
      </button>

      <button
        id="mobile-nav-orders"
        className="mobile-nav-item"
        onClick={onOpenOrders}
        title="My Orders"
      >
        <PackageCheck size={20} />
        <span className="mobile-nav-label">Orders</span>
      </button>

      <button
        id="mobile-nav-cart"
        className="mobile-nav-item cart-highlight"
        onClick={onOpenCart}
        title="Shopping Cart"
      >
        <div className="mobile-nav-icon-wrapper">
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span className="mobile-cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
          )}
        </div>
        <span className="mobile-nav-label">Cart</span>
      </button>

      <button
        id="mobile-nav-account"
        className="mobile-nav-item"
        onClick={onOpenAuth}
        title={currentUser ? `Logged in as ${currentUser.name}` : 'Sign In'}
      >
        {currentUser ? (
          <div className="mobile-nav-avatar">
            {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
          </div>
        ) : (
          <User size={20} />
        )}
        <span className="mobile-nav-label">{currentUser ? 'Account' : 'Sign In'}</span>
      </button>
    </nav>
  );
}
