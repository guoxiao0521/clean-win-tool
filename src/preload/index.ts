import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  startCleanup: (): void => {
    ipcRenderer.send('start-cleanup')
  },
  onCleanupOutput: (callback: (event: Electron.IpcRendererEvent, line: string) => void): (() => void) => {
    ipcRenderer.on('cleanup-output', callback)
    return () => ipcRenderer.removeListener('cleanup-output', callback)
  },
  onCleanupComplete: (callback: (event: Electron.IpcRendererEvent, data: { code: number }) => void): (() => void) => {
    ipcRenderer.on('cleanup-complete', callback)
    return () => ipcRenderer.removeListener('cleanup-complete', callback)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
