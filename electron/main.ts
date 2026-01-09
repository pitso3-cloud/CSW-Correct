import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { initializeDatabase, getAbbreviations, getRanks } from './database'
import { parseDocument } from './parser'
import { validateDocument } from './engine'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

global.__filename = __filename

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Promise Rejection:', reason);
});

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  try {
    win = new BrowserWindow({
      width: 1200,
      height: 800,
      icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.mjs'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    })

    win.webContents.on('did-finish-load', () => {
      console.log('[MAIN] Window loaded, sending timestamp...');
      win?.webContents.send('main-process-message', (new Date).toLocaleString());
      
      (async () => {
        try {
          const apiAvailable = await win?.webContents.executeJavaScript(
            'typeof window.electronAPI !== "undefined"'
          );
          if (apiAvailable) {
            console.log('[MAIN] ✓ Preload injected: window.electronAPI is available');
            
            const methods = await win?.webContents.executeJavaScript(
              'Object.keys(window.electronAPI || {})'
            );
            console.log('[MAIN] ✓ Available IPC methods:', methods);
            
            try {
              const testResult = await win?.webContents.executeJavaScript(
                'window.electronAPI.getAbbreviations("").then(r => ({success: true, count: r?.length || 0}))'
              );
              console.log('[MAIN] ✓ IPC test result:', testResult);
            } catch (ipcErr) {
              console.warn('[MAIN] IPC test failed:', ipcErr);
            }
          } else {
            console.error('[MAIN] ✗ Preload NOT injected: window.electronAPI is undefined');
          }
        } catch (err) {
          console.error('[MAIN] Error verifying preload:', err);
        }
      })();
    })

    if (VITE_DEV_SERVER_URL) {
      win.loadURL(VITE_DEV_SERVER_URL)
    } else {
      win.loadFile(path.join(RENDERER_DIST, 'index.html'))
    }
  } catch (error) {
    console.error('Error creating window:', error)
  }
}

ipcMain.handle('check-document', async (_, filePath) => {
  try {
    console.log('Checking document:', filePath);
    const data = await parseDocument(filePath);
    const report = await validateDocument(data, filePath);
    return report;
  } catch (error) {
    console.error('Check failed:', error);
    return {
      filePath,
      score: 0,
      issues: [{ checkId: 'ERR', severity: 'Error', message: 'Failed to check document: ' + (error as Error).message, reference: 'N/A' }]
    };
  }
});

ipcMain.handle('get-abbreviations', async (_, query) => {
  try {
    return await getAbbreviations(query);
  } catch (error) {
    console.error('Error fetching abbreviations:', error);
    return [];
  }
});

ipcMain.handle('get-ranks', async (_, service) => {
  try {
    return await getRanks(service);
  } catch (error) {
    console.error('Error fetching ranks:', error);
    return [];
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(async () => {
  console.log('[MAIN] App ready, creating window...');
  createWindow();
}).catch((error) => {
  console.error('App initialization error:', error);
});