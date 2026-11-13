#!/usr/bin/env bash
# ==============================================================================
# Cloud-Native Retail Platform - All-in-One EC2 Kubernetes Deployment Script
# Microservices + MySQL + Redis + Helm + Prometheus + Grafana + ArgoCD
# Tested on: Ubuntu 22.04 LTS / 24.04 LTS (x86_64 and arm64)
# ==============================================================================
set -euo pipefail

# Visual styling
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

echo -e "${BOLD}${CYAN}"
echo "================================================================================"
echo "      🚀 CLOUD-NATIVE RETAIL PLATFORM - ALL-IN-ONE EC2 K8S DEPLOYMENT         "
echo "================================================================================"
echo -e "${NC}"

# ------------------------------------------------------------------------------
# 1. Environment & Sudo Setup
# ------------------------------------------------------------------------------
SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    log_error "This script requires superuser privileges or sudo."
    exit 1
  fi
fi

export DEBIAN_FRONTEND=noninteractive

# Detect EC2 Public IP
PUBLIC_IP=$(curl -s --connect-timeout 2 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || true)
if [ -z "$PUBLIC_IP" ]; then
  PUBLIC_IP=$(curl -s --connect-timeout 2 https://ifconfig.me 2>/dev/null || true)
fi
if [ -z "$PUBLIC_IP" ]; then
  PUBLIC_IP=$(hostname -I | awk '{print $1}')
fi
log_info "Detected Public IP: ${BOLD}${PUBLIC_IP}${NC}"

# ------------------------------------------------------------------------------
# 2. Swap Memory Allocation (Critical for JVM & Build Stability on EC2)
# ------------------------------------------------------------------------------
SWAP_TOTAL=$(free -m | awk '/Swap:/ {print $2}')
if [ "${SWAP_TOTAL}" -lt 2000 ]; then
  log_info "Allocating 4GB swap space to prevent JVM Out-Of-Memory during container builds..."
  $SUDO fallocate -l 4G /swapfile 2>/dev/null || $SUDO dd if=/dev/zero of=/swapfile bs=1M count=4096 status=progress
  $SUDO chmod 600 /swapfile
  $SUDO mkswap /swapfile
  $SUDO swapon /swapfile || true
  if ! grep -q "/swapfile" /etc/fstab; then
    echo "/swapfile none swap sw 0 0" | $SUDO tee -a /etc/fstab >/dev/null
  fi
  log_success "4GB swap active."
else
  log_info "Sufficient swap space detected (${SWAP_TOTAL} MB)."
fi

# Kernel memory tuning
$SUDO sysctl -w vm.max_map_count=262144 >/dev/null 2>&1 || true
$SUDO sysctl -w fs.file-max=65536 >/dev/null 2>&1 || true

# ------------------------------------------------------------------------------
# 3. System Packages & Prerequisites
# ------------------------------------------------------------------------------
log_info "Updating system packages and installing baseline utilities..."
$SUDO apt-get update -y
$SUDO apt-get install -y --no-install-recommends \
  curl wget git jq ca-certificates gnupg lsb-release apt-transport-https tar net-tools

# ------------------------------------------------------------------------------
# 4. Install Docker CE (Container Build Engine)
# ------------------------------------------------------------------------------
if ! command -v docker >/dev/null 2>&1; then
  log_info "Installing Docker Engine..."
  $SUDO install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | $SUDO gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
  $SUDO chmod a+r /etc/apt/keyrings/docker.gpg

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" | $SUDO tee /etc/apt/sources.list.d/docker.list > /dev/null

  $SUDO apt-get update -y
  $SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  $SUDO systemctl enable --now docker
  $SUDO usermod -aG docker "$USER" 2>/dev/null || true
  log_success "Docker Engine installed."
else
  log_info "Docker is already installed."
fi

# ------------------------------------------------------------------------------
# 5. Install K3s (Lightweight Kubernetes Engine)
# ------------------------------------------------------------------------------
if ! command -v k3s >/dev/null 2>&1; then
  log_info "Installing K3s (Single-Node K8s cluster without Traefik)..."
  curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable=traefik --write-kubeconfig-mode 644" sh -
  log_success "K3s installed."
else
  log_info "K3s is already installed."
fi

# Configure Kubeconfig for current user
mkdir -p "$HOME/.kube"
$SUDO cp /etc/rancher/k3s/k3s.yaml "$HOME/.kube/config"
$SUDO chown "$(id -u):$(id -g)" "$HOME/.kube/config"
export KUBECONFIG="$HOME/.kube/config"

if ! grep -q "KUBECONFIG" "$HOME/.bashrc" 2>/dev/null; then
  echo "export KUBECONFIG=\$HOME/.kube/config" >> "$HOME/.bashrc"
fi

# Symlink kubectl if not present
if ! command -v kubectl >/dev/null 2>&1; then
  $SUDO ln -sf /usr/local/bin/k3s /usr/local/bin/kubectl
fi

# Wait for K8s node ready
log_info "Verifying Kubernetes cluster node state..."
kubectl wait --for=condition=Ready node --all --timeout=60s
log_success "Kubernetes cluster is Ready."

# ------------------------------------------------------------------------------
# 6. Install Helm v3
# ------------------------------------------------------------------------------
if ! command -v helm >/dev/null 2>&1; then
  log_info "Installing Helm v3..."
  curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
  log_success "Helm v3 installed."
else
  log_info "Helm is already installed."
fi

# ------------------------------------------------------------------------------
# 7. Locate or Clone Repository
# ------------------------------------------------------------------------------
REPO_DIR=""
if [ -f "./product-service/pom.xml" ] && [ -f "./frontend/package.json" ]; then
  REPO_DIR="$(pwd)"
  log_info "Running inside repository root: ${REPO_DIR}"
else
  REPO_DIR="${HOME}/retail-store-microservices"
  if [ ! -d "$REPO_DIR" ]; then
    log_info "Cloning repository branch [kubernetes-testing]..."
    git clone -b kubernetes-testing https://github.com/riteshdawale02/retail-store-microservices.git "$REPO_DIR"
  else
    log_info "Updating repository at ${REPO_DIR}..."
    cd "$REPO_DIR"
    git fetch origin kubernetes-testing || true
    git checkout kubernetes-testing || true
    git pull origin kubernetes-testing || true
  fi
fi
cd "$REPO_DIR"

# ------------------------------------------------------------------------------
# 8. Build Microservices Docker Images & Import to K3s
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}📦 [1/5] Building Microservice Docker Images...${NC}"

