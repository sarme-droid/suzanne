import { apiFetch } from './client';

export function getAllProducts() {
  return apiFetch('/api/admin/products');
}

export function createProduct(product) {
  return apiFetch('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

export function updateProduct(id, product) {
  return apiFetch(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
}

export function deleteProduct(id) {
  return apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
}

export function getCategories() {
  return apiFetch('/api/admin/categories');
}

export function createCategory(name) {
  return apiFetch('/api/admin/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function getActivity() {
  return apiFetch('/api/admin/activity');
}

export function getUsers() {
  return apiFetch('/api/admin/users');
}

export function createStaff(staff) {
  return apiFetch('/api/admin/staff', {
    method: 'POST',
    body: JSON.stringify(staff),
  });
}

export function setStaffStatus(id, is_active) {
  return apiFetch(`/api/admin/staff/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active }),
  });
}