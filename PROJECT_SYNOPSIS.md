# COLLEGE OF MANAGEMENT AND COMPUTER SCIENCE, YAVATMAL
### Department of Computer Science
### BCA Semester V – Capstone Project (Academic Year: 2026–2027)

---

# PROJECT SYNOPSIS

## Cloud-Native Retail Platform Using Microservices
**Domain:** E-Commerce, Cloud Computing and DevOps

---

## 1. Project Title
**Cloud-Native Retail Platform Using Microservices**  
**Domain:** E-Commerce, Cloud Computing and DevOps

---

## 2. Student / Team Details

| Sr. No. | Name of Student | Contact No. | Role / Responsibility |
| :--- | :--- | :--- | :--- |
| 1 | **Samir Anil Dhavane** | 8767621867 | Cloud Architecture, AWS & DevOps Lead |
| 2 | **Ritesh Dhammanand Dawale** | 9699838302 | Product & Catalog Microservice Lead |
| 3 | **Gauri Vinod Taksande** | 9226636115 | Shopping Cart & Caching Service Lead |
| 4 | **Achal Sachin Ghosalkar** | 9011628025 | Checkout, Order Processing & DB Lead |

---

## 3. Introduction / Background
Traditional web applications are commonly developed as monolithic systems in which different application components are tightly coupled and deployed together. As the number of users and application traffic increases, managing deployment, scalability, availability and infrastructure can become challenging.

The proposed **Cloud-Native Retail Platform Using Microservices** aims to develop a functional retail application using a microservices architecture and deploy it on cloud infrastructure. The system divides major retail functionalities such as product catalog, shopping cart, checkout, and order processing into independently manageable services that communicate through REST APIs.

The primary focus of the project is not only application development but also the deployment and management of microservices using modern DevOps and cloud-native practices. The project explores **Docker containerization**, **Kubernetes orchestration**, **Amazon Elastic Kubernetes Service (EKS)**, **CI/CD via GitHub Actions**, **GitOps via Argo CD**, **Infrastructure as Code (IaC) via Terraform**, cloud networking, load balancing, and horizontal pod autoscaling.

---

## 4. Problem Statement
Traditional monolithic applications tightly couple multiple application components, making application deployment, maintenance, scalability, and availability difficult as application complexity and traffic increase.

Deploying such applications manually requires significant effort and makes it difficult to independently update or scale individual components. A single bug or traffic surge in one feature can degrade or crash the entire application.

Therefore, a **cloud-native retail platform using microservices architecture** is proposed, where application functionalities are divided into independent services that can be containerized, deployed, managed, and scaled separately using Docker, Kubernetes, and AWS cloud infrastructure.

---

## 5. Objectives of the Project
The major objectives of the proposed project are:
1. To develop a functional retail application using a microservices architecture in Java Spring Boot.
2. To implement and understand resilient communication between independent application services using REST APIs.
3. To containerize application services using Docker multi-stage builds.
4. To deploy and manage containerized services using Kubernetes and Amazon Elastic Kubernetes Service (EKS).
5. To implement an automated software delivery workflow using GitHub Actions and GitOps practices.
6. To use Argo CD for continuous deployment and declarative synchronization of application deployments.
7. To provision and manage cloud infrastructure using Terraform (Infrastructure as Code).
8. To explore horizontal pod autoscaling (HPA) and multiple application instances for handling increased retail application traffic.
9. To implement health checks (liveness and readiness probes), rolling zero-downtime deployments, and service management using Kubernetes.
10. To configure cloud networking, AWS Application Load Balancers, Kubernetes Ingress, DNS, and HTTPS for secure public application access.

---

## 6. Scope of the Project

### Application Scope
* **Product Catalog:** Manage, categorize, search, and retrieve retail inventory with real-time stock levels.
* **Product Browsing:** Filter by categories, instant keyword search, and view detailed product specifications.
* **Shopping Cart:** Add items, view cart contents, update item quantities, remove items, and calculate totals in real time.
* **Checkout & Order Processing:** Secure checkout validation, inventory reservation, order placement, order status lifecycle management, and purchase history tracking.
* **REST API-Based Communication:** Inter-service synchronous RESTful communication with resilient fallback strategies.

