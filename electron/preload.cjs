const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    ping: () => ipcRenderer.invoke('ping'),
    saveVault: (items, password, path) => ipcRenderer.invoke('vault:save', { items, password, path }),
    loadVault: (password, path) => ipcRenderer.invoke('vault:load', { password, path }),
    vaultExists: (path) => ipcRenderer.invoke('vault:exists', path),
    deleteVault: (path) => ipcRenderer.invoke('vault:delete', path),
    openSaveDialog: () => ipcRenderer.invoke('dialog:saveFile'),
});
