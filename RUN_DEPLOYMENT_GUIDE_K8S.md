# Kubernetes Multi-Environment Deployment & Run Guide
### Cloud-Native Retail Platform (Local, EC2, and Amazon EKS)

---

## 1. Architecture & Coupling Analysis

### Is this Project Tightly Coupled?
**No. The architecture is loosely coupled and highly portable across environments.**

All microservices adhere to the **Twelve-Factor App** methodology and communicate strictly through externalized configurations:

1. **Service Discovery via Standard DNS**:
   Services do not use hardcoded IP addresses or cloud-vendor proprietary discovery servers. Instead, they rely on standard Kubernetes Service DNS / Docker network hostnames:
   - MySQL: `mysql:3306`
   - Redis: `redis:6379`
   - Product Service: `http://product-service:8081`
   - Cart Service: `http://cart-service:8082`
   - Order Service: `http://order-service:8083`
   - API Gateway: `http://api-gateway:8080`
   - Frontend: `http://retail-frontend:80`

2. **Configuration Decoupling**:
   Environment parameters (`SPRING_DATASOURCE_URL`, `SPRING_DATA_REDIS_HOST`, `SERVICES_PRODUCT_URL`, etc.) are injected through Kubernetes `ConfigMap` and `Secret` objects (or `.env` in Docker Compose). The application code itself does not know whether it is running on a developer laptop, an EC2 instance, or a managed EKS cluster.

3. **Portability Matrix**:

| Feature / Component | Local Machine | AWS EC2 (Single-Node K8s) | Amazon EKS (Production) |
|---|---|---|---|
| **K8s Engine** | Minikube / Docker Desktop / Kind | K3s / Minikube | Amazon EKS (v1.30 Managed) |
| **Databases** | In-Cluster Pods or Docker containers | In-Cluster Pods (`databases.yaml`) | In-Cluster Pods OR Amazon RDS / ElastiCache |
| **Container Images** | Local Docker daemon (`retail/*`) | Local Docker / K3s containerd OR ECR | Amazon ECR (`<account>.dkr.ecr...`) |
| **Ingress / Exposure** | `localhost:3005` or `kubectl port-forward` | EC2 Public IP (`NodePort` or `port-forward`) | AWS Application Load Balancer (ALB) |
| **Monitoring** | Prometheus + Grafana (local) | Prometheus + Grafana (in-cluster) | In-cluster / CloudWatch / Prometheus |

---

## 2. Prerequisites for Running on an EC2 Instance

Before deploying Kubernetes on EC2, ensure the following specifications and configurations are in place:

### A. EC2 Instance Sizing
The platform runs 4 Spring Boot microservices, MySQL 8.0, Redis 7, React Frontend, Prometheus, and Grafana.
- **Recommended Instance Type**: `t3.large` (2 vCPUs, 8 GB RAM) or `t3a.large`
- **Minimum Instance Type**: `t3.medium` (2 vCPUs, 4 GB RAM) with a 4 GB swap file enabled
- **Operating System**: **Ubuntu 22.04 LTS** or **Ubuntu 24.04 LTS** (x86_64 / amd64)
- **Storage**: **30 GB gp3** EBS root volume (sufficient for container images and build layers)

### B. EC2 Security Group Inbound Rules
Configure your EC2 Security Group with the following inbound ports:

| Port Range | Protocol | Source | Purpose |
|---|---|---|---|
| `22` | TCP | Your IP | SSH access |
| `80` | TCP | `0.0.0.0/0` | HTTP Web traffic |
| `3005` | TCP | `0.0.0.0/0` | Frontend direct access |
| `8080` | TCP | `0.0.0.0/0` | API Gateway access / Healthchecks |
| `3001` | TCP | Your IP | Grafana Monitoring Dashboard |
| `30000 - 32767` | TCP | `0.0.0.0/0` | Kubernetes NodePort service range |

---

## 3. Step-by-Step: Deploy & Test Kubernetes on EC2

### Step 1: Launch & Connect to EC2
1. Launch an Ubuntu 22.04 LTS instance with `t3.large` and 30 GB EBS.
2. SSH into your instance:
```bash
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

### Step 2: System Update & Package Installation
Update system packages and install Docker, Git, and utilities:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git apt-transport-https ca-certificates gnupg lsb-release

# Install Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Grant current user docker access
sudo usermod -aG docker ubuntu
newgrp docker
```

