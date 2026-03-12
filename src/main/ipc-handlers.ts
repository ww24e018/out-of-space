import { BrowserWindow, dialog } from 'electron'

export async function handleSelectFolder(): Promise<string | null> {
  const window = BrowserWindow.getFocusedWindow()
  const result = await dialog.showOpenDialog(window!, {
    properties: ['openDirectory']
  })
  return result.canceled ? null : result.filePaths[0]
}
