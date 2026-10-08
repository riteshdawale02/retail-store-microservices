import React from 'react';
import { CheckCircle2, Copy, Check, ArrowRight } from 'lucide-react';

export default function OrderSuccessModal({ orderData, onClose, onOpenOrders }) {
  const [copied, setCopied] = React.useState(false);
  if (!orderData) return null;

  const order = orderData.order || orderData;
  const orderNumber = order.orderNumber || `ORD-${order.id || 'NEW'}`;

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        id="order-success-modal"
        className="modal-box glass-panel animate-fade receipt-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="success-icon-banner">
          <div className="success-pulse-circle">
            <CheckCircle2 size={44} className="text-emerald" />
          </div>
          <h2 className="success-title">Order Placed Successfully!</h2>
          <p className="success-subtitle">
            Inventory stock deducted & order transaction committed in MySQL.
          </p>
        </div>

        {/* Order Meta Box */}
        <div className="receipt-meta-box glass-card">
          <div className="meta-item">
            <span className="meta-label">Order Number</span>
            <div className="meta-value-copy">
              <code>{orderNumber}</code>
              <button
                className="copy-btn"
                onClick={copyOrderNumber}
                title="Copy order number"
              >
                {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="meta-item">
            <span className="meta-label">Status</span>
            <span className="badge badge-success">{order.status || 'CONFIRMED'}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Customer</span>
            <span className="meta-value">{order.customerName}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Total Amount</span>
            <span className="meta-value total-highlight">
              ${Number(order.totalAmount || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Items List */}
        {order.items && order.items.length > 0 && (
          <div className="receipt-items-container">
            <h4 className="receipt-items-title">Purchased Items:</h4>
            <div className="receipt-items-list">
              {order.items.map((it, idx) => (
                <div key={idx} className="receipt-item-row">
                  <div className="receipt-item-left">
                    <span className="receipt-item-bullet">•</span>
                    <span className="receipt-item-name">{it.productName}</span>
                    <span className="receipt-item-qty">× {it.quantity}</span>
                  </div>
                  <span className="receipt-item-price">
                    ${Number(it.subtotal || it.unitPrice * it.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="receipt-actions">
          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            Continue Shopping
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onOpenOrders();
            }}
          >
            <span>View All Orders</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
