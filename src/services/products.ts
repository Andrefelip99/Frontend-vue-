import { api } from './api';
import { getToken } from './auth';
import type { Product, ProductPayload } from '../types';
const list = (data: Product[] | { content?: Product[] }) => Array.isArray(data) ? data : data.content || [];
const PRODUCTS_CACHE_KEY = 'macedo-farias-products';
const PRODUCTS_UPDATED_AT_KEY = 'macedo-farias-products-updated-at';
const PRODUCTS_TIMEOUT_MS = 10000;
const getCachedProducts = () => { try { const raw = localStorage.getItem(PRODUCTS_CACHE_KEY); if (!raw) return null; const parsed: unknown = JSON.parse(raw); return Array.isArray(parsed) ? parsed as Product[] : null; } catch { return null; } };
const saveCachedProducts = (products: Product[]) => { try { localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(products)); localStorage.setItem(PRODUCTS_UPDATED_AT_KEY, new Date().toISOString()); window.dispatchEvent(new Event('products-cache-updated')); } catch { /* cache is an enhancement, not a requirement */ } };
export const productsService = { async all() { const cached = getCachedProducts(); if (!getToken() && cached !== null) { void this.refresh(cached).catch(() => undefined); return cached; } return this.refresh(); }, getCached: getCachedProducts, async refresh(cached?: Product[]) { const { data } = await api.get('/products', { timeout: PRODUCTS_TIMEOUT_MS }); const products = list(data); if (cached) { cached.splice(0, cached.length, ...products); saveCachedProducts(cached); return cached; } saveCachedProducts(products); return products; }, async one(id: string) { const { data } = await api.get<Product>(`/products/${id}`); return data; }, create(payload: ProductPayload) { return api.post('/products', payload); }, update(id: number, payload: ProductPayload) { return api.put(`/products/${id}`, payload); }, remove(id: number) { return api.delete(`/products/${id}`); } };
async function compressImage(file: File) {
	const bitmap = await createImageBitmap(file);
	const maxDimension = 1600;
	const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
	const canvas = document.createElement('canvas');
	canvas.width = Math.max(1, Math.round(bitmap.width * scale));
	canvas.height = Math.max(1, Math.round(bitmap.height * scale));
	canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	bitmap.close();
	const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.82));
	if (!blob) throw new Error('Não foi possível preparar a imagem.');
	return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' });
}

export async function uploadImage(file: File, onProgress?: (value: number) => void) { const compressed = await compressImage(file); const form = new FormData(); form.append('file', compressed); const { data } = await api.post<{ imageUrl: string }>('/upload', form, { onUploadProgress: e => onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0) }); return data.imageUrl; }
