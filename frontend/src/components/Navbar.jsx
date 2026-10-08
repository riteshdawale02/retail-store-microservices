import React from 'react';
import { ShoppingBag, Search, Activity, PackageCheck, Server, User, LogOut, PlusCircle, Sun, Moon } from 'lucide-react';

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
  const isHealthy = healthData?.overallHealth === 'HEALTHY';
  const isRetailer = currentUser?.role === 'RETAILER';
  const isDark = theme === 'dark';

  return (
    <header className="navbar-wrapper glass-panel">
      <div className="app-container navbar-content">
        {/* Brand / Logo */}
        <div className="brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="brand-icon-box">
            <Server className="brand-icon" size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Cloud<span>Retail</span></span>
            <span className="brand-badge">MICROSERVICES</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="nav-search-container">
          <Search className="search-icon" size={17} />
          <input
            id="product-search-input"
            type="text"
            className="nav-search-input"
            placeholder="Search products by title, category, specs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Actions / Status */}
        <div className="nav-actions">
          {/* Theme Toggle (Dark / Light) */}
          <button
            id="theme-toggle-btn"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun size={18} className="theme-icon sun animate-fade" />
            ) : (
              <Moon size={18} className="theme-icon moon animate-fade" />
            )}
          </button>

          {/* Retailer "+ Add Product" CTA */}
          {isRetailer && (
            <button
              id="retailer-add-product-btn"
              className="btn btn-primary nav-retailer-add-btn animate-fade"
              onClick={onOpenAddProduct}
              title="Publish a new product to catalog"
            >
              <PlusCircle size={17} />
              <span className="hide-on-mobile">Add Product</span>
            </button>
          )}

          {/* Cloud DevOps Telemetry Pill */}
          <button
            id="system-health-btn"
            className={`health-pill ${isHealthy ? 'healthy' : 'degraded'}`}
            onClick={onOpenHealth}
            title="Inspect AWS Cloud & Microservices Telemetry"
          >
            <span className={`pulse-dot ${isHealthy ? 'green' : 'amber'}`}></span>
            <span className="health-text hide-on-mobile">
              {healthData?.awsRegion ? `${healthData.awsRegion} • ` : 'AWS • '}
              {isHealthy ? '4 Services UP' : 'Telemetry'}
            </span>
            <Activity size={15} className="health-icon" />
          </button>

          {/* Orders History Button */}
          <button
            id="view-orders-btn"
            className="btn btn-secondary nav-action-btn"
            onClick={onOpenOrders}
            title="View placed orders"
          >
            <PackageCheck size={18} />
            <span className="action-btn-text hide-on-mobile">Orders</span>
          </button>

          {/* Cart Trigger */}
          <button
            id="open-cart-btn"
            className="btn btn-primary nav-cart-btn"
            onClick={onOpenCart}
            title="Open Shopping Cart"
          >
            <ShoppingBag size={18} />
            <span className="cart-btn-label hide-on-mobile">Cart</span>
            {cartCount > 0 && (
              <span className="cart-badge-count animate-fade">{cartCount}</span>
            )}
          </button>

          {/* User Account / Auth Section */}
          {currentUser ? (
            <div className="user-profile-menu">
              <div className="user-info-pill glass-card" title={`Logged in as ${currentUser.email}`}>
                <div className="user-avatar-circle">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
                <div className="user-text-meta hide-on-mobile">
                  <span className="user-name-short">{currentUser.name?.split(' ')[0]}</span>
                  <span className={`user-role-badge ${isRetailer ? 'retailer-role' : 'customer-role'}`}>
                    {isRetailer ? '👑 Retailer' : 'Shopper'}
                  </span>
                </div>
              </div>

              <button
                id="logout-btn"
                className="btn-logout-icon"
                onClick={onLogout}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              id="open-auth-btn"
              className="btn btn-secondary nav-auth-btn"
              onClick={onOpenAuth}
              title="Sign In or Register"
            >
              <User size={17} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
