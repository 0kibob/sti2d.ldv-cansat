const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron/main')
const path = require('node:path')
const fsPromises = require('fs').promises

const windowSettings =
{
    width: 1280,
    height: 720,
    webPreferences:
    {
        preload: path.join(__dirname, "src", "preload.js"),
        contextIsolation: true,
        nodeIntegration: true
    }
};

function createWindow()
{
    const browserWindow = new BrowserWindow(windowSettings);
    browserWindow.loadFile(path.join(__dirname, "src", "index.html"));

    Menu.setApplicationMenu(null)

    if (!app.isPackaged)
    {
        browserWindow.webContents.on('before-input-event', (event, input) =>
        {
            if (input.key === 'F12')
            {
                browserWindow.webContents.toggleDevTools()
                event.preventDefault()
            }
        })
    }
    
    return browserWindow;
}

function registerIpcHandlers()
{
    ipcMain.handle('appVersion', async () => { return app.getVersion(); });
    ipcMain.handle('openJsonFile', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'JSON', extensions: ['json'] }]
        });
        if (canceled) return null;
        const content = await fsPromises.readFile(filePaths[0], 'utf8');
        try { return JSON.parse(content); }
        catch (err) { return null; }
    });
}

app.whenReady().then(() =>
{
    registerIpcHandlers();
    createWindow();

    app.on('activate', () => 
    {
        if (BrowserWindow.getAllWindows().length === 0)
        {
            createWindow();
        }
    })
})

app.on('window-all-closed', () =>
{
    if (process.platform !== 'darwin')
    {
        app.quit();
    }
})