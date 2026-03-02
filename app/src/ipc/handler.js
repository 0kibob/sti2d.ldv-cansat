const { ipcMain } = require('electron/main');

const file = require('../modules/file');

const modules = [
    file,
];

const handle = (channel) => (...fn) => {ipcMain.handle(channel, ...fn); console.log(`[IPC] Handler -> ${channel} registered.`);}

function registerHandlers(app) {

    handle('api:version')(() => app.getVersion())

    for (const module of modules) {
        if (!module.handlers) continue;

        for (const [channel, fn] of Object.entries(module.handlers)) {
            handle(channel)(fn)
        }
    }
}

module.exports = { registerHandlers };