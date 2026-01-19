# PSCVault

PSCVault is a secure, local password manager application built with Electron and React.

## Features

- **Local Storage**: All data is encrypted and stored locally on your device.
- **Secure Encryption**: Uses AES-GCM encryption for all sensitive fields.
- **Password Generator**: Customisable password generator with options for length, character sets, and exclusions.
- **Cloud Storage (AWS)**: Optional S3 integration for cloud-based vault storage via API Gateway.
- **Multiple Vaults**: Support for creating and managing multiple vault files locally or in the cloud.
- **Backup & Restore**: Easily download cloud vaults for local backup or restore local backups to the cloud.
- **Cross-Platform**: Runs on Windows and macOS.

## Cloud Setup (AWS)

The `aws` branch introduces AWS S3 integration. To set up the infrastructure:

1.  Navigate to the `terraform/` directory.
2.  Follow the instructions in `terraform/README.md` to deploy your S3 bucket and API Gateway.
3.  Once deployed, open PSCVault and click "☁️ Setup Cloud Storage" to enter your API credentials.

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

## Security

PSCVault uses AES-GCM encryption with a PBKDF2 derived key. When using Cloud Storage, your vault remains encrypted locally before being transmitted to AWS. Communication with AWS is secured using SigV4 signing.
