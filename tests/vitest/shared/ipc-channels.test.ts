import { describe, it, expect } from 'vitest'
import { IpcChannels } from '@shared/ipc-channels'

describe('IpcChannels', () => {
  it('defines expected channel names', () => {
    expect(IpcChannels.SELECT_FOLDER).toBe('dialog:select-folder')
    expect(IpcChannels.SCAN_FOLDER).toBe('fs:scan-folder')
    expect(IpcChannels.SHOW_IN_FINDER).toBe('shell:show-in-finder')
    expect(IpcChannels.OPEN_IN_TERMINAL).toBe('shell:open-in-terminal')
  })

  it('has only string values', () => {
    const values = Object.values(IpcChannels)
    expect(values.every((v) => typeof v === 'string')).toBe(true)
  })
})
