import React, { useState, useEffect } from 'react';

export default function Login({ onUnlock, vaultPath }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isNewUser, setIsNewUser] = useState(false);

    useEffect(() => {
        async function checkVault() {
            const exists = await window.electronAPI.vaultExists(vaultPath);
            setIsNewUser(!exists);
        }
        checkVault();
    }, [vaultPath]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password) return;

        try {
            if (isNewUser) {
                // Create new vault
                await window.electronAPI.saveVault([], password, vaultPath);
                onUnlock([], password);
            } else {
                // Load existing
                const data = await window.electronAPI.loadVault(password, vaultPath);
                if (data.items) {
                    onUnlock(data.items, password);
                } else {
                    throw new Error('Invalid Password');
                }
            }
        } catch (err) {
            console.error(err);
            setError('Incorrect Password');
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
                </form>
            </div>
        </div>
    );
}
