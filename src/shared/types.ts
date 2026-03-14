/** A node in the scanned directory tree */
export interface FileNode {
  /** File or directory name */
  name: string
  /** Absolute path on disk */
  path: string
  /** Size in bytes (for files: file size, for directories: sum of children) */
  size: number
  /** Whether this node is a file or directory */
  type: 'file' | 'directory'
  /** Child nodes (only for directories) */
  children?: FileNode[]
}

/** Progress update emitted during a directory scan */
export interface ScanProgress {
  filesScanned: number
}

/** The API exposed to the renderer via contextBridge */
export interface ElectronApi {
  selectFolder(): Promise<string | null>
  scanFolder(folderPath: string): Promise<FileNode>
  showInFinder(filePath: string): Promise<void>
  openInTerminal(dirPath: string): Promise<void>
  onScanProgress(callback: (progress: ScanProgress) => void): void
  offScanProgress(): void
}
