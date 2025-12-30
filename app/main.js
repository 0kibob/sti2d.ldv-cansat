const { app, BrowserWindow, Menu } = require('electron/main')

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1280,
        height: 720
    })

    win.loadFile('src/index.html')
    Menu.setApplicationMenu(null);

    win.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F12') {
            win.webContents.toggleDevTools()
            event.preventDefault()
        }
    })
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})