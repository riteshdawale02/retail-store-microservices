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
            <h2 className="modal-title">Order History</h2>
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
              <p>Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="orders-empty-state">
              <Package size={48} className="text-muted" />
              <h3>No orders found</h3>
              <p>Your confirmed orders will appear here once you complete checkout.</p>
            </div>
          ) : (
            <div className="orders-cards-list">
              {orders.map((ord) => {
                const formattedDate = ord.createdAt
                  ? new Date(ord.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'Today';
                const totalItemCount = ord.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 1;

                return (
                  <div key={ord.id} className="order-history-card glass-card">
                    <div className="order-card-header">
                      <div className="order-card-id-group">
                        <span className="order-card-code">{ord.orderNumber || `ORD-${ord.id}`}</span>
                        <span className="order-card-date-badge">
                          <Calendar size={13} />
                          <span>{formattedDate}</span>
                        </span>
                      </div>
                      <span className="badge badge-success">
                        <CheckCircle2 size={13} />
                        <span>{ord.status || 'CONFIRMED'}</span>
                      </span>
                    </div>

                    {ord.items && ord.items.length > 0 && (
                      <div className="order-card-items-list">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="order-item-row">
                            <span className="order-item-name">{it.productName}</span>
                            <span className="order-item-qty">Qty: {it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="order-card-footer">
                      <span className="order-card-summary-count">
                        <Clock size={13} />
                        <span>{totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}</span>
                      </span>
                      <div className="order-card-total-group">
                        <span className="order-total-label">Total</span>
                        <span className="order-total-value">${Number(ord.totalAmount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