### Step 3: Install K3s (Lightweight Kubernetes for EC2)
K3s is a CNCF-certified, lightweight Kubernetes distribution ideal for single-node EC2 testing:
```bash
# Install K3s without Traefik (to avoid port 80 conflicts with custom services)
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable=traefik" sh -

# Setup kubeconfig permissions for ubuntu user
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
export KUBECONFIG=~/.kube/config
echo "export KUBECONFIG=~/.kube/config" >> ~/.bashrc

# Verify cluster status
kubectl get nodes -o wide
```

### Step 4: Clone the Project Repository
```bash
git clone https://github.com/riteshdawale02/retail-store-microservices.git
cd retail-store-microservices
```

### Step 5: Build Container Images on EC2
Build the microservice images using Docker on the EC2 instance:
```bash
docker build -t retail/product-service:latest ./product-service
docker build -t retail/cart-service:latest ./cart-service
docker build -t retail/order-service:latest ./order-service
docker build -t retail/api-gateway:latest ./api-gateway
docker build -t retail/frontend:latest ./frontend
```

Import the locally built Docker images directly into K3s containerd:
```bash
docker save retail/product-service:latest | sudo k3s ctr images import -
docker save retail/cart-service:latest | sudo k3s ctr images import -
docker save retail/order-service:latest | sudo k3s ctr images import -
docker save retail/api-gateway:latest | sudo k3s ctr images import -
docker save retail/frontend:latest | sudo k3s ctr images import -

# Verify imported images
sudo k3s ctr images list | grep retail
```

### Step 6: Deploy Kubernetes Manifests
Deploy the manifests into the `retail-system` namespace in dependency order:

```bash
# 1. Namespace
kubectl apply -f k8s/namespace.yaml

# 2. ConfigMap and Secrets
kubectl apply -f k8s/configmap-and-secrets.yaml

# 3. Databases (MySQL & Redis)
kubectl apply -f k8s/databases.yaml

# Wait for databases to become ready
kubectl wait --namespace retail-system --for=condition=ready pod -l app=mysql --timeout=120s
kubectl wait --namespace retail-system --for=condition=ready pod -l app=redis --timeout=120s

# 4. Monitoring (Prometheus & Grafana)
kubectl apply -f k8s/monitoring.yaml

# 5. Microservices & Frontend
# Note: For local/EC2 without ECR, ensure the imagePullPolicy is IfNotPresent
kubectl apply -f k8s/product-service.yaml
kubectl apply -f k8s/cart-service.yaml
kubectl apply -f k8s/order-service.yaml
kubectl apply -f k8s/api-gateway.yaml
kubectl apply -f k8s/frontend.yaml
```

> **Note on Image Names**: If using local images on EC2 without AWS ECR, update the image field in `k8s/*.yaml` to `retail/<service-name>:latest` and `imagePullPolicy: IfNotPresent`.

### Step 7: Expose Services for External Testing on EC2
To test directly from your browser using the EC2 Public IP, expose the frontend and API gateway via NodePort or background port-forwarding:

#### Method A: Port Forwarding (Recommended for quick testing)
Run port-forwards bound to `0.0.0.0`:
```bash
# Expose Frontend on port 3005
kubectl port-forward --address 0.0.0.0 svc/retail-frontend 3005:80 -n retail-system &

# Expose API Gateway on port 8080
kubectl port-forward --address 0.0.0.0 svc/api-gateway 8080:8080 -n retail-system &

# Expose Grafana on port 3001
kubectl port-forward --address 0.0.0.0 svc/grafana 3001:3000 -n retail-system &
```

#### Method B: Convert Services to NodePort
Alternatively, patch the services to `NodePort`:
```bash
kubectl patch svc retail-frontend -n retail-system -p '{"spec": {"type": "NodePort"}}'
kubectl patch svc api-gateway -n retail-system -p '{"spec": {"type": "NodePort"}}'
kubectl get svc -n retail-system
```

---

## 4. End-to-End Testing & Verification Runbook

