data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/lambda/index.mjs"
  output_path = "${path.module}/lambda_function_payload.zip"
}

resource "aws_lambda_function" "vault_handler" {
  filename      = data.archive_file.lambda_zip.output_path
  function_name = "${var.app_name}-handler"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"

  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      BUCKET_NAME = aws_s3_bucket.vault_storage.id
    }
  }
}

resource "aws_iam_role" "lambda_role" {
  name = "${var.app_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.app_name}-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket",
          "s3:DeleteObject"
        ]
        Effect   = "Allow"
        Resource = [
          aws_s3_bucket.vault_storage.arn,
          "${aws_s3_bucket.vault_storage.arn}/*"
        ]
      },
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# API Gateway Integrations
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.vault_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.vault_handler.invoke_arn
}

resource "aws_apigatewayv2_route" "list_vaults" {
  api_id             = aws_apigatewayv2_api.vault_api.id
  route_key          = "GET /vaults"
  target             = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
  authorization_type = "AWS_IAM"
}

resource "aws_apigatewayv2_route" "get_vault" {
  api_id             = aws_apigatewayv2_api.vault_api.id
  route_key          = "GET /vaults/{name}"
  target             = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
  authorization_type = "AWS_IAM"
}

resource "aws_apigatewayv2_route" "put_vault" {
  api_id             = aws_apigatewayv2_api.vault_api.id
  route_key          = "PUT /vaults/{name}"
  target             = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
  authorization_type = "AWS_IAM"
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.vault_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.vault_api.execution_arn}/*/*"
}
