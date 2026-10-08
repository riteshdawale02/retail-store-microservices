# Cloud-Native Retail Platform – System Architecture & Design

## 1. Executive Architecture Overview

The **Cloud-Native Retail Platform** is built from the ground up as a distributed, loosely-coupled microservices system hosted on **Amazon Web Services (AWS)** using **Amazon Elastic Kubernetes Service (EKS)**. It implements cloud-native principles: containerization, continuous integration, continuous delivery via GitOps, declarative infrastructure, and horizontal scalability.

```
                                    ┌────────────────────────────────────────────────────────┐
                                    │                     END USER / BROWSER                 │
                                    └───────────────────────────┬────────────────────────────┘
                                                                │ HTTPS (Port 443)
                                                                ▼
                                    ┌────────────────────────────────────────────────────────┐
                                    │               AWS ROUTE 53 (DNS RESOLUTION)            │
                                    └───────────────────────────┬────────────────────────────┘
                                                                │
                                                                ▼
                                    ┌────────────────────────────────────────────────────────┐
                                    │         AWS APPLICATION LOAD BALANCER (ALB)            │
                                    │       • SSL Termination via AWS ACM Certificate        │
                                    │       • Managed by AWS Load Balancer Controller        │
                                    └───────────────────────────┬────────────────────────────┘
                                                                │ Port 8080 (Forward)
                                                                ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                 AMAZON EKS CLUSTER (KUBERNETES v1.30)                                             │
│                                                 Namespace: `retail-system`                                                        │
│                                                                                                                                   │
│   ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                API GATEWAY PODS (x2)                                                      │   │
│   │   • Unified Reverse Proxy & Static Storefront Host (Spring Boot 3 + Static Web Assets)                                    │   │
│   │   • Health Aggregator endpoint: `/api/system/health`                                                                      │   │
│   └──────────────────────┬─────────────────────────────────────┬────────────────────────────────────┬─────────────────────────┘   │
│                          │                                     │                                    │                             │
│                          │ /api/products/**                    │ /api/cart/**                       │ /api/orders/**              │
│                          ▼                                     ▼                                    ▼                             │
│   ┌───────────────────────────────────┐ ┌───────────────────────────────────┐ ┌───────────────────────────────────┐               │
│   │       PRODUCT SERVICE (x2)        │ │         CART SERVICE (x2)         │ │         ORDER SERVICE (x2)        │               │
│   │   • Spring Boot 3 + JPA           │ │   • Spring Boot 3 + Spring Redis  │ │   • Spring Boot 3 + RestClient    │               │
│   │   • Catalog management & Search   │ │   • Ephemeral shopping session    │ │   • Checkout & State Machine      │               │
│   │   • Stock decrement atomic logic  │ │   • TTL auto-expiry & in-memory   │ │   • Orchestrates Product & Cart   │               │
│   └─────────────────┬─────────────────┘ └─────────────────┬─────────────────┘ └─────────────────┬─────────────────┘               │
│                     │                                     │                                     │                                 │
│                     │ JDBC                                │ RESP                                │ JDBC                            │
└─────────────────────┼─────────────────────────────────────┼─────────────────────────────────────┼─────────────────────────────────┘
                      │                                     │                                     │
                      ▼                                     ▼                                     ▼
       ┌─────────────────────────────┐       ┌─────────────────────────────┐       ┌─────────────────────────────┐
       │     AMAZON RDS MYSQL        │       │  AMAZON ELASTICACHE REDIS   │       │      AMAZON RDS MYSQL       │
       │     `retail_product_db`     │       │    `retail-cart-cache`      │       │     `retail_order_db`       │
       └─────────────────────────────┘       └─────────────────────────────┘       └─────────────────────────────┘
```

---

## 2. Microservice Inventory & Communication Contracts

### A. Product Catalog Microservice (`product-service`)
* **Port:** 8081
* **Primary Database:** Amazon RDS MySQL (Table: `products`)
* **Responsibilities:**
  - Manages product inventory, categories, descriptions, ratings, prices, and stock counts.
  - Exposes atomic inventory decrement API with optimistic locking and row-level safety.
* **REST Endpoints:**
  | Method | Endpoint | Description | Status Code |
  | :--- | :--- | :--- | :--- |
  | `GET` | `/api/products` | Retrieve all products (supports `?category=` and `?search=`) | 200 OK |
  | `GET` | `/api/products/{id}` | Retrieve product details by ID | 200 / 404 |
  | `GET` | `/api/products/categories` | List distinct product categories | 200 OK |
  | `POST` | `/api/products` | Create a new catalog product | 201 Created |
  | `PUT` | `/api/products/{id}/stock` | Deduct quantity from inventory (`{"quantity": N}`) | 200 / 400 |
  | `GET` | `/actuator/health` | Spring Boot Actuator liveness & readiness probe | 200 OK |

---

### B. Shopping Cart Microservice (`cart-service`)
* **Port:** 8082
* **Primary Store:** Amazon ElastiCache Redis (Key: `retail:cart:{userId}` with 7-day TTL), plus resilient local memory fallback.
* **Responsibilities:**
  - Fast, low-latency shopping cart state operations.
  - Automatically recalculates line item subtotals and overall cart totals on mutation.
