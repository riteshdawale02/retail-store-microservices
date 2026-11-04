# Complete End-to-End Enterprise Deployment Guide
### Cloud-Native Retail Platform on Amazon EKS v1.35, ECR, Terraform, Helm, ArgoCD, Prometheus, Grafana & GitHub Actions

---

## 1. Architectural Blueprint & Automated Workflow

This guide covers the complete production deployment of the Cloud-Native Retail Platform on **Amazon Web Services (AWS)**. It encompasses infrastructure provisioning via Terraform, automated CI/CD pipelines, GitOps synchronization via ArgoCD, zero-downtime rolling updates, and full observability.

```mermaid
flowchart TD
    subgraph Phase 1: Infrastructure as Code
        TF[Terraform CLI] -->|Provisions| VPC[AWS VPC Multi-AZ]
        TF -->|Provisions| EKS[Amazon EKS v1.35]
        TF -->|Provisions| ECR[Amazon ECR Repositories]
        TF -->|Provisions| RDS[Amazon RDS MySQL / In-Cluster DB]
        TF -->|Provisions| REDIS[Amazon ElastiCache / In-Cluster Redis]
        TF -->|Provisions| CSI[AWS EBS CSI Driver Add-on]
    end

    subgraph Phase 2: CI/CD Pipeline [GitHub Actions]
        DEV[Developer Git Push] -->|Trigger on main| GHA[GitHub Actions Runner]
        GHA -->|1. Test & Package| MAVEN[Maven & Vitest Unit Tests]
        GHA -->|2. Build & Push| DOCKER[Docker Buildx AMD64]
        DOCKER -->|Tag latest & Git SHA| ECR
        GHA -->|3. Trigger Rollout| HELM_UPGRADE[Helm Upgrade on EKS]
    end

    subgraph Phase 3: GitOps & Kubernetes [Amazon EKS]
        HELM_UPGRADE -->|Updates Deployment Spec| ROLLING[Zero-Downtime Rolling Update]
        ARGO[ArgoCD Controller] -->|Self-Healing & Auto-Sync| ROLLING
        ROLLING -->|maxSurge: 1, maxUnavailable: 0| PODS[New Pods Ready & Health Checked]
        ALB[AWS Application Load Balancer] -->|Routes HTTP/HTTPS| PODS
    end

    subgraph Phase 4: Observability
        PROM[Prometheus Server] -->|Scrapes /actuator/prometheus| PODS
        GRAF[Grafana Dashboard] -->|Queries| PROM
    end
```

---

## 2. Prerequisites & Local Tooling

Ensure the following CLIs are installed and configured on your machine:

```bash
# Verify tooling versions
aws --version            # AWS CLI v2.x
terraform version        # Terraform v1.5+ (recommended v1.8+)
kubectl version --client   # Kubectl v1.30+
helm version             # Helm v3.14+
docker --version         # Docker Engine v24+
```

### AWS Authentication
Authenticate your terminal with active AWS credentials:
```bash
aws configure
# Enter AWS Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)

# Confirm identity
aws sts get-caller-identity
```

---

## 3. Phase 1: Provision Cloud Infrastructure with Terraform

The `terraform/` directory defines the entire AWS cloud footprint:
- **Multi-AZ VPC** (`10.0.0.0/16`) across 2 Availability Zones with public/private subnets, NAT Gateway, and Internet Gateway. Subnets are tagged with `kubernetes.io/role/elb = 1` for AWS ALB Ingress autodiscovery.
- **Amazon EKS Managed Cluster** (v1.35) with managed node groups (`t3.medium`).
- **Amazon ECR Repositories** for all 5 services (`product-service`, `cart-service`, `order-service`, `api-gateway`, and `frontend`).
- **AWS EBS CSI Driver Add-on** with `AmazonEBSCSIDriverPolicy` for persistent volume lifecycle management.
- **Dynamic IAM OIDC Provider** for Kubernetes Service Accounts (IRSA).
- **Amazon RDS MySQL** and **Amazon ElastiCache Redis** clusters with security groups.

