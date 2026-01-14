resource "aws_iam_user_policy" "api_access" {
  name = "${var.app_name}-api-access"
  user = aws_iam_user.app_user.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = "execute-api:Invoke"
        Effect   = "Allow"
        Resource = "${aws_apigatewayv2_api.vault_api.execution_arn}/*"
      }
    ]
  })
}
