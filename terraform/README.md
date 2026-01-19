# Terraform AWS Setup for PSCVault

This folder contains the infrastructure-as-code to set up the AWS resources required for PSCVault's S3 storage integration.

## IAM & Security: Least Privilege

To follow the principle of **Least Privilege**, you should handle two distinct types of IAM users:

### 1. The Deployer User (Manual Setup)
This is the user you use to run Terraform (`terraform apply`).
- **Recommended Method**: Use **AWS CloudShell**. It is pre-authenticated and prevents you from needing to store permanent Access Keys on your computer. It also preserves your free cloud credits.
- **Permissions**: Create a custom policy in the AWS Console with the following JSON and attach it to your user/group:
```json
{
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Action": ["s3:*", "lambda:*", "apigateway:*", "iam:*", "logs:*"],
        "Resource": "*"
    }]
}
```

### 2. The App User (Terraform Managed)
This is the user the Electron application uses to talk to the API.
- **Creation**: **Automatic** (Created by these Terraform scripts).
- **Permissions**: Extremely restricted. It **only** has permission to execute the specific API Gateway created for this project.
- **Access**: Terraform will output the `app_user_access_key` and `app_user_secret_key`.

---

## Resources Created

1.  **S3 Bucket**: Stores the encrypted vault files (`.enc`).
2.  **AWS Lambda**: Handles listing, reading, and writing vaults to S3.
3.  **API Gateway**: Provides a public endpoint for the app.
4.  **IAM User**: A dedicated user for the app with restricted API access.

---

## Deployment Instructions (via AWS CloudShell)

1.  **Prepare Files**: From your project root, run this PowerShell command to create a clean zip (excluding heavy provider files):
    ```powershell
    Get-ChildItem -Path terraform -Exclude ".terraform", ".terraform.lock.hcl", "*.zip" | Compress-Archive -DestinationPath terraform.zip -Force
    ```
2.  **Upload**: Open **CloudShell** in the AWS Console and upload the zip via **Actions -> Upload file**.
3.  **Extract & Clean**:
    ```bash
    # Extract into the terraform folder (overwriting if prompted)
    unzip -o terraform.zip -d terraform/
    cd terraform
    rm -rf .terraform/ .terraform.lock.hcl ../terraform.zip
    ```
4.  **Install Terraform** (Required once PER session):
    *Note: System-wide changes like this do not persist when CloudShell restarts.*
    ```bash
    sudo yum install -y yum-utils
    sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/AmazonLinux/hashicorp.repo
    sudo yum install -y terraform
    ```
5.  **Initialize & Apply**:
    ```bash
    terraform init
    terraform apply
    ```
6.  **Retrieve Credentials**:
    After a successful apply, Terraform will output the `api_url` and `app_user_access_key`. To see the secret key (which is hidden by default), run:
    ```bash
    terraform output app_user_secret_key
    ```

## Maintenance & Persistence (AWS CloudShell)

- **What Persists**: Everything in your home directory (`/home/cloudshell-user`), including your `.tf` files, the `.terraform/` folder, and the **critical** `terraform.tfstate` file. **Do not delete the `.tfstate` file**, as it tracks your deployed infrastructure.
- **What to Re-install**: The `terraform` binary itself is not persisted in system folders. Next time you open CloudShell, you will need to re-run the **Install Terraform** block (Step 4 above).
- **Periodic Cleanup**: To stay under the 1 GB limit, occasionally run:
  ```bash
  rm ../terraform.zip
  rm -rf ~/.cache
  ```

## Security Note

Ensure you keep the generated credentials secure. Do not commit your `terraform.tfstate` file if it contains sensitive information (though it is ignored by default in `.gitignore`).
