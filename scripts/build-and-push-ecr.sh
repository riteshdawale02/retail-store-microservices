#!/usr/bin/env bash
set -euo pipefail

# Configuration
REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
PLATFORM="linux/amd64" # EKS nodes are x86_64 t3.medium

echo "=================================================="
echo " Cloud-Native Retail Platform - ECR Build & Push  "
echo "=================================================="
echo "AWS Account ID: ${ACCOUNT_ID}"
echo "Region:         ${REGION}"
echo "Registry:       ${ECR_REGISTRY}"
echo "Target Arch:    ${PLATFORM}"
echo "=================================================="

# Check Docker daemon
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please open Docker Desktop and try again."
    exit 1
fi

# Log in to Amazon ECR
echo "🔐 Logging in to Amazon ECR..."
aws ecr get-login-password --region "${REGION}" | docker login --username AWS --password-stdin "${ECR_REGISTRY}"
echo "✅ Authenticated to ECR successfully."

# List of microservices to build and push
SERVICES=(
    "retail/api-gateway:./api-gateway"
    "retail/product-service:./product-service"
    "retail/cart-service:./cart-service"
    "retail/order-service:./order-service"
    "retail/frontend:./frontend"
)

# Ensure ECR repo exists for frontend
aws ecr describe-repositories --repository-names "retail/frontend" --region "${REGION}" >/dev/null 2>&1 || \
    aws ecr create-repository --repository-name "retail/frontend" --region "${REGION}" >/dev/null

for item in "${SERVICES[@]}"; do
    REPO_NAME="${item%%:*}"
    SERVICE_DIR="${item##*:}"
    IMAGE_URI="${ECR_REGISTRY}/${REPO_NAME}:latest"

    echo ""
    echo "📦 Building [${REPO_NAME}] from [${SERVICE_DIR}] for ${PLATFORM}..."
    docker buildx build --platform "${PLATFORM}" -t "${IMAGE_URI}" "${SERVICE_DIR}" --load

    echo "🚀 Pushing [${IMAGE_URI}]..."
    docker push "${IMAGE_URI}"
    echo "✅ [${REPO_NAME}] successfully pushed to ECR!"
done

echo ""
echo "=================================================="
echo "🎉 All container images pushed to ECR successfully!"
echo "You can now run: ./scripts/deploy-eks.sh"
echo "=================================================="
