variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "pscvault"
}

variable "bucket_name" {
  description = "Name of the S3 bucket for vaults"
  type        = string
  default     = "pscvault-storage-roaming" # User should change this
}
