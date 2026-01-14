import React, { useState, useEffect } from 'react';

export default function AwsSettings({ onSave, onCancel }) {
    const [config, setConfig] = useState({
        endpoint: '',
        accessKeyId: '',
        secretAccessKey: '',
        region: 'us-east-1'
    });

    const [testStatus, setTestStatus] = useState(null); // null, 'testing', 'success', 'error'
    const [testMessage, setTestMessage] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('pscvault_aws_config');
        if (saved) {
            try {
                setConfig(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load AWS config", e);
            }
        }
    }, []);

    const handleChange = (e) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
        setTestStatus(null); // Reset status on change
    };

    const handleTestConnection = async () => {
        if (!config.endpoint || !config.accessKeyId || !config.secretAccessKey) {
            setTestStatus('error');
            setTestMessage('Please fill in all fields first.');
            return;
        }

        setTestStatus('testing');
        setTestMessage('Connecting to AWS...');

        try {
            const response = await window.electronAPI.listS3Vaults({
                endpoint: config.endpoint,
                credentials: {
                    accessKeyId: config.accessKeyId,
                    secretAccessKey: config.secretAccessKey,
                    region: config.region
                }
            });

            if (response && response.vaults) {
                setTestStatus('success');
                setTestMessage(`Successfully connected! Found ${response.vaults.length} vault(s).`);
            } else {
                setTestStatus('error');
                setTestMessage('Invalid response from API.');
            }
        } catch (err) {
            console.error("Connection test failed:", err);
            let msg = 'Connection failed.';
            if (err.message.includes('403')) msg = 'Invalid Credentials (403).';
            else if (err.message.includes('404')) msg = 'Endpoint Not Found (404).';
            else if (err.message.includes('Fetch')) msg = 'Network Error. Check URL and Internet.';

            setTestStatus('error');
            setTestMessage(msg);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('pscvault_aws_config', JSON.stringify(config));
        onSave(config);
    };

    const handleClear = () => {
        if (window.confirm("Are you sure you want to clear AWS configuration? This will revert to local (if any).")) {
            localStorage.removeItem('pscvault_aws_config');
            setConfig({ endpoint: '', accessKeyId: '', secretAccessKey: '', region: 'us-east-1' });
            setTestStatus(null);
            onSave(null);
        }
    };

    return (
        <div className="center-container">
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
                <h2 style={{ marginTop: 0 }}>AWS S3 Settings</h2>
                <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1.5rem' }}>
                    Configure your AWS API Gateway and IAM credentials to enable cloud storage.
                </p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', opacity: 0.8 }}>API Gateway Endpoint</label>
                        <input
                            name="endpoint"
                            className="input"
                            placeholder="https://xxxx.execute-api.region.amazonaws.com"
                            value={config.endpoint}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', opacity: 0.8 }}>Access Key ID</label>
                            <input
                                name="accessKeyId"
                                className="input"
                                placeholder="AKIA..."
                                value={config.accessKeyId}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', opacity: 0.8 }}>AWS Region</label>
                            <input
                                name="region"
                                className="input"
                                placeholder="us-east-1"
                                value={config.region}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', opacity: 0.8 }}>Secret Access Key</label>
                        <input
                            name="secretAccessKey"
                            type="password"
                            className="input"
                            placeholder="Your AWS Secret Key"
                            value={config.secretAccessKey}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {testStatus && (
                        <div style={{
                            padding: '0.8rem',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            background: testStatus === 'success' ? 'rgba(16, 185, 129, 0.1)' : testStatus === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                            color: testStatus === 'success' ? '#10b981' : testStatus === 'error' ? '#ef4444' : '#3b82f6',
                            border: `1px solid ${testStatus === 'success' ? '#10b981' : testStatus === 'error' ? '#ef4444' : '#3b82f6'}33`
                        }}>
                            {testStatus === 'testing' && '⏳ '}
                            {testStatus === 'success' && '✅ '}
                            {testStatus === 'error' && '❌ '}
                            {testMessage}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                        <button type="button" className="btn" style={{ background: '#334155' }} onClick={onCancel}>Cancel</button>
                        <button type="button" className="btn" style={{ background: '#334155' }} onClick={handleClear}>Clear</button>
                        <button
                            type="button"
                            className="btn"
                            style={{ background: '#3b82f6' }}
                            onClick={handleTestConnection}
                            disabled={testStatus === 'testing'}
                        >
                            {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                        </button>
                        <button type="submit" className="btn" style={{ flex: 1 }}>Save Settings</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
