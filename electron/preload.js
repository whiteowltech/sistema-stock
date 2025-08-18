const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('api', {
  // acá podés exponer funciones seguras si necesitás
});