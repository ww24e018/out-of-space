import { readdir, lstat } from 'fs/promises'
import { join } from 'path'
import type { FileNode } from '@shared/types'

export async function scanDirectory(rootPath: string): Promise<FileNode> {
  const stats = await lstat(rootPath)
  const name = rootPath.split('/').pop() || rootPath

  if (!stats.isDirectory()) {
    return { name, path: rootPath, size: stats.size, type: 'file' }
  }

  const children = await scanChildren(rootPath)
  const size = children.reduce((sum, child) => sum + child.size, 0)

  return { name, path: rootPath, size, type: 'directory', children }
}

async function scanChildren(dirPath: string): Promise<FileNode[]> {
  let entries: string[]
  try {
    entries = await readdir(dirPath)
  } catch {
    return []
  }

  const results = await Promise.all(
    entries.map(async (entry): Promise<FileNode | null> => {
      const fullPath = join(dirPath, entry)
      let stats
      try {
        stats = await lstat(fullPath)
      } catch {
        return null // Inaccessible (permission denied, deleted mid-scan, etc.)
      }

      if (stats.isSymbolicLink()) {
        return null // Skip symlinks to avoid cycles and double-counting
      }

      if (stats.isDirectory()) {
        const children = await scanChildren(fullPath)
        const size = children.reduce((sum, child) => sum + child.size, 0)
        return { name: entry, path: fullPath, size, type: 'directory', children }
      }

      if (stats.isFile()) {
        return { name: entry, path: fullPath, size: stats.size, type: 'file' }
      }

      return null // Not a regular file or directory (socket, FIFO, etc.)
    })
  )

  // Remove skipped entries (nulls from errors, symlinks, or unknown types above)
  return results.filter((r): r is FileNode => r !== null)
}