### Step-by-Step Execution:
```bash
cd terraform

# 1. Initialize Terraform plugins
terraform init

# 2. Plan and validate infrastructure changes
terraform plan -out=tfplan

# 3. Apply infrastructure to AWS (takes ~12-15 minutes)
terraform apply tfplan

# 4. Save and inspect Terraform outputs
terraform output
cd ..
```

---

## 4. Phase 2: Connect Kubectl to Amazon EKS

Configure `kubectl` to communicate with the newly provisioned EKS cluster:

```bash
REGION="us-east-1"
CLUSTER_NAME="retail-platform-cluster"

aws eks update-kubeconfig --name "${CLUSTER_NAME}" --region "${REGION}"

# Verify cluster connectivity and worker nodes
kubectl get nodes -o wide
```

Create the application namespace:
```bash
kubectl create namespace retail-system --dry-run=client -o yaml | kubectl apply -f -
```

---

## 5. Phase 3: Build & Push Production Images to Amazon ECR

Build all 5 microservices for `linux/amd64` architecture (matching EKS worker nodes) and push them to ECR:

```bash
# Fetch active AWS Account ID dynamically
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

# Authenticate Docker daemon to Amazon ECR
aws ecr get-login-password --region "${REGION}" | docker login --username AWS --password-stdin "${ECR_REGISTRY}"

# Run the automated multi-service build and push script
chmod +x ./scripts/build-and-push-ecr.sh
./scripts/build-and-push-ecr.sh
```

---

## 6. Phase 4: Deploy AWS Load Balancer Controller (ALB Ingress)

The AWS Load Balancer Controller manages AWS Application Load Balancers for Kubernetes `Ingress` resources:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"
CLUSTER_NAME="retail-platform-cluster"

# 1. Associate IAM OIDC Provider with your EKS cluster
eksctl utils associate-iam-oidc-provider --cluster "${CLUSTER_NAME}" --region "${REGION}" --approve

# 2. Create IAM Policy for AWS Load Balancer Controller
curl -fsSL -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.7.2/docs/install/iam_policy.json
aws iam create-policy --policy-name AWSLoadBalancerControllerIAMPolicy --policy-document file://iam_policy.json || true

# 3. Create ServiceAccount with IRSA
eksctl create iamserviceaccount \
  --cluster="${CLUSTER_NAME}" \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name="AmazonEKSLoadBalancerControllerRole" \
  --attach-policy-arn="arn:aws:iam::${ACCOUNT_ID}:policy/AWSLoadBalancerControllerIAMPolicy" \
  --approve

# 4. Install AWS Load Balancer Controller via Helm
helm repo add eks https://aws.github.io/eks-charts
helm repo update eks

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName="${CLUSTER_NAME}" \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

---

## 7. Phase 5: Deploy Microservices via Helm or Scripts

Deploy the application using the automated deployment script (or direct Helm upgrade):

```bash
# Option A: Run automated deployment script (handles dynamic account ID & Helm rollout)
chmod +x ./scripts/deploy-eks.sh
./scripts/deploy-eks.sh

# Option B: Direct Helm upgrade
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com"

helm upgrade --install retail-platform ./helm/retail-platform \
  --namespace retail-system \
  --create-namespace \
  --set global.ecrRegistry="${ECR_REGISTRY}" \
  --set global.tag="latest" \
  --set ingress.enabled=true \
  --wait \
  --timeout 10m
```

### Retrieve Multi-Device Public ALB URL
Wait ~2 minutes for the AWS Application Load Balancer to provision. Retrieve the public DNS:
```bash
kubectl get ingress -n retail-system -o jsonpath="{.items[0].status.loadBalancer.ingress[0].hostname}"
echo ""
```
**Access this URL from ANY mobile phone, laptop, or browser anywhere in the world.**

---

## 8. Phase 6: Observability (Prometheus & Grafana)

