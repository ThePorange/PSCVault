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

// IPC Handlers
ipcMain.handle('ping', () => 'pong');

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
