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

  // Redirigir mensajes del backend a todos los renderer.
  backendProcess.stdout.on('data', (data) => {
    try {
      const messages = data.toString().split('\n').filter(line => line);
      messages.forEach((msg) => {
        const parsed = JSON.parse(msg);
        BrowserWindow.getAllWindows().forEach(win => {
          win.webContents.send("ipc-response", parsed);
        });
      });
    } catch (error) {
      console.error("Error al parsear datos del backend:", error);
    }
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend error: ${data}`);
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
