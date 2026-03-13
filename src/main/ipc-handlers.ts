import { BrowserWindow, dialog, IpcMainInvokeEvent, shell } from 'electron'
import { spawn } from 'child_process'
import { stat } from 'fs/promises'
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

export function handleShowInFinder(_event: IpcMainInvokeEvent, filePath: string): void {
  shell.showItemInFolder(filePath)
}

export async function handleOpenInTerminal(
  _event: IpcMainInvokeEvent,
  dirPath: string
): Promise<void> {
  const stats = await stat(dirPath)
  if (!stats.isDirectory()) {
    throw new Error('Path is not a directory')
  }
  spawn('open', ['-a', 'Terminal', dirPath], { detached: true, stdio: 'ignore' })
}
