import React from 'react';
import { X, Activity, RefreshCw, Server, Database, Cloud, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

export default function HealthModal({
  isOpen,
  onClose,
  healthData,
  onRefresh,
  isRefreshing
}) {
  if (!isOpen) return null;

  const isHealthy = healthData?.overallHealth === 'HEALTHY' && healthData?.connected !== false;
  const services = healthData?.services || {};

  const getServiceStatus = (serviceKey) => {
    const s = services[serviceKey];
    if (!s) return { status: 'UNKNOWN', latency: 'N/A', isUp: false };
    const isUp = s.status === 'UP';
    return {
      status: s.status || 'UNKNOWN',
      latency: s.latencyMs !== undefined ? `${s.latencyMs}ms` : 'N/A',
      isUp,
      url: s.url || ''
    };
  };

  const productStatus = getServiceStatus('productService');
  const cartStatus = getServiceStatus('cartService');
  const orderStatus = getServiceStatus('orderService');
  const gatewayUp = healthData?.gatewayStatus === 'UP';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        id="cloud-telemetry-modal"
        className="modal-box glass-panel animate-fade health-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-row">
            <Activity size={22} className="text-cyan" />
            <h2 className="modal-title">Cloud Infrastructure & Microservices Telemetry</h2>
          </div>
          <button
            id="close-health-modal"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close telemetry modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Cluster Summary */}
        <div className="telemetry-banner glass-card">
          <div className="telemetry-item">
            <span className="telemetry-label">Cloud Platform</span>
            <div className="telemetry-val-row">
              <Cloud size={16} className="text-primary" />
              <strong>{healthData?.cloudProvider || 'AWS'} EKS Cluster</strong>
            </div>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">Region</span>
            <strong>{healthData?.awsRegion || 'us-east-1'}</strong>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">Cluster Mode</span>
            <span className={`badge ${healthData?.connected ? 'badge-purple' : 'badge-warning'}`}>
              {healthData?.connected ? 'Live Kubernetes Mesh' : 'Offline / Local Dev'}
            </span>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">Cluster Status</span>
            <span className={`badge ${isHealthy ? 'badge-success' : 'badge-warning'}`}>
              <span className={`pulse-dot ${isHealthy ? 'green' : 'amber'}`}></span>
              {isHealthy ? 'ALL SYSTEMS OPERATIONAL' : 'DEGRADED / RECOVERING'}
            </span>
          </div>
        </div>

        {/* Microservices Matrix */}
        <div className="services-telemetry-grid">
          {/* API Gateway */}
          <div className="service-card glass-card">
            <div className="service-card-top">
              <div className="service-icon-box gateway">
                <Server size={18} />
              </div>
              <div>
                <h4 className="service-name">API Gateway</h4>
                <span className="service-port">Reverse Proxy & Route Dispatcher</span>
              </div>
            </div>
            <div className="service-status-pill">
              <span className={`status-badge-text ${gatewayUp ? 'text-emerald' : 'text-rose'}`}>
                {gatewayUp ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {gatewayUp ? ' UP' : ' DOWN'}
              </span>
              <span className="service-latency">{gatewayUp ? 'Connected' : 'Unreachable'}</span>
            </div>
          </div>

          {/* Product Service */}
          <div className="service-card glass-card">
            <div className="service-card-top">
              <div className="service-icon-box product">
                <Database size={18} />
              </div>
              <div>
                <h4 className="service-name">Product Service</h4>
                <span className="service-port">Spring Boot 3 • MySQL Catalog</span>
              </div>
            </div>
            <div className="service-status-pill">
              <span className={`status-badge-text ${productStatus.isUp ? 'text-emerald' : 'text-rose'}`}>
                {productStatus.isUp ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {productStatus.status}
              </span>
              <span className="service-latency">{productStatus.latency}</span>
            </div>
          </div>

          {/* Cart Service */}
          <div className="service-card glass-card">
            <div className="service-card-top">
              <div className="service-icon-box cart">
                <Zap size={18} />
              </div>
              <div>
                <h4 className="service-name">Cart Service</h4>
                <span className="service-port">Spring Boot 3 • Redis In-Memory Cache</span>
              </div>
            </div>
            <div className="service-status-pill">
              <span className={`status-badge-text ${cartStatus.isUp ? 'text-emerald' : 'text-rose'}`}>
                {cartStatus.isUp ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {cartStatus.status}
              </span>
              <span className="service-latency">{cartStatus.latency}</span>
            </div>
          </div>

          {/* Order Service */}
          <div className="service-card glass-card">
            <div className="service-card-top">
              <div className="service-icon-box order">
                <Database size={18} />
              </div>
              <div>
                <h4 className="service-name">Order Service</h4>
                <span className="service-port">Spring Boot 3 • MySQL Transactions & Auth</span>
              </div>
            </div>
            <div className="service-status-pill">
              <span className={`status-badge-text ${orderStatus.isUp ? 'text-emerald' : 'text-rose'}`}>
                {orderStatus.isUp ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {orderStatus.status}
              </span>
              <span className="service-latency">{orderStatus.latency}</span>
            </div>
          </div>
        </div>

        {/* Telemetry Footer Controls */}
        <div className="telemetry-footer">
          <div className="telemetry-timestamp">
            <span>Last cluster poll: {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : 'Just now'}</span>
          </div>

          <button
            id="refresh-telemetry-btn"
            className="btn btn-secondary"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Poll cluster health endpoints"
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin' : ''} />
            <span>{isRefreshing ? 'Querying Pods...' : 'Poll Health Actuators'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
