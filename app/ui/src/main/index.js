import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '../../../../.env');
console.log('Ruta del .env:', envPath);
config({ path: envPath });

// Verificar carga de variables
console.log('Variables cargadas:', process.env.APP_ENV); // Debe mostrar "DEV"
let backendProcess;

function startPythonBackend() {
  const isDev = process.env.APP_ENV === 'DEV';

  console.log(process.env.APP_ENV);

  console.log("isDev:", isDev, " ", process.platform);

  let backendPath;
  const args = [];
  
  if (isDev) {
    // En desarrollo, ejecutamos el script Python directamente.
    backendPath = join(__dirname, '../../../runtime/main.py');
    return spawn('python3', [backendPath], { stdio: 'pipe' });
  } else {
    // En producción, usar el ejecutable empaquetado.
    if (process.platform === 'win32') {
      backendPath = join(process.resourcesPath, "python_backend.exe");
    } else {
      backendPath = join(process.resourcesPath, "python_backend");
    }
    return spawn(backendPath, args, { stdio: 'pipe' });
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });
  
  // Maximizar la ventana cuando se cree
  mainWindow.maximize();

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Inicia el backend Python.
  backendProcess = startPythonBackend();

  let messageBuffer = '';

  backendProcess.stdout.on('data', (data) => {
    try {
      // Agregar los nuevos datos al buffer
      messageBuffer += data.toString();
      
      let messages = [];
      
      // Separa por salto de línea, ya que cada mensaje JSON fue enviado en una línea completa.
      let parts = messageBuffer.split('\n');
      // El último elemento podría ser un mensaje incompleto, por lo que se mantiene en el buffer.
      messageBuffer = parts.pop();
      
      // Procesar cada parte completa
      parts.forEach(part => {
        if (part.trim()) {
          try {
            const parsed = JSON.parse(part);
            if (parsed.event && parsed.data !== undefined) {
              messages.push(parsed);
            }
          } catch (e) {
            console.error('Error al parsear fragmento:', part);
          }
        }
      });
      
      // Procesar los mensajes válidos
      messages.forEach(parsed => {
        console.log('Enviando mensaje al frontend:', {
          event: parsed.event,
          dataType: typeof parsed.data,
          isArray: Array.isArray(parsed.data),
          dataLength: Array.isArray(parsed.data) ? parsed.data.length : 'N/A'
        });
        
        BrowserWindow.getAllWindows().forEach(win => {
          win.webContents.send("ipc-response", parsed);
        });
      });
      
      // Si el buffer es muy grande y no hay JSON válido, limpiarlo
      if (messageBuffer.length > 1000000) {
        console.warn('Buffer muy grande, limpiando...');
        messageBuffer = '';
      }
      
    } catch (error) {
      console.error("Error procesando stream:", error);
      messageBuffer = ''; // Resetear el buffer en caso de error
    }
  });

  // Limpiar el buffer cuando el proceso termine
  backendProcess.on('close', () => {
    messageBuffer = '';
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend finalizó con código ${code}`);
  });
  
  // Recibir comandos del renderer y reenviarlos al backend.
  ipcMain.on("ipc-command", (event, message) => {
    backendProcess.stdin.write(JSON.stringify(message) + "\n");
  });
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron.paperless');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on('ping', () => console.log('pong'));

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});