The platform includes Prometheus metrics scraping on `/actuator/prometheus` and pre-built Grafana dashboards.

### Step 1: Deploy Manifests
```bash
kubectl apply -f k8s/monitoring.yaml
```

### Step 2: Access Grafana & Prometheus
```bash
# Expose Grafana on port 3001
kubectl port-forward --address 0.0.0.0 svc/grafana 3001:3000 -n retail-system > /dev/null 2>&1 &

# Expose Prometheus on port 9090
kubectl port-forward --address 0.0.0.0 svc/prometheus 9090:9090 -n retail-system > /dev/null 2>&1 &
```

### Step 3: Configure Grafana Dashboard
1. Open `http://<HOST_IP>:3001` (Credentials: `admin` / `admin`).
2. Add Prometheus Datasource: URL `http://prometheus:9090` -> Click **Save & test**.
3. Import the pre-built dashboard:
   - Navigate to **Dashboards -> Import**.
   - Paste contents of `grafana/provisioning/dashboards/retail-microservices-dashboard.json`.
   - Select the Prometheus datasource and click **Import**.

### Key Telemetry Visualized:
- **JVM Heap & Non-Heap Memory**: Microservice memory consumption.
- **HTTP Request Rates (RPS)**: Throughput per microservice and status code (200, 4xx, 5xx).
- **Latency Percentiles**: p95 and p99 response times.
- **HikariCP Connection Pools**: Active vs. idle MySQL database connections.

---

## 9. Phase 7: Setup GitOps with ArgoCD

ArgoCD maintains desired cluster state synchronized with your Git repository.

### Step 1: Install ArgoCD on EKS
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl wait --namespace argocd --for=condition=ready pod -l app.kubernetes.io/name=argocd-server --timeout=180s
```

### Step 2: Access ArgoCD UI & Retrieve Password
```bash
# Retrieve initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
echo ""

# Port-forward ArgoCD Web UI on port 8085
kubectl port-forward --address 0.0.0.0 svc/argocd-server -n argocd 8085:443 > /dev/null 2>&1 &
```
Open `https://<HOST_IP>:8085` (Username: `admin`).

### Step 3: Deploy GitOps Application
```bash
kubectl apply -f argocd/application.yaml
```

---

## 10. Phase 8: Automated CI/CD Pipelines (GitHub Actions)

The repository implements a two-tier pipeline architecture in `.github/workflows/`:

### 1. Workflow 1: Continuous Integration (`.github/workflows/ci.yaml`)
- **Triggers**: On push / PR targeting `main` and `develop`.
- **Jobs Executed**:
  1. `iac-validation`: Runs `terraform fmt -check`, `terraform validate`, `helm lint`, and manifest YAML validation.
  2. `frontend-ci`: Runs Node.js 20 `oxlint` linting, `vitest` unit tests, and production `vite build`.
  3. `backend-microservices-ci`: Parallel Maven matrix testing on JDK 17 for `product-service`, `cart-service`, `order-service`, and `api-gateway`.
  4. `docker-build-verification`: Docker Buildx compilation gate with GitHub Actions layer caching.

### 2. Workflow 2: Continuous Delivery (`.github/workflows/ci-cd.yaml`)
- **Triggers**: On `git push origin main`.
- **Jobs Executed**:
  1. `test-and-build`: Verifies microservices compile and package.
  2. `docker-build-push`: Builds and pushes all 5 images to Amazon ECR with tags `latest` and `${{ github.sha }}`.
  3. `deploy-eks`: Updates EKS kubeconfig and triggers a rolling update via `helm upgrade`.

### Required GitHub Repository Secrets:
Configure in **GitHub Repository -> Settings -> Secrets and variables -> Actions**:

| Secret Name | Description | Example |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | IAM User Access Key with ECR & EKS permissions | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | IAM User Secret Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_ACCOUNT_ID` | Your 12-digit AWS Account ID | `123456789012` |

### Zero-Downtime Rolling Update Demonstration:
```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant Git as GitHub Repository
    participant GHA as GitHub Actions CI/CD
    participant ECR as Amazon ECR
    participant K8s as Amazon EKS (Deployment Controller)
    participant PodOld as Old Pods (v1)
    participant PodNew as New Pods (v2)

    Dev->>Git: git push origin main
    Git->>GHA: Webhook Triggers ci-cd.yaml
    GHA->>GHA: Run Unit Tests (Maven & Vitest)
    GHA->>ECR: Build & Push Image with SHA tag and latest
    GHA->>K8s: helm upgrade --set global.tag=<SHA>
    Note over K8s: RollingUpdate Strategy Triggered<br/>(maxSurge: 1, maxUnavailable: 0)
    K8s->>PodNew: Spin up new Pod
    K8s->>PodNew: Run Readiness Probe (/actuator/health)
    PodNew-->>K8s: Status: Ready (200 OK)
    K8s->>K8s: Route incoming traffic to New Pod
    K8s->>PodOld: Send SIGTERM, drain connections
    K8s->>PodOld: Terminate Old Pod
    Note over Dev,K8s: Zero dropped requests during entire update!
```

---

## 11. Phase 9: End-to-End Verification Runbook

### 1. Actuator Health Verification
```bash
ALB_URL=$(kubectl get ingress -n retail-system -o jsonpath="{.items[0].status.loadBalancer.ingress[0].hostname}")

curl -s "http://${ALB_URL}/actuator/health"
# Expected: {"status":"UP"}
```

### 2. Complete End-to-End Shopping Flow Test
```bash
# 1. Fetch Products
curl -i "http://${ALB_URL}/api/products"

# 2. Add an item to Cart (Redis)
curl -i -X POST "http://${ALB_URL}/api/cart/1/items" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "productName": "UltraBook Pro 16", "price": 1299.99, "quantity": 1}'

# 3. Retrieve Cart
curl -i "http://${ALB_URL}/api/cart/1"

# 4. Checkout Order (Order Service & MySQL)
curl -i -X POST "http://${ALB_URL}/api/orders" \
  -H "Content-Type: application/json" \
  -d '{"customerId": 1, "shippingAddress": "100 Broadway, New York, NY", "paymentMethod": "CREDIT_CARD"}'
```

---

## 12. Phase 10: Teardown & Clean Up

To avoid unnecessary AWS cloud costs after evaluation:

```bash
# 1. Uninstall Helm applications
helm uninstall retail-platform -n retail-system || true
helm uninstall aws-load-balancer-controller -n kube-system || true

# 2. Delete ArgoCD and Monitoring resources
kubectl delete -f argocd/application.yaml || true
kubectl delete -f k8s/monitoring.yaml || true
kubectl delete namespace argocd retail-system || true

# 3. Destroy AWS infrastructure via Terraform
cd terraform
terraform destroy -auto-approve
cd ..
```

---

### Deployment Architecture Summary

| Component | Technology | Role |
|---|---|---|
| **IaC** | Terraform v1.5+ | Multi-AZ VPC, EKS Cluster, ECR, Node Groups, IAM Roles |
| **Orchestration** | Amazon EKS v1.35 | Managed Kubernetes Container Orchestration |
| **Registry** | Amazon ECR | Private Docker Image Repositories with vulnerability scanning |
| **Packaging** | Helm 3 | Parametrized Application Chart & Config Management |
| **CI/CD** | GitHub Actions | Automated Linting, Multi-Stage Tests, Build & Push |
| **GitOps** | ArgoCD | Git-to-Cluster Continuous Synchronization |
| **Traffic Routing**| AWS ALB Controller | External HTTP Ingress with dynamic IP targets |
| **Observability** | Prometheus & Grafana | Real-time Metrics, Alerts & System Dashboards |
| **Zero-Downtime** | Kubernetes RollingUpdate | `maxSurge: 1`, `maxUnavailable: 0` with health checks |
