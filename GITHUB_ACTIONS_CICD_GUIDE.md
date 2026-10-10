# GitHub Actions CI/CD Pipeline Guide
### Cloud-Native Retail Platform Microservices

This document details the automated **Continuous Integration (CI)** and **Continuous Deployment (CD)** pipelines configured for the Retail Microservices Platform using GitHub Actions, Amazon ECR, Amazon EKS, Helm, and ArgoCD.

---

## 1. Pipeline Architecture Overview

The repository implements a two-tier pipeline architecture designed for high code quality, security, and zero-downtime deployment:

```mermaid
flowchart TD
    subgraph Developer Trigger
        DEV[Developer Git Push / PR] --> GITHUB[GitHub Repository]
    end

    subgraph CI Stage [ci.yaml]
        GITHUB --> IAC[IaC Linting: Terraform, Helm, K8s]
        GITHUB --> FRONT_CI[Frontend CI: Oxlint, Vitest, Vite Build]
        GITHUB --> BACK_CI[Backend CI: Java 17, Maven Tests Matrix]
        FRONT_CI --> DOCKER_VAL[Docker Buildx Cache & Verification]
        BACK_CI --> DOCKER_VAL
    end

    subgraph CD Stage [ci-cd.yaml - On Main Push]
        DOCKER_VAL --> ECR_LOGIN[Authenticate to Amazon ECR]
        ECR_LOGIN --> ECR_PUSH[Build & Tag Images with Git SHA & latest]
        ECR_PUSH --> HELM_DEPLOY[Helm Upgrade to Amazon EKS]
        HELM_DEPLOY --> ARGOCD[ArgoCD GitOps Reconciliation]
    end
```

---

## 2. Pipeline Workflows Breakdown

### Workflow 1: Continuous Integration (`.github/workflows/ci.yaml`)
- **Triggers**:
  - `push` to `main`, `develop`, and `feature/*`
  - `pull_request` targeting `main`
  - `workflow_dispatch` (Manual trigger)
- **Concurrency**: Automatically cancels in-progress runs when new commits are pushed to the same branch (`cancel-in-progress: true`).

#### Jobs Executed:
1. **`iac-validation` (Infrastructure as Code Linting)**:
   - Validates Terraform code using `terraform fmt -check` and `terraform validate`.
   - Lints Helm charts using `helm lint ./helm/retail-platform`.
   - Validates all Kubernetes YAML manifest syntax in `k8s/*.yaml` via `js-yaml`.

2. **`frontend-ci` (React Storefront Verification)**:
   - Sets up Node.js 20 with cached `npm` dependencies.
   - Runs fast code linting via `oxlint`.
   - Executes automated unit tests via `Vitest`.
   - Builds optimized static assets via `Vite`.

3. **`backend-microservices-ci` (Spring Boot Matrix Testing)**:
   - Uses a parallel build matrix for:
     - `product-service`
     - `cart-service`
     - `order-service`
     - `api-gateway`
   - Sets up Eclipse Temurin JDK 17 with Maven caching.
   - Runs unit tests with Maven Surefire.
   - Packages Spring Boot executable `.jar` files.
   - Uploads Surefire test reports as downloadable GitHub artifacts.

4. **`docker-build-verification` (Container Build Validation)**:
   - Validates that all multi-stage Dockerfiles compile cleanly using Docker Buildx.
   - Uses GitHub Actions cache (`type=gha`) to accelerate subsequent builds.

---

### Workflow 2: Continuous Delivery (`.github/workflows/ci-cd.yaml`)
- **Triggers**:
  - `push` to `main` branch.
- **Purpose**: Builds production container images, pushes them to Amazon ECR, and executes a rolling update on Amazon EKS.

#### Jobs Executed:
1. **`test-and-build`**:
   - Compiles and verifies all 4 Spring Boot microservices.

2. **`docker-build-push`**:
   - Authenticates to AWS via `aws-actions/configure-aws-credentials@v4`.
   - Logs in to Amazon ECR via `aws-actions/amazon-ecr-login@v2`.
   - Builds container images for all 5 components:
     - `retail/product-service`
     - `retail/cart-service`
     - `retail/order-service`
     - `retail/api-gateway`
     - `retail/frontend`
   - Tags each container with two tags:
     - `latest`
     - `${{ github.sha }}` (Immutable Git commit SHA for auditability and rollback).
   - Pushes images directly to Amazon ECR.

3. **`deploy-eks`**:
   - Updates local kubeconfig for Amazon EKS (`retail-platform-cluster`).
   - Executes zero-downtime rolling upgrade using Helm:
     ```bash
     helm upgrade --install retail-platform ./helm/retail-platform \
       --namespace retail-system \
       --create-namespace \
       --set global.ecrRegistry=$ECR_REGISTRY \
       --set global.tag=${{ github.sha }}
     ```

---

## 3. Required GitHub Repository Secrets

For the CD pipeline (`ci-cd.yaml`) to authenticate with AWS and push to ECR/EKS, configure the following secrets in your GitHub repository:

### How to Add Secrets:
1. Go to your repository on GitHub: `https://github.com/riteshdawale02/retail-store-microservices`
2. Navigate to **Settings** -> **Secrets and variables** -> **Actions**.
3. Click **New repository secret** for each of the following:

| Secret Name | Description | Example Value |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | IAM User Access Key with ECR & EKS permissions | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | IAM User Secret Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_ACCOUNT_ID` | Your 12-digit AWS Account ID | `592306540354` |

---

## 4. How to Monitor Pipeline Execution

### View Real-Time Workflow Runs
1. Open your browser and navigate to:
   ```text
   https://github.com/riteshdawale02/retail-store-microservices/actions
   ```
2. You will see active and past runs for both:
   - **Continuous Integration (CI)**
   - **Cloud Retail CI/CD Pipeline**
3. Click on any workflow run to inspect live logs for each individual step.

### Testing the Pipeline Manually
You can test the pipeline anytime with a Git commit:
```bash
# Make a minor change (e.g., in README or frontend)
git add .
git commit -m "feat: trigger automated CI/CD pipeline"
git push origin main
```

---

## 5. Integrating with ArgoCD GitOps

You can choose between two deployment strategies:

1. **Direct Helm Upgrade from GitHub Actions (Push-based)**:
   - Managed automatically by job `deploy-eks` in `.github/workflows/ci-cd.yaml`.
2. **GitOps with ArgoCD (Pull-based)**:
   - ArgoCD monitors the repository's `helm/retail-platform` directory.
   - When a commit updates image tags or values in Git, ArgoCD automatically reconciles the EKS cluster to match the Git state.

---

## 6. Troubleshooting Common Pipeline Errors

| Error | Root Cause | Solution |
|---|---|---|
| `Error: Credentials could not be loaded` | Missing or incorrect GitHub Secrets | Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are saved in GitHub Repository Settings. |
| `repository retail/... does not exist` | ECR repository not yet created | Run `aws ecr create-repository --repository-name retail/<service>` or run `terraform apply`. |
| `User is not authorized to perform: eks:DescribeCluster` | IAM User lacks RBAC permissions on EKS | Ensure the IAM user has `eks:DescribeCluster` and is mapped in `aws-auth` ConfigMap. |
| `npm run lint` or `mvn test` failed | Code style violation or broken test | Inspect the specific failing test logs in GitHub Actions, fix locally, and push a new commit. |