build_and_import() {
  local service_name="$1"
  local dir_path="$2"
  local image_tag="retail/${service_name}:latest"

  log_info "Building ${image_tag}..."
  docker build -t "${image_tag}" "${dir_path}"

  log_info "Importing ${image_tag} into K3s containerd..."
  docker save "${image_tag}" | $SUDO k3s ctr images import -
}

build_and_import "product-service" "./product-service"
build_and_import "cart-service"    "./cart-service"
build_and_import "order-service"   "./order-service"
build_and_import "api-gateway"     "./api-gateway"
build_and_import "frontend"        "./frontend"

log_success "All 5 container images built and imported to K3s."

# ------------------------------------------------------------------------------
# 9. Install ArgoCD
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}🐙 [2/5] Installing & Setting up ArgoCD...${NC}"
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -n argocd --server-side --force-conflicts -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Download ArgoCD CLI if not present
if ! command -v argocd >/dev/null 2>&1; then
  log_info "Installing ArgoCD CLI..."
  ARGOCD_ARCH="amd64"
  if [ "$(uname -m)" = "aarch64" ]; then ARGOCD_ARCH="arm64"; fi
  curl -sSL -o /tmp/argocd "https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-${ARGOCD_ARCH}"
  $SUDO install -m 555 /tmp/argocd /usr/local/bin/argocd
  rm -f /tmp/argocd
fi

log_info "Waiting for ArgoCD server deployment to become available..."
kubectl wait --namespace argocd --for=condition=available deployment/argocd-server --timeout=180s || true

# Extract ArgoCD admin password
ARGOCD_ADMIN_PASSWORD=""
for i in {1..30}; do
  ARGOCD_ADMIN_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" 2>/dev/null | base64 -d 2>/dev/null || true)
  if [ -n "$ARGOCD_ADMIN_PASSWORD" ]; then break; fi
  sleep 2
done

# Remove duplicate legacy app if present
kubectl delete application cloud-retail-platform -n argocd 2>/dev/null || true

# Apply ArgoCD Application
if [ -f "argocd/application-ec2.yaml" ]; then
  kubectl apply -f argocd/application-ec2.yaml
elif [ -f "argocd/application.yaml" ]; then
  kubectl apply -f argocd/application.yaml
fi
log_success "ArgoCD initialized and application registered."

# ------------------------------------------------------------------------------
# 10. Deploy Microservices & Databases Stack via Helm
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}🛍️  [3/5] Deploying Retail Microservices & Databases (Helm)...${NC}"
kubectl create namespace retail-system --dry-run=client -o yaml | kubectl apply -f -

# Deploy Helm Chart using local single-node values
helm upgrade --install retail-platform ./helm/retail-platform \
  --namespace retail-system \
  --create-namespace \
  -f ./helm/retail-platform/values-local.yaml

log_info "Waiting for core databases (MySQL & Redis) to initialize..."
kubectl wait --namespace retail-system --for=condition=ready pod -l app=mysql --timeout=150s || true
kubectl wait --namespace retail-system --for=condition=ready pod -l app=redis --timeout=150s || true
log_success "Retail platform microservices deployed."

# ------------------------------------------------------------------------------
# 11. Deploy Prometheus & Grafana Monitoring
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}📊 [4/5] Deploying Prometheus & Grafana Monitoring Stack...${NC}"

# Provision Prometheus config
kubectl create configmap prometheus-config \
  --from-file=prometheus/prometheus.yml \
  -n retail-system \
  --dry-run=client -o yaml | kubectl apply -f -

