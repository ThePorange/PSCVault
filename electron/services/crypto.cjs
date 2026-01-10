const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const SALT_LENGTH = 16;
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16;

/**
 * Derives a key from the master password using scrypt.
 * @param {string} password 
 * @param {Buffer} salt 
 * @returns {Promise<Buffer>}
 */
function deriveKey(password, salt) {
    return new Promise((resolve, reject) => {
        // N=16384, r=8, p=1 are standard good parameters for scrypt
        crypto.scrypt(password, salt, KEY_LENGTH, { N: 16384 }, (err, derivedKey) => {
            if (err) reject(err);
            else resolve(derivedKey);
        });
    });
}

/**
 * Encrypts data.
 * Format: [salt(16)][iv(12)][tag(16)][ciphertext(variable)]
 * @param {object} data - The JSON object to encrypt
 * @param {string} password - Master password
 * @returns {Promise<Buffer>}
 */
async function encrypt(data, password) {
    const json = JSON.stringify(data);
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = await deriveKey(password, salt);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, tag, encrypted]);
}

/**
 * Decrypts data.
 * @param {Buffer} buffer - The encrypted buffer
 * @param {string} password - Master password
 * @returns {Promise<object>} - Decrypted JSON object
 */
async function decrypt(buffer, password) {
    try {
        const salt = buffer.subarray(0, SALT_LENGTH);
        const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
        const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
        const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

        const key = await deriveKey(password, salt);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return JSON.parse(decrypted.toString('utf8'));
    } catch (error) {
        throw new Error('Decryption Failed: Invalid Password or Corrupted File');
    }
}

module.exports = { encrypt, decrypt };
