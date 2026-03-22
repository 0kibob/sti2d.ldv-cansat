const { ipcMain } = require('electron/main');
const { Buffer } = require('buffer');
const { SerialPort } = require('serialport')

const file = require('../modules/file');
const { parseSensorBuffer, PACKET_SIZE } = require('../modules/convert.js')

const modules = [
    file,
];

const handle = (channel) => (...fn) => {ipcMain.handle(channel, ...fn); console.log(`[IPC] Handler -> ${channel} registered.`);}

let currentPort = null
let currentPath = null

function registerHandlers(app) {

    handle('api:version')(() => app.getVersion())
    handle('api:url')(() => `${app.serverUrl}:${app.serverPort}/api`)
    
    handle('serial:list')(async () => await SerialPort.list())
    handle('serial:connect')(async (_, path) => {
        if (currentPath === path && currentPort?.isOpen) { return true }

        if (currentPort) {
            await new Promise(res => {currentPort.close(() => res())})
            currentPort = null
        }
        currentPath = path
        const port = new SerialPort({
            path,
            baudRate: 115200,
            autoOpen: false
        })
        return await new Promise((resolve, reject) => {
            port.open((err) => {
                if (err) {
                    currentPath = null
                    return reject(err)
                }

                currentPort = port

                port.on('data', (data) => {
                    app.win.webContents.send('serial:on:data', data)
                })

                port.on('close', () => {
                    app.win.webContents.send('serial:on:disconnect')
                    currentPort = null
                    currentPath = null
                })

                port.on('error', (err) => {
                    app.win.webContents.send('serial:on:error', err.message)
                })

                resolve(true)
            })
        })
    })
    handle('serial:disconnect')(async () => {if (currentPort){ currentPort.close(); currentPath = null } })
    handle('serial:current')(() => currentPath)
    handle('serial:send')((_, data) => {if (currentPort) currentPort.write(data + '\n')})

    handle('helper:convert:buffer')((_, buffer) => parseSensorBuffer(Buffer.from(buffer)));
    handle('helper:convert:size')(() => PACKET_SIZE);
        
    for (const module of modules) {
        if (!module.handlers) continue;

        for (const [channel, fn] of Object.entries(module.handlers)) {
            handle(channel)(fn)
        }
    }
}

module.exports = { registerHandlers };