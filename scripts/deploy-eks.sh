#!/usr/bin/env bash
set -euo pipefail

CLUSTER_NAME="retail-platform-cluster"
REGION="us-east-1"
NAMESPACE="retail-system"

echo "=================================================="
echo " Cloud-Native Retail Platform - EKS Deployment   "
echo "=================================================="

# Update kubeconfig
echo "🔌 Updating kubeconfig for cluster [${CLUSTER_NAME}]..."
aws eks update-kubeconfig --name "${CLUSTER_NAME}" --region "${REGION}"

# Apply manifests in dependency order
echo "📦 Applying Kubernetes manifests..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap-and-secrets.yaml
kubectl apply -f k8s/databases.yaml
kubectl apply -f k8s/monitoring.yaml
kubectl apply -f k8s/product-service.yaml
kubectl apply -f k8s/cart-service.yaml
kubectl apply -f k8s/order-service.yaml
kubectl apply -f k8s/api-gateway.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/hpa.yaml

echo ""
echo "⏳ Waiting for core pods to become ready..."
kubectl get pods -n "${NAMESPACE}"

echo ""
echo "=================================================="
echo "🎉 Deployment initiated successfully!"
echo "Useful commands:"
echo "  1. View Pods:      kubectl get pods -n ${NAMESPACE}"
echo "  2. View Services:  kubectl get svc -n ${NAMESPACE}"
echo "  3. Access App:     kubectl port-forward svc/retail-frontend 3005:80 -n ${NAMESPACE} (http://localhost:3005)"
echo "  4. Access Gateway: kubectl port-forward svc/api-gateway 8080:8080 -n ${NAMESPACE} (http://localhost:8080)"
echo "  5. Access Grafana: kubectl port-forward svc/grafana 3001:3000 -n ${NAMESPACE} (http://localhost:3001)"
echo "=================================================="
