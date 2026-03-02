const { app, BrowserWindow, globalShortcut } = require('electron/main')
const { registerHandlers } = require('./src/ipc/handler');
const path = require('node:path')

app.win = null

app.on('ready', () => {
    app.win = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 630,
        minHeight: 360,
        autoHideMenuBar: true,
        backgroundColor: '#212125',
        resizable: true,
        webPreferences: {
            zoomFactor: 1.0,
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
            backgroundThrottling: false,
            preload: path.join(__dirname, 'src/bridge.js')
        }
    })

    registerHandlers(app)
    app.debug()
    app.win.loadURL(path.join(__dirname, 'src/index.html'))

    app.win.on('closed', () => {
        app.quit()
    })

    app.on('window-all-closed', () => {
        app.quit()
    })

    app.on('activate', () => {
        if (app.win === null) { createWindow() }
        else { app.win.show() }
    })
})

app.debug = function () {
    app.win.toggleDevTools()
    globalShortcut.register('F1', () => { app.win.toggleDevTools() })
}