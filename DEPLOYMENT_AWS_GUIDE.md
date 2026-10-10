# Complete AWS Hosting & Deployment Guide
### Cloud-Native Retail Platform Using Microservices
**Authors:** Samir Anil Dhavane, Ritesh Dhammanand Dawale, Gauri Vinod Taksande, Achal Sachin Ghosalkar  
**Department of Computer Science – BCA Semester V Capstone Project**

---

## Overview

This guide walks you through deploying the complete Cloud-Native Retail Platform on **Amazon Web Services (AWS)** using **Terraform**, **Amazon EKS**, **Amazon ECR**, **Amazon RDS MySQL**, **Amazon ElastiCache Redis**, and **Argo CD / GitHub Actions**.

---

## 1. Prerequisites & Tooling

Ensure the following tools are installed on your local machine:
1. **AWS CLI** (`aws --version`) – Installed
2. **Terraform CLI** (`terraform --version`) – Installed
3. **Kubectl** (`kubectl version --client`) – Installed
4. **Helm 3** (`helm version`) – Installed
5. **Docker** (`docker --version`)
6. **Java 17 & Maven** (`mvn -version`) – Installed

---

## 2. Phase 1: AWS Authentication Setup

Authenticate your terminal session with your AWS account credentials:

```bash
aws configure
# Enter your:
# AWS Access Key ID: <YOUR_ACCESS_KEY>
# AWS Secret Access Key: <YOUR_SECRET_KEY>
# Default region name: us-east-1
# Default output format: json
```

Verify authentication:
```bash
aws sts get-caller-identity
```

---

## 3. Phase 2: Provision Cloud Infrastructure with Terraform

Navigate into the `terraform/` directory:

```bash
cd /Users/samir/ecom/terraform

# Copy example variables
cp terraform.tfvars.example terraform.tfvars

# (Optional) Customize variables such as db_password or aws_region in terraform.tfvars
```

Initialize and review the execution plan:
```bash
terraform init
terraform plan
```

Deploy the infrastructure to AWS:
```bash
terraform apply -auto-approve
```

> **Note:** Terraform will provision:
> - Multi-AZ VPC (`10.0.0.0/16`) with public and private subnets, NAT Gateway, and Internet Gateway.
> - Amazon EKS Managed Kubernetes Cluster (v1.30) and worker nodes.
> - 4 Amazon ECR Repositories (`retail/product-service`, `retail/cart-service`, `retail/order-service`, `retail/api-gateway`).
> - Amazon RDS MySQL instance (`retail-mysql`).
> - Amazon ElastiCache Redis cluster (`retail-redis`).
> - Security Groups and IAM Roles for Service Accounts (IRSA).
> 
> *Estimated execution time: 12–15 minutes.*

Once finished, save the outputs:
```bash
terraform output
```

---

## 4. Phase 3: Connect Kubectl to Amazon EKS

Run the outputted command to fetch the kubeconfig:

```bash
aws eks update-kubeconfig --name retail-platform-cluster --region us-east-1
```

Verify your cluster connectivity:
```bash
kubectl get nodes -o wide
```

Create the application namespace:
```bash
kubectl apply -f /Users/samir/ecom/k8s/namespace.yaml
```

---

## 5. Phase 4: Install AWS Load Balancer Controller

The AWS Load Balancer Controller provisions AWS ALBs automatically when Kubernetes Ingress resources are created.

```bash
# 1. Download IAM policy for AWS Load Balancer Controller
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.7.2/docs/install/iam_policy.json

# 2. Create IAM policy in AWS
aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json

# 3. Associate OIDC provider with your cluster
eksctl utils associate-iam-oidc-provider --region=us-east-1 --cluster=retail-platform-cluster --approve

# 4. Create IAM Service Account for the controller
eksctl create iamserviceaccount \
  --cluster=retail-platform-cluster \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --attach-policy-arn=arn:aws:iam::<YOUR_AWS_ACCOUNT_ID>:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve

# 5. Install controller using Helm
helm repo add eks https://aws.github.io/eks-charts
helm repo update eks
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=retail-platform-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

---

## 6. Phase 5: Build & Push Microservices to Amazon ECR

Log in to your Amazon ECR registry:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"
REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $REGISTRY
```

