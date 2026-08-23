import { beforeEach, describe, expect, it } from 'vitest';
import { getCachedProducts, PRODUCTS_CACHE_KEY } from './products';
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
});
