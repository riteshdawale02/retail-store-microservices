#!/usr/bin/env bash
# ==============================================================================
# CloudRetail - Local CI Verification Pipeline
# Runs all Continuous Integration checks matching GitHub Actions CI runner.
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}  Starting CloudRetail Local CI Verification Suite     ${NC}"
echo -e "${BLUE}======================================================${NC}\n"

# 1. IaC & Manifest Verification
echo -e "${YELLOW}[1/5] Checking Terraform IaC & Helm Charts...${NC}"
cd terraform
terraform fmt -check
terraform validate
cd ..
helm lint ./helm/retail-platform
echo -e "${GREEN}✔ IaC & Helm linting passed!${NC}\n"

# 2. Kubernetes Manifests Syntax Check
echo -e "${YELLOW}[2/5] Validating Kubernetes Manifests...${NC}"
for f in k8s/*.yaml; do
  npx --yes js-yaml "$f" > /dev/null
  echo "  ✔ $f syntax valid"
done
echo -e "${GREEN}✔ Kubernetes manifests syntax passed!${NC}\n"

# 3. Frontend CI (Lint, Test, Build)
echo -e "${YELLOW}[3/5] Running Frontend CI (React Vite)...${NC}"
cd frontend
npm run lint
npm test
npm run build
cd ..
echo -e "${GREEN}✔ Frontend CI passed!${NC}\n"

# 4. Backend Microservices Unit Tests & Build
echo -e "${YELLOW}[4/5] Running Backend Microservices Unit Tests...${NC}"
SERVICES=("product-service" "cart-service" "order-service" "api-gateway")

for SVC in "${SERVICES[@]}"; do
  echo -e "  --> Testing ${SVC}..."
  (cd "$SVC" && mvn test -B --quiet)
  echo -e "  ✔ ${SVC} unit tests passed!"
done
echo -e "${GREEN}✔ All Backend Microservices tests passed!${NC}\n"

# 5. Summary
echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}  ALL CONTINUOUS INTEGRATION CHECKS PASSED!           ${NC}"
echo -e "${BLUE}======================================================${NC}"
