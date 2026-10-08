import React from 'react';
import { X, Package, Clock, Calendar, CheckCircle2 } from 'lucide-react';

export default function OrdersModal({ isOpen, onClose, orders, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        id="orders-history-modal"
        className="modal-box glass-panel animate-fade orders-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-row">
            <Package size={22} className="text-primary" />
            <h2 className="modal-title">My Orders History</h2>
          </div>
          <button
            id="close-orders-modal"
            className="modal-close-btn"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="orders-list-body">
          {isLoading ? (
            <div className="loading-state">
              <span className="spinner-medium"></span>
              <p>Fetching orders from MySQL database...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="orders-empty-state">
              <Package size={48} className="text-muted" />
              <h3>No orders found</h3>
              <p>Your confirmed orders will appear here once you complete checkout.</p>
            </div>
          ) : (
            <div className="orders-cards-list">
              {orders.map((ord) => (
                <div key={ord.id} className="order-history-card glass-card">
                  <div className="order-card-header">
                    <div>
                      <span className="order-num-label">Order</span>
                      <h4 className="order-num-value">{ord.orderNumber || `ORD-${ord.id}`}</h4>
                    </div>
                    <span className="badge badge-success">
                      <CheckCircle2 size={13} />
                      {ord.status || 'CONFIRMED'}
                    </span>
                  </div>

                  <div className="order-card-details">
                    <div className="order-card-info-item">
                      <Calendar size={14} className="text-muted" />
                      <span>{ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Today'}</span>
                    </div>
                    <div className="order-card-info-item">
                      <Clock size={14} className="text-muted" />
                      <span>{ord.items?.length || 1} item(s)</span>
                    </div>
                  </div>

                  {ord.items && ord.items.length > 0 && (
                    <div className="order-card-items-preview">
                      {ord.items.map((it, idx) => (
                        <span key={idx} className="order-item-chip">
                          {it.productName} ({it.quantity})
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="order-card-footer">
                    <span className="order-total-label">Total Amount:</span>
                    <span className="order-total-value">${Number(ord.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
