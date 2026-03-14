import type { FileNode } from '@shared/types'

/**
 * Recursively sort every directory's children by size (descending) in place.
 * Ties are broken alphabetically by name for deterministic order.
 * Call once after scanning so navigation and layout can rely on pre-sorted children.
 */
export function sortTreeBySize(node: FileNode): void {
  if (!node.children || node.children.length === 0) return
  node.children.sort((a, b) => b.size - a.size || a.name.localeCompare(b.name))
  for (const child of node.children) {
    sortTreeBySize(child)
  }
}

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
