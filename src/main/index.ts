import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { StringDecoder } from 'string_decoder'
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

function getPowerShellExecutable(): string {
  const winDir = process.env['WINDIR'] || process.env['SystemRoot'] || 'C:\\Windows'
  const candidates = [
    join(winDir, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe'),
    join(winDir, 'Sysnative', 'WindowsPowerShell', 'v1.0', 'powershell.exe'),
    'powershell.exe',
    'pwsh.exe'
  ]

  for (const candidate of candidates) {
    if (candidate.includes('\\') && existsSync(candidate)) {
      return candidate
    }
    if (!candidate.includes('\\')) {
      return candidate
    }
  }

  return 'powershell.exe'
}

function setupIPC(): void {
  ipcMain.on('start-cleanup', (event) => {
    const scriptPath = getScriptPath()
    const psExe = getPowerShellExecutable()

    if (!existsSync(scriptPath)) {
      event.sender.send('cleanup-output', `[ERR] 找不到清理脚本: ${scriptPath}`)
      event.sender.send('cleanup-complete', { code: -1 })
      return
    }

    const escapedScriptPath = scriptPath.replace(/'/g, "''")
    const command = `$OutputEncoding = [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false); & '${escapedScriptPath}'`

    const ps = spawn(psExe, [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-Command', command
    ], {
      windowsHide: true
    })

    const stdoutDecoder = new StringDecoder('utf8')
    let stdoutPending = ''
    ps.stdout.on('data', (data: Buffer) => {
      stdoutPending += stdoutDecoder.write(data)
      const lines = stdoutPending.split(/\r?\n/)
      stdoutPending = lines.pop() ?? ''
      for (const line of lines) {
        if (line) {
          event.sender.send('cleanup-output', line)
        }
      }
    })
    ps.stdout.on('end', () => {
      const tail = (stdoutPending + stdoutDecoder.end()).trim()
      if (tail) {
        event.sender.send('cleanup-output', tail)
      }
    })

    const stderrDecoder = new StringDecoder('utf8')
    let stderrPending = ''
    ps.stderr.on('data', (data: Buffer) => {
      stderrPending += stderrDecoder.write(data)
      const lines = stderrPending.split(/\r?\n/)
      stderrPending = lines.pop() ?? ''
      for (const line of lines) {
        if (line) {
          event.sender.send('cleanup-output', `[ERR] ${line}`)
        }
      }
    })
    ps.stderr.on('end', () => {
      const tail = (stderrPending + stderrDecoder.end()).trim()
      if (tail) {
        event.sender.send('cleanup-output', `[ERR] ${tail}`)
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
