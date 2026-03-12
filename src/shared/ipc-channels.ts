export const IpcChannels = {
  SELECT_FOLDER: 'dialog:select-folder',
  SCAN_FOLDER: 'fs:scan-folder',
  SHOW_IN_FINDER: 'shell:show-in-finder',
  OPEN_IN_TERMINAL: 'shell:open-in-terminal'
} as const

// Deliberate type error to verify CI catches it (will be reverted)
const _ciTest: number = 'not a number'