### Cloud and DevOps Scope
* **Docker-Based Containerization:** Multi-stage production container images.
* **Kubernetes-Based Deployment:** Pods, Deployments, Services (ClusterIP), ConfigMaps, and Secrets.
* **Amazon EKS:** Production-grade managed Kubernetes control plane on AWS.
* **Kubernetes Service Management:** Service discovery, load balancing, and DNS resolution inside the cluster.
* **Application Replicas & Horizontal Scaling:** Horizontal Pod Autoscaler (HPA) driven by CPU/Memory utilization.
* **Health Checks & Rolling Deployments:** Zero-downtime rolling updates with liveness and readiness actuator endpoints.
* **GitHub-Based Source Code Management:** Feature branching and pull request workflow.
* **CI/CD Using GitHub Actions:** Automated compile, test, container packaging, and push to Amazon ECR.
* **GitOps-Based Deployment Using Argo CD:** Declarative synchronization of Kubernetes manifests from Git to AWS EKS.
* **Helm-Based Kubernetes Configuration:** Templated, versioned Kubernetes package management.
* **Terraform-Based Infrastructure Provisioning:** Complete AWS VPC, subnets, EKS cluster, node groups, ECR, RDS MySQL, and ElastiCache Redis.
* **AWS Cloud Infrastructure:** High-availability multi-Availability Zone architecture.
* **Load Balancing & Kubernetes Ingress:** AWS ALB Ingress Controller routing incoming traffic.
* **DNS & HTTPS Configuration:** Custom domain routing with AWS Route 53 and ACM SSL/TLS certificates.

---

## 7. Proposed System / Methodology

The proposed system utilizes a microservices architecture where each core business function is isolated into an independent, loosely coupled service:
- **Product Service:** Built with Java Spring Boot and Spring Data JPA, connecting to MySQL for catalog persistence.
- **Cart Service:** Built with Java Spring Boot and Spring Data Redis for high-speed ephemeral cart sessions with persistence fallback.
- **Order Service:** Built with Java Spring Boot and Spring Data JPA, connecting to MySQL, coordinating checkout by validating stock with Product Service and fetching cart items from Cart Service.
- **API Gateway:** Provides a single unified entry point, routing requests to appropriate downstream services, handling CORS, and serving the responsive client web application.

### Overall Application Workflow
```
[End User] 
    │
    ▼
[Custom Domain (Route 53 / DNS)]
    │
    ▼
[HTTPS / SSL Termination (ACM)]
    │
    ▼
[AWS Application Load Balancer / Ingress Controller]
    │
    ▼
[API Gateway (Spring Boot)]
    ├── /               ──> [Static Frontend Storefront (HTML5/CSS3/JS)]
    ├── /api/products/** ──> [Product Service (Spring Boot)] ──> [MySQL Database]
    ├── /api/cart/**     ──> [Cart Service (Spring Boot)]    ──> [Redis Cache]
    └── /api/orders/**   ──> [Order Service (Spring Boot)]   ──> [MySQL Database]
                                │               │
                                └──REST Client──┴──> (Inter-service calls)
```

### DevOps Workflow
```
[Developer]
    │ git push
    ▼
[GitHub Repository]
    │ triggers
    ▼
[GitHub Actions CI]
    │ maven build & test
    │ docker buildx
    ▼
[Amazon ECR (Container Registry)]
    │ image pushed
    ▼
[Argo CD (GitOps Controller)]
    │ detects Git / Helm state change
    ▼
[Amazon EKS Cluster]
    │ pulls image & rolls out pods
    ▼
[Live Retail Microservices Application]
```

---

## 8. Major Modules

### Module 1 – Product Catalog (`product-service`)
* Display available products with category, price, rating, stock status, and images.
* Retrieve individual product details.
* REST APIs for product queries, additions, and atomic inventory stock decrements.
* Seed database with initial catalog items on startup.

### Module 2 – Shopping Cart (`cart-service`)
* Add products to cart with quantity management.
* View active user cart items and computed subtotals.
* Update cart item quantities or delete specific items.
* Clear entire cart after order completion.
* Backed by Redis key-value store for sub-millisecond retrieval.