### 1. Check Pod Health
```bash
kubectl get pods -n retail-system -o wide
```
All pods should be in `Running` status with `1/1` or `2/2` ready.

### 2. Verify Actuator Healthchecks
```bash
# Check API Gateway
curl -s http://localhost:8080/actuator/health | grep UP

# Check Product Service (via gateway or internal service)
curl -s http://localhost:8080/api/products | head -n 20
```

### 3. Verify Database Connectivity
```bash
# Verify MySQL tables
kubectl exec -it deployment/mysql -n retail-system -- mysql -uroot -pRetailRootSecret2026! -e "SHOW DATABASES;"

# Verify Redis ping
kubectl exec -it deployment/redis -n retail-system -- redis-cli ping
```

### 4. Test Complete Business Flow via Curl
```bash
# Step 1: List products
curl -i http://localhost:8080/api/products

# Step 2: Add item to cart (Customer ID: 1, Product ID: 1, Quantity: 2)
curl -i -X POST http://localhost:8080/api/cart/1/items \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "productName": "Wireless Headphones", "price": 99.99, "quantity": 2}'

# Step 3: View cart contents
curl -i http://localhost:8080/api/cart/1

# Step 4: Checkout cart to create an order
curl -i -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId": 1, "shippingAddress": "123 Main St, New York, NY", "paymentMethod": "CREDIT_CARD"}'
```

### 5. Access the Web Frontend
Open in your browser:
- **Storefront UI**: `http://<EC2_PUBLIC_IP>:3005`
- **Grafana Dashboard**: `http://<EC2_PUBLIC_IP>:3001` (Credentials: `admin` / `admin`)

---

## 5. Running on Local Machine (Quick Reference)

### Option 1: Docker Compose (Fastest Developer Workflow)
```bash
cd /path/to/retail-store-microservices
docker compose up --build -d

# Check running services
docker compose ps

# Access applications:
# Frontend: http://localhost:3005
# Gateway:  http://localhost:8080
# Grafana:  http://localhost:3001
```

### Option 2: Local Minikube
```bash
minikube start --cpus=4 --memory=8192 --disk-size=30g
eval $(minikube docker-env)

# Build images inside minikube's Docker daemon
docker build -t retail/product-service:latest ./product-service
docker build -t retail/cart-service:latest ./cart-service
docker build -t retail/order-service:latest ./order-service
docker build -t retail/api-gateway:latest ./api-gateway
docker build -t retail/frontend:latest ./frontend

# Deploy manifests
kubectl apply -f k8s/
```

---

## 6. Transitioning from EC2 to Amazon EKS (Production)

Once tested and validated on EC2, transition to production Amazon EKS:

1. **Push Images to Amazon ECR**:
   Use the provided helper script:
   ```bash
   chmod +x scripts/build-and-push-ecr.sh
   ./scripts/build-and-push-ecr.sh
   ```

2. **Provision Infrastructure via Terraform**:
   ```bash
   cd terraform
   terraform init
   terraform apply -auto-approve
   ```

3. **Deploy to EKS**:
   ```bash
   # Connect kubectl to EKS
   aws eks update-kubeconfig --name retail-platform-cluster --region us-east-1

   # Deploy manifests or Helm chart
   ./scripts/deploy-eks.sh
   # OR using Helm
   helm install retail-platform ./helm/retail-platform -n retail-system --create-namespace
   ```

4. **Verify AWS Application Load Balancer**:
   ```bash
   kubectl get ingress -n retail-system
   ```

---

## 7. Complete Helm Implementation & Lifecycle Guide

Helm is the official CNCF Kubernetes package manager used in this retail platform to parameterize, version, package, and operate all microservices, stateful databases, persistent storage, and ingress routing as a single unified release.

---

### A. Architectural Value of Helm in this Platform

1. **Elimination of Configuration Drift (DRY)**:
   Instead of duplicating registry URLs, database passwords, CPU/memory limits, and replica counts across 10+ standalone Kubernetes YAML files, Helm centralizes configuration into `values.yaml` and environment overlays (`values-local.yaml`, `values-prod.yaml`).
