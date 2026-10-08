import React, { useState } from 'react';
import { X, Star, ShoppingBag, Check, ShieldCheck, Truck } from 'lucide-react';

export default function ProductDetailModal({ product, onClose, onAddToCart }) {
  const [qty, setQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 30;
  const isOutOfStock = product.stockQuantity <= 0;

  const handleAdd = async () => {
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    try {
      await onAddToCart({ ...product, quantity: qty });
      setJustAdded(true);
      setTimeout(() => {
        setJustAdded(false);
        onClose();
      }, 1200);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        id="product-detail-modal"
        className="modal-box glass-panel animate-fade product-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-product-detail"
          className="modal-close-btn"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div className="product-detail-grid">
          {/* Image */}
          <div className="product-detail-media">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="detail-large-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
              }}
            />
            <span className="detail-category-badge">{product.category}</span>
          </div>

          {/* Info */}
          <div className="product-detail-info">
            <div className="detail-rating-row">
              <div className="rating-stars">
                <Star size={16} className="star-icon filled" />
                <span className="rating-value">{product.rating || '4.8'}</span>
              </div>
              <span className="review-count">({product.reviewCount || 98} verified customer reviews)</span>
            </div>

            <h2 className="detail-title">{product.name}</h2>

            <div className="detail-price-row">
              <span className="detail-price">${Number(product.price).toFixed(2)}</span>
              {isOutOfStock ? (
                <span className="badge badge-warning">Out of Stock</span>
              ) : isLowStock ? (
                <span className="badge badge-warning">Low Stock ({product.stockQuantity} remaining)</span>
              ) : (
                <span className="badge badge-success">In Stock ({product.stockQuantity} available)</span>
              )}
            </div>

            <p className="detail-desc">{product.description}</p>

            <div className="detail-perks">
              <div className="perk-item">
                <Truck size={16} className="text-cyan" />
                <span>Free expedited standard delivery</span>
              </div>
              <div className="perk-item">
                <ShieldCheck size={16} className="text-emerald" />
                <span>1-Year comprehensive cloud hardware warranty</span>
              </div>
            </div>

            {/* Quantity and CTA */}
            {!isOutOfStock && (
              <div className="detail-actions">
                <div className="detail-quantity-box">
                  <button
                    className="qty-btn"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                  >
                    -
                  </button>
                  <span className="detail-qty-num">{qty}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQty(Math.min(product.stockQuantity, qty + 1))}
                  >
                    +
                  </button>
                </div>

                <button
                  id="detail-add-to-cart-btn"
                  className={`btn ${justAdded ? 'added' : 'btn-primary'} detail-add-btn`}
                  disabled={isAdding}
                  onClick={handleAdd}
                >
                  {justAdded ? (
                    <>
                      <Check size={18} />
                      <span>Added to Cart!</span>
                    </>
                  ) : isAdding ? (
                    <span className="spinner-small"></span>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>Add to Cart • ${(product.price * qty).toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