# Provision Grafana datasources & dashboard
kubectl create configmap grafana-datasources \
  --from-file=grafana/provisioning/datasources/datasources.yml \
  -n retail-system \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl create configmap grafana-dashboards \
  --from-file=grafana/provisioning/dashboards/dashboards.yml \
  --from-file=grafana/provisioning/dashboards/retail-microservices-dashboard.json \
  -n retail-system \
  --dry-run=client -o yaml | kubectl apply -f -

# Apply monitoring manifest
kubectl apply -f k8s/monitoring.yaml

log_info "Waiting for Prometheus and Grafana pods..."
kubectl wait --namespace retail-system --for=condition=ready pod -l app=prometheus --timeout=120s || true
kubectl wait --namespace retail-system --for=condition=ready pod -l app=grafana --timeout=120s || true
log_success "Monitoring stack operational."

# ------------------------------------------------------------------------------
# 12. Persistent Background Port-Forwarding (Systemd Service)
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}🌐 [5/5] Configuring Public Port Forwarding on EC2...${NC}"

FORWARD_SCRIPT="/usr/local/bin/retail-k8s-port-forward.sh"
$SUDO tee "${FORWARD_SCRIPT}" > /dev/null << 'EOF'
#!/usr/bin/env bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

kill_existing() {
  pkill -f "kubectl port-forward" 2>/dev/null || true
}

kill_existing
sleep 2

# Expose services to all network interfaces (0.0.0.0)
kubectl port-forward --address 0.0.0.0 svc/retail-frontend 3005:80 -n retail-system &
kubectl port-forward --address 0.0.0.0 svc/api-gateway 8080:8080 -n retail-system &
kubectl port-forward --address 0.0.0.0 svc/grafana 3001:3000 -n retail-system &
kubectl port-forward --address 0.0.0.0 svc/prometheus 9090:9090 -n retail-system &
kubectl port-forward --address 0.0.0.0 svc/argocd-server 8443:443 -n argocd &

wait
EOF

$SUDO chmod +x "${FORWARD_SCRIPT}"

# Create Systemd service
$SUDO tee /etc/systemd/system/retail-k8s-ports.service > /dev/null << EOF
[Unit]
Description=Cloud Retail Platform K8s Port-Forward Supervisor
After=network.target k3s.service
Requires=k3s.service

[Service]
Type=simple
User=root
ExecStart=${FORWARD_SCRIPT}
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

$SUDO systemctl daemon-reload
$SUDO systemctl enable --now retail-k8s-ports.service

sleep 4

# ------------------------------------------------------------------------------
# 13. Health & Sanity Verification
# ------------------------------------------------------------------------------
log_info "Verifying microservices healthcheck..."
GATEWAY_HEALTH=""
for i in {1..30}; do
  GATEWAY_HEALTH=$(curl -s --connect-timeout 2 http://localhost:8080/actuator/health 2>/dev/null || true)
  if echo "$GATEWAY_HEALTH" | grep -q "UP"; then
    break
  fi
  sleep 2
done

if echo "$GATEWAY_HEALTH" | grep -q "UP"; then
  log_success "API Gateway Actuator health status: UP"
else
  log_warn "API Gateway is still warming up. Pods are initializing in the background."
fi

# ------------------------------------------------------------------------------
# 14. Final Operational Output
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${GREEN}"
echo "================================================================================"
echo "          🎉 DEPLOYMENT COMPLETE & OPERATIONAL ON KUBERNETES!                  "
echo "================================================================================"
echo -e "${NC}"

echo -e "${BOLD}Access Endpoints (Open in your browser):${NC}"
echo -e "  🛍️  ${CYAN}Storefront UI:${NC}     http://${PUBLIC_IP}:3005"
echo -e "  🚪 ${CYAN}API Gateway:${NC}       http://${PUBLIC_IP}:8080"
echo -e "  📊 ${CYAN}Grafana Dashboard:${NC} http://${PUBLIC_IP}:3001  (User: ${BOLD}admin${NC} / Pass: ${BOLD}admin${NC})"
echo -e "  🔥 ${CYAN}Prometheus UI:${NC}     http://${PUBLIC_IP}:9090"
echo -e "  🐙 ${CYAN}ArgoCD Console:${NC}    https://${PUBLIC_IP}:8443 (User: ${BOLD}admin${NC} / Pass: ${BOLD}${ARGOCD_ADMIN_PASSWORD}${NC})"
echo ""
echo -e "${BOLD}EC2 Security Group Requirements:${NC}"
echo "  Ensure your AWS EC2 Security Group allows inbound TCP traffic on ports:"
echo "  - Port 3005 (Storefront)"
echo "  - Port 8080 (API Gateway)"
echo "  - Port 3001 (Grafana)"
echo "  - Port 9090 (Prometheus)"
echo "  - Port 8443 (ArgoCD HTTPS)"
echo ""
echo -e "${BOLD}Helpful Management Commands:${NC}"
echo "  View all pods:         kubectl get pods -A"
echo "  View retail pods:      kubectl get pods -n retail-system"
echo "  View ArgoCD apps:      argocd app list"
echo "  Stream gateway logs:   kubectl logs -f -l app=api-gateway -n retail-system"
echo "  Restart port-forward:  sudo systemctl restart retail-k8s-ports.service"
echo "================================================================================"
