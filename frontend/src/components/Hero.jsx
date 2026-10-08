import React from 'react';
import { Layers, ShieldCheck, Zap, Database, Cpu, Cloud } from 'lucide-react';

export default function Hero({ totalProducts }) {
  return (
    <section className="hero-banner">
      <div className="hero-glass-card glass-panel">
        <div className="hero-content">
          <div className="hero-badge-row">
            <span className="badge badge-purple">
              <Cloud size={13} /> AWS Cloud-Native
            </span>
            <span className="badge badge-info">
              <Cpu size={13} /> Java Spring Boot 3
            </span>
            <span className="badge badge-success">
              <Zap size={13} /> Redis Caching
            </span>
          </div>

          <h1 className="hero-heading">
            Enterprise Cloud Retail <br />
            <span className="gradient-text">Orchestrated with Microservices</span>
          </h1>

          <p className="hero-subtext">
            High-throughput distributed commerce engine featuring isolated database partitions,
            sub-millisecond Redis shopping cart persistence, and zero-downtime Kubernetes deployments.
          </p>

          <div className="hero-stats-row">
            <div className="stat-pill">
              <span className="stat-value">4</span>
              <span className="stat-label">Microservices</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-pill">
              <span className="stat-value">{totalProducts || 10}+</span>
              <span className="stat-label">Live Catalog Items</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-pill">
              <span className="stat-value">&lt; 10ms</span>
              <span className="stat-label">Redis Cart Latency</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-pill">
              <span className="stat-value">ACID</span>
              <span className="stat-label">MySQL Transactions</span>
            </div>
          </div>
        </div>

        {/* Tech stack interactive badges */}
        <div className="hero-tech-strip">
          <div className="tech-chip"><Layers size={14} /> Amazon EKS</div>
          <div className="tech-chip"><ShieldCheck size={14} /> Docker Multi-Stage</div>
          <div className="tech-chip"><Database size={14} /> MySQL 8.0</div>
          <div className="tech-chip"><Zap size={14} /> Redis 7 Cache</div>
          <div className="tech-chip"><Cloud size={14} /> Terraform IaC</div>
        </div>
      </div>
    </section>
  );
}
