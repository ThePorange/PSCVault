import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AwsSettings from './components/AwsSettings';

function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [items, setItems] = useState([]);
  const [masterPassword, setMasterPassword] = useState('');
  const [vaultPath, setVaultPath] = useState(null); // null = default vault
  const [vaultLinks, setVaultLinks] = useState([]); // Cache for vault links
  const [awsConfig, setAwsConfig] = useState(() => {
    const saved = localStorage.getItem('pscvault_aws_config');
    return saved ? JSON.parse(saved) : null;
  });
  const [showSettings, setShowSettings] = useState(false);

  const handleUnlock = (vaultItems, password) => {
    setItems(vaultItems);
    setMasterPassword(password);
    setUnlocked(true);

    // If unlocking default vault, update cache
    if (!vaultPath) {
      setVaultLinks(vaultItems.filter(i => i.type === 'vault-link'));
    }
  };

  const handleUpdate = (newItems) => {
    setItems(newItems);
    // If updating default vault, update cache
    if (!vaultPath) {
      setVaultLinks(newItems.filter(i => i.type === 'vault-link'));
    }
  };

  const handleLock = () => {
    setUnlocked(false);
    setItems([]);
    setMasterPassword('');
    setVaultLinks([]); // Clear cache on full lock
    setVaultPath(null); // Reset to default on lock? Or keep? Usually lock resets everything.
  };

  const handleSwitchVault = (path) => {
    setUnlocked(false);
    setItems([]);
    setMasterPassword('');
    setVaultPath(path);
    // Do NOT clear vaultLinks here, so we remember them
  };

  const handleRefresh = async () => {
    try {
      const target = vaultPath || 'vault.enc';
      if (awsConfig) {
        const config = {
          endpoint: awsConfig.endpoint,
          credentials: {
            accessKeyId: awsConfig.accessKeyId,
            secretAccessKey: awsConfig.secretAccessKey,
            region: awsConfig.region
          }
        };
        const buffer = await window.electronAPI.getS3Vault(target, config);
        const data = await window.electronAPI.loadVault(masterPassword, { buffer });
        if (data && data.items) {
          handleUpdate(data.items);
        }
      } else {
        const data = await window.electronAPI.loadVault(masterPassword, vaultPath);
        if (data && data.items) {
          handleUpdate(data.items);
        }
      }
      return true;
    } catch (err) {
      console.error("Refresh failed", err);
      return false;
    }
  };

  return (
    <>
      <div className="title-bar"></div>
      {showSettings ? (
        <AwsSettings
          onSave={(cfg) => { setAwsConfig(cfg); setShowSettings(false); }}
          onCancel={() => setShowSettings(false)}
        />
      ) : unlocked ? (
        <Dashboard
          items={items}
          password={masterPassword}
          onUpdate={handleUpdate}
          onLock={handleLock}
          onRefresh={handleRefresh}
          vaultPath={vaultPath}
          onSwitchVault={handleSwitchVault}
          vaultLinks={vaultLinks}
          awsConfig={awsConfig}
          onOpenSettings={() => setShowSettings(true)}
        />
      ) : (
        <Login
          onUnlock={handleUnlock}
          vaultPath={vaultPath}
          awsConfig={awsConfig}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}
    </>
  );
}

export default App;
