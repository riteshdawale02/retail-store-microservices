# Monitoring (Prometheus & Grafana) and GitOps (ArgoCD) Guide
### Cloud-Native Retail Platform on Kubernetes / EC2

This guide walks you through deploying and configuring **Prometheus**, **Grafana**, and **ArgoCD** on your Kubernetes cluster (EC2 / K3s or EKS).

---

## 1. Network & Security Group Requirements

Before starting, ensure your AWS EC2 Security Group allows inbound traffic for the following ports:

| Port | Protocol | Purpose | Source |
|---|---|---|---|
| `3001` | TCP | Grafana Dashboard UI | `0.0.0.0/0` (or Your IP) |
| `9090` | TCP | Prometheus Query UI | `0.0.0.0/0` (or Your IP) |
| `8085` | TCP | ArgoCD Web UI (Port-forwarded) | `0.0.0.0/0` (or Your IP) |

---

## 2. Part 1: Deploy Prometheus & Grafana

The project includes pre-configured monitoring manifests under [`k8s/monitoring.yaml`](file:///Users/samir/ecom/k8s/monitoring.yaml) and pre-built Grafana dashboards under [`grafana/provisioning/`](file:///Users/samir/ecom/grafana/provisioning/).

### Step 1: Deploy Monitoring Manifests
Run the following command on your EC2 terminal:
```bash
cd ~/retail-store-microservices
kubectl apply -f k8s/monitoring.yaml
```

This provisions:
- **`prometheus-config` ConfigMap**: Scrapes `/actuator/prometheus` metrics from `api-gateway:8080`, `product-service:8081`, `cart-service:8082`, and `order-service:8083` every 10s.
- **Prometheus Deployment & Service**: ClusterIP on port `9090`.
- **Grafana Deployment & Service**: ClusterIP on port `3000` (pre-configured with default credentials `admin` / `admin`).

### Step 2: Verify Monitoring Pods
Check that Prometheus and Grafana are running:
```bash
kubectl get pods -n retail-system -l 'app in (prometheus, grafana)'
```
*Expected output: Both pods report `1/1 Running`.*

### Step 3: Expose Prometheus and Grafana
Run port-forwards bound to `0.0.0.0` in the background:
```bash
# 1. Expose Prometheus on port 9090
kubectl port-forward --address 0.0.0.0 svc/prometheus 9090:9090 -n retail-system > /tmp/prometheus.log 2>&1 &

# 2. Expose Grafana on port 3001
kubectl port-forward --address 0.0.0.0 svc/grafana 3001:3000 -n retail-system > /tmp/grafana.log 2>&1 &
```

Verify background processes:
```bash
jobs -l
```

---

## 3. Part 2: Accessing & Configuring Grafana

### Step 1: Open Grafana in Browser
Navigate to:
```text
http://<YOUR_EC2_PUBLIC_IP>:3001
```
- **Username:** `admin`
- **Password:** `admin` *(You can skip or change the password when prompted).*

### Step 2: Add Prometheus Data Source
1. In the left navigation menu, click **Connections** -> **Data sources**.
2. Click **Add data source** and select **Prometheus**.
3. In the **Prometheus server URL** field, enter:
   ```text
   http://prometheus:9090
   ```
4. Scroll to the bottom and click **Save & test**.  
   *(You should see a green notification: "Data source is working").*

### Step 3: Import Pre-built Microservices Dashboard
The project includes a ready-to-use JSON dashboard located at:
[`grafana/provisioning/dashboards/retail-microservices-dashboard.json`](file:///Users/samir/ecom/grafana/provisioning/dashboards/retail-microservices-dashboard.json)

1. In Grafana, click **Dashboards** -> **New** -> **Import**.
2. Copy and paste the contents of `retail-microservices-dashboard.json` into the import field (or upload the file).
3. Select the **Prometheus** data source configured in Step 2.
4. Click **Import**.

### What You Can Monitor:
- **JVM Heap & Non-Heap Memory** across all services.
- **HTTP Request Rates (RPS)** per microservice.
- **Response Latency (p95 & p99)**.
- **HTTP 4xx / 5xx Error Rates**.
- **CPU & Garbage Collection Pauses**.

---

## 4. Part 3: Deploy and Configure ArgoCD (GitOps)

ArgoCD continuously monitors your Git repository and automatically synchronizes Kubernetes/Helm manifests to the cluster.

### Step 1: Create Namespace and Install ArgoCD
Run on your EC2 terminal:
```bash
# 1. Create dedicated argocd namespace
kubectl create namespace argocd

# 2. Install official ArgoCD manifests
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 3. Wait for all ArgoCD components to become ready
kubectl wait --namespace argocd --for=condition=ready pod -l app.kubernetes.io/name=argocd-server --timeout=180s
```

### Step 2: Retrieve Initial Admin Password
ArgoCD generates a random password stored in a Kubernetes secret:
```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
echo ""
```
> **Save this password** — you will use it to log in to the web interface.

### Step 3: Expose ArgoCD Web UI
Start a port-forward on port `8085` bound to `0.0.0.0`:
```bash
kubectl port-forward --address 0.0.0.0 svc/argocd-server -n argocd 8085:443 > /tmp/argocd.log 2>&1 &
```

### Step 4: Access ArgoCD in Your Browser
Open your browser and navigate to:
```text
https://<YOUR_EC2_PUBLIC_IP>:8085
```
> **Note:** Because ArgoCD uses a self-signed TLS certificate by default, your browser will display a security warning. Click **Advanced -> Proceed to unsafe** to continue.

- **Username:** `admin`
- **Password:** `<The password retrieved in Step 2>`

### Step 5: Deploy the Retail Platform Application in ArgoCD
The project has a pre-configured ArgoCD Application manifest at [`argocd/application.yaml`](file:///Users/samir/ecom/argocd/application.yaml).

Apply it to the cluster:
```bash
cd ~/retail-store-microservices
kubectl apply -f argocd/application.yaml
```

### Step 6: Verify GitOps Synchronization
1. Open the ArgoCD Web UI.
2. You will see an application named **`cloud-retail-platform`**.
3. Click on the application card to inspect the real-time resource tree:
   - Deployments, Pods, Services, PVCs, ConfigMaps, and Secrets.
4. If the status is `OutOfSync`, click **Sync** -> **Synchronize** to trigger reconciliation.

---

## 5. Complete Access Summary Table

Assuming your EC2 Public IP is `54.237.204.247`:

| Application | Access URL | Default Credentials |
|---|---|---|
| **Retail Storefront UI** | `http://54.237.204.247:3005` | N/A |
| **API Gateway** | `http://54.237.204.247:8080/actuator/health` | N/A |
| **Grafana Dashboards** | `http://54.237.204.247:3001` | `admin` / `admin` |
| **Prometheus Query UI** | `http://54.237.204.247:9090` | N/A |
| **ArgoCD GitOps UI** | `https://54.237.204.247:8085` | `admin` / `<argocd-secret>` |

---

## 6. One-Line Background Port Forward Startup Script

If you reboot your EC2 instance or reconnect via SSH, run this single block to restore all port forwards:

```bash
# Stop any stale port-forwards
pkill -f "port-forward" 2>/dev/null || true

# Launch all service port-forwards in background
kubectl port-forward --address 0.0.0.0 svc/retail-frontend 3005:80 -n retail-system > /tmp/retail-frontend.log 2>&1 &
kubectl port-forward --address 0.0.0.0 svc/api-gateway 8080:8080 -n retail-system > /tmp/retail-api.log 2>&1 &
kubectl port-forward --address 0.0.0.0 svc/grafana 3001:3000 -n retail-system > /tmp/grafana.log 2>&1 &
kubectl port-forward --address 0.0.0.0 svc/prometheus 9090:9090 -n retail-system > /tmp/prometheus.log 2>&1 &
kubectl port-forward --address 0.0.0.0 svc/argocd-server 8085:443 -n argocd > /tmp/argocd.log 2>&1 &

echo "✅ All port forwards started successfully!"
```