* **REST Endpoints:**
  | Method | Endpoint | Description | Status Code |
  | :--- | :--- | :--- | :--- |
  | `GET` | `/api/cart/{userId}` | Retrieve current user's cart | 200 OK |
  | `POST` | `/api/cart/{userId}/items` | Add product to cart | 200 OK |
  | `PUT` | `/api/cart/{userId}/items/{productId}` | Update product quantity | 200 OK |
  | `DELETE`| `/api/cart/{userId}/items/{productId}`| Remove specific product from cart | 200 OK |
  | `DELETE`| `/api/cart/{userId}` | Purge cart after checkout | 200 OK |
  | `GET` | `/actuator/health` | Actuator health probe | 200 OK |

---

### C. Checkout and Order Microservice (`order-service`)
* **Port:** 8083
* **Primary Database:** Amazon RDS MySQL (Tables: `orders`, `order_items`)
* **Responsibilities:**
  - Orchestrates the end-to-end checkout workflow.
  - Validates cart contents with `cart-service`.
  - Atomically deducts inventory stock with `product-service`.
  - Persists order receipt with unique identifier (`ORD-YYYY-XXXX`).
  - Clears shopping cart upon confirmed order creation.
* **REST Endpoints:**
  | Method | Endpoint | Description | Status Code |
  | :--- | :--- | :--- | :--- |
  | `POST` | `/api/orders/checkout` | Process order checkout | 201 Created |
  | `GET` | `/api/orders` | List all system orders | 200 OK |
  | `GET` | `/api/orders/{id}` | Get order details by ID | 200 / 404 |
  | `GET` | `/api/orders/user/{userId}` | Get orders for specific user | 200 OK |
  | `PUT` | `/api/orders/{id}/status` | Update order lifecycle status | 200 OK |
  | `GET` | `/actuator/health` | Actuator health probe | 200 OK |

---

### D. API Gateway & Storefront (`api-gateway`)
* **Port:** 8080
* **Responsibilities:**
  - Single public edge entrypoint into the Kubernetes pod mesh.
  - Reverse proxy request forwarding for `/api/products/**`, `/api/cart/**`, `/api/orders/**`.
  - Centralized CORS configuration and request routing.
  - High-performance static web server serving the responsive storefront HTML5/CSS3/JavaScript web UI.
  - System Telemetry aggregation endpoint (`/api/system/health`) querying all downstream microservices and reporting cluster status.

---

## 3. Inter-Service Communication Flow (Checkout Sequence)

```
[Browser / Client]      [API Gateway]       [Order Service]      [Cart Service]      [Product Service]     [MySQL RDS]
       │                      │                    │                    │                     │                  │
       │── POST /checkout ───>│                    │                    │                     │                  │
       │                      │── POST /checkout ─>│                    │                     │                  │
       │                      │                    │── GET /cart ──────>│                     │                  │
       │                      │                    │<── Cart Items ─────│                     │                  │
       │                      │                    │                                          │                  │
       │                      │                    │── PUT /stock (deduct) ──────────────────>│                  │
       │                      │                    │<── Stock Confirmed ──────────────────────│                  │
       │                      │                    │                                                             │
       │                      │                    │── Save Order & Line Items ─────────────────────────────────>│
       │                      │                    │<── Persisted Order ─────────────────────────────────────────│
       │                      │                    │                                                             │
       │                      │                    │── DELETE /cart ───>│                                        │
       │                      │                    │<── Cart Cleared ───│                                        │
       │                      │                    │                                                             │
       │                      │<── Order Created ──│                                                             │
       │<── 201 Order Confirmed ───────────────────│                                                             │
```

---

## 4. AWS Cloud Infrastructure Architecture

Provisioned entirely via HashiCorp Terraform:
1. **AWS VPC:**
   - IP Range: `10.0.0.0/16`
   - Spans 2 Availability Zones (`us-east-1a`, `us-east-1b`).
   - 2 Public Subnets: Host AWS Application Load Balancer and NAT Gateway.
   - 2 Private Subnets: Host EKS Managed Worker Nodes, RDS MySQL instance, and ElastiCache Redis cluster.
2. **Amazon EKS (Elastic Kubernetes Service):**
   - Version 1.30 managed control plane.
   - Managed Node Group running `t3.medium` instances across private subnets.
   - Horizontal Pod Autoscaler (HPA) configured for CPU utilization thresholds (70%-75%).
3. **AWS Application Load Balancer (ALB):**
   - Managed automatically by the AWS Load Balancer Controller in Kubernetes.
   - Handles SSL termination via AWS Certificate Manager (ACM).
4. **Data Persistence:**
   - **Amazon RDS MySQL 8.0:** Provisioned in private subnets, security group restricted to EKS node IPs.
   - **Amazon ElastiCache Redis 7.0:** In-memory caching for shopping cart sessions.
5. **Amazon ECR (Elastic Container Registry):**
   - 4 private container repositories with vulnerability scanning enabled.
