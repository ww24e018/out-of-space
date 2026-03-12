import { BrowserWindow, dialog, IpcMainInvokeEvent } from 'electron'
import { FileNode } from '@shared/types'
import { scanDirectory } from './scanner'

export async function handleSelectFolder(): Promise<string | null> {
  const window = BrowserWindow.getFocusedWindow()
  const result = await dialog.showOpenDialog(window!, {
    properties: ['openDirectory']
  })
  return result.canceled ? null : result.filePaths[0]
}

export async function handleScanFolder(
  _event: IpcMainInvokeEvent,
  folderPath: string
): Promise<FileNode> {
  return scanDirectory(folderPath)
}
