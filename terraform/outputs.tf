output "vpc_id" {
  description = "VPC ID where retail platform resources are hosted"
  value       = aws_vpc.main.id
}

output "eks_cluster_name" {
  description = "Name of the Amazon EKS cluster"
  value       = aws_eks_cluster.main.name
}

output "eks_cluster_endpoint" {
  description = "Kubernetes API server endpoint"
  value       = aws_eks_cluster.main.endpoint
}

output "ecr_repository_urls" {
  description = "URLs of the Amazon ECR repositories"
  value       = { for k, v in aws_ecr_repository.services : k => v.repository_url }
}

output "rds_mysql_endpoint" {
  description = "RDS MySQL connection endpoint"
  value       = aws_db_instance.mysql.endpoint
}

output "elasticache_redis_endpoint" {
  description = "ElastiCache Redis primary address"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}

output "kubectl_connection_command" {
  description = "Command to configure kubectl to access EKS cluster"
  value       = "aws eks update-kubeconfig --name ${aws_eks_cluster.main.name} --region ${var.aws_region}"
}
