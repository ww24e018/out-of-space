import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannels } from '@shared/ipc-channels'
import type { ElectronApi, FileNode } from '@shared/types'

const api: ElectronApi = {
  selectFolder: () => ipcRenderer.invoke(IpcChannels.SELECT_FOLDER),
  scanFolder: (folderPath: string) => ipcRenderer.invoke(IpcChannels.SCAN_FOLDER, folderPath),
  showInFinder: (filePath: string) => ipcRenderer.invoke(IpcChannels.SHOW_IN_FINDER, filePath),
  openInTerminal: (dirPath: string) => ipcRenderer.invoke(IpcChannels.OPEN_IN_TERMINAL, dirPath)
}

// Use `contextBridge` to expose Electron APIs to the renderer
// only when context isolation is enabled, otherwise just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error -- fallback for non-isolated contexts
  window.api = api
}
