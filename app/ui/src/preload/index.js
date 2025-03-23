// /app/ui/preload/index.js
import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

const api = {}; // Puedes agregar APIs personalizadas aquí

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
