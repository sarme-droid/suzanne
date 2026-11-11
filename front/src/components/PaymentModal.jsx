import { useState } from 'react';
import { motion } from 'framer-motion';
import { createOrder } from '../api/orders';

const PAYMENT_METHODS = ['Cash', 'Card', 'GCash'];

function formatPrice(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { style: 'currency', currency: 'PHP' });
}

export default function PaymentModal({ cart, onClose, onComplete }) {
  const [method, setMethod] = useState('Cash');
  const [tendered, setTendered] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const tenderedNum = Number(tendered) || 0;
  const change = tenderedNum - total;
  const canConfirm = method !== 'Cash' || tenderedNum >= total;

  async function handleConfirm() {
    setSubmitting(true);
    setError('');
    try {
      const result = await createOrder({
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod: method,
        amountTendered: method === 'Cash' ? tenderedNum : total,
        total,
      });
      setReceipt({ ...result, method, items: cart, total });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      className="cart-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={receipt ? undefined : onClose}
    >
      <motion.div
        className="glass-panel payment-card"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        {!receipt ? (
          <>
            <div className="cart-header">
              <h2>Payment</h2>
              <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
            </div>

            <p className="payment-total">Total due: <strong>{formatPrice(total)}</strong></p>

            <div className="payment-methods">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m}
                  className={`payment-method ${method === m ? 'active' : ''}`}
                  onClick={() => setMethod(m)}
                >
                  {m}
                </button>
              ))}
            </div>

            {method === 'Cash' && (
              <div className="payment-cash">
                <label>
                  Amount tendered
                  <input
                    type="number"
                    step="0.01"
                    value={tendered}
                    onChange={(e) => setTendered(e.target.value)}
                    autoFocus
                  />
                </label>
                <p className={`payment-change ${change < 0 ? 'negative' : ''}`}>
                  {change < 0 ? `Short by ${formatPrice(-change)}` : `Change: ${formatPrice(change)}`}
                </p>
              </div>
            )}

            {error && <p className="login-error">{error}</p>}

            <button
              className="primary-button payment-confirm"
              disabled={!canConfirm || submitting}
              onClick={handleConfirm}
            >
              {submitting ? 'Processing…' : `Confirm ${method} payment`}
            </button>
          </>
        ) : (
          <Receipt receipt={receipt} onClose={() => onComplete()} />
        )}
      </motion.div>
    </motion.div>
  );
}

function Receipt({ receipt, onClose }) {
  return (
    <div className="receipt">
      <h2>Payment successful</h2>
      <p className="receipt-order-id">Order #{receipt.order_id}</p>

      <div className="receipt-items">
        {receipt.items.map((item) => (
          <div key={item.product_id} className="receipt-line">
            <span>{item.name} × {item.quantity}</span>
            <span>{formatPrice(Number(item.price) * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="receipt-line receipt-total">
        <span>Total</span>
        <span>{formatPrice(receipt.total)}</span>
      </div>

      {receipt.method === 'Cash' && (
        <>
          <div className="receipt-line">
            <span>Tendered</span>
            <span>{formatPrice(receipt.amount_tendered)}</span>
          </div>
          <div className="receipt-line">
            <span>Change</span>
            <span>{formatPrice(receipt.change)}</span>
          </div>
        </>
      )}

      <button className="primary-button" onClick={onClose}>Start new order</button>
    </div>
  );
}