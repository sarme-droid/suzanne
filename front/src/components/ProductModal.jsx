import { motion } from 'framer-motion';

function formatPrice(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { style: 'currency', currency: 'PHP' });
}

export default function ProductModal({ product, onClose, onAddToCart }) {
  const name = product.name || product.product_name || 'Untitled product';
  const price = product.price ?? product.base_price;
  const image = product.image_url || product.image;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-panel modal-card"
        layoutId={`product-${product.product_id ?? product.id}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal-image">
          {image ? <img src={image} alt={name} /> : <div className="modal-image-placeholder">No image</div>}
        </div>
        <div className="modal-body">
          {product.category_name && <span className="modal-category">{product.category_name}</span>}
          <h2>{name}</h2>
          {product.description && <p className="modal-description">{product.description}</p>}
          {price !== undefined && <p className="modal-price">{formatPrice(price)}</p>}
          {onAddToCart && (
            <button
              className="primary-button modal-add-to-cart"
              onClick={() => { onAddToCart(product); onClose(); }}
            >
              Add to cart
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}