const { contextBridge, ipcRenderer, shell } = require('electron')
const { createIcons, icons } = require("lucide");

// const invoke = (channel) => (...args) => ipcRenderer.invoke(channel, ...args);

const serverUrl = "http://localhost";
const serverPort = "81";

contextBridge.exposeInMainWorld('api', {
    version: () => ipcRenderer.invoke('api:version'),
    serverUrl,
    serverPort,
    serverKey: "secretkey1234",
    getServerUrl: () => `${serverUrl}:${serverPort}/api`
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
