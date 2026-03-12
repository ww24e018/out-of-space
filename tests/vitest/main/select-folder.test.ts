import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('electron', () => ({
  dialog: {
    showOpenDialog: vi.fn()
  },
  BrowserWindow: {
    getFocusedWindow: vi.fn(() => ({}))
  }
}))

import { dialog } from 'electron'
import { handleSelectFolder } from '../../../src/main/ipc-handlers'

describe('handleSelectFolder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns folder path when user selects one', async () => {
    vi.mocked(dialog.showOpenDialog).mockResolvedValue({
      canceled: false,
      filePaths: ['/Users/test/Documents']
    })

    const result = await handleSelectFolder()

    expect(result).toBe('/Users/test/Documents')
  })

  it('returns null when user cancels', async () => {
    vi.mocked(dialog.showOpenDialog).mockResolvedValue({
      canceled: true,
      filePaths: []
    })

    const result = await handleSelectFolder()

    expect(result).toBeNull()
  })
})
