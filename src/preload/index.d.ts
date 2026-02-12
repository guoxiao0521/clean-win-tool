import { ElectronAPI } from '@electron-toolkit/preload'

interface CleanupAPI {
  startCleanup: () => void
  onCleanupOutput: (
    callback: (event: Electron.IpcRendererEvent, line: string) => void
  ) => () => void
  onCleanupComplete: (
    callback: (event: Electron.IpcRendererEvent, data: { code: number }) => void
  ) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CleanupAPI
  }
}
