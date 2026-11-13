import React from 'react';
import { Truck, RotateCcw, ShieldCheck, ArrowRight, Layers } from 'lucide-react';

export default function Hero({ onExploreClick, totalProducts = 0 }) {
  return (
    <section className="hero-banner">
      <div className="hero-simple-card">
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
            Engineered for Scale. Curated for Performance.
          </h1>
          <p className="hero-subtitle">
            Curated developer hardware, audio, and everyday tech essentials for modern creators and engineering teams.
          </p>

          <div className="hero-actions">
            <button
              className="btn btn-hero"
              onClick={onExploreClick}
              aria-label="Shop catalog products"
            >
              <span>Shop Collection</span>
              <ArrowRight size={16} />
            </button>
            <button
              className="btn btn-hero-secondary hero-deals-btn"
              onClick={onExploreClick}
              aria-label="Explore deals and specs"
            >
              <span>Explore Deals</span>
            </button>
          </div>
        </div>

        {/* Customer trust guarantees */}
        <div className="hero-trust-bar">
          <div className="trust-item">
            <Truck size={17} className="trust-icon" />
            <div>
              <strong>Free Express Shipping</strong>
              <span>On all orders over $50</span>
            </div>
          </div>
          <div className="trust-divider"></div>
          <div className="trust-item">
            <RotateCcw size={17} className="trust-icon" />
            <div>
              <strong>30-Day Easy Returns</strong>
              <span>Hassle-free guarantee</span>
            </div>
          </div>
          <div className="trust-divider"></div>
          <div className="trust-item">
            <ShieldCheck size={17} className="trust-icon" />
            <div>
              <strong>Secure Transactions</strong>
              <span>256-Bit encrypted checkout</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
