// /app/ui/src/hooks/useIpc.js
import { useCallback } from 'react';

/**
 * Hook reutilizable para enviar comandos y suscribirse a eventos IPC.
 * Se basa en window.electron.ipcRenderer, expuesto en el preload.
 */
export function useIpc() {
  /**
   * Envía un comando al backend.
   * @param {string} command - Comando (ej. "ping", "syncDocuments").
   * @param {object} data - Datos adicionales.
   */
  const sendCommand = useCallback((command, data = {}) => {
    const message = { command, data };
    window.electron.ipcRenderer.send("ipc-command", message);
  }, []);

  /**
   * Se suscribe a un evento específico del backend.
   * @param {string} eventName - Nombre del evento (ej. "pong", "syncCompleted").
   * @param {function} callback - Función a ejecutar con los datos recibidos.
   * @returns {function} Función de desuscripción.
   */
  const onEvent = useCallback((eventName, callback) => {
    const handler = (event, response) => {
      if (response && response.event === eventName) {
        callback(response.data);
      }
    };
    window.electron.ipcRenderer.on("ipc-response", handler);
    return () => {
      window.electron.ipcRenderer.removeListener("ipc-response", handler);
    };
  }, []);

  return { sendCommand, onEvent };
}