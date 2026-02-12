import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { spawn } from 'child_process'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 960,
    height: 680,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function getScriptPath(): string {
  if (is.dev) {
    return join(app.getAppPath(), 'CleanUp.ps1')
  }
  return join(process.resourcesPath, 'CleanUp.ps1')
}

function setupIPC(): void {
  ipcMain.on('start-cleanup', (event) => {
    const scriptPath = getScriptPath()

    const ps = spawn('powershell.exe', [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-File', scriptPath
    ], {
      windowsHide: true
    })

    ps.stdout.on('data', (data: Buffer) => {
      const lines = data.toString('utf-8').split(/\r?\n/).filter(Boolean)
      for (const line of lines) {
        event.sender.send('cleanup-output', line)
      }
    })

    ps.stderr.on('data', (data: Buffer) => {
      const lines = data.toString('utf-8').split(/\r?\n/).filter(Boolean)
      for (const line of lines) {
        event.sender.send('cleanup-output', `[ERR] ${line}`)
      }
    })

    ps.on('close', (code) => {
      event.sender.send('cleanup-complete', { code: code ?? 0 })
    })

    ps.on('error', (err) => {
      event.sender.send('cleanup-output', `[ERR] 无法启动 PowerShell: ${err.message}`)
      event.sender.send('cleanup-complete', { code: -1 })
    })
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  setupIPC()
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
