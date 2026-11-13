import React from 'react';
import { ShoppingBag, Search, PackageCheck, User, LogOut, PlusCircle, Sun, Moon } from 'lucide-react';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  cartCount,
  onOpenCart,
  onOpenHealth,
  onOpenOrders,
  healthData,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenAddProduct,
  theme,
  onToggleTheme
}) {
  const isRetailer = currentUser?.role === 'RETAILER';
  const isDark = theme === 'dark';

  const isDegraded = healthData?.overallStatus === 'DEGRADED';
  const isDown = healthData?.overallStatus === 'DOWN';

  return (
    <header className="navbar-wrapper">
      <div className="app-container navbar-content">
        {/* Brand Logo */}
        <div
          className="brand-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          role="button"
          tabIndex={0}
          title="Return to Home"
          aria-label="Home"
        >
          <img src="/logo.png" alt="Logo" className="brand-logo-img" />
        </div>

        {/* Primary Search Bar */}
        <div className="nav-search-container">
          <Search className="search-icon" size={17} />
          <input
            id="product-search-input"
            type="text"
            className="nav-search-input"
            placeholder="Search products, categories, essentials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <kbd className="nav-search-kbd">⌘K</kbd>
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
              aria-label="Clear search input"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right Navigation: Structured Visual Groups */}
        <div className="nav-actions">
          {/* Group 1: Quiet System Utilities */}
          <div className="nav-utilities-group">
            {/* Live Microservices Health Telemetry Indicator */}
            {onOpenHealth && (
              <button
                id="microservices-health-pill-btn"
                className="nav-health-status-pill"
                onClick={onOpenHealth}
                title="Inspect AWS EKS Microservices Cluster Health"
              >
                <span className={`beacon-indicator ${isDown ? 'down' : isDegraded ? 'degraded' : ''}`}>
                  <span className="beacon-ping"></span>
                  <span className="beacon-core"></span>
                </span>
                <span className="health-pill-label">
                  {isDown ? 'Offline' : isDegraded ? 'Degraded' : 'Operational'}
                </span>
              </button>
            )}

            {/* Theme Toggle (Ghost Icon Button) */}
            <button
              id="theme-toggle-btn"
              className="nav-ghost-icon-btn theme-toggle-btn"
              onClick={onToggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle visual theme"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>

          <div className="nav-cluster-divider" aria-hidden="true" />

          {/* Group 2: Core E-Commerce Actions */}
          <div className="nav-commerce-group">
            {/* Retailer "+ Add Product" Button */}
            {isRetailer && (
              <button
                id="retailer-add-product-btn"
                className="btn btn-retailer-add"
                onClick={onOpenAddProduct}
                title="Publish a new product to catalog"
              >
                <PlusCircle size={15} />
                <span className="nav-btn-text">Add Product</span>
              </button>
            )}

            {/* Orders History */}
            <button
              id="view-orders-btn"
              className="nav-link-btn nav-action-desktop-only"
              onClick={onOpenOrders}
              title="View your orders"
            >
              <PackageCheck size={17} />
              <span>Orders</span>
            </button>

            {/* Shopping Cart */}
            <button
              id="open-cart-btn"
              className="nav-cart-btn"
              onClick={onOpenCart}
              title="View Shopping Cart"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <ShoppingBag size={17} />
              <span className="nav-btn-text">Cart</span>
              {cartCount > 0 && (
                <span className="nav-cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </button>

            {/* Account / Authentication */}
            {currentUser ? (
              <div className="nav-user-cluster">
                <button
                  id="user-account-btn"
                  className="nav-user-pill"
                  onClick={onOpenAuth}
                  title={`Account: ${currentUser.name} (${currentUser.role})`}
                >
                  <span className="user-avatar-circle">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </span>
                  <span className="user-name-short nav-btn-text">
                    {currentUser.name?.split(' ')[0]}
                  </span>
                </button>

                <button
                  id="logout-btn"
                  className="nav-ghost-icon-btn nav-action-desktop-only"
                  onClick={onLogout}
                  title="Sign Out"
                  aria-label="Sign out of account"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                id="open-auth-btn"
                className="btn btn-primary nav-signin-btn"
                onClick={onOpenAuth}
                title="Sign In or Create Account"
              >
                <User size={15} />
                <span className="nav-btn-text">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
