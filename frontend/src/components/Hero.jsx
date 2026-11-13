import React from 'react';
import { Truck, RotateCcw, ShieldCheck, ArrowRight, Layers, Star } from 'lucide-react';

export default function Hero({
  onExploreClick,
  totalProducts = 0,
  featuredProduct = null,
  onQuickView = null
}) {
  const featuredItem = featuredProduct || {
    id: 1,
    name: 'UltraBook Pro 16',
    category: 'Electronics',
    description: 'High-performance workstation featuring 32GB RAM, 1TB NVMe SSD, and high-res Retina display.',
    price: 1299.99,
    rating: 4.9,
    reviewCount: 128,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'
  };

  const handleSpotlightClick = () => {
    if (onQuickView) {
      onQuickView(featuredItem);
    } else if (onExploreClick) {
      onExploreClick();
    }
  };

  return (
    <section className="hero-banner">
      <div className="hero-simple-card">
        {/* Main 2-Column Split: Editorial Copy + Featured Product Spotlight */}
        <div className="hero-main-grid">
          <div className="hero-copy">
            <div className="hero-badge-row">
              <span className="hero-tag">DISTRIBUTED CLOUD COMMERCE</span>
              {totalProducts > 0 && (
                <span className="hero-count-chip">
                  <Layers size={13} />
                  <span>{totalProducts} Catalog Items</span>
                </span>
              )}
            </div>

            <h1 className="hero-title">
              Engineered for Scale.<br />Curated for Performance.
            </h1>
            <p className="hero-subtitle">
              Curated developer hardware, studio acoustics, and everyday technical essentials designed for modern engineering teams.
            </p>

            <div className="hero-actions">
              <button
                className="btn btn-primary btn-hero"
                onClick={onExploreClick}
                aria-label="Shop catalog products"
              >
                <span>Shop Collection</span>
                <ArrowRight size={16} />
              </button>
              <button
                className="btn btn-secondary btn-hero-secondary"
                onClick={onExploreClick}
                aria-label="Explore deals and specs"
              >
                <span>Explore Deals</span>
              </button>
            </div>
          </div>

          {/* Right Column: High-Impact Featured Spotlight Card */}
          <div className="hero-spotlight-wrapper">
            <div
              className="hero-spotlight-card"
              onClick={handleSpotlightClick}
              role="button"
              tabIndex={0}
              title={`Inspect ${featuredItem.name}`}
            >
              <div className="spotlight-header">
                <span className="spotlight-kicker">FEATURED ARCHITECTURE</span>
                <span className="spotlight-stock-pill">
                  <span className="status-dot dot-online"></span> In Stock
                </span>
              </div>

              <div className="spotlight-visual">
                <img
                  src={featuredItem.imageUrl}
                  alt={featuredItem.name}
                  className="spotlight-image"
                  loading="lazy"
                />
              </div>

              <div className="spotlight-details">
                <div className="spotlight-meta-row">
                  <span className="spotlight-cat-tag">{featuredItem.category || 'Hardware'}</span>
                  <div className="spotlight-rating-tag">
                    <Star size={12} className="star-icon filled" />
                    <span>{featuredItem.rating || '4.9'}</span>
                  </div>
                </div>

                <h3 className="spotlight-product-name">{featuredItem.name}</h3>
                <p className="spotlight-product-desc">{featuredItem.description}</p>

                <div className="spotlight-footer-row">
                  <div className="spotlight-price-box">
                    <span className="price-currency">$</span>
                    <span className="price-amount">
                      {Number(featuredItem.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="spotlight-link-cta">
                    <span>Inspect Specs</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer trust guarantees: Structured 3-column industrial trust bar */}
        <div className="hero-trust-bar">
          <div className="trust-col">
            <div className="trust-icon-box">
              <Truck size={18} className="trust-icon" />
            </div>
            <div className="trust-text-stack">
              <strong className="trust-heading">Free Express Shipping</strong>
              <span className="trust-caption">Complimentary dispatch on orders over $50</span>
            </div>
          </div>

          <div className="trust-divider"></div>

          <div className="trust-col">
            <div className="trust-icon-box">
              <RotateCcw size={18} className="trust-icon" />
            </div>
            <div className="trust-text-stack">
              <strong className="trust-heading">30-Day Easy Returns</strong>
              <span className="trust-caption">Zero-friction guarantee with prepaid return labels</span>
            </div>
          </div>

          <div className="trust-divider"></div>

          <div className="trust-col">
            <div className="trust-icon-box">
              <ShieldCheck size={18} className="trust-icon" />
            </div>
            <div className="trust-text-stack">
              <strong className="trust-heading">Secure Transactions</strong>
              <span className="trust-caption">256-Bit end-to-end encrypted microservice checkout</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
