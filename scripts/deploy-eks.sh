#!/usr/bin/env bash
set -euo pipefail

CLUSTER_NAME="retail-platform-cluster"
REGION="us-east-1"
NAMESPACE="retail-system"

echo "=================================================="
echo " Cloud-Native Retail Platform - EKS Deployment   "
echo "=================================================="

# 1. Fetch Dynamic AWS Account ID & ECR Registry
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

echo "AWS Account ID: ${ACCOUNT_ID}"
echo "ECR Registry:   ${ECR_REGISTRY}"
echo "EKS Cluster:    ${CLUSTER_NAME}"
echo "Region:         ${REGION}"
echo "=================================================="

# 2. Update kubeconfig
echo "🔌 Updating kubeconfig for cluster [${CLUSTER_NAME}]..."
aws eks update-kubeconfig --name "${CLUSTER_NAME}" --region "${REGION}"

# 3. Deploy via Helm (Preferred) or Manifests with Dynamic ECR Registry
if command -v helm &>/dev/null; then
    echo "📦 Deploying microservices via Helm..."
    helm upgrade --install retail-platform ./helm/retail-platform \
      --namespace "${NAMESPACE}" \
      --create-namespace \
      --set global.ecrRegistry="${ECR_REGISTRY}" \
      --set global.tag="latest" \
      --set ingress.enabled=true
else
    echo "📦 Applying Kubernetes manifests with dynamic ECR registry substitution..."
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/configmap-and-secrets.yaml
    kubectl apply -f k8s/databases.yaml
    kubectl apply -f k8s/monitoring.yaml

    for manifest in k8s/product-service.yaml k8s/cart-service.yaml k8s/order-service.yaml k8s/api-gateway.yaml k8s/frontend.yaml; do
        sed "s|[0-9]\{12\}\.dkr\.ecr\.[a-z0-9-]*\.amazonaws\.com|${ECR_REGISTRY}|g" "$manifest" | kubectl apply -f -
    done

    kubectl apply -f k8s/hpa.yaml
    kubectl apply -f k8s/ingress.yaml
fi

# Apply monitoring if not already applied
kubectl apply -f k8s/monitoring.yaml

echo ""
echo "⏳ Waiting for pods to initialize in namespace [${NAMESPACE}]..."
kubectl get pods -n "${NAMESPACE}"

echo ""
echo "=================================================="
echo "🎉 Deployment initiated successfully!"
echo ""
echo "🌐 Multi-Device Public Access (Internet-facing):"
echo "Retrieve your AWS Application Load Balancer DNS (accessible from ANY device):"
echo "  kubectl get ingress -n ${NAMESPACE} -o jsonpath='{.items[0].status.loadBalancer.ingress[0].hostname}'"
echo ""
echo "Local / Port-forwarding commands (single machine):"
echo "  1. View Pods:      kubectl get pods -n ${NAMESPACE}"
echo "  2. View Services:  kubectl get svc -n ${NAMESPACE}"
echo "  3. Access App:     kubectl port-forward --address 0.0.0.0 svc/retail-frontend 3005:80 -n ${NAMESPACE}"
echo "  4. Access Gateway: kubectl port-forward --address 0.0.0.0 svc/api-gateway 8080:8080 -n ${NAMESPACE}"
echo "  5. Access Grafana: kubectl port-forward --address 0.0.0.0 svc/grafana 3001:3000 -n ${NAMESPACE}"
echo "=================================================="