2. **Deterministic Release Lifecycle & Instant Rollbacks**:
   Helm stores revision snapshots directly within Kubernetes cluster Secrets (`sh.helm.release.v1.*`). If an application code update or faulty environment variable causes degradation, a single `helm rollback` command reverts all deployments, services, and configurations to the last known healthy state in seconds.
3. **Environment Parity**:
   The exact same Kubernetes manifests run seamlessly on:
   - Developer laptops (Minikube / Docker Desktop / Kind) using local Docker images.
   - Single-node AWS EC2 instances running K3s.
   - Multi-AZ enterprise Amazon EKS clusters backed by AWS Application Load Balancers and AWS ECR.
4. **GitOps-Ready Engine**:
   The chart is directly consumable by declarative GitOps controllers such as **Argo CD** or **Flux CD** without extra wrapping.

---

### B. Helm Chart Architecture & File Hierarchy

```
helm/retail-platform/
├── Chart.yaml                  # Chart metadata, version (1.0.0), and maintainers
├── values.yaml                 # Base configuration and default parameters
├── values-local.yaml           # Development overlay (single-replica, local Docker images)
├── values-prod.yaml            # Production overlay (multi-replica HA, AWS ECR, AWS ALB, HPA)
└── templates/                  # Templated Kubernetes resources
    ├── configmap-and-secrets.yaml # Platform environment variables and DB credentials
    ├── storage.yaml            # Dynamic PVCs for MySQL (10Gi) and Redis (2Gi)
    ├── databases.yaml          # MySQL (with auto-provisioning 01-init.sql ConfigMap) and Redis
    ├── all-services.yaml       # Gateway, Product, Cart, Order, and Frontend deployments & services
    ├── ingress.yaml            # AWS Application Load Balancer Ingress
    └── hpa.yaml                # Horizontal Pod Autoscalers (HPA) for compute workloads
```

#### Detailed Component Responsibilities:

| Template File | Managed Resources | Key Implementation Features |
|---|---|---|
| `Chart.yaml` | Chart Metadata | Standard Helm v2 API version, semantic versioning (`1.0.0`). |
| `values.yaml` | Default Values | Central catalog of database credentials, ports, resource limits, and service definitions. |
| `templates/storage.yaml` | `PersistentVolumeClaim` | Automated provisioning of storage for MySQL (`mysql-pvc`) and Redis (`redis-pvc`). |
| `templates/databases.yaml` | `Deployment`, `Service`, `ConfigMap` | MySQL 8.0 and Redis 7 deployments. Mounts an auto-generated `01-init.sql` ConfigMap to `/docker-entrypoint-initdb.d/` ensuring `retail_product_db`, `retail_order_db`, and user `retail_user` with full permissions are created on first boot without any manual intervention. |
| `templates/all-services.yaml` | `Deployment`, `Service` | Spring Boot services and React Frontend. Includes `initContainers` (`wait-for-mysql` and `wait-for-redis`) utilizing lightweight `busybox:1.36` to poll database socket availability (`nc -z -w 2`) before launching the JVM, preventing `CrashLoopBackOff` race conditions. |
| `templates/ingress.yaml` | `Ingress` | Provisions an AWS Application Load Balancer (ALB) via the AWS Load Balancer Controller with automated SSL redirection and internet-facing routing. |
| `templates/hpa.yaml` | `HorizontalPodAutoscaler` | Dynamic CPU-based pod autoscaling (2 to 8 replicas) for `product-service` and `order-service`. |

---

### C. Parameter Configuration Reference (`values.yaml`)

