import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { api } from '../services/api';

describe('CloudRetail Theme Tokens & Stylesheets', () => {
  const indexCss = fs.readFileSync(path.resolve(__dirname, '../index.css'), 'utf-8');
  const appCss = fs.readFileSync(path.resolve(__dirname, '../App.css'), 'utf-8');

  it('defines pure Light Mode variables without blue tints', () => {
    expect(indexCss).toContain('[data-theme="light"]');
    expect(indexCss).toContain('--bg-primary: #FCF0DA');
    expect(indexCss).toContain('--text-main: #4C4541');
    expect(indexCss).toContain('--border-subtle: #E2D1B3');
  });

  it('defines Stitch AI premium Dark Mode tokens', () => {
    expect(indexCss).toContain(':root');
    expect(indexCss).toContain('--bg-primary: #252220');
    expect(indexCss).toContain('--bg-card: #322D2A');
    expect(indexCss).toContain('--text-main: #FCF0DA');
    expect(indexCss).toContain('--accent-indigo: #F2C46A');
  });

  it('implements responsive mobile header rules in App.css', () => {
    expect(appCss).toContain('@media (max-width: 880px)');
    expect(appCss).toContain('grid-template-areas');
    expect(appCss).toContain('.nav-search-container');
  });

  it('implements dedicated full-screen mobile auth modal styling', () => {
    expect(appCss).toContain('.auth-modal-card');
    expect(appCss).toContain('100dvh');
    expect(appCss).toContain('font-size: 16px');
  });

  it('enforces 1:1 square aspect ratio for product cards', () => {
    expect(appCss).toContain('aspect-ratio: 1 / 1');
  });

  it('implements bottom nav elevation and mobile safe area insets', () => {
    expect(appCss).toContain('safe-area-inset-bottom');
    expect(appCss).toContain('.mobile-bottom-nav');
  });

  it('prevents icon overlapping in auth modal inputs', () => {
    expect(appCss).toMatch(/\.auth-input-wrapper\.input-with-icon input[\s\S]*padding-left:\s*40px/);
    expect(appCss).toMatch(/\.auth-input-wrapper input#auth-password[\s\S]*padding-right:\s*42px/);
  });

  it('implements aligned, simplified hero banner styles', () => {
    expect(appCss).toContain('.hero-badge-row');
    expect(appCss).toContain('.hero-count-chip');
    expect(appCss).toContain('.hero-actions');
  });

  it('implements clean, aligned health telemetry modal layout', () => {
    expect(appCss).toContain('.services-telemetry-list');
    expect(appCss).toContain('.service-status-pill');
    expect(appCss).toContain('.telemetry-banner');
  });

  it('implements Stitch mobile responsiveness patterns and slide-up sheets', () => {
    expect(indexCss).toContain('-webkit-tap-highlight-color: transparent');
    expect(indexCss).toContain('.no-scrollbar');
    expect(appCss).toContain('slideUpSheet');
    expect(appCss).toContain('.mobile-sheet-pull-handle');
    expect(appCss).toContain('.toast-container');
    expect(appCss).toContain('.toast-pill');
  });
});

describe('Component Module Integrity', () => {
  it('exports Navbar component', async () => {
    const mod = await import('../components/Navbar.jsx');
    expect(mod.default).toBeDefined();
  });

  it('exports AuthModal component', async () => {
    const mod = await import('../components/AuthModal.jsx');
    expect(mod.default).toBeDefined();
  });

  it('exports ProductCard component', async () => {
    const mod = await import('../components/ProductCard.jsx');
    expect(mod.default).toBeDefined();
  });

  it('exports Hero component', async () => {
    const mod = await import('../components/Hero.jsx');
    expect(mod.default).toBeDefined();
  });

  it('exports MobileBottomNav component', async () => {
    const mod = await import('../components/MobileBottomNav.jsx');
    expect(mod.default).toBeDefined();
  });

  it('exports HealthModal component', async () => {
    const mod = await import('../components/HealthModal.jsx');
    expect(mod.default).toBeDefined();
  });

  it('exports AddProductModal component', async () => {
    const mod = await import('../components/AddProductModal.jsx');
    expect(mod.default).toBeDefined();
  });
});

describe('API Service Order Routing Protocol', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('routes user-specific order queries to /api/orders/user/{userId}', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 101, orderNumber: 'ORD-101', totalAmount: 149.99 }]
    });
    globalThis.fetch = fetchMock;

    const orders = await api.getOrders('usr-customer-01');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/api/orders/user/usr-customer-01');
    expect(orders).toHaveLength(1);
    expect(orders[0].orderNumber).toBe('ORD-101');
  });

  it('routes generic order queries to /api/orders when no userId is passed', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 202, orderNumber: 'ORD-202' }]
    });
    globalThis.fetch = fetchMock;

    const orders = await api.getOrders(null);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/orders$/);
    expect(orders).toHaveLength(1);
  });
});
