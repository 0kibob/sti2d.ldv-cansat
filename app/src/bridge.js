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
    disconnect: () => ipcRenderer.invoke('serial:disconnect'),
    current: () => ipcRenderer.invoke('serial:current'),
    send: (data) => ipcRenderer.invoke('serial:send', data),
    on: {
        data: (cb) => {
            const handler = (_, d) => cb(d);
            ipcRenderer.removeAllListeners('serial:on:data');
            ipcRenderer.on('serial:on:data', handler);
        },
        disconnect: (cb) => {
            ipcRenderer.removeAllListeners('serial:on:disconnect');
            ipcRenderer.on('serial:on:disconnect', cb);
        },
        error: (cb) => {
            const handler = (_, e) => cb(e);
            ipcRenderer.removeAllListeners('serial:on:error');
            ipcRenderer.on('serial:on:error', handler);
        }
    }
})

contextBridge.exposeInMainWorld('helper', {
    convert: {
        buffer: (buffer) => ipcRenderer.invoke('helper:convert:buffer', buffer),
        size: () => ipcRenderer.invoke('helper:convert:size'),
    }
});

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