| Parameter | Description | Default | Environment Override |
|---|---|---|---|
| `global.environment` | Environment identifier | `production` | Set to `development` for local/EC2 |
| `global.awsRegion` | AWS deployment region | `us-east-1` | Cloud region |
| `global.ecrRegistry` | Container registry prefix | `592306540354.dkr.ecr.us-east-1.amazonaws.com` | Set to `""` for local Docker images |
| `global.tag` | Default image tag | `latest` | Release git commit SHA or semver |
| `mysql.enabled` | Deploy in-cluster MySQL | `true` | Set `false` if connecting to Amazon RDS |
| `mysql.storage` | MySQL PVC storage size | `10Gi` | `5Gi` (dev), `20Gi` (prod) |
| `mysql.username` | App database username | `retail_user` | Automated across DB and microservices |
| `mysql.password` | App database password | `RetailAppSecret2026!` | Synchronized across Secrets |
| `redis.enabled` | Deploy in-cluster Redis | `true` | Set `false` if connecting to ElastiCache |
| `redis.storage` | Redis PVC storage size | `2Gi` | `1Gi` (dev), `5Gi` (prod) |
| `apiGateway.replicaCount` | Replicas for API Gateway | `2` | `1` (dev), `3` (prod) |
| `productService.replicaCount` | Replicas for Product Service | `2` | `1` (dev), `3` (prod) |
| `cartService.replicaCount` | Replicas for Cart Service | `2` | `1` (dev), `3` (prod) |
| `orderService.replicaCount` | Replicas for Order Service | `2` | `1` (dev), `3` (prod) |
| `frontend.replicaCount` | Replicas for React Frontend | `2` | `1` (dev), `3` (prod) |
| `autoscaling.enabled` | Enable Horizontal Pod Autoscaling | `true` | `false` (dev), `true` (prod) |
| `autoscaling.targetCPUUtilizationPercentage` | Target CPU % for scaling | `75` | Target threshold |
| `ingress.enabled` | Deploy AWS ALB Ingress | `true` | `false` (dev), `true` (prod) |
| `ingress.host` | Ingress hostname | `retail.yourdomain.com` | Production DNS name |

---

### D. Step-by-Step Helm Deployment Runbook

#### 1. Validate & Lint the Chart
Always execute linting and dry-run template rendering prior to running deployment:
```bash
# Lint the chart against best practices
helm lint ./helm/retail-platform

# Dry-run template generation locally (no cluster modification)
helm template retail-platform ./helm/retail-platform \
  --namespace retail-system \
  -f ./helm/retail-platform/values-prod.yaml
```

#### 2. Scenario A: Deploying on Local Machine or Single-Node EC2 (K3s)
For local testing or single-node EC2, use `values-local.yaml` (which uses single replicas, local Docker image names, and disables the AWS ALB):
```bash
helm upgrade --install retail-platform ./helm/retail-platform \
  --namespace retail-system \
  --create-namespace \
  -f ./helm/retail-platform/values-local.yaml \
  --wait \
  --timeout 10m
```

#### 3. Scenario B: Deploying to Production Amazon EKS
For production Amazon EKS, authenticate with ECR and apply `values-prod.yaml`:
```bash
# Connect kubectl to your Amazon EKS cluster
aws eks update-kubeconfig --name retail-platform-cluster --region us-east-1

# Deploy or upgrade the Helm release
helm upgrade --install retail-platform ./helm/retail-platform \
  --namespace retail-system \
  --create-namespace \
  -f ./helm/retail-platform/values-prod.yaml \
  --set global.tag=latest \
  --wait \
  --timeout 10m
```
> **What `--wait` does**: Helm will block and monitor pod rollouts until all containers pass their readiness probes (`/actuator/health` for Spring Boot, `mysqladmin ping` for MySQL, and `redis-cli ping` for Redis). If any pod fails, Helm halts and reports the failure.

#### 4. Inspect & Verify Release Status
```bash
# Check release status and metadata
helm status retail-platform -n retail-system

# View all active Kubernetes resources created by Helm
kubectl get all,pvc,ingress -n retail-system

# Check pod startup logs for MySQL initialization
kubectl logs -n retail-system -l app=mysql --tail=50
```

#### 5. Executing Zero-Downtime Rolling Upgrades
When deploying a new version of the microservices or updating a configuration value:
```bash
# Upgrade image tag with zero downtime
helm upgrade retail-platform ./helm/retail-platform \
  --namespace retail-system \
  --set global.tag=v1.1.0 \
  --reuse-values \
  --wait
```
Kubernetes will deploy the new pods, wait for the `wait-for-mysql` initContainer and the `/actuator/health` probe to succeed, switch traffic to the new pods, and cleanly terminate the old pods.

