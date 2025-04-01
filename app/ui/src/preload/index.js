//app/ui/preload/index.js
const { contextBridge, shell } = require('electron');
import { electronAPI } from '@electron-toolkit/preload';

const api = {
  openFile: (filePath) => shell.openPath(filePath)
}; // Puedes agregar APIs personalizadas aquí

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}