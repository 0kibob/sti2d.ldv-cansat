const { contextBridge, ipcRenderer, shell } = require('electron')
const { createIcons, icons } = require("lucide");

contextBridge.exposeInMainWorld('api', {
    version: () => ipcRenderer.invoke('appVersion'),
    openExternal: (url) => shell.openExternal(url),
    lucide: {render: () => createIcons({ icons })},
    serverKey: "secretkey1234"
});
