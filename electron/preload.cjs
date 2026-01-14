const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    ping: () => ipcRenderer.invoke('ping'),
    saveVault: (items, password, path) => ipcRenderer.invoke('vault:save', { items, password, path }),
    loadVault: (password, path) => ipcRenderer.invoke('vault:load', { password, path }),
    vaultExists: (path) => ipcRenderer.invoke('vault:exists', path),
    deleteVault: (path) => ipcRenderer.invoke('vault:delete', path),
    openSaveDialog: () => ipcRenderer.invoke('dialog:saveFile'),
    getAppVersion: () => ipcRenderer.invoke('app:version'),

    // AWS API
    listS3Vaults: (config) => ipcRenderer.invoke('aws:listVaults', config),
    getS3Vault: (name, config) => ipcRenderer.invoke('aws:getVault', { name, config }),
    putS3Vault: (name, data, config) => ipcRenderer.invoke('aws:putVault', { name, data, config }),
    deleteS3Vault: (name, config) => ipcRenderer.invoke('aws:deleteVault', { name, config }),

    // Backup/Restore
    downloadVault: (name, data) => ipcRenderer.invoke('vault:download', { name, data }),
    selectLocalVault: () => ipcRenderer.invoke('vault:selectLocal'),
});
