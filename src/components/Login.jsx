import React, { useState, useEffect } from 'react';

export default function Login({ onUnlock, vaultPath, awsConfig, onOpenSettings }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isNewUser, setIsNewUser] = useState(false);

    useEffect(() => {
        async function checkVault() {
            if (awsConfig) {
                try {
                    const response = await window.electronAPI.listS3Vaults({
                        endpoint: awsConfig.endpoint,
                        credentials: {
                            accessKeyId: awsConfig.accessKeyId,
                            secretAccessKey: awsConfig.secretAccessKey,
                            region: awsConfig.region
                        }
                    });
                    const target = vaultPath || 'vault.enc';
                    setIsNewUser(!response.vaults.includes(target));
                } catch (e) {
                    console.error("Failed to list S3 vaults", e);
                    setError("Cloud connection failed. Check settings.");
                    setIsNewUser(false);
                }
            } else {
                const exists = await window.electronAPI.vaultExists(vaultPath);
                setIsNewUser(!exists);
            }
        }
        checkVault();
    }, [vaultPath, awsConfig]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password) return;

        try {
            const target = vaultPath || 'vault.enc';
            const config = awsConfig ? {
                endpoint: awsConfig.endpoint,
                credentials: {
                    accessKeyId: awsConfig.accessKeyId,
                    secretAccessKey: awsConfig.secretAccessKey,
                    region: awsConfig.region
                }
            } : null;

            if (isNewUser) {
                // Create new vault
                if (awsConfig) {
                    // S3 creation
                    const result = await window.electronAPI.saveVault([], password, 'TEMP_FOR_ENCRYPTION');
                    // Upload the buffer to S3
                    await window.electronAPI.putS3Vault(target, result.buffer, config);
                } else {
                    await window.electronAPI.saveVault([], password, vaultPath);
                }
                onUnlock([], password);
            } else {
                // Load existing
                if (awsConfig) {
                    const buffer = await window.electronAPI.getS3Vault(target, config);
                    // decrypt it
                    const items = await window.electronAPI.loadVault(password, { buffer }); // I need to update loadVault
                    if (items) {
                        onUnlock(items.items, password);
                    } else {
                        throw new Error('Invalid Password');
                    }
                } else {
                    const data = await window.electronAPI.loadVault(password, vaultPath);
                    if (data.items) {
                        onUnlock(data.items, password);
                    } else {
                        throw new Error('Invalid Password');
                    }
                }
            }
        } catch (err) {
            console.error(err);
            setError('Incorrect Password or Cloud Error');
        }
    };

    return (
        <div className="center-container">
            <div className="glass-panel" style={{ width: '400px' }}>
                <h1 style={{ marginTop: 0, textAlign: 'center' }}>
                    {vaultPath ? (isNewUser ? 'Create Vault Password' : 'Unlock Vault') : (isNewUser ? 'Create Master Password' : 'Unlock Vault')}
                </h1>
                {vaultPath && <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>{vaultPath}</div>}
                <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: '2rem' }}>
                    {isNewUser
                        ? 'This password will encrypt this vault. Do not lose it.'
                        : 'Enter the password for this vault.'}
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <input
                            type="password"
                            className="input"
                            placeholder="Vault Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {error && <div style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>
                        {isNewUser ? 'Create Vault' : 'Unlock'}
                    </button>
                    {!awsConfig && (
                        <button type="button" className="btn" style={{ width: '100%', background: '#334155' }} onClick={onOpenSettings}>
                            ☁️ Setup Cloud Storage
                        </button>
                    )}
                    {awsConfig && (
                        <button type="button" className="btn" style={{ width: '100%', background: '#334155' }} onClick={onOpenSettings}>
                            ⚙️ Cloud Settings
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}