#### 6. Rollback in Case of Failure
If an upgrade causes errors, rollback to any previous release version:
```bash
# List release revision history
helm history retail-platform -n retail-system

# Instantly rollback to revision 1 (or any previous healthy revision)
helm rollback retail-platform 1 -n retail-system
```

#### 7. Complete Uninstallation
To tear down the application release:
```bash
helm uninstall retail-platform -n retail-system
```
> **Data Protection Note**: By default, PersistentVolumeClaims (`retail-platform-mysql-pvc` and `retail-platform-redis-pvc`) remain intact in the cluster to prevent catastrophic data loss. If you wish to delete storage volumes as well, run `kubectl delete pvc -l app=mysql -n retail-system`.

---

### E. Declarative GitOps Integration (Argo CD)

In an automated CI/CD and GitOps workflow, Argo CD monitors this Helm chart repository and synchronizes state to Amazon EKS automatically.

Create the Argo CD Application manifest (`argocd-retail-platform.yaml`):
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: retail-platform
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/riteshdawale02/retail-store-microservices.git
    targetRevision: main
    path: helm/retail-platform
    helm:
      valueFiles:
        - values-prod.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: retail-system
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```
Apply to your Argo CD cluster:
```bash
kubectl apply -f argocd-retail-platform.yaml
```

---

### F. CI/CD GitHub Actions Pipeline Snippet

Automate chart linting and deployment within `.github/workflows/deploy.yml`:
```yaml
name: Lint and Deploy Helm Chart

on:
  push:
    branches: [ main ]
    paths:
      - 'helm/**'

jobs:
  lint-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Set up Helm
        uses: azure/setup-helm@v3
        with:
          version: v3.12.0

      - name: Lint Chart
        run: |
          helm lint ./helm/retail-platform -f ./helm/retail-platform/values-local.yaml
          helm lint ./helm/retail-platform -f ./helm/retail-platform/values-prod.yaml

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Update Kubeconfig
        run: aws eks update-kubeconfig --name retail-platform-cluster --region us-east-1

      - name: Deploy Helm Chart to Amazon EKS
        run: |
          helm upgrade --install retail-platform ./helm/retail-platform \
            --namespace retail-system \
            --create-namespace \
            -f ./helm/retail-platform/values-prod.yaml \
            --set global.tag=${{ github.sha }} \
            --wait \
            --timeout 10m
```

---

### G. Helm CLI Troubleshooting & Cheat Sheet

| Command | Action / Objective |
|---|---|
| `helm list -A` | List all deployed Helm releases across all namespaces. |
| `helm get values <release> -n <ns>` | Inspect the user-supplied values applied to the active release. |
| `helm get manifest <release> -n <ns>` | View all rendered Kubernetes manifests currently running in the cluster. |
| `helm diff upgrade <release> <chart>` | View the exact YAML diff between the current release and pending changes (requires `helm-diff` plugin). |
| `helm history <release> -n <ns>` | View deployment timeline, revision numbers, descriptions, and statuses. |
| `helm rollback <release> <revision> -n <ns>` | Instantly restore a previous revision without downtime. |
| `helm template <release> <chart> --debug` | Render all templates locally with full variable expansion and line numbers for debugging syntax issues. |

---

---

## 8. Troubleshooting Guide

| Issue | Cause | Resolution |
|---|---|---|
| `ErrImageNeverPull` or `ImagePullBackOff` | Kubernetes cannot find local image or lacks ECR credentials | Ensure image was loaded into containerd (`k3s ctr images import`) and `imagePullPolicy: IfNotPresent` is set. |
| `CrashLoopBackOff` on Spring services | Memory limit exceeded or MySQL not yet ready | The included `wait-for-mysql` initContainer prevents this. Check `kubectl logs -n retail-system -l app=product-service`. |
| Cannot access ports from browser | EC2 Security Group blocking inbound traffic | Ensure ports `3005`, `8080`, and `3001` are open in AWS EC2 Security Group. |
| Port-forward closes on disconnect | Command terminated when SSH session exits | Use `nohup` or `tmux` / `screen` session to keep port-forwarding alive. |
| Helm release in `failed` state | Timeout reached while waiting for pods | Run `helm status retail-platform -n retail-system` and check pod logs with `kubectl logs -n retail-system -l app=mysql`. |
