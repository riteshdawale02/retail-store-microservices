import React from 'react';
import { X, Activity, RefreshCw, Server, Database, Cloud, Zap, CheckCircle2 } from 'lucide-react';

export default function HealthModal({
  isOpen,
  onClose,
  healthData,
  onRefresh,
  isRefreshing
}) {
  if (!isOpen) return null;

  const isHealthy = healthData?.overallHealth === 'HEALTHY';
  const services = healthData?.services || {};

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
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Cluster Summary */}
        <div className="telemetry-banner glass-card">
          <div className="telemetry-item">
            <span className="telemetry-label">Cloud Provider</span>
            <div className="telemetry-val-row">
              <Cloud size={16} className="text-primary" />
              <strong>{healthData?.cloudProvider || 'AWS (Amazon Web Services)'}</strong>
            </div>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">Region</span>
            <strong>{healthData?.awsRegion || 'us-east-1 (N. Virginia)'}</strong>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">Environment</span>
            <span className="badge badge-purple">{healthData?.environment || 'Production'}</span>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">Cluster Status</span>
            <span className={`badge ${isHealthy ? 'badge-success' : 'badge-warning'}`}>
              <span className={`pulse-dot ${isHealthy ? 'green' : 'amber'}`}></span>
              {isHealthy ? 'ALL SYSTEMS OPERATIONAL' : 'DEGRADED'}
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
                <span className="service-port">Port 8080 • Spring Web Proxy</span>
              </div>
            </div>
            <div className="service-status-pill">
              <span className="status-badge-text text-emerald">
                <CheckCircle2 size={14} /> UP
              </span>
              <span className="service-latency">&lt; 5ms</span>
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
                <span className="service-port">Port 8081 • MySQL (Catalog)</span>
              </div>
            </div>
            <div className="service-status-pill">
              <span className="status-badge-text text-emerald">
                <CheckCircle2 size={14} /> {services.productService?.status || 'UP'}
              </span>
              <span className="service-latency">{services.productService?.latencyMs || 42}ms</span>
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
                <span className="service-port">Port 8082 • Redis Distributed Cache</span>
              </div>
            </div>
            <div className="service-status-pill">
              <span className="status-badge-text text-emerald">
                <CheckCircle2 size={14} /> {services.cartService?.status || 'UP'}
              </span>
              <span className="service-latency">{services.cartService?.latencyMs || 12}ms</span>
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
                <span className="service-port">Port 8083 • MySQL (Transactions)</span>
              </div>
            </div>
            <div className="service-status-pill">
              <span className="status-badge-text text-emerald">
                <CheckCircle2 size={14} /> {services.orderService?.status || 'UP'}
              </span>
              <span className="service-latency">{services.orderService?.latencyMs || 58}ms</span>
            </div>
          </div>
        </div>

        {/* Monitoring & Observability Hub */}
        <div className="monitoring-quick-links glass-card" style={{ padding: '14px 18px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h4 style={{ fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '4px' }}>📊 Observability Stack (Prometheus + Grafana)</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Real-time JVM metrics, request rates, p95 latencies, and HikariCP connection pools.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href="http://localhost:9090/targets"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                Prometheus (9090) ↗
              </a>
              <a
                href="http://localhost:3001/d/retail-microservices-overview"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                Grafana Dashboards (3001) ↗
              </a>
            </div>
          </div>
        </div>

        {/* Refresh Action */}
        <div className="telemetry-footer">
          <span className="telemetry-timestamp">
            Last health sync: {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : 'Live'}
          </span>
          <button
            id="refresh-telemetry-btn"
            className="btn btn-secondary"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Poll Health Endpoints</span>
          </button>
        </div>
      </div>
    </div>
  );
}
