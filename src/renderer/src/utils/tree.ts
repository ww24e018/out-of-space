import type { FileNode } from '@shared/types'

/**
 * DFS to locate the parent of the node at targetPath — O(n) worst case.
 * Returns null if targetPath is the root or not found.
 */
export function findParent(root: FileNode, targetPath: string): FileNode | null {
  if (!root.children) return null
  for (const child of root.children) {
    if (child.path === targetPath) return root
    const found = findParent(child, targetPath)
    if (found) return found
  }
  return null
}
