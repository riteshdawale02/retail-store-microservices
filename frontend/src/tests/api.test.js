import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getUserId, USER_ID_KEY, FALLBACK_PRODUCTS, api } from '../services/api';

const storageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

globalThis.localStorage = storageMock;

describe('Frontend API Service & Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('getUserId()', () => {
    it('generates a new user ID if none exists in localStorage', () => {
      const uid = getUserId();
      expect(uid).toBeDefined();
      expect(uid.startsWith('user-')).toBe(true);
      expect(localStorage.getItem(USER_ID_KEY)).toBe(uid);
    });

    it('returns the existing user ID from localStorage if already set', () => {
      localStorage.setItem(USER_ID_KEY, 'custom-test-user-123');
      const uid = getUserId();
      expect(uid).toBe('custom-test-user-123');
    });
  });

  describe('FALLBACK_PRODUCTS catalog', () => {
    it('contains exactly 100 realistic curated products', () => {
      expect(FALLBACK_PRODUCTS.length).toBe(100);
    });

    it('every product has required properties with valid types and realistic images', () => {
      const uniqueIds = new Set();
      FALLBACK_PRODUCTS.forEach((product) => {
        expect(product.id).toBeTypeOf('number');
        expect(uniqueIds.has(product.id)).toBe(false);
        uniqueIds.add(product.id);
        expect(product.name).toBeTypeOf('string');
        expect(product.name.trim().length).toBeGreaterThan(3);
        expect(product.price).toBeGreaterThan(0);
        expect(product.stockQuantity).toBeGreaterThanOrEqual(0);
        expect(product.category).toBeTypeOf('string');
        expect(product.imageUrl).toMatch(/^https:\/\/images\.unsplash\.com\//);
        expect(product.rating).toBeGreaterThanOrEqual(4.0);
        expect(product.reviewCount).toBeGreaterThan(0);
      });
    });
  });

  describe('api.getSystemHealth()', () => {
    it('returns degraded fallback state when network request fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network offline')));

      const health = await api.getSystemHealth();
      expect(health.overallHealth).toBe('DEGRADED');
      expect(health.gatewayStatus).toBe('DOWN');
      expect(health.cloudProvider).toBe('AWS');
    });
  });
});
