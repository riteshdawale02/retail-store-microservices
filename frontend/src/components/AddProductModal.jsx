import React, { useState } from 'react';
import { X, PlusCircle, Package, DollarSign, Image, Tag, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AddProductModal({
  isOpen,
  onClose,
  onProductCreated
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    price: '',
    stockQuantity: 50,
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.price || !formData.description.trim()) {
      setErrorMessage('Please fill in product name, price, and description.');
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMessage('Please enter a valid positive price.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        price: priceNum,
        stockQuantity: parseInt(formData.stockQuantity) || 10,
        imageUrl: formData.imageUrl.trim(),
        description: formData.description.trim()
      };

      await onProductCreated(payload);
      onClose();
      // Reset form
      setFormData({
        name: '',
        category: 'Electronics',
        price: '',
        stockQuantity: 50,
        imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
        description: ''
      });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to add product to catalog.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        id="add-product-modal"
        className="modal-box glass-panel animate-fade add-product-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-row">
            <PlusCircle size={22} className="text-amber" />
            <h2 className="modal-title">Retailer Portal – Publish New Product</h2>
          </div>
          <button
            id="close-add-product-modal"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <div className="retailer-role-pill">
          <span>Logged in with verified role: <strong>RETAILER</strong></span>
        </div>

        {errorMessage && (
          <div className="alert-box alert-error">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="form-group">
            <label htmlFor="product-name">Product Title *</label>
            <div className="input-with-icon">
              <Package size={16} className="input-icon" />
              <input
                id="product-name"
                type="text"
                required
                placeholder="e.g. Wireless Smart Speaker 360"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="product-category">Category *</label>
              <div className="input-with-icon">
                <Tag size={16} className="input-icon" />
                <select
                  id="product-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={isSubmitting}
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Audio">Audio</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="product-price">Price ($ USD) *</label>
              <div className="input-with-icon">
                <DollarSign size={16} className="input-icon" />
                <input
                  id="product-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="e.g. 199.99"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="product-stock">Initial Stock Quantity *</label>
            <input
              id="product-stock"
              type="number"
              min="1"
              required
              placeholder="e.g. 50"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-image">Image URL</label>
            <div className="input-with-icon">
              <Image size={16} className="input-icon" />
              <input
                id="product-image"
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            {formData.imageUrl && (
              <div className="image-preview-thumbnail">
                <img src={formData.imageUrl} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
                <span>Image Preview</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="product-desc">Product Description *</label>
            <textarea
              id="product-desc"
              rows="3"
              required
              placeholder="Detailed specs, features, warranty, and highlights..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              id="submit-product-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  <span>Writing to MySQL Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Publish Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