### Build & Push Each Microservice:

```bash
cd /Users/samir/ecom

# 1. Product Service
docker build -t $REGISTRY/retail/product-service:latest ./product-service
docker push $REGISTRY/retail/product-service:latest

# 2. Cart Service
docker build -t $REGISTRY/retail/cart-service:latest ./cart-service
docker push $REGISTRY/retail/cart-service:latest

# 3. Order Service
docker build -t $REGISTRY/retail/order-service:latest ./order-service
docker push $REGISTRY/retail/order-service:latest

# 4. API Gateway & Storefront
docker build -t $REGISTRY/retail/api-gateway:latest ./api-gateway
docker push $REGISTRY/retail/api-gateway:latest
```

---

## 7. Phase 6: Deploy Application to EKS

### Option A: Deploy via Helm (Recommended)
```bash
helm upgrade --install retail-platform ./helm/retail-platform \
  --namespace retail-system \
  --create-namespace \
  --set global.ecrRegistry=$REGISTRY \
  --set global.tag=latest
```

### Option B: Deploy via Kubernetes Manifests
Update the image URLs in `k8s/*.yaml` with your `$REGISTRY` address, then run:
```bash
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Storage: Persistent Volumes and Claims
kubectl apply -f k8s/storage.yaml

# 3. Configuration & Secrets
kubectl apply -f k8s/configmap-and-secrets.yaml

# 4. Databases (MySQL with auto-init ConfigMap & Redis)
kubectl apply -f k8s/databases.yaml

# 5. Microservices & Ingress
kubectl apply -f k8s/product-service.yaml
kubectl apply -f k8s/cart-service.yaml
kubectl apply -f k8s/order-service.yaml
kubectl apply -f k8s/api-gateway.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml
```

Verify all pods are running and healthy:
```bash
kubectl get pods -n retail-system -w
kubectl get services -n retail-system
kubectl get ingress -n retail-system
```

---

## 8. Phase 7: Accessing the Application

Retrieve the public address of your AWS Application Load Balancer:

```bash
kubectl get ingress -n retail-system retail-alb-ingress
```

Look for the `ADDRESS` field (e.g. `k8s-retailsy-retailal-xxxx.us-east-1.elb.amazonaws.com`).

Open this URL in your browser:
- Storefront UI: `http://<ALB-ADDRESS>/`
- Live Health Telemetry: `http://<ALB-ADDRESS>/api/system/health`
- Product Catalog API: `http://<ALB-ADDRESS>/api/products`

*(Optional)* In **AWS Route 53**, create a `CNAME` or `A Alias` record pointing `retail.yourdomain.com` to the ALB DNS name and attach an ACM certificate for HTTPS.

---

## 9. Phase 8: Setting Up GitOps with Argo CD

1. Install Argo CD on your EKS cluster:
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

2. Access the Argo CD UI:
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Retrieve default admin password:
argocd admin initial-password -n argocd
```

3. Deploy the application CRD:
```bash
kubectl apply -f argocd/application.yaml
```
Argo CD will continuously sync git commits to your EKS cluster with zero downtime!

---

## 10. Phase 9: Automated CI/CD via GitHub Actions

1. Push this repository to GitHub:
```bash
git init
git add .
git commit -m "feat: complete cloud-native retail microservices platform"
git remote add origin https://github.com/riteshdawale02/retail-store-microservices.git
git branch -M main
git push -u origin main
```

2. In GitHub Repository **Settings > Secrets and variables > Actions**, add:
   - `AWS_ACCESS_KEY_ID`: Your IAM user access key
   - `AWS_SECRET_ACCESS_KEY`: Your IAM secret key
   - `AWS_ACCOUNT_ID`: Your 12-digit AWS account number

Whenever you push code changes to `main`, GitHub Actions will build, test, package, push to ECR, and roll out the update to Amazon EKS!

---

## 11. Cost Management & Infrastructure Teardown

To avoid incurring ongoing AWS charges when you finish testing or demonstrating the project:

```bash
# 1. Delete Kubernetes Ingress (to release the ALB)
kubectl delete ingress retail-alb-ingress -n retail-system

# 2. Destroy cloud infrastructure with Terraform
cd /Users/samir/ecom/terraform
terraform destroy -auto-approve
```
