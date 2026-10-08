# Cloud-Native Retail Platform Using Microservices
## Academic Capstone Viva Voce & Demonstration Guide
**College of Management and Computer Science, Yavatmal**  
**Department of Computer Science — BCA Semester V (Academic Year: 2026–2027)**  
**Domain:** E-Commerce, Cloud Computing and DevOps

---

## 👥 Student Project Team & Module Ownership

| Sr. No. | Student Name | Contact | Primary Defense Area |
| :---: | :--- | :---: | :--- |
| 1 | **Ritesh Dhammanand Dawale** | 9699838302 | **Module 1 & 4:** Product Catalog Microservice, Category Browsing, REST APIs |
| 2 | **Samir Anil Dhavane** | 8767621867 | **Module 6, 7 & 8:** Cloud Architecture, AWS EKS, Terraform, CI/CD & DevOps |
| 3 | **Gauri Vinod Taksande** | 9226636115 | **Module 2:** Shopping Cart Microservice, Redis In-Memory Caching & TTL |
| 4 | **Achal Sachin Ghosalkar** | 9011628025 | **Module 3:** Checkout, Order Processing, Relational Database & Transactions |

---

## 🎬 5-Minute Live Demonstration Walkthrough for Examiners

Follow this sequential script during your project presentation:

### Step 1: Microservices Architecture & System Health (1 min)
1. Open the Storefront at **`http://localhost:3000`** (or `http://localhost:8080`).
2. Point out the glassmorphic responsive UI, Dark/Light mode toggle, and live tech badges (AWS, Spring Boot 3, Redis, EKS).
3. Click the **"System Health"** pulse icon in the navbar.
4. **Explain to Examiner:** *"Our API Gateway dynamically aggregates real-time health telemetry across all downstream Spring Boot microservices and displays AWS cluster region and status."*

### Step 2: Storefront, Redis Cart & Payment Sandbox (1.5 min)
1. Filter catalog items by Category (**Electronics**, **Audio**, etc.).
2. Add a product to the cart. Open the Cart Drawer.
3. Change quantities or remove items.
4. **Explain to Examiner:** *"The shopping cart microservice is completely decoupled from MySQL and writes sub-millisecond mutations to Redis with key-level TTL expiration."*
5. Click **"Proceed to Checkout"**.
6. Select **Credit Card** or **UPI / QR** payment method. Click **"Pay & Place Order"**.
7. Watch the interactive bank sandbox simulate authorization, followed by the atomic inventory reduction in MySQL and order receipt generation.

### Step 3: Role-Based Access Control (Retailer vs. User) (1 min)
1. Open the **Auth Modal** (Login / Sign Up).
2. Switch roles to **Retailer** (`retailer@cloudretail.io`).
3. Point out the dynamic **"Add Product"** button that only appears for Retailers.
4. Add a new catalog item. Show that it instantly appears in the public catalog and MySQL database.
5. Explain that standard `USER` accounts receive HTTP `403 Forbidden` if attempting to post products directly to the catalog API.

### Step 4: Observability with Prometheus & Grafana (1 min)
1. Open Grafana at **`http://localhost:3001`** (Login: `admin` / `admin`).
2. Show the **Retail Platform – Cloud Microservices Overview** dashboard.
3. Show the live panels:
   - Microservice JVM Process CPU % & System Load
   - JVM Heap Used vs. Max Committed Memory
   - HTTP Request Rates (200, 400, 500)
   - p95 and p99 Response Latencies
   - MySQL HikariCP Connection Pool Count
4. Open Prometheus target health at **`http://localhost:9090/targets`** showing all 4 microservice Actuator feeds reporting `UP`.

### Step 5: Continuous Integration & Stress Benchmark (30 sec)
1. Run the local automated CI script:
   ```bash
   ./scripts/run-ci-checks.sh
   ```
   Show that all 19 automated tests (14 JUnit 5 + 5 Vitest) and Terraform/Helm linters pass.
2. Run the load test benchmark:
   ```bash
   ./scripts/load-test.sh 5 25 http://localhost:8080
   ```
   Demonstrate high throughput (2,000+ req/sec) and observe the Grafana metrics graph spike in real time.

---

## ❓ High-Probability Viva Voce Questions & Model Answers

