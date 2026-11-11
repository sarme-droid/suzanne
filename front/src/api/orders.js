import { apiFetch } from './client';

export function createOrder({ items, paymentMethod, amountTendered, total }) {
  return apiFetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      items,
      payment_method: paymentMethod,
      amount_tendered: amountTendered,
      total,
    }),
  });
}