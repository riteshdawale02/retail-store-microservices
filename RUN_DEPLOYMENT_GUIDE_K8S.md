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

## 7. Troubleshooting Guide

| Issue | Cause | Resolution |
|---|---|---|
| `ErrImageNeverPull` or `ImagePullBackOff` | Kubernetes cannot find local image or lacks ECR credentials | Ensure image was loaded into containerd (`k3s ctr images import`) and `imagePullPolicy: IfNotPresent` is set. |
| `CrashLoopBackOff` on Spring services | Memory limit exceeded or MySQL not yet ready | Check logs: `kubectl logs -n retail-system -l app=product-service`. Verify DB is ready. |
| Cannot access ports from browser | EC2 Security Group blocking inbound traffic | Ensure ports `3005`, `8080`, and `3001` are open in AWS EC2 Security Group. |
| Port-forward closes on disconnect | Command terminated when SSH session exits | Use `nohup` or `tmux` / `screen` session to keep port-forwarding alive. |
