# PSCVault

PSCVault is a secure, local password manager application built with Electron and React.

## Features

- **Local Storage**: All data is encrypted and stored locally on your device.
- **Secure Encryption**: Uses AES-GCM encryption for all sensitive fields.
- **Password Generator**: Customisable password generator with options for length, character sets, and exclusions.
- **Multiple Vaults**: Support for creating and managing multiple vault files.
- **Cross-Platform**: Runs on Windows and macOS.

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

PSCVault does not sync your passwords to the cloud. You are responsible for backing up your vault files.
