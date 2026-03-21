const { contextBridge, ipcRenderer, shell } = require('electron')
const { createIcons, icons } = require("lucide");

// const invoke = (channel) => (...args) => ipcRenderer.invoke(channel, ...args);

let cachedServerUrl = null

async function cacheUrl() {
    cachedServerUrl = await ipcRenderer.invoke('api:url')
}

cacheUrl()

contextBridge.exposeInMainWorld('api', {
    version: () => ipcRenderer.invoke('api:version'),
    serverKey: "secretkey1234",
    getServerUrl: () => cachedServerUrl
});

contextBridge.exposeInMainWorld('serial', {
    list: () => ipcRenderer.invoke('serial:list'),
    connect: (port) => ipcRenderer.invoke('serial:connect', port),
    getCurrent: () => ipcRenderer.invoke('serial:getCurrent'),
    send: (data) => ipcRenderer.invoke('serial:send', data),
    
    onData: (cb) => ipcRenderer.on('serial:data', (_, d) => cb(d)),
    onDisconnect: (cb) => ipcRenderer.on('serial:disconnect', cb),
    onError: (cb) => ipcRenderer.on('serial:error', (_, e) => cb(e))
})

contextBridge.exposeInMainWorld('file', {
    open: () => ipcRenderer.invoke('file:open'),
    save: (path, data) => ipcRenderer.invoke('file:save', path, data),
    json: {
        open: () => ipcRenderer.invoke('file:json:open'),
        save: (path, data) => ipcRenderer.invoke('file:json:save', path, data),
        download: (data, name) => ipcRenderer.invoke('file:json:download', data, name)
    },
    scm: { open: () => ipcRenderer.invoke('file:scm:open') },
    mission: { open: () => ipcRenderer.invoke('file:mission:open') }
});


contextBridge.exposeInMainWorld('web', {
    open: (url) => shell.openExternal(url),
});

contextBridge.exposeInMainWorld('icons', {
    lucide: {render: () => createIcons({ icons })},
});