### Category 1: Microservices & Distributed Architecture
**Q1: Why did you choose a Microservices architecture instead of a Monolith?**
> **Answer:** A monolithic retail platform tightly couples catalog, cart, and ordering into one codebase and single database. A memory leak in cart calculation could bring down the entire checkout. With microservices:
> 1. Each domain scales independently (e.g., product browsing receives 100× more traffic than checkout).
> 2. Fault isolation: if the order database slows down, users can still browse products and add to carts.
> 3. Polyglot persistence: we used Redis key-value store for the cart and MySQL ACID relational tables for orders and catalog.

**Q2: What is the role of the API Gateway in your architecture?**
> **Answer:** The API Gateway acts as the single reverse-proxy entry point on port `8080`. It handles CORS, routes incoming client requests (`/api/products` $\rightarrow$ port 8081, `/api/cart` $\rightarrow$ port 8082, `/api/orders` $\rightarrow$ port 8083), hides internal microservice network topology, and provides unified cluster telemetry (`/api/system/health`).

---

### Category 2: Databases & Caching
**Q3: Why use Redis for the Shopping Cart instead of MySQL?**
> **Answer:** Shopping carts generate very high write-and-read volume (adding items, changing quantities, rapid price checks), but cart data is ephemeral. Redis stores carts in memory with sub-millisecond retrieval latency, reducing database query load on MySQL by over 80%. We also leverage Redis TTL so abandoned carts expire automatically without running cleanup cron jobs against MySQL.

**Q4: How do you handle stock inventory when multiple users buy the last item simultaneously?**
> **Answer:** `product-service` executes an atomic conditional SQL update:  
> `UPDATE products SET stock_quantity = stock_quantity - :qty WHERE id = :id AND stock_quantity >= :qty;`  
> If the affected row count is 0, the stock is insufficient and an exception is raised, preventing race conditions and overselling.

---

### Category 3: Docker & Kubernetes (Amazon EKS)
**Q5: What is the difference between a Docker container and a Kubernetes Pod?**
> **Answer:** A Docker container is an isolated execution runtime for a single process. A Kubernetes Pod is the smallest deployable unit in Kubernetes that encapsulates one or more containers sharing the same network namespace (localhost) and storage volumes.

**Q6: How does Kubernetes handle Horizontal Pod Autoscaling (HPA)?**
> **Answer:** Our `k8s/hpa.yaml` defines autoscalers for each microservice targeting 70% CPU utilization. The Kubernetes Metrics Server queries pod resource usage via cAdvisor; when traffic spikes exceed 70%, the HPA controller automatically increases pod replicas from 2 up to 10.

---

### Category 4: DevOps, CI/CD & Terraform
**Q7: Explain your Continuous Integration (CI) workflow.**
> **Answer:** In `.github/workflows/ci.yaml`, every commit triggers 4 parallel jobs:
> 1. `iac-validation`: Runs `terraform fmt -check`, `terraform validate`, and `helm lint`.
> 2. `frontend-ci`: Runs `oxlint`, `vitest` unit tests, and production Vite compilation.
> 3. `backend-microservices-ci`: A parallel matrix running JUnit 5 + MockMvc tests across all 4 microservices with Maven Surefire XML reporting.
> 4. `docker-build-verification`: Builds all 5 multi-stage container images using Docker Buildx and GitHub Actions layer caching.

**Q8: What is Infrastructure as Code (IaC) with Terraform?**
> **Answer:** Instead of clicking in the AWS Management Console, Terraform uses declarative HCL code to provision our VPC, Amazon EKS cluster, RDS MySQL instance, ElastiCache Redis cluster, and Amazon ECR repositories. This ensures infrastructure is repeatable, version-controlled, and environment-agnostic.

---

### Category 5: Observability & Monitoring
**Q9: How does Prometheus collect metrics from Spring Boot microservices?**
> **Answer:** Prometheus uses a pull model. We added `micrometer-registry-prometheus` to each service. Spring Boot Actuator formats JVM, CPU, and HTTP metrics into standard Prometheus OpenMetrics text at `/actuator/prometheus`. Prometheus scrapes each container every 5 seconds as configured in `prometheus.yml`.

**Q10: What does Grafana provide over standard logs?**
> **Answer:** Logs show raw text events after an issue occurs. Grafana queries Prometheus metrics in real time and renders visual telemetry (JVM memory heap saturation, p95 latency percentiles, active HikariCP database connections), enabling proactive performance anomaly detection before microservices crash.
