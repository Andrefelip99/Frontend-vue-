import { api } from './api';
import type { Product, ProductPayload } from '../types';

export const PRODUCTS_CACHE_KEY = 'macedo-farias-products';
export const PRODUCTS_UPDATED_AT_KEY = 'macedo-farias-updated-at';

type ProductResponse = Product[] | { content?: Product[] };
const normalize = (data: ProductResponse) => Array.isArray(data) ? data : data.content || [];

export function getCachedProducts(): Product[] | null {
  try {
    const raw = localStorage.getItem(PRODUCTS_CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as Product[] : null;
  } catch { return null; }
}

function saveCachedProducts(products: Product[]) {
  try {
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(products));
    localStorage.setItem(PRODUCTS_UPDATED_AT_KEY, new Date().toISOString());
    window.dispatchEvent(new Event('products-cache-updated'));
  } catch { /* cache local e uma melhoria, nao bloqueia a vitrine */ }
}

export async function refreshProducts() {
  const { data } = await api.get<ProductResponse>('/products');
  const products = normalize(data);
  saveCachedProducts(products);
  return products;
}

export const productsService = {
  all: refreshProducts,
  getCached: getCachedProducts,
  one: async (id: string | number) => (await api.get<Product>(`/products/${id}`)).data,
  create: (payload: ProductPayload) => api.post<Product>('/products', payload),
  update: (id: number, payload: ProductPayload) => api.put<Product>(`/products/${id}`, payload),
  remove: (id: number) => api.delete(`/products/${id}`)
};

async function compressImage(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Selecione um arquivo de imagem.');
  if (file.size <= 1_500_000) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.84));
  if (!blob) throw new Error('Nao foi possivel otimizar a imagem.');
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' });
}

export async function uploadImage(file: File, onProgress?: (value: number) => void) {
  const compressed = await compressImage(file);
  const form = new FormData();
  form.append('file', compressed);
  const { data } = await api.post<{ imageUrl: string }>('/upload', form, {
    onUploadProgress: (event) => onProgress?.(event.total ? Math.round(event.loaded * 100 / event.total) : 0)
  });
  return data.imageUrl;
}
