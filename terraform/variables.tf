variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Base project name used in resource naming"
  type        = string
  default     = "retail-platform"
}

variable "vpc_cidr" {
  description = "CIDR block for the retail platform VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "eks_version" {
  description = "Kubernetes version for Amazon EKS"
  type        = string
  default     = "1.30"
}

variable "node_instance_types" {
  description = "EC2 instance types for EKS worker nodes"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "db_username" {
  description = "Master username for RDS MySQL database"
  type        = string
  default     = "retailadmin"
}

variable "db_password" {
  description = "Master password for RDS MySQL database"
  type        = string
  default     = "RetailSecurePass2026!"
  sensitive   = true
}
