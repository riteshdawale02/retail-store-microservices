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
    if (!s) return { status: 'Standby', latency: null, isUp: false };
    const isUp = s.status === 'UP';
    return {
      status: isUp ? 'Operational' : (s.status || 'Offline'),
      latency: s.latencyMs !== undefined ? `${s.latencyMs}ms` : null,
      isUp,
      url: s.url || ''
    };
  };

  const productStatus = getServiceStatus('productService');
  const cartStatus = getServiceStatus('cartService');
  const orderStatus = getServiceStatus('orderService');
  const gatewayUp = healthData?.gatewayStatus === 'UP';

  const serviceList = [
    {
      id: 'gateway',
      name: 'API Gateway',
      desc: 'Reverse Proxy & Route Dispatcher',
      icon: Server,
      isUp: gatewayUp,
      status: gatewayUp ? 'Operational' : 'Offline',
      latency: gatewayUp ? '< 5ms' : null,
    },
    {
      id: 'product',
      name: 'Product Service',
      desc: 'Spring Boot 3 • MySQL Catalog',
      icon: Database,
      isUp: productStatus.isUp,
      status: productStatus.status,
      latency: productStatus.latency,
    },
    {
      id: 'cart',
      name: 'Cart Service',
      desc: 'Spring Boot 3 • Redis Cache',
      icon: Zap,
      isUp: cartStatus.isUp,
      status: cartStatus.status,
      latency: cartStatus.latency,
    },
    {
      id: 'order',
      name: 'Order Service',
      desc: 'Spring Boot 3 • MySQL Transactions',
      icon: Database,
      isUp: orderStatus.isUp,
      status: orderStatus.status,
      latency: orderStatus.latency,
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        id="cloud-telemetry-modal"
        className="modal-box glass-panel animate-fade health-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-row">
            <Activity size={20} className="text-cyan" />
            <h2 className="modal-title">System &amp; Service Telemetry</h2>
          </div>
          <button
            id="close-health-modal"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close telemetry modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Global Cluster Summary */}
        <div className="telemetry-banner glass-card">
          <div className="telemetry-item">
            <span className="telemetry-label">Cloud Platform</span>
            <div className="telemetry-val-row">
              <Cloud size={15} className="text-primary" />
              <span>{healthData?.cloudProvider || 'AWS'} EKS</span>
            </div>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">Region</span>
            <span className="telemetry-val">{healthData?.awsRegion || 'us-east-1'}</span>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">Cluster Mode</span>
            <span className={`badge ${healthData?.connected ? 'badge-purple' : 'badge-warning'}`}>
              {healthData?.connected ? 'Live Mesh' : 'Offline / Local Dev'}
            </span>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">Cluster Status</span>
            <span className={`badge ${isHealthy ? 'badge-success' : 'badge-warning'}`}>
              <span className={`pulse-dot ${isHealthy ? 'green' : 'amber'}`}></span>
              {isHealthy ? 'Operational' : 'Degraded'}
            </span>
          </div>
        </div>

        {/* Microservices Matrix */}
        <div className="services-telemetry-list">
          {serviceList.map((srv) => (
            <div className="service-card glass-card" key={srv.id}>
              <div className="service-info-row">
                <div className={`service-icon-box ${srv.id}`}>
                  <srv.icon size={17} />
                </div>
                <div className="service-text">
                  <h4 className="service-name">{srv.name}</h4>
                  <span className="service-desc">{srv.desc}</span>
                </div>
              </div>
              <div className="service-status-cluster">
                <span className={`service-status-pill ${srv.isUp ? 'status-up' : srv.status === 'Standby' ? 'status-standby' : 'status-down'}`}>
                  {srv.isUp ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                  <span>{srv.status}</span>
                </span>
                {srv.latency && (
                  <span className="service-latency-pill">{srv.latency}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Telemetry Footer Controls */}
        <div className="telemetry-footer">
          <span className="telemetry-timestamp">
            Last checked: {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : 'Just now'}
          </span>

          <button
            id="refresh-telemetry-btn"
            className="btn btn-secondary telemetry-refresh-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Poll cluster health endpoints"
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
            <span>{isRefreshing ? 'Checking...' : 'Refresh Status'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
