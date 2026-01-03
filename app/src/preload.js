const { contextBridge, ipcRenderer } = require('electron')
const { createIcons, icons } = require("lucide");

contextBridge.exposeInMainWorld("lucideAPI", {
    loadIcons: () => createIcons({ icons }),
});

contextBridge.exposeInMainWorld('api', {
    appVersion: () => ipcRenderer.invoke('appVersion'),
})