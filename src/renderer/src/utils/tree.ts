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

export interface NavMaps {
  parent: WeakMap<FileNode, FileNode>
  nextSibling: WeakMap<FileNode, FileNode>
  prevSibling: WeakMap<FileNode, FileNode>
}

/**
 * Build lookup maps for O(1) parent and sibling navigation.
 * Call once after sorting so the sibling order matches the sorted children.
 */
export function buildNavMaps(root: FileNode): NavMaps {
  const parent = new WeakMap<FileNode, FileNode>()
  const nextSibling = new WeakMap<FileNode, FileNode>()
  const prevSibling = new WeakMap<FileNode, FileNode>()

  function walk(node: FileNode): void {
    const children = node.children
    if (!children || children.length === 0) return
    const len = children.length
    for (let i = 0; i < len; i++) {
      const child = children[i]
      parent.set(child, node)
      nextSibling.set(child, children[(i + 1) % len])
      prevSibling.set(child, children[(i - 1 + len) % len])
      walk(child)
    }
  }

  walk(root)
  return { parent, nextSibling, prevSibling }
}

/**
 * Collect the ancestor chain from `stop` down to `node` (inclusive, root-first order).
 * Returns [stop, ..., node]. Returns [node] if node === stop.
 * Returns an empty array if stop is not an ancestor of node.
 */
export function collectAncestors(
  node: FileNode,
  stop: FileNode,
  parentOf: (n: FileNode) => FileNode | null
): FileNode[] {
  const chain: FileNode[] = [node]
  let current = node
  // Compare by path rather than identity to handle Vue reactive proxies
  while (current.path !== stop.path) {
    const p = parentOf(current)
    if (!p) return []
    chain.push(p)
    current = p
  }
  chain.reverse()
  return chain
}
