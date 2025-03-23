import React, { useEffect, useState } from 'react';
import { useIpc } from '../../hooks/useIpc';
import Versions from './features/Versions';
import electronLogo from './assets/electron.svg';

function App() {
  const { sendCommand, onEvent } = useIpc();
  const [pongCount, setPongCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState('');

  // Manejar ping/pong automático
  useEffect(() => {
    const pingInterval = setInterval(() => {
      sendCommand("ping");
      console.log("enviando ping al backend");
    }, 5000);

    const unsubscribePong = onEvent("pong", (data) => {
      setPongCount(prev => prev + 1);
      console.log("Respuesta del backend:", data);
    });

    return () => {
      clearInterval(pingInterval);
      unsubscribePong();
    };
  }, [sendCommand, onEvent]);

  // Manejar sincronización manual
  const handleSync = () => {
    sendCommand("syncDocuments");
    setSyncStatus("Sincronizando...");
    
    const unsubscribe = onEvent("syncCompleted", (data) => {
      setSyncStatus(`Sincronizado: ${data}`);
      unsubscribe();
    });
  };

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      
      <div className="status-panel">
        <div className="metric">
          🟢 Pongs recibidos: {pongCount}
        </div>
        
        <button className="sync-btn" onClick={handleSync}>
          🔄 Sincronizar documentos
        </button>
        
        <div className="sync-status">
          {syncStatus}
        </div>
      </div>

      <Versions></Versions>
    </>
  );
}

export default App;