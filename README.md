# Cloud-Native Retail Platform Using Microservices

## 🚀 Architectural Overview

This project is a modern, enterprise-grade cloud-native e-commerce application structured into **4 Java Spring Boot microservices**, backed by **MySQL** relational database and **Redis** distributed in-memory cache, orchestrated with **Docker**, **Kubernetes (Amazon EKS)**, **Helm**, and **Terraform** on **Amazon Web Services (AWS)**.

### Microservices Matrix

| Microservice | Port | Framework | Storage / Cache | Key Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| [`product-service`](file:///Users/samir/ecom/product-service) | `8081` | Spring Boot 3 + JPA | MySQL (`retail_product_db`) | Product Catalog, category browsing, full-text search, atomic stock reservation |
| [`cart-service`](file:///Users/samir/ecom/cart-service) | `8082` | Spring Boot 3 + Redis | Redis (`retail:cart:{id}`) | High-throughput cart management, quantity mutations, automatic TTL |
| [`order-service`](file:///Users/samir/ecom/order-service) | `8083` | Spring Boot 3 + JPA | MySQL (`retail_order_db`) | Checkout orchestration, inter-service REST calls, order state machine |
| [`api-gateway`](file:///Users/samir/ecom/api-gateway) | `8080` | Spring Boot 3 + Web | Dynamic / Proxy | Central entrypoint, reverse proxy routing, CORS, aggregated health telemetry, hosts Storefront UI |

---

## 📁 Repository Structure

```
/Users/samir/ecom/
├── README.md                      # Project overview and quickstart 1
├── PROJECT_SYNOPSIS.md            # Exact academic capstone synopsis (15 Sections)
├── VIVA_VOCE_PREPARATION.md       # Capstone Viva Voce defense & examiner Q&A guide
├── ARCHITECTURE.md                # Microservices architecture & API contract specs
├── DEPLOYMENT_AWS_GUIDE.md        # Comprehensive AWS production hosting guide
├── docker-compose.yml             # Local multi-container complete stack
├── init-db.sql                    # Initial database bootstrapper
│
├── product-service/               # Module 1: Product Catalog (Spring Boot 3 + MySQL)
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/...
│
├── cart-service/                  # Module 2: Shopping Cart (Spring Boot 3 + Redis)
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/...
│
├── order-service/                 # Module 3: Checkout & Orders (Spring Boot 3 + MySQL)
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/...
│
├── api-gateway/                   # Module 4: API Gateway & Web Storefront Host
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/resources/static/ # Modern Storefront UI (HTML5, Vanilla CSS, JS)
│       ├── index.html
│       ├── css/style.css
│       └── js/app.js
│
├── frontend/                      # Independent React 19 + Vite Storefront UI
│   ├── package.json
│   ├── Dockerfile
│   └── src/...
│
├── prometheus/                    # Module 5: Metrics & Observability Collector
│   └── prometheus.yml             # Scrape config (5s interval for 4 services + gateway)
│
├── grafana/                       # Module 5: Real-Time Observability Dashboards
│   └── provisioning/
│       ├── datasources/datasources.yml # Auto-provisioned Prometheus data source
│       └── dashboards/
│           ├── dashboards.yml
│           └── retail-microservices-dashboard.json # JVM, CPU, HTTP throughput, p95 latency
│
├── k8s/                           # Module 6: Production Kubernetes Manifests
│   ├── namespace.yaml
│   ├── storage.yaml               # PersistentVolumes (PV) & Claims (PVC) for MySQL & Redis
│   ├── configmap-and-secrets.yaml
│   ├── databases.yaml             # MySQL & Redis manifests with auto-init ConfigMap
│   ├── product-service.yaml
│   ├── cart-service.yaml
│   ├── order-service.yaml
│   ├── api-gateway.yaml
│   ├── frontend.yaml              # React Storefront deployment & service
│   ├── monitoring.yaml            # Prometheus & Grafana K8s deployments & services
│   ├── hpa.yaml                   # Horizontal Pod Autoscalers
│   └── ingress.yaml               # AWS ALB Ingress Controller spec
│
├── helm/retail-platform/          # Module 7: Helm 3 Chart & GitOps packaging
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
│
├── terraform/                     # Module 8: AWS Infrastructure as Code
│   ├── provider.tf
│   ├── variables.tf
│   ├── vpc.tf                     # Multi-AZ VPC, subnets, NAT Gateway
│   ├── eks.tf                     # Amazon EKS Cluster & Managed Node Groups
│   ├── ecr.tf                     # Amazon ECR Repositories for 4 services
│   ├── rds.tf                     # Amazon RDS MySQL database
│   ├── elasticache.tf             # Amazon ElastiCache Redis cluster
│   ├── security_groups.tf
│   ├── outputs.tf
│   └── terraform.tfvars.example
│
├── .github/workflows/             # Module 7: CI/CD Pipelines
│   ├── ci.yaml                    # Automated CI (Terraform, Helm, React, 4 Spring Microservices, Docker)
│   └── ci-cd.yaml                 # Build, test, container buildx, ECR push & EKS rollout
│
├── scripts/
│   ├── run-ci-checks.sh           # Local one-command CI test runner
│   ├── load-test.sh               # High-throughput load & stress testing benchmark
│   └── load-test.js
│
└── argocd/                        # GitOps Declarative Controller
    └── application.yaml           # Argo CD Application CRD
```

---

## 💻 Running Locally

### Option 1: One-Click Local Orchestration (Docker Compose)

Run the entire platform (MySQL, Redis, 4 Spring Boot Microservices, Storefront UI, Prometheus, and Grafana) with a single command:

```bash
docker compose up --build
```

Access the application:
- **Storefront Web UI (API Gateway):** [http://localhost:8080](http://localhost:8080)
- **Independent React Storefront:** [http://localhost:3000](http://localhost:3000)
- **Prometheus Metrics & Targets:** [http://localhost:9090](http://localhost:9090) (Targets: [http://localhost:9090/targets](http://localhost:9090/targets))
- **Grafana Observability Dashboard:** [http://localhost:3001](http://localhost:3001) (Login: `admin` / `admin`)
- **Live System Health Monitor:** [http://localhost:8080/api/system/health](http://localhost:8080/api/system/health)
- **Product Catalog API:** [http://localhost:8081/api/products](http://localhost:8081/api/products)
- **Cart API:** [http://localhost:8082/api/cart/{userId}](http://localhost:8082/api/cart/{userId})
- **Order API:** [http://localhost:8083/api/orders](http://localhost:8083/api/orders)

---

### Option 2: Running the Independent React Frontend

```bash
cd frontend
npm install
npm run dev
# Accessible at http://localhost:3000 (proxies /api to http://localhost:8080)
```

---

### Option 3: Running Microservices Individually via Maven

```bash
# Terminal 1: Product Service
cd product-service
mvn spring-boot:run

# Terminal 2: Cart Service
cd cart-service
mvn spring-boot:run

# Terminal 3: Order Service
cd order-service
mvn spring-boot:run

# Terminal 4: API Gateway & Storefront
cd api-gateway
mvn spring-boot:run
```

---

## ☁️ Hosting on Amazon Web Services (AWS)

For detailed step-by-step instructions with exact CLI commands, see [DEPLOYMENT_AWS_GUIDE.md](file:///Users/samir/ecom/DEPLOYMENT_AWS_GUIDE.md).

### Quick Summary:
1. **Provision Infrastructure with Terraform:**
   ```bash
   cd terraform
   terraform init
   terraform apply -auto-approve
   ```
2. **Connect Kubectl to Amazon EKS:**
   ```bash
   aws eks update-kubeconfig --name retail-platform-cluster --region us-east-1
   ```
3. **Build & Push Microservices to Amazon ECR:**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
   # Build & push product-service, cart-service, order-service, api-gateway
   ```
4. **Deploy using Helm:**
   ```bash
   helm upgrade --install retail-platform ./helm/retail-platform \
     --namespace retail-system \
     --create-namespace \
     --set global.ecrRegistry=<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
   ```
5. **Get ALB URL:**
   ```bash
   kubectl get ingress -n retail-system
   ```

---

## 🧪 Verification & Health Checks

Each microservice includes Spring Boot Actuator probes for Kubernetes liveness and readiness:

```bash
# Verify Product Service
curl http://localhost:8081/actuator/health

# Verify Cart Service
curl http://localhost:8082/actuator/health

# Verify Order Service
curl http://localhost:8083/actuator/health

# Verify Gateway Aggregated Cluster Telemetry
curl http://localhost:8080/api/system/health

# Verify Prometheus Metrics Export
curl http://localhost:8081/actuator/prometheus
```

---

## 🔄 Continuous Integration (CI Pipeline)

The repository features an enterprise GitHub Actions Continuous Integration pipeline defined in [`.github/workflows/ci.yaml`](file:///Users/samir/ecom/.github/workflows/ci.yaml):

| CI Job | Scope | Tools / Checks |
| :--- | :--- | :--- |
| **`iac-validation`** | Terraform, Helm & K8s | `terraform fmt -check`, `terraform validate`, `helm lint`, Kubernetes YAML syntax check |
| **`frontend-ci`** | React 19 + Vite Storefront | `oxlint` static code analysis, `vitest` unit tests, `vite build` production bundle |
| **`backend-microservices-ci`** | 4 Java Spring Boot Services | Parallel Matrix (`product-service`, `cart-service`, `order-service`, `api-gateway`) running `mvn clean test -B` with JUnit 5 and Surefire XML artifact generation |
| **`docker-build-verification`** | Container Build Gate | Parallel Docker Buildx validation for all 5 images with GitHub Actions layer caching |

### Run Local CI Checks
You can validate all CI checks locally prior to committing code using the included verification script:

```bash
chmod +x scripts/run-ci-checks.sh
./scripts/run-ci-checks.sh
```

### Run High-Throughput Load & Stress Testing Benchmark
Simulate concurrent shopper traffic to test Kubernetes Horizontal Pod Autoscaler (HPA) and observe Grafana throughput metrics:

```bash
# Usage: ./scripts/load-test.sh [duration_sec] [concurrency] [target_url]
./scripts/load-test.sh 15 30 http://localhost:8080
```

---

## 🎓 Academic Capstone Viva Voce & Demonstration Guide

A complete examiner presentation script and high-probability viva voce questions with model answers (microservices rationale, Redis vs MySQL trade-offs, HPA, Prometheus metrics, and Terraform state) is available in [VIVA_VOCE_PREPARATION.md](file:///Users/samir/ecom/VIVA_VOCE_PREPARATION.md).

---

## 📊 Observability & Monitoring (Prometheus + Grafana)

The retail microservices platform includes production-grade observability:

1. **Prometheus Scraping (`:9090`):**
   - Configured via [`prometheus/prometheus.yml`](file:///Users/samir/ecom/prometheus/prometheus.yml).
   - Scrapes all 4 microservices every 5 seconds (`/actuator/prometheus`).
   - Targets page: [http://localhost:9090/targets](http://localhost:9090/targets) shows real-time health for all service pods.

2. **Grafana Dashboards (`:3001`):**
   - Credentials: `admin` / `admin`.
   - Pre-provisioned Datasource: Prometheus (`http://prometheus:9090`).
   - Pre-provisioned Dashboard: **Retail Microservices - System Overview** (`retail-microservices-overview`).
   - **Metrics Visualized:**
     - JVM Heap & Non-Heap Memory utilization
     - Process & System CPU usage per microservice
     - HTTP Request Throughput (Req/sec by status code: 200, 400, 500)
     - p95 and p99 HTTP latency per endpoint
     - MySQL HikariCP Active and Idle Connection pool counts

3. **Kubernetes Monitoring:**
   - Manifests in [`k8s/monitoring.yaml`](file:///Users/samir/ecom/k8s/monitoring.yaml) deploy Prometheus and Grafana as cluster services in the `retail-system` namespace.

---

## 📜 Academic Capstone Synopsis

The complete, official synopsis following all 15 academic guidelines (Objectives, Problem Statement, Scope, Methodology, Module breakdown, Hardware/Software requirements, Timeline, and References) is available in [PROJECT_SYNOPSIS.md](file:///Users/samir/ecom/PROJECT_SYNOPSIS.md).
