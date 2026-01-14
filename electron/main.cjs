const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        titleBarStyle: 'hidden', // Custom title bar potential
        titleBarOverlay: {
            color: '#000000',
            symbolColor: '#ffffff'
        }
    });

    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

const storage = require('./services/storage.cjs');
const awsService = require('./services/aws.cjs');

// IPC Handlers
ipcMain.handle('ping', () => 'pong');
ipcMain.handle('app:version', () => app.getVersion());

ipcMain.handle('vault:save', async (_, { items, password, path }) => {
    return await storage.saveVault(items, password, path);
});

ipcMain.handle('vault:load', async (_, { password, path }) => {
    return await storage.loadVault(password, path);
});

ipcMain.handle('vault:exists', async (event, path) => {
    return await storage.vaultExists(path);
});

ipcMain.handle('vault:delete', async (event, path) => {
    return await storage.deleteFile(path);
});

ipcMain.handle('dialog:saveFile', async () => {
    const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Create New Vault',
        defaultPath: 'my-vault.enc',
        filters: [{ name: 'Encrypted Vault', extensions: ['enc'] }]
    });
    if (canceled) return null;
    return filePath;
});

// AWS IPC Handlers
ipcMain.handle('aws:listVaults', async (_, config) => {
    return await awsService.listVaults(config);
});

ipcMain.handle('aws:getVault', async (_, { name, config }) => {
    const buffer = await awsService.getVault(name, config);
    // Convert Buffer to Uint8Array for IPC if necessary (though Electron handles Buffers)
    return buffer;
});

ipcMain.handle('aws:putVault', async (_, { name, data, config }) => {
    return await awsService.putVault(name, data, config);
});

ipcMain.handle('aws:deleteVault', async (_, { name, config }) => {
    return await awsService.deleteVault(name, config);
});

// Helper for local backup/restore
ipcMain.handle('vault:download', async (_, { name, data }) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
        title: `Backup ${name}`,
        defaultPath: name,
        filters: [{ name: 'Encrypted Vault', extensions: ['enc'] }]
    });
    if (canceled || !filePath) return null;
    fs.writeFileSync(filePath, data);
    return filePath;
});

ipcMain.handle('vault:selectLocal', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Select Vault to Restore',
        filters: [{ name: 'Encrypted Vault', extensions: ['enc'] }],
        properties: ['openFile']
    });
    if (canceled || filePaths.length === 0) return null;
    const filePath = filePaths[0];
    const data = fs.readFileSync(filePath);
    return { name: path.basename(filePath), data: data };
});
