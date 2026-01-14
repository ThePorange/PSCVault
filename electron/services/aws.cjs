const aws4 = require('aws4');
const { URL } = require('url');

/**
 * Sends a signed request to the AWS API Gateway.
 * @param {string} method - HTTP method (GET, PUT, etc.)
 * @param {string} endpoint - API Gateway endpoint URL
 * @param {string} path - Resource path (e.g., /vaults)
 * @param {object} credentials - { accessKeyId, secretAccessKey, region }
 * @param {any} body - Request body
 */
async function signedRequest(method, endpoint, path, credentials, body = null) {
    const url = new URL(endpoint);
    const host = url.hostname;
    const region = credentials.region || 'us-east-1';

    let opts = {
        host: host,
        path: path,
        method: method,
        service: 'execute-api',
        region: region,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        // Robust binary check for data coming from renderer or main
        if (Buffer.isBuffer(body) || body instanceof Uint8Array || (typeof body === 'object' && body.type === 'Buffer')) {
            opts.body = Buffer.from(body);
            opts.headers['Content-Type'] = 'application/octet-stream';
        } else {
            opts.body = JSON.stringify(body);
        }
    }

    aws4.sign(opts, {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
    });

    const fullUrl = `${endpoint}${path.startsWith('/') ? '' : '/'}${path}`;

    const fetchOpts = {
        method: method,
        headers: opts.headers,
    };

    if (body) {
        fetchOpts.body = opts.body;
    }

    const response = await fetch(fullUrl, fetchOpts);

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`AWS Request Failed: ${response.status} - ${errText}`);
    }

    if (response.headers.get('content-type')?.includes('application/octet-stream')) {
        return Buffer.from(await response.arrayBuffer());
    }

    return await response.json();
}

/**
 * Logic for S3 vault operations via the signed API
 */
const awsService = {
    async listVaults(config) {
        const { endpoint, credentials } = config;
        return await signedRequest('GET', endpoint, '/vaults', credentials);
    },

    async getVault(name, config) {
        const { endpoint, credentials } = config;
        // The API returns the file as octet-stream (base64 decoded by Lambda proxy)
        const response = await signedRequest('GET', endpoint, `/vaults/${encodeURIComponent(name)}`, credentials);
        return response; // This should be a Buffer
    },

    async putVault(name, data, config) {
        const { endpoint, credentials } = config;
        return await signedRequest('PUT', endpoint, `/vaults/${encodeURIComponent(name)}`, credentials, data);
    },

    async deleteVault(name, config) {
        const { endpoint, credentials } = config;
        return await signedRequest('DELETE', endpoint, `/vaults/${encodeURIComponent(name)}`, credentials);
    }
};

module.exports = awsService;
