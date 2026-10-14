locals {
  services = [
    "retail/product-service",
    "retail/cart-service",
    "retail/order-service",
    "retail/api-gateway",
    "retail/frontend"
  ]
}

resource "aws_ecr_repository" "services" {
  for_each             = toset(local.services)
  name                 = each.key
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = each.key
  }
}
