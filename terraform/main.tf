resource "aws_s3_bucket" "vault_storage" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_public_access_block" "vault_storage" {
  bucket = aws_s3_bucket.vault_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# IAM User for the Electron App to interact with the API
resource "aws_iam_user" "app_user" {
  name = "${var.app_name}-app-user"
}

resource "aws_iam_access_key" "app_user" {
  user = aws_iam_user.app_user.name
}

# Policy for the app user to invoke API Gateway (if we use API keys/Authorizers)
# Or just a policy to allow the Lambda to access S3.
# The Electron app will likely use API Gateway URL. 
# We should secure the API Gateway. Using an API Key is a simple way.

resource "aws_apigatewayv2_api" "vault_api" {
  name          = "${var.app_name}-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.vault_api.id
  name        = "$default"
  auto_deploy = true
}

# Outputs
output "s3_bucket_name" {
  value = aws_s3_bucket.vault_storage.id
}

output "api_url" {
  value = aws_apigatewayv2_api.vault_api.api_endpoint
}

output "app_user_access_key" {
  value = aws_iam_access_key.app_user.id
}

output "app_user_secret_key" {
  value     = aws_iam_access_key.app_user.secret
  sensitive = true
}
