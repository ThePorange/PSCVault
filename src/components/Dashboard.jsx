import React, { useState, useEffect } from 'react';
import { generatePassword } from '../utils/generator';

function EditForm({ item, onSave, onCancel, genConfig, masterPassword }) {
    const [formData, setFormData] = useState({
        type: 'password', // 'password' or 'secret'
        site: '',
        username: '',
        notes: '',
        password: '',
        accessKey: '',
        secretKey: ''
    });

    const [isLocked, setIsLocked] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [unlockInput, setUnlockInput] = useState('');
    const [unlockError, setUnlockError] = useState('');

    const [showConfirm, setShowConfirm] = useState(false);
    const [showRegenConfirm, setShowRegenConfirm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({
                type: item.type === 'secret' ? 'secret' : 'password',
                site: item.site || '',
                username: item.username || '',
                notes: item.notes || '',
                password: item.password || '',
                accessKey: item.accessKey || '',
                secretKey: item.secretKey || ''
            });
            // Lock editing of the password/secret field if it's an existing item
            setIsLocked(true);
        } else {
            setFormData({ type: 'password', site: '', username: '', notes: '', password: '', accessKey: '', secretKey: '' });
            setIsLocked(false);
        }
    }, [item]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSecretChange = (e) => {
        if (isLocked) {
            setShowUnlockModal(true);
            return;
        }
        setFormData({ ...formData, secretKey: e.target.value });
    };

    const handlePasswordChange = (e) => {
        if (isLocked) {
            setShowUnlockModal(true);
            return;
        }
        setFormData({ ...formData, password: e.target.value });
    };

    const handleProtectedClick = () => {
        if (isLocked) {
            setShowUnlockModal(true);
        }
    };

    const handleGenPass = () => {
        const pass = generatePassword(genConfig.length, genConfig);
        if (formData.type === 'secret') {
            setFormData({ ...formData, secretKey: pass });
        } else {
            setFormData({ ...formData, password: pass });
        }
        setShowRegenConfirm(false);
    };

    const handleGenClick = () => {
        if (isLocked) {
            setShowUnlockModal(true);
            return;
        }

        if (item) {
            setShowRegenConfirm(true);
        } else {
            handleGenPass();
        }
    };

    const handleUnlockAttempt = (e) => {
        e.preventDefault();
        if (unlockInput === masterPassword) {
            setIsLocked(false);
            setShowUnlockModal(false);
            setUnlockInput('');
            setUnlockError('');
        } else {
            setUnlockError('Incorrect Master Password');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const checkDirty = () => {
        if (!item) {
            if (formData.site || formData.username || formData.notes || formData.password || formData.accessKey || formData.secretKey) {
                setShowConfirm(true);
                return;
            }
            onCancel();
            return;
        }

        const initialType = item.type === 'secret' ? 'secret' : 'password';
        const initialSite = item.site || '';
        const initialUser = item.username || '';
        const initialNotes = item.notes || '';
        const initialPass = item.password || '';
        const initialAccess = item.accessKey || '';
        const initialSecret = item.secretKey || '';

        const isDirty = formData.type !== initialType ||
            formData.site !== initialSite ||
            formData.username !== initialUser ||
            formData.notes !== initialNotes ||
            formData.password !== initialPass ||
            formData.accessKey !== initialAccess ||
            formData.secretKey !== initialSecret;

        if (isDirty) {
            setShowConfirm(true);
        } else {
            onCancel();
        }
    };

    const formattedDate = item?.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'New Record';

    return (
        <div className="center-container" style={{ alignItems: 'flex-start' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                <h2>{item ? 'Edit Entry' : 'New Entry'}</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        name="site"
                        className="input"
                        placeholder="Website / Service"
                        value={formData.site}
                        onChange={handleChange}
                        required
                        autoFocus
                    />
                    <input
                        name="username"
                        className="input"
                        placeholder="Username / Email"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <textarea
                        name="notes"
                        className="input"
                        placeholder="Notes (Optional)"
                        value={formData.notes}
                        onChange={handleChange}
                        style={{ height: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                    />

                    {/* Type Toggle */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <button
                            type="button"
                            className="btn"
                            disabled={!!item}
                            style={{
                                flex: 1,
                                background: formData.type === 'password' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                opacity: formData.type === 'password' ? 1 : 0.6,
                                cursor: item ? 'not-allowed' : 'pointer'
                            }}
                            onClick={() => !item && setFormData({ ...formData, type: 'password' })}
                        >
                            Password
                        </button>
                        <button
                            type="button"
                            className="btn"
                            disabled={!!item}
                            style={{
                                flex: 1,
                                background: formData.type === 'secret' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                opacity: formData.type === 'secret' ? 1 : 0.6,
                                cursor: item ? 'not-allowed' : 'pointer'
                            }}
                            onClick={() => !item && setFormData({ ...formData, type: 'secret' })}
                        >
                            Secret
                        </button>
                    </div>

                    {formData.type === 'password' ? (
                        <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                            <div style={{ position: 'relative', flex: 1 }} onClick={handleProtectedClick}>
                                <input
                                    name="password"
                                    className="input"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handlePasswordChange}
                                    required
                                    readOnly={isLocked}
                                    style={{ width: '100%', cursor: isLocked ? 'pointer' : 'text' }}
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowPassword(!showPassword);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        opacity: 0.7,
                                        fontSize: '1.2rem',
                                        padding: 0
                                    }}
                                >
                                    {showPassword ? '👁️' : '🔒'}
                                </button>
                            </div>
                            <button type="button" className="btn" onClick={handleGenClick}>
                                {item ? 'Re-Gen' : 'Gen'}
                            </button>
                        </div>
                    ) : (
                        <>
                            <input
                                name="accessKey"
                                className="input"
                                placeholder="Access Key (Visible)"
                                value={formData.accessKey}
                                onChange={handleChange}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                                <div style={{ position: 'relative', flex: 1 }} onClick={handleProtectedClick}>
                                    <textarea
                                        name="secretKey"
                                        className="input"
                                        placeholder="Secret Key"
                                        value={formData.secretKey}
                                        onChange={handleSecretChange}
                                        required
                                        readOnly={isLocked}
                                        style={{
                                            width: '100%',
                                            cursor: isLocked ? 'pointer' : 'text',
                                            height: '80px',
                                            resize: 'vertical',
                                            fontFamily: 'inherit',
                                            paddingRight: '40px',
                                            WebkitTextSecurity: showPassword ? 'none' : 'disc'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowPassword(!showPassword);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '10px',
                                            background: 'none',
                                            border: 'none',
                                            color: 'white',
                                            cursor: 'pointer',
                                            opacity: 0.7,
                                            fontSize: '1.2rem',
                                            padding: 0
                                        }}
                                    >
                                        {showPassword ? '👁️' : '🔒'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn" style={{ background: '#334155' }} onClick={checkDirty}>Cancel</button>
                        <button type="submit" className="btn" style={{ flex: 1 }}>Save</button>
                    </div>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.7rem', opacity: 0.5, lineHeight: '1.4', margin: '0 0 0.5rem 0' }}>
                            <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Security Note:</strong>
                            All fields, including notes, are secured with AES-GCM encryption.<br />
                            No information is stored in plain text.
                        </p>
                        <div style={{ fontSize: '0.7rem', opacity: 0.4 }}>
                            Last Updated: {formattedDate}
                        </div>
                    </div>
                </form>

                {showConfirm && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '2rem',
                        textAlign: 'center',
                        zIndex: 10
                    }}>
                        <h3 style={{ marginTop: 0 }}>Unsaved Changes</h3>
                        <p style={{ marginBottom: '1.5rem', opacity: 0.8 }}>You have unsaved changes. Are you sure you want to discard them?</p>
                        <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                            <button className="btn" style={{ flex: 1, background: '#334155' }} onClick={() => setShowConfirm(false)}>Keep Editing</button>
                            <button className="btn" style={{ flex: 1, background: 'var(--danger)' }} onClick={onCancel}>Discard</button>
                        </div>
                    </div>
                )}

                {showRegenConfirm && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '2rem',
                        textAlign: 'center',
                        zIndex: 10
                    }}>
                        <h3 style={{ marginTop: 0 }}>Overwrite Secret?</h3>
                        <p style={{ marginBottom: '1.5rem', opacity: 0.8 }}>This will overwrite the current secret in the field. This cannot be undone.</p>
                        <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                            <button className="btn" style={{ flex: 1, background: '#334155' }} onClick={() => setShowRegenConfirm(false)}>Cancel</button>
                            <button className="btn" style={{ flex: 1, background: 'var(--danger)' }} onClick={handleGenPass}>Overwrite</button>
                        </div>
                    </div>
                )}

                {showUnlockModal && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(15, 23, 42, 0.98)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '2rem',
                        textAlign: 'center',
                        zIndex: 20
                    }}>
                        <h3 style={{ marginTop: 0 }}>Locked for Editing</h3>
                        <p style={{ marginBottom: '1.5rem', opacity: 0.8 }}>Please enter your Master Password to modify this entry.</p>
                        <form onSubmit={handleUnlockAttempt} style={{ width: '100%' }}>
                            <input
                                type="password"
                                className="input"
                                placeholder="Master Password"
                                value={unlockInput}
                                onChange={(e) => setUnlockInput(e.target.value)}
                                style={{ marginBottom: '1rem', width: '100%', boxSizing: 'border-box' }}
                                autoFocus
                            />
                            {unlockError && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem' }}>{unlockError}</div>}
                            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                                <button type="button" className="btn" style={{ flex: 1, background: '#334155' }} onClick={() => setShowUnlockModal(false)}>Cancel</button>
                                <button type="submit" className="btn" style={{ flex: 1 }}>Unlock</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Dashboard({ items, password, onUpdate, onLock, onRefresh, vaultPath, onSwitchVault, vaultLinks, awsConfig, onOpenSettings }) {
    const [view, setView] = useState('vault');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [appVersion, setAppVersion] = useState('');

    const [genConfig, setGenConfig] = useState({
        length: 20,
        includeUppercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeChars: ''
    });

    useEffect(() => {
        async function fetchVersion() {
            const version = await window.electronAPI.getAppVersion();
            setAppVersion(version);
        }
        fetchVersion();
    }, []);
    const [generatedPass, setGeneratedPass] = useState('');
    const [showGenPass, setShowGenPass] = useState(false);

    const [editingItem, setEditingItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [toast, setToast] = useState(null);

    // Multi-Vault UI State
    const [showNewVault, setShowNewVault] = useState(false);
    const [newVaultName, setNewVaultName] = useState('');
    const [newVaultPath, setNewVaultPath] = useState('');
    const [newVaultPass, setNewVaultPass] = useState('');
    const [showSwitchVault, setShowSwitchVault] = useState(false);
    const [s3Vaults, setS3Vaults] = useState([]);

    useEffect(() => {
        if (awsConfig) {
            loadS3Vaults();
        }
    }, [awsConfig]);

    const loadS3Vaults = async () => {
        try {
            const config = {
                endpoint: awsConfig.endpoint,
                credentials: {
                    accessKeyId: awsConfig.accessKeyId,
                    secretAccessKey: awsConfig.secretAccessKey,
                    region: awsConfig.region
                }
            };
            const response = await window.electronAPI.listS3Vaults(config);
            setS3Vaults(response.vaults);
        } catch (e) {
            console.error("Failed to load S3 vaults", e);
        }
    };

    // Vault Deletion State
    const [vaultToDelete, setVaultToDelete] = useState(null);
    const [deletePhrase, setDeletePhrase] = useState('');

    const filteredItems = items.filter(i =>
        i.type !== 'vault-link' && (
            i.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.username.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Use items if in default vault, otherwise fallback to prop
    const displayVaultLinks = !vaultPath ? items.filter(i => i.type === 'vault-link') : vaultLinks;

    // ... existing handlers ...
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setToast('Copied to clipboard!');
        setTimeout(() => setToast(null), 2000);
    };

    const handleCopyItem = (item) => {
        if (item.type === 'secret') {
            handleCopy(item.secretKey);
        } else {
            handleCopy(item.password);
        }
    };

    const handleRefreshClick = async () => {
        setIsRefreshing(true);
        const success = await onRefresh();
        setIsRefreshing(false);
        if (success) {
            setToast('Vault Refreshed');
        } else {
            setToast('Refresh Failed');
        }
        setTimeout(() => setToast(null), 2000);
    };

    const handleSaveItem = async (formData) => {
        const newItem = {
            id: editingItem?.id || crypto.randomUUID(),
            type: formData.type,
            site: formData.site,
            username: formData.username,
            notes: formData.notes,
            password: formData.type === 'secret' ? '' : formData.password,
            accessKey: formData.type === 'secret' ? formData.accessKey : '',
            secretKey: formData.type === 'secret' ? formData.secretKey : '',
            updatedAt: new Date().toISOString()
        };

        let newItems;
        if (editingItem) {
            newItems = items.map(i => i.id === newItem.id ? newItem : i);
        } else {
            newItems = [...items, newItem];
        }

        if (awsConfig) {
            const config = {
                endpoint: awsConfig.endpoint,
                credentials: {
                    accessKeyId: awsConfig.accessKeyId,
                    secretAccessKey: awsConfig.secretAccessKey,
                    region: awsConfig.region
                }
            };
            const result = await window.electronAPI.saveVault(newItems, password, 'TEMP_FOR_ENCRYPTION');
            await window.electronAPI.putS3Vault(vaultPath || 'vault.enc', result.buffer, config);
        } else {
            await window.electronAPI.saveVault(newItems, password, vaultPath);
        }

        onUpdate(newItems);
        setView('vault');
        setEditingItem(null);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        const newItems = items.filter(i => i.id !== itemToDelete);

        if (awsConfig) {
            const config = {
                endpoint: awsConfig.endpoint,
                credentials: {
                    accessKeyId: awsConfig.accessKeyId,
                    secretAccessKey: awsConfig.secretAccessKey,
                    region: awsConfig.region
                }
            };
            const result = await window.electronAPI.saveVault(newItems, password, 'TEMP_FOR_ENCRYPTION');
            await window.electronAPI.putS3Vault(vaultPath || 'vault.enc', result.buffer, config);
        } else {
            await window.electronAPI.saveVault(newItems, password, vaultPath);
        }

        onUpdate(newItems);
        setItemToDelete(null);
    };

    const startDelete = (id) => {
        setItemToDelete(id);
    };

    const startEdit = (item) => {
        setEditingItem(item);
        setView('add');
    };

    const startNew = () => {
        setEditingItem(null);
        setView('add');
    };

    // New Multi-Vault Handlers
    const handleBrowseVaultLoc = async () => {
        const path = await window.electronAPI.openSaveDialog();
        if (path) setNewVaultPath(path);
    };

    const handleCreateVault = async () => {
        if (!newVaultName || !newVaultPass) return;
        if (!awsConfig && !newVaultPath) return;

        if (awsConfig) {
            const targetName = newVaultName.endsWith('.enc') ? newVaultName : `${newVaultName}.enc`;
            const config = {
                endpoint: awsConfig.endpoint,
                credentials: {
                    accessKeyId: awsConfig.accessKeyId,
                    secretAccessKey: awsConfig.secretAccessKey,
                    region: awsConfig.region
                }
            };
            const result = await window.electronAPI.saveVault([], newVaultPass, 'TEMP_FOR_ENCRYPTION');
            await window.electronAPI.putS3Vault(targetName, result.buffer, config);
            loadS3Vaults();
        } else {
            // Local creation (existing logic)
            await window.electronAPI.saveVault([], newVaultPass, newVaultPath);
            const linkItem = {
                id: crypto.randomUUID(),
                type: 'vault-link',
                site: `Vault: ${newVaultName}`,
                username: newVaultPath,
                password: '',
                notes: 'Linked Vault',
                updatedAt: new Date().toISOString()
            };
            const newItems = [...items, linkItem];
            await window.electronAPI.saveVault(newItems, password, vaultPath);
            onUpdate(newItems);
        }

        setShowNewVault(false);
        setNewVaultName('');
        setNewVaultPath('');
        setNewVaultPass('');
        setToast('New Vault Created!');
        setTimeout(() => setToast(null), 2000);
    };

    const handleDownloadBackup = async () => {
        if (!awsConfig) return;
        try {
            const target = vaultPath || 'vault.enc';
            const config = {
                endpoint: awsConfig.endpoint,
                credentials: {
                    accessKeyId: awsConfig.accessKeyId,
                    secretAccessKey: awsConfig.secretAccessKey,
                    region: awsConfig.region
                }
            };
            const buffer = await window.electronAPI.getS3Vault(target, config);
            await window.electronAPI.downloadVault(target, buffer);
            setToast('Backup saved successfully');
        } catch (e) {
            console.error(e);
            setToast('Backup failed');
        }
        setTimeout(() => setToast(null), 2000);
    };

    const handleRestoreBackup = async () => {
        if (!awsConfig) return;
        try {
            const localFile = await window.electronAPI.selectLocalVault();
            if (!localFile) return;

            if (s3Vaults.includes(localFile.name)) {
                if (!window.confirm(`S3 already contains ${localFile.name}. Overwrite?`)) {
                    return;
                }
            }

            const config = {
                endpoint: awsConfig.endpoint,
                credentials: {
                    accessKeyId: awsConfig.accessKeyId,
                    secretAccessKey: awsConfig.secretAccessKey,
                    region: awsConfig.region
                }
            };
            await window.electronAPI.putS3Vault(localFile.name, localFile.data, config);
            loadS3Vaults();
            setToast(`Restored ${localFile.name} to Cloud`);
        } catch (e) {
            console.error(e);
            setToast('Restore failed');
        }
        setTimeout(() => setToast(null), 2000);
    };

    const handleDeleteVault = async () => {
        if (deletePhrase !== 'Remove Vault' || !vaultToDelete) return;

        try {
            // 1. Delete the actual vault file
            await window.electronAPI.deleteVault(vaultToDelete.username); // username is the path

            // 2. Remove the link from the current list
            const newItems = items.filter(i => i.id !== vaultToDelete.id);
            await window.electronAPI.saveVault(newItems, password, vaultPath);
            onUpdate(newItems);

            setVaultToDelete(null);
            setDeletePhrase('');
            setToast('Vault Deleted Permanently');
            setTimeout(() => setToast(null), 2000);
        } catch (error) {
            console.error('Failed to delete vault:', error);
            setToast('Error deleting vault');
            setTimeout(() => setToast(null), 2000);
        }
    };

    return (
        <div className="app-container">
            <div className="sidebar">
                <h2 style={{ margin: '0 0 1rem 0' }}>PSCVault</h2>
                <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '1rem', wordBreak: 'break-all' }}>
                    Current: {(() => {
                        if (!vaultPath) return 'Default Vault';
                        const link = displayVaultLinks.find(l => l.username === vaultPath);
                        return link ? link.site.replace('Vault: ', '') : vaultPath.split(/[/\\]/).pop();
                    })()}
                </div>

                <button className={`btn ${view === 'vault' ? 'active' : ''}`} onClick={() => { setView('vault'); setEditingItem(null); }} style={{ textAlign: 'left', background: view === 'vault' ? 'var(--primary-hover)' : 'transparent' }}>
                    Drafts / Vault
                </button>
                <button className={`btn ${view === 'generator' ? 'active' : ''}`} onClick={() => { setView('generator'); setEditingItem(null); }} style={{ textAlign: 'left', background: view === 'generator' ? 'var(--primary-hover)' : 'transparent' }}>
                    Generator
                </button>

                <div style={{ margin: '1rem 0', height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>

                <button className="btn" onClick={() => setShowSwitchVault(true)} style={{ textAlign: 'left', background: 'transparent' }}>
                    Switch Vault
                </button>

                {/* Only allow New Vault creation if we are in the Default Vault */}
                {!vaultPath && (
                    <button className="btn" onClick={() => setShowNewVault(true)} style={{ textAlign: 'left', background: 'transparent' }}>
                        New Vault
                    </button>
                )}

                <div style={{ flex: 1 }}></div>

                {awsConfig && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                        <button className="btn" onClick={handleDownloadBackup} style={{ background: '#334155', fontSize: '0.8rem' }}>
                            📥 Backup Vault
                        </button>
                        <button className="btn" onClick={handleRestoreBackup} style={{ background: '#334155', fontSize: '0.8rem' }}>
                            📤 Restore Vault
                        </button>
                    </div>
                )}

                <button className="btn" onClick={onOpenSettings} style={{ background: '#334155', marginBottom: '0.5rem' }}>
                    ⚙️ Settings
                </button>
                <button
                    className="btn"
                    onClick={handleRefreshClick}
                    disabled={isRefreshing}
                    style={{
                        background: '#334155',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span style={{
                        display: 'inline-block',
                        transition: 'transform 0.5s ease',
                        transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)',
                        fontSize: '1.2rem'
                    }}>
                        🔄
                    </span>
                    Refresh
                </button>
                <button className="btn" onClick={onLock} style={{ background: 'var(--danger)' }}>
                    Lock Vault
                </button>

                <div style={{ marginTop: '1rem', textAlign: 'center', opacity: 0.4, fontSize: '0.7rem' }}>
                    v{appVersion}
                </div>
            </div>

            <div className="main-content" style={{ position: 'relative' }}>
                {toast && (
                    <div style={{
                        position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)',
                        background: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px',
                        fontSize: '0.9rem', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        zIndex: 100, animation: 'fadeIn 0.2s ease-out'
                    }}>
                        {toast}
                    </div>
                )}

                {/* Vault View */}
                {view === 'vault' && (
                    <>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <input className="input" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            <button className="btn" onClick={startNew}>+ New</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {filteredItems.map(item => (
                                <div key={item.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', wordBreak: 'break-all' }}>{item.site}</h3>
                                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem', wordBreak: 'break-all' }}>{item.username}</div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleCopyItem(item)}>
                                            {item.type === 'secret' ? 'Copy Key' : 'Copy'}
                                        </button>
                                        <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#334155' }} onClick={() => startEdit(item)}>Edit</button>
                                        <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--danger)' }} onClick={() => startDelete(item.id)}>Del</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredItems.length === 0 && <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '4rem' }}>No passwords found.</div>}
                    </>
                )}

                {/* Edit Form */}
                {(view === 'add' || editingItem) && (
                    <EditForm
                        item={editingItem}
                        onSave={handleSaveItem}
                        onCancel={() => { setEditingItem(null); setView('vault'); }}
                        genConfig={genConfig}
                        masterPassword={password}
                    />
                )}

                {/* Generator View */}
                {view === 'generator' && (
                    <div className="center-container">
                        <div className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
                            <h2>Password Generator</h2>
                            {/* Generator UI Code (Same as before) */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input className="input" value={generatedPass} readOnly type={showGenPass ? "text" : "password"} placeholder="Generate..." style={{ width: '100%' }} />
                                    <button type="button" onClick={() => setShowGenPass(!showGenPass)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.7, fontSize: '1.2rem', padding: 0 }}>{showGenPass ? '👁️' : '🔒'}</button>
                                </div>
                                <button className="btn" onClick={() => handleCopy(generatedPass)}>Copy</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                <label style={{ display: 'flex', justifyContent: 'space-between' }}>Length: {genConfig.length} <input type="range" min="8" max="64" value={genConfig.length} onChange={e => setGenConfig({ ...genConfig, length: parseInt(e.target.value) })} /></label>
                                <label><input type="checkbox" checked={genConfig.includeUppercase} onChange={e => setGenConfig({ ...genConfig, includeUppercase: e.target.checked })} /> Uppercase (A-Z)</label>
                                <label><input type="checkbox" checked={genConfig.includeNumbers} onChange={e => setGenConfig({ ...genConfig, includeNumbers: e.target.checked })} /> Numbers (0-9)</label>
                                <label><input type="checkbox" checked={genConfig.includeSymbols} onChange={e => setGenConfig({ ...genConfig, includeSymbols: e.target.checked })} /> Symbols (!@#$)</label>
                                <div style={{ marginTop: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Exclude Characters:</label>
                                    <input className="input" placeholder="e.g. ,2&quot;" value={genConfig.excludeChars} onChange={e => setGenConfig({ ...genConfig, excludeChars: e.target.value })} />
                                </div>
                            </div>
                            <button className="btn" style={{ width: '100%' }} onClick={() => setGeneratedPass(generatePassword(genConfig.length, genConfig))}>Generate New Password</button>
                        </div>
                    </div>
                )}

                {/* Modals */}
                {itemToDelete && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(4px)', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', textAlign: 'center', zIndex: 20 }}>
                        <h3 style={{ marginTop: 0 }}>Delete Password?</h3>
                        <p style={{ marginBottom: '1.5rem', opacity: 0.8 }}>Are you sure? cannot be undone.</p>
                        <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '300px' }}>
                            <button className="btn" style={{ flex: 1, background: '#334155' }} onClick={() => setItemToDelete(null)}>Cancel</button>
                            <button className="btn" style={{ flex: 1, background: 'var(--danger)' }} onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                )}

                {/* Vault Deletion Modal */}
                {vaultToDelete && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.98)', backdropFilter: 'blur(4px)', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', textAlign: 'center', zIndex: 40 }}>
                        <h3 style={{ marginTop: 0, color: 'var(--danger)' }}>Dangerous Action</h3>
                        <p style={{ marginBottom: '0.5rem', opacity: 0.8 }}>You are about to permanently delete vault:</p>
                        <p style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}>{vaultToDelete.site.replace('Vault: ', '')}</p>
                        <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>This will remove the vault file from your computer.<br />This action cannot be undone.</p>

                        <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem' }}>Type <strong>Remove Vault</strong> to confirm:</p>
                        <input
                            className="input"
                            value={deletePhrase}
                            onChange={e => setDeletePhrase(e.target.value)}
                            placeholder="Type exactly..."
                            style={{ marginBottom: '1.5rem', textAlign: 'center' }}
                        />

                        <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '300px' }}>
                            <button className="btn" style={{ flex: 1, background: '#334155' }} onClick={() => { setVaultToDelete(null); setDeletePhrase(''); }}>Cancel</button>
                            <button
                                className="btn"
                                style={{ flex: 1, background: 'var(--danger)', opacity: deletePhrase === 'Remove Vault' ? 1 : 0.5, cursor: deletePhrase === 'Remove Vault' ? 'pointer' : 'not-allowed' }}
                                onClick={handleDeleteVault}
                                disabled={deletePhrase !== 'Remove Vault'}
                            >
                                DELETE
                            </button>
                        </div>
                    </div>
                )}

                {/* New Vault Modal */}
                {showNewVault && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.98)', backdropFilter: 'blur(4px)', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', textAlign: 'center', zIndex: 30 }}>
                        <h2 style={{ marginTop: 0 }}>Create New Vault</h2>
                        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input className="input" placeholder="Vault Name (e.g. Work)" value={newVaultName} onChange={e => setNewVaultName(e.target.value)} />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input className="input" placeholder={awsConfig ? "Cloud Name (my-vault.enc)" : "Path..."} value={newVaultPath} readOnly={!awsConfig} onChange={e => awsConfig && setNewVaultPath(e.target.value)} style={{ flex: 1, opacity: awsConfig ? 1 : 0.6 }} />
                                {!awsConfig && <button className="btn" onClick={handleBrowseVaultLoc}>Browse</button>}
                            </div>
                            <input className="input" type="password" placeholder="New Master Password" value={newVaultPass} onChange={e => setNewVaultPass(e.target.value)} />
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button className="btn" style={{ flex: 1, background: '#334155' }} onClick={() => setShowNewVault(false)}>Cancel</button>
                                <button className="btn" style={{ flex: 1 }} onClick={handleCreateVault}>Create</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Switch Vault Modal */}
                {showSwitchVault && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.98)', backdropFilter: 'blur(4px)', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', textAlign: 'center', zIndex: 30 }}>
                        <h2 style={{ marginTop: 0 }}>Switch Vault</h2>
                        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                            {/* Option to return to default */}
                            {vaultPath && (
                                <button className="btn" onClick={() => onSwitchVault(null)} style={{ background: '#3b82f6', marginBottom: '1rem' }}>
                                    Return to Default Vault
                                </button>
                            )}

                            {displayVaultLinks.length === 0 && !vaultPath && <div style={{ opacity: 0.5 }}>No other vaults linked.</div>}

                            {awsConfig && s3Vaults.map(name => (
                                <div key={name} style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="glass-panel" onClick={() => onSwitchVault(name)} style={{ flex: 1, padding: '1rem', textAlign: 'left', cursor: 'pointer', border: 'none', color: 'inherit', display: 'block' }}>
                                        <div style={{ fontWeight: 'bold' }}>{name}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Cloud S3 Vault</div>
                                    </button>
                                </div>
                            ))}

                            {!awsConfig && displayVaultLinks.map(link => (
                                <div key={link.id} style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="glass-panel" onClick={() => onSwitchVault(link.username)} style={{ flex: 1, padding: '1rem', textAlign: 'left', cursor: 'pointer', border: 'none', color: 'inherit', display: 'block' }}>
                                        <div style={{ fontWeight: 'bold' }}>{link.site}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.6, wordBreak: 'break-all' }}>{link.username}</div>
                                    </button>
                                    <button
                                        className="btn"
                                        style={{ background: 'var(--danger)', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        onClick={() => setVaultToDelete(link)}
                                    >
                                        Del
                                    </button>
                                </div>
                            ))}

                            <button className="btn" style={{ marginTop: '1rem', background: '#334155' }} onClick={() => setShowSwitchVault(false)}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
