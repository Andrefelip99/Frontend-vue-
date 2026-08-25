import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getCachedProducts,
  getSnapshotProducts,
  PRODUCTS_CACHE_KEY,
  PRODUCTS_SNAPSHOT_URL
} from './products';
import type { Product } from '../types';

const product: Product = {
  id: 1,
  title: 'Bolo de chocolate',
  price: 45,
  description: 'Bolo com cobertura',
  oneImageUrl: 'https://example.com/bolo.jpg',
  category: 'Bolos',
};

describe('products cache', () => {
  beforeEach(() => localStorage.clear());

  it('returns null when no products are cached', () => {
    expect(getCachedProducts()).toBeNull();
  });

  it('reads a valid product list from localStorage', () => {
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify([product]));

    expect(getCachedProducts()).toEqual([product]);
  });

  it('ignores malformed cache data', () => {
    localStorage.setItem(PRODUCTS_CACHE_KEY, '{malformed');

    expect(getCachedProducts()).toBeNull();
  });

  it('reads a valid product snapshot', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([product])
    }));

    await expect(getSnapshotProducts()).resolves.toEqual([product]);
    expect(fetch).toHaveBeenCalledWith(PRODUCTS_SNAPSHOT_URL, { cache: 'no-store' });
  });

  it('ignores unavailable or malformed snapshots', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    await expect(getSnapshotProducts()).resolves.toBeNull();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ products: [product] })
    }));
    await expect(getSnapshotProducts()).resolves.toBeNull();
  });
});
