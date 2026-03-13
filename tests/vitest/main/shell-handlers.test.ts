import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mkdtemp, writeFile, mkdir, rm } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

vi.mock('electron', () => ({
  shell: { showItemInFolder: vi.fn() },
  dialog: { showOpenDialog: vi.fn() },
  BrowserWindow: { getFocusedWindow: vi.fn(() => ({})) }
}))

import { shell } from 'electron'
import { handleShowInFinder, handleOpenInTerminal } from '../../../src/main/ipc-handlers'
import type { IpcMainInvokeEvent } from 'electron'

const fakeEvent = {} as IpcMainInvokeEvent

describe('handleShowInFinder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls shell.showItemInFolder with the given path', () => {
    handleShowInFinder(fakeEvent, '/Users/test/file.txt')
    expect(shell.showItemInFolder).toHaveBeenCalledWith('/Users/test/file.txt')
  })
})

describe('handleOpenInTerminal', () => {
  let tmp: string

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'oos-shell-test-'))
  })

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true })
  })

  it('throws when path is not a directory', async () => {
    const filePath = join(tmp, 'file.txt')
    await writeFile(filePath, 'hello')

    await expect(handleOpenInTerminal(fakeEvent, filePath))
      .rejects.toThrow('Path is not a directory')
  })

  it('throws when path does not exist', async () => {
    await expect(handleOpenInTerminal(fakeEvent, join(tmp, 'nonexistent')))
      .rejects.toThrow()
  })
})
