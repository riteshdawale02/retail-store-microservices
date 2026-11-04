import React from 'react';
import { Truck, RotateCcw, ShieldCheck, ArrowRight, Layers, Cpu } from 'lucide-react';

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
            <span className="hero-engine-chip hide-on-mobile">
              <Cpu size={13} />
              <span>Edge Storefront v4.2</span>
            </span>
          </div>

          <h1 className="hero-title">
            Engineered for Scale. Curated for Performance.
          </h1>
          <p className="hero-subtitle">
            Curated developer hardware, audio, and everyday tech essentials powered by an isolated Spring Boot &amp; Redis microservices architecture.
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
              className="btn btn-hero-secondary hide-on-mobile"
              onClick={onExploreClick}
              aria-label="Explore deals and specs"
            >
              <span>Explore Deals</span>
            </button>
          </div>

          {/* Telemetry Metrics from Stitch Design System */}
          <div className="hero-metrics-grid">
            <div className="metric-chip">
              <span className="metric-val text-emerald">99.99%</span>
              <span className="metric-label">Edge Availability</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-chip">
              <span className="metric-val text-cyan">Sub-15ms</span>
              <span className="metric-label">Checkout Dispatch</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-chip">
              <span className="metric-val text-indigo">Instant API</span>
              <span className="metric-label">Webhook Provision</span>
            </div>
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
