import { apiFetch } from './client';

export function getProducts() {
  return apiFetch('/api/products');
}

export function getProductOptions(productId) {
  return apiFetch(`/api/products/${productId}/options`);
}