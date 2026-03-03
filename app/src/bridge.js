const { contextBridge, ipcRenderer, shell } = require('electron')
const { createIcons, icons } = require("lucide");

const invoke = (channel) => (...args) => ipcRenderer.invoke(channel, ...args);

contextBridge.exposeInMainWorld('api', {
    version: invoke('api:version'),
    serverKey: "secretkey1234" // need to be change
});

contextBridge.exposeInMainWorld('file', {
    open: invoke('file:open'),
    save: (path, data) => invoke('file:save')(path, data),
    json: {
        open: invoke('file:json:open'),
        save: (path, data) => invoke('file:json:save')(path, data),
    }
});

contextBridge.exposeInMainWorld('web', {
    open: (url) => shell.openExternal(url),
});

contextBridge.exposeInMainWorld('icons', {
    lucide: {render: () => createIcons({ icons })},
});
