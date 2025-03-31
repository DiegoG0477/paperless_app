import { useCallback } from 'react';

export function useIpc() {
  const sendCommand = useCallback((command, data = {}) => {
    try {
      const message = { command, data: data ?? "empty" };
      console.log('[IPC] Sending command:', message);
      window.electron.ipcRenderer.send("ipc-command", message);
    } catch (error) {
      console.error('[IPC] Error sending command:', error);
    }
  }, []);

  const onEvent = useCallback((eventName, callback) => {
    console.log('[IPC] Subscribing to event:', eventName);
    
    const handler = (event, response) => {
      try {
        console.log('[IPC] Received event:', eventName, response);
        if (response && response.event === eventName) {
          callback(response.data);
        }
      } catch (error) {
        console.error('[IPC] Error handling event:', error);
      }
    };

    window.electron.ipcRenderer.on("ipc-response", handler);
    
    return () => {
      console.log('[IPC] Unsubscribing from event:', eventName);
      window.electron.ipcRenderer.removeListener("ipc-response", handler);
    };
  }, []);

  return { sendCommand, onEvent };
}