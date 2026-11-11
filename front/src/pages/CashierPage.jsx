import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getProducts } from '../api/products';
import { useAuth } from '../context/AuthContext';
import ProductModal from '../components/ProductModal';
import CartDrawer from '../components/CartDrawer';
import PaymentModal from '../components/PaymentModal';
import './CashierPage.css';

function formatPrice(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { style: 'currency', currency: 'PHP' });
}

function ProductCard({ product, onSelect }) {
  const name = product.name || product.product_name || 'Untitled product';
  const price = product.price ?? product.base_price;
  const image = product.image_url || product.image;
  const id = product.product_id ?? product.id;

  return (
    <motion.button
      className="glass-panel product-card"
      layoutId={`product-${id}`}
      onClick={() => onSelect(product)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="product-image">
        {image ? <img src={image} alt={name} /> : <div className="product-image-placeholder">No image</div>}
      </div>
      <div className="product-body">
        {product.category_name && <span className="product-category">{product.category_name}</span>}
        <h3 className="product-name">{name}</h3>
        {price !== undefined && <p className="product-price">{formatPrice(price)}</p>}
      </div>
    </motion.button>
  );
}

export default function CashierPage() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    let isMounted = true;
    getProducts()
      .then((data) => {
        if (isMounted) {
          setProducts(data);
          setStatus('success');
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(err.message);
          setStatus('error');
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  function addToCart(product) {
    const id = product.product_id ?? product.id;
    const price = product.price ?? product.base_price;
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product_id: id, name: product.name, price, quantity: 1 }];
    });
    setShowCart(true);
  }

  function changeQuantity(productId, quantity) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => prev.map((item) => (item.product_id === productId ? { ...item, quantity } : item)));
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  }

  function handleOrderComplete() {
    setCart([]);
    setShowPayment(false);
    setShowCart(false);
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-background cashier-screen">
      <header className="glass-panel cashier-header">
        <div>
          <h1>Print Shop</h1>
          <p>Tap a product to view details</p>
        </div>
        <div className="cashier-header-right">
          <span className="cashier-user">{user?.full_name || user?.username}</span>
          <button className="logout-button" onClick={logout}>Log out</button>
        </div>
      </header>

      <main className="cashier-content">
        {status === 'loading' && <p className="status-message">Loading products…</p>}
        {status === 'error' && <div className="status-message error"><p>Couldn't load products: {errorMessage}</p></div>}
        {status === 'success' && products.length === 0 && <p className="status-message">No products found yet.</p>}
        {status === 'success' && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.product_id ?? product.id} product={product} onSelect={setSelected} />
            ))}
          </div>
        )}
      </main>

      <button className="cart-fab" onClick={() => setShowCart(true)}>
        🛒
        {cartCount > 0 && <span className="cart-fab-badge">{cartCount}</span>}
      </button>

      <AnimatePresence>
        {selected && (
          <ProductModal product={selected} onClose={() => setSelected(null)} onAddToCart={addToCart} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCart && !showPayment && (
          <CartDrawer
            cart={cart}
            onQuantityChange={changeQuantity}
            onRemove={removeFromCart}
            onClose={() => setShowCart(false)}
            onCheckout={() => setShowPayment(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPayment && (
          <PaymentModal
            cart={cart}
            onClose={() => setShowPayment(false)}
            onComplete={handleOrderComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}