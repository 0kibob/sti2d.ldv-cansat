const { app, BrowserWindow, Menu, ipcMain } = require('electron/main')
const path = require('node:path')

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

    browserWindow.webContents.on('before-input-event', (event, input) =>
    {
        if (input.key === 'F12')
        {
            browserWindow.webContents.toggleDevTools()
            event.preventDefault()
        }
    })
    // browserWindow.webContents.toggleDevTools()
    
    return browserWindow;
}

function registerIpcHandlers()
{
    ipcMain.handle('appVersion', async () => { return app.getVersion(); });
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