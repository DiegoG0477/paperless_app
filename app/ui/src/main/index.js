import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { spawn } from 'child_process'

let backendProcess;

function startPythonBackend() {
  const isDev = process.env.NODE_ENV === 'development';
  let backendPath;
  let args = [];
  
  if (isDev) {
    // En desarrollo, ejecutamos el script de Python directamente.
    backendPath = join(__dirname, '../../runtime/core/main.py');
    // Se asume que el intérprete de Python está en el PATH (usar "python3" o "python" según corresponda)
    return spawn('python3', [backendPath], { stdio: 'pipe' });
  } else {
    // En producción, buscamos el ejecutable empaquetado
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

  // Cargar la URL remota en desarrollo o el archivo local en producción
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Lanzar el backend
  backendProcess = startPythonBackend();

  // Conectar la salida del backend a la consola (puedes extenderlo para IPC)
  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
    // Aquí podrías parsear mensajes JSON y reenviarlos a la UI
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend error: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend finalizó con código ${code}`);
  });
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron.paperless');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Ejemplo de un IPC simple
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