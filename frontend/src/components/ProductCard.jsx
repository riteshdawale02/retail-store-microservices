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

  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 30;
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
    if (!window.confirm(`Delete product "${product.name}" from MySQL database?`)) return;

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
      className="product-card glass-card"
      onClick={() => onQuickView(product)}
    >
      {/* Image Container */}
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

        {/* Category Tag Overlay */}
        <span className="product-category-overlay">
          {product.category || 'Retail'}
        </span>

        {/* Stock Status Badge */}
        {isOutOfStock ? (
          <span className="stock-badge out-of-stock">Out of Stock</span>
        ) : isLowStock ? (
          <span className="stock-badge low-stock">Only {product.stockQuantity} left</span>
        ) : (
          <span className="stock-badge in-stock">{product.stockQuantity} in stock</span>
        )}

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
        <div className="product-rating-row">
          <div className="rating-stars">
            <Star size={14} className="star-icon filled" />
            <span className="rating-value">{product.rating || '4.8'}</span>
          </div>
          <span className="review-count">({product.reviewCount || 42} reviews)</span>
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
                <Check size={16} />
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
                <ShoppingBag size={16} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