### Module 3 – Checkout and Order Processing (`order-service`)
* Checkout workflow: orchestrates cart retrieval and stock deduction.
* Order creation and persistence in relational MySQL database.
* Order lifecycle status tracking (`PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`).
* Query user order history and detailed order receipts.

### Module 4 – REST API & API Gateway (`api-gateway`)
* Single entry point reverse-proxy routing for all frontend requests.
* Inter-service HTTP REST communication between Order, Cart, and Product services.
* Aggregated system health monitoring endpoint (`/api/system/health`).
* Centralized CORS, headers, and request logging.
* Hosting responsive storefront web UI.

### Module 5 – Docker Containerization
* Optimized multi-stage `Dockerfile` per microservice based on Eclipse Temurin JRE 17.
* Non-root security execution (`appuser`).
* Complete `docker-compose.yml` for unified local stack testing (MySQL, Redis, Services, Gateway).

### Module 6 – Kubernetes / Amazon EKS
* Declarative Kubernetes manifests for all microservices, databases, and ingress.
* Liveness and readiness health probes utilizing Spring Boot Actuator.
* Resource requests and limits for optimal cluster scheduling.
* Horizontal Pod Autoscaler (HPA) targeting CPU utilization.

### Module 7 – CI/CD and GitOps
* GitHub Actions Continuous Integration (`.github/workflows/ci.yaml`) with parallel matrix jobs across all 4 microservices, Vitest frontend test runner, and Docker build validation.
* Infrastructure as Code static analysis: automated Terraform formatting & validation, Helm chart linting, and Kubernetes manifest verification.
* Automated build artifacts and Surefire XML test report archiving.
* Continuous Deployment pipeline (`.github/workflows/ci-cd.yaml`) publishing tagged container images to Amazon ECR and rolling out to Amazon EKS.
* Helm chart (`helm/retail-platform`) for parameterized environment deployments.
* Argo CD application manifest for automated GitOps pull-based synchronization.

### Module 8 – Cloud Infrastructure & Networking (Terraform on AWS)
* Multi-AZ AWS VPC with public and private subnets across 2 Availability Zones.
* Amazon EKS Managed Cluster with auto-scaling node groups.
* Amazon ECR private repositories for each microservice container image.
* Amazon RDS MySQL for production transactional data persistence.
* Amazon ElastiCache Redis for distributed caching.
* AWS Application Load Balancer (ALB) and AWS Load Balancer Controller integration.

### Module 9 – Observability & Monitoring (Prometheus & Grafana)
* Real-time metrics collection with Prometheus scraping Spring Boot Actuator `/actuator/prometheus` endpoints.
* Production Grafana dashboards with provisioned data sources and visual telemetry for JVM heap, CPU, HTTP throughput, and p95 latency.
* Integrated health check telemetry displayed dynamically inside the Storefront UI and Kubernetes probes.

---

## 9. Technology / Software Requirements

| Category | Technology |
| :--- | :--- |
| **Programming Language** | Java (JDK 17), JavaScript (ES6+) |
| **Front-End** | React (Vite), HTML5, CSS3 (Modern Glassmorphic UI), JavaScript |
| **Back-End** | Java, Spring Boot 3.x, Spring Data JPA, Spring Data Redis, REST APIs |
| **Database & Cache** | MySQL 8.0, Redis 7.x |
| **Observability & Metrics** | Prometheus 2.54, Grafana 11.1, Micrometer Registry Prometheus |
| **Version Control** | Git, GitHub |
| **Containerization** | Docker, Docker Compose |
| **Orchestration** | Kubernetes 1.30+, Amazon EKS |
| **DevOps / GitOps** | GitHub Actions, Argo CD, Helm 3 |
| **Infrastructure as Code** | Terraform (HashiCorp) |
| **Cloud Provider** | Amazon Web Services (AWS) |
| **Container Registry** | Amazon ECR |
| **Networking** | AWS ALB, Kubernetes Ingress, Route 53 DNS, AWS ACM HTTPS |
| **Development Tools** | VS Code, IntelliJ IDEA, Maven, Postman |
| **Operating Environment** | macOS / Ubuntu Linux / Windows |

---

## 10. Hardware Requirements

