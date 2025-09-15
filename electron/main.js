// electron/main.js  (ESM)
import { fileURLToPath } from 'url';
import path from 'path';
import { app, BrowserWindow } from 'electron';
import { spawn } from 'child_process';
import os from 'os';
import fs from 'fs';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isPackaged = app.isPackaged;

// (opcional) para que en dev userData sea %AppData%\StockApp y no \Electron
if (!isPackaged) app.setName('StockApp');

// ---------- utilidades ----------
function mainLogPath() {
  try { return path.join(app.getPath('userData'), 'stock-app-main.log'); }
  catch { return path.join(os.homedir(), 'stock-app-main.log'); }
}
function log(...args) {
  const line = `[${new Date().toISOString()}] ` + args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
  try { fs.appendFileSync(mainLogPath(), line + '\n'); } catch {}
  console.log(line);
}
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return false;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const file of fs.readdirSync(src)) {
    const s = path.join(src, file);
    const d = path.join(dest, file);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
  return true;
}

// ---------- single instance ----------
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); process.exit(0); }

let mainWindow = null;
app.on('second-instance', () => {
  if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); }
});

// ---------- migraciones (DEV: electron/sql | PROD: resources/electron/sql) ----------
function copyMigrationsIntoUserData() {
  const userData = app.getPath('userData');
  const srcMigrations = isPackaged
    ? path.join(process.resourcesPath, 'electron', 'sql') // PROD
    : path.join(__dirname, 'sql');                        // DEV (tu carpeta real)
  const destMigrations = path.join(userData, 'sql');
  // Evitar trabajo si ya existe al menos un .sql
  if (fs.existsSync(destMigrations)) {
    const hasSql = fs.readdirSync(destMigrations).some(f => f.toLowerCase().endsWith('.sql'));
    if (hasSql) {
      log('Migraciones ya presentes en', destMigrations);
      return;
    }
  }
  const ok = copyDir(srcMigrations, destMigrations);
  log(ok ? 'Migraciones copiadas a ' + destMigrations : 'No se encontró carpeta de migraciones en ' + srcMigrations);
}

// ---------- esperar API ----------
function waitForApi(port, timeoutMs = 12000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function poll() {
      const req = http.get({ host: '127.0.0.1', port, path: '/health' }, res => {
        if (res.statusCode && res.statusCode < 500) return resolve(true);
        setTimeout(poll, 300);
      });
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) return reject(new Error('waitForApi timeout'));
        setTimeout(poll, 300);
      });
    })();
  });
}

// ---------- levantar API como hijo ----------
let apiProc = null;
let chosenPort = Number(process.env.API_PORT) || 4000;

function startApi() {
  const electronNode = process.execPath;
  const apiPath = isPackaged
    ? path.join(process.resourcesPath, 'electron', 'api', 'dist', 'index.js')
    : path.join(__dirname, 'api', 'dist', 'index.js');

  const userData = app.getPath('userData');
  fs.mkdirSync(userData, { recursive: true });

  const apiLog = path.join(userData, 'stock-app-api.log');
  const out = fs.openSync(apiLog, 'a');
  const err = fs.openSync(apiLog, 'a');

  const desired = Number(process.env.API_PORT) || 4000;
  const candidatePorts = [desired]; // sin reintentos costosos para acelerar arranque
  const migrationsDir = path.join(userData, 'sql'); // <- donde acabamos de copiar

  const env = {
    ...process.env,
    NODE_ENV: isPackaged ? 'production' : 'development',
    ELECTRON_RUN_AS_NODE: '1',
    STOCK_APP_DATA_DIR: userData,
    MIGRATIONS_DIR: migrationsDir,       // 👈 pásale a la API dónde están las .sql
    API_PORT: String(candidatePorts[0]),
  };

  function spawnApi(portIdx = 0) {
    const port = candidatePorts[portIdx];
    env.API_PORT = String(port);
    chosenPort = port;
    log('Starting API with port', env.API_PORT, 'cwd=', userData);

    const child = spawn(electronNode, [apiPath], {
      env, stdio: isPackaged ? ['ignore', out, err] : 'inherit',
      windowsHide: true, cwd: userData,
    });

    child.on('spawn', () => log('API spawned pid', child.pid));
    child.on('exit', (code, signal) => {
      log('API exit', String(code), String(signal));
      if (code !== 0 && portIdx + 1 < candidatePorts.length) spawnApi(portIdx + 1);
      else if (code !== 0) app.quit();
    });
    child.on('error', (e) => {
      log('API error', e?.stack || e?.message);
      if (portIdx + 1 < candidatePorts.length) spawnApi(portIdx + 1);
      else app.quit();
    });

    apiProc = child;
    log('API logs at', apiLog);
  }

  log('ENV', JSON.stringify({
    isPackaged, electronNode,
    resourcesPath: process.resourcesPath,
    __dirname, cwd: process.cwd(),
    versions: process.versions
  }));
  log('apiPath', apiPath);
  log('checkFile apiPath', fs.existsSync(apiPath) ? 'OK' : 'MISSING');

  spawnApi(0);
}

// ---------- ventana ----------
function createWindow() {
  if (mainWindow) return;
  mainWindow = new BrowserWindow({
    width: 1200, height: 800,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
    icon: path.join(__dirname, 'icon.ico'),
  });

  const indexPath = isPackaged
    ? path.join(process.resourcesPath, 'stock-app', 'browser', 'index.html')
    : path.join(__dirname, '../dist/stock-app/browser/index.html');

  mainWindow.loadFile(indexPath);
  mainWindow.on('closed', () => { mainWindow = null; });
}

// ---------- lifecycle ----------
process.on('uncaughtException', (e) => log('uncaughtException', e?.stack || e?.message));
process.on('unhandledRejection', (e) => log('unhandledRejection', e?.stack || e?.message));

app.whenReady().then(async () => {
  copyMigrationsIntoUserData();
  startApi();
  // Crear ventana inmediatamente; no bloquear por el backend
  createWindow();
  // Chequeo en background (no bloqueante)
  waitForApi(Number(chosenPort) || 4000, 5000).catch(e => log(e.message));
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0 && !mainWindow) createWindow(); });
});

app.on('before-quit', () => { try { apiProc?.kill(); } catch {} });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
