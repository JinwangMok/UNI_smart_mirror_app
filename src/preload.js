const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    handleWakeword: (callback) => ipcRenderer.on('on-air', callback)
})