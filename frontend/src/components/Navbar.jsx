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
          title="CloudRetail - Return to Home"
        >
          <div className="brand-icon-box">
            <ShoppingBag size={19} strokeWidth={2.2} />
          </div>
          <div className="brand-text-cluster">
            <div className="brand-title-row">
              <span className="brand-title">CloudRetail</span>
              {/* Stitch Mobile Live Edge Status Beacon */}
              <div
                className="mobile-live-beacon hide-on-desktop"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenHealth) onOpenHealth();
                }}
                title="Inspect System Telemetry"
              >
                <span className={`beacon-indicator ${isDown ? 'down' : isDegraded ? 'degraded' : ''}`}>
                  <span className="beacon-ping"></span>
                  <span className="beacon-core"></span>
                </span>
                <span className="mobile-beacon-text">
                  {isDown ? 'OFFLINE' : isDegraded ? 'DEGRADED' : 'ALL SYSTEMS LIVE'}
                </span>
              </div>
            </div>
            <span className="brand-subtitle hide-on-mobile">Microservices</span>
          </div>
        </div>

        {/* Search Bar */}
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
          <kbd className="nav-search-kbd hide-on-mobile">⌘K</kbd>
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

        {/* Live Microservices Health Telemetry Pill (Stitch Component) */}
        {onOpenHealth && (
          <button
            id="microservices-health-pill-btn"
            className="nav-health-status-pill hide-on-mobile"
            onClick={onOpenHealth}
            title="Inspect AWS EKS Microservices Cluster Health"
          >
            <span className={`beacon-indicator ${isDown ? 'down' : isDegraded ? 'degraded' : ''}`}>
              <span className="beacon-ping"></span>
              <span className="beacon-core"></span>
            </span>
            <span className="health-pill-label">
              {isDown ? 'Cluster Offline' : isDegraded ? 'Service Degraded' : 'All Systems Operational'}
            </span>
          </button>
        )}

        {/* Right Navigation Actions */}
        <div className="nav-actions">
          {/* Theme Toggle (Light / Dark) */}
          <button
            id="theme-toggle-btn"
            className="nav-icon-btn theme-toggle-btn"
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle visual theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Retailer "+ Add Product" Button */}
          {isRetailer && (
            <button
              id="retailer-add-product-btn"
              className="btn btn-retailer-add"
              onClick={onOpenAddProduct}
              title="Publish a new product to catalog"
            >
              <PlusCircle size={16} />
              <span className="hide-on-mobile">Add Product</span>
            </button>
          )}

          {/* Orders History */}
          <button
            id="view-orders-btn"
            className="nav-link-btn nav-action-desktop-only"
            onClick={onOpenOrders}
            title="View your orders"
          >
            <PackageCheck size={18} />
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
            <ShoppingBag size={18} />
            <span className="hide-on-mobile">Cart</span>
            {cartCount > 0 && (
              <span className="nav-cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
            )}
          </button>

          {/* Customer / Retailer Account */}
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
                <span className="user-name-short hide-on-mobile">
                  {currentUser.name?.split(' ')[0]}
                </span>
              </button>

              <button
                id="logout-btn"
                className="nav-icon-btn nav-action-desktop-only"
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
              <User size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