| Component | Minimum Requirement | Recommended (AWS Deployment) |
| :--- | :--- | :--- |
| **Processor** | Intel / AMD / Apple Silicon (x86_64 or arm64) | AWS t3.medium / t3a.medium nodes |
| **RAM** | 4 GB | 8 GB - 16 GB |
| **Storage** | 20 GB free space | 50 GB EBS gp3 volume |
| **Network** | Broadband Internet connection | AWS VPC 10 Gbps backbone |

---

## 11. Expected Outcomes
* A functional, cloud-native retail platform running independently managed microservices.
* Resilient REST API inter-service communication with transactional integrity.
* Containerized deployments packaged through Docker and orchestrated on Amazon EKS.
* Fully automated CI/CD pipeline building images to Amazon ECR and deploying via Argo CD.
* Declarative AWS cloud infrastructure provisioned through repeatable Terraform code.
* Automatic horizontal scaling and zero-downtime rolling updates verified in the cloud.
* Publicly accessible, secure retail storefront served over HTTPS with custom DNS.

---

## 12. Advantages of the Proposed System
1. **Independent Service Deployment:** Teams can develop, test, and deploy Product, Cart, or Order services independently without touching other components.
2. **Elastic Scalability:** High-traffic services (such as product browsing or cart) can scale out horizontally while maintaining minimal footprint for less-used services.
3. **Fault Isolation:** A failure in the Cart service or Redis cache does not crash the Product catalog browsing functionality.
4. **Automated Infrastructure & GitOps:** Terraform and Argo CD eliminate configuration drift, providing audited, reproducible cloud environments.
5. **Cost Optimization:** Elastic auto-scaling on AWS ensures compute resources expand during high load and scale down during idle periods.

---

## 13. Future Scope
* Implementation of OAuth2 / OpenID Connect (Keycloak or AWS Cognito) for user authentication and Role-Based Access Control (RBAC).
* Event-driven architecture with Apache Kafka or AWS SQS/SNS for asynchronous order notifications.
* AI-powered product recommendation engine.
* Integration of real-time third-party payment gateways (Stripe / Razorpay).
* Distributed tracing with OpenTelemetry, Jaeger, and AWS CloudWatch Container Insights.

---

## 14. Tentative Project Timeline

| Phase | Activity | Duration | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Topic Selection & Requirement Analysis | 1 Week | Completed |
| **Phase 2** | Literature / Existing System Study | 1 Week | Completed |
| **Phase 3** | System Architecture & Microservice Design | 1 Week | Completed |
| **Phase 4** | Database & UI Design | 1 Week | Completed |
| **Phase 5** | Microservices Development & Docker Implementation | 2 Weeks | In Progress / Implemented |
| **Phase 6** | Kubernetes & AWS EKS Deployment | 2 Weeks | Ready / Manifested |
| **Phase 7** | CI/CD, GitOps & Terraform Implementation | 2 Weeks | Ready / Implemented |
| **Phase 8** | Testing, Debugging & Scaling | 1 Week | Scheduled |
| **Phase 9** | Documentation & Presentation Prep | 1 Week | Scheduled |
| **Phase 10** | Final Demonstration & Academic Submission | 1 Week | Scheduled |

---

## 15. References
1. Java 17 Documentation – Oracle Corporation (`docs.oracle.com/en/java`)
2. Spring Boot 3 Reference Guide – VMware Tanzu (`docs.spring.io/spring-boot`)
3. Docker Containerization Best Practices – Docker Inc. (`docs.docker.com`)
4. Kubernetes Production Documentation – Cloud Native Computing Foundation (`kubernetes.io/docs`)
5. Amazon Web Services (AWS) Documentation – Amazon Web Services (`aws.amazon.com/documentation`)
6. Amazon Elastic Kubernetes Service (EKS) User Guide – AWS Documentation
7. Terraform AWS Provider Documentation – HashiCorp Inc. (`registry.terraform.io`)
8. Argo CD Declarative GitOps Documentation – Argo Project (`argo-cd.readthedocs.io`)
9. Helm Package Manager Documentation – Helm Project (`helm.sh/docs`)
10. MySQL 8.0 Reference Manual – Oracle Corporation (`dev.mysql.com/doc`)
11. Redis In-Memory Data Store Documentation – Redis Ltd. (`redis.io/docs`)
