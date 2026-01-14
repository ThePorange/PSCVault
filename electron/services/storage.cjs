const fs = require('fs').promises;
const path = require('path');
const { app } = require('electron');
const { encrypt, decrypt } = require('./crypto.cjs');

const USER_DATA_PATH = app.getPath('userData');
const VAULT_FILE_PATH = path.join(USER_DATA_PATH, 'vault.enc');

/**
 * Saves the store to disk.
 * @param {object[]} items - List of credentials
 * @param {string} password - Master password
 * @param {string} [filePath] - Optional custom path (use default if null)
 */
async function saveVault(items, password, filePath = null, returnBuffer = false) {
    const targetPath = filePath || VAULT_FILE_PATH;
    // 1. Encrypt the new data first
    const data = {
        updatedAt: new Date().toISOString(),
        items: items
    };
    const encryptedParams = await encrypt(data, password);

    if (returnBuffer) {
        return { success: true, buffer: encryptedParams };
    }

    if (filePath !== 'TEMP_FOR_ENCRYPTION') {
        // 2. Backup the EXISTING file if it exists
        try {
            await fs.access(targetPath);
            const backupPath = `${targetPath}.bak`;
            await fs.copyFile(targetPath, backupPath);
        } catch (e) { }

        // 3. Write the new file
        await fs.writeFile(targetPath, encryptedParams);
    }

    return { success: true, path: targetPath, buffer: encryptedParams };
}

/**
 * Loads the vault from disk.
 * @param {string} password - Master password
 * @param {string} [filePath] - Optional custom path
 * @returns {Promise<object>} The vault data
 */
async function loadVault(password, filePathOrBuffer = null) {
    let buffer;
    // Check if we were passed a buffer directly OR an object containing a buffer (from S3)
    if (Buffer.isBuffer(filePathOrBuffer)) {
        buffer = filePathOrBuffer;
    } else if (filePathOrBuffer && typeof filePathOrBuffer === 'object' && filePathOrBuffer.buffer) {
        // If it's a raw Uint8Array/Buffer from the renderer, wrap it to be sure
        buffer = Buffer.from(filePathOrBuffer.buffer);
    } else {
        const targetPath = filePathOrBuffer || VAULT_FILE_PATH;
        try {
            await fs.access(targetPath);
        } catch {
            return { items: [] };
        }
        buffer = await fs.readFile(targetPath);
    }

    const data = await decrypt(buffer, password);
    return data;
}

/**
 * Checks if a vault exists.
 * @param {string} [filePath] - Optional custom path
 */
async function vaultExists(filePath) {
    const targetPath = filePath || VAULT_FILE_PATH;
    try {
        await fs.access(targetPath);
        return true;
    } catch {
        return false;
    }
}

async function deleteFile(filePath) {
    if (!filePath) throw new Error("File path required");
    await fs.unlink(filePath);
    // Also try to delete backup if exists
    try {
        await fs.unlink(`${filePath}.bak`);
    } catch (e) {
        // Ignore if backup doesn't exist
    }
}

module.exports = { saveVault, loadVault, vaultExists, deleteFile };
