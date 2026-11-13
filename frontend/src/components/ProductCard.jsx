import React, { useState } from 'react';
import { Star, ShoppingBag, Check, AlertCircle, Trash2 } from 'lucide-react';

export default function ProductCard({
  product,
  onAddToCart,
  onQuickView,
  isRetailer,
  onDeleteProduct
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 10;
  const isOutOfStock = product.stockQuantity <= 0;

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (isOutOfStock || isAdding) return;

    setIsAdding(true);
    try {
      await onAddToCart(product);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove "${product.name}" from the store catalog?`)) return;

    setIsDeleting(true);
    try {
      await onDeleteProduct(product.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article
      id={`product-card-${product.id}`}
      className="product-card"
      onClick={() => onQuickView(product)}
    >
      {/* Neutral Image Container */}
      <div className="product-image-container">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Minimal Stock Notice: Only shown when actionable (out of stock or low) */}
        {isOutOfStock ? (
          <span className="stock-notice-pill out-of-stock">Sold Out</span>
        ) : isLowStock ? (
          <span className="stock-notice-pill low-stock">Only {product.stockQuantity} Left</span>
        ) : null}

        {/* Retailer Action: Delete Product */}
        {isRetailer && (
          <button
            className="retailer-card-delete-btn"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Retailer Action: Delete Product from Catalog"
          >
            {isDeleting ? <span className="spinner-small"></span> : <Trash2 size={15} />}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="product-content">
        <div className="product-meta-header">
          <span className="product-category-label">
            {product.category || 'Hardware'}
          </span>
          <div className="product-rating-row">
            <Star size={13} className="star-icon filled" />
            <span className="rating-value">{product.rating || '4.8'}</span>
            <span className="review-count">({product.reviewCount || 42})</span>
          </div>
        </div>

        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>

        <p className="product-description" title={product.description}>
          {product.description}
        </p>

        {/* Footer / Price & Add */}
        <div className="product-footer">
          <div className="price-box">
            <span className="price-currency">$</span>
            <span className="price-amount">
              {Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <button
            id={`add-to-cart-${product.id}`}
            className={`btn add-cart-btn ${justAdded ? 'added' : 'btn-primary'}`}
            disabled={isOutOfStock || isAdding}
            onClick={handleAdd}
            title={isOutOfStock ? 'Sold out' : 'Add to cart'}
          >
            {justAdded ? (
              <>
                <Check size={15} />
                <span>Added</span>
              </>
            ) : isAdding ? (
              <span className="spinner-small"></span>
            ) : isOutOfStock ? (
              <>
                <AlertCircle size={15} />
                <span>Sold Out</span>
              </>
            ) : (
              <>
                <ShoppingBag size={15} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
