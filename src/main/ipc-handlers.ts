import { BrowserWindow, dialog, IpcMainInvokeEvent, shell } from 'electron'
import { spawn } from 'child_process'
import { stat } from 'fs/promises'
import { FileNode } from '@shared/types'
import { IpcChannels } from '@shared/ipc-channels'
import { scanDirectory } from './scanner'
import { makeThrottled } from './throttle'

export async function handleSelectFolder(): Promise<string | null> {
  const window = BrowserWindow.getFocusedWindow()
  const result = await dialog.showOpenDialog(window!, {
    properties: ['openDirectory']
  })
  return result.canceled ? null : result.filePaths[0]
}

export async function handleScanFolder(
  event: IpcMainInvokeEvent,
  folderPath: string
): Promise<FileNode> {
  const send = makeThrottled(
    (filesScanned: number, currentPath: string) => {
      event.sender.send(IpcChannels.SCAN_PROGRESS, { filesScanned, currentPath })
    },
    250
  )
  return scanDirectory(folderPath, send)
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
  if (process.platform === 'darwin') {
    spawn('open', ['-a', 'Terminal', dirPath], { detached: true, stdio: 'ignore' })
  } else if (process.platform === 'win32') {
    spawn('cmd.exe', ['/c', 'start', 'cmd.exe'], { cwd: dirPath, detached: true, stdio: 'ignore' })
  } else {
    spawn('xterm', [], { cwd: dirPath, detached: true, stdio: 'ignore' })
  }
}
