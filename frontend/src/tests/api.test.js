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
    it('contains at least 8 valid seed catalog items', () => {
      expect(FALLBACK_PRODUCTS.length).toBeGreaterThanOrEqual(8);
    });

    it('every product has required properties with valid types', () => {
      FALLBACK_PRODUCTS.forEach((product) => {
        expect(product.id).toBeTypeOf('number');
        expect(product.name).toBeTypeOf('string');
        expect(product.price).toBeGreaterThan(0);
        expect(product.stockQuantity).toBeGreaterThanOrEqual(0);
        expect(product.category).toBeTypeOf('string');
        expect(product.imageUrl).toMatch(/^https?:\/\//);
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
