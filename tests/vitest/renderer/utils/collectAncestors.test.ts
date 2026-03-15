import { describe, it, expect } from 'vitest'
import { collectAncestors, buildNavMaps } from '@/utils/tree'
import type { FileNode } from '@shared/types'

function makeTree(): FileNode {
  return {
    name: 'root',
    path: '/root',
    size: 300,
    type: 'directory',
    children: [
      {
        name: 'a',
        path: '/root/a',
        size: 200,
        type: 'directory',
        children: [
          {
            name: 'b',
            path: '/root/a/b',
            size: 100,
            type: 'directory',
            children: [
              { name: 'file.txt', path: '/root/a/b/file.txt', size: 100, type: 'file' }
            ]
          }
        ]
      }
    ]
  }
}

describe('collectAncestors', () => {
  it('returns chain from stop to node (inclusive, root-first)', () => {
    const tree = makeTree()
    const maps = buildNavMaps(tree)
    const parentOf = (n: FileNode) => maps.parent.get(n) ?? null

    const a = tree.children![0]
    const b = a.children![0]

    const chain = collectAncestors(b, tree, parentOf)
    expect(chain).toEqual([tree, a, b])
  })

  it('returns single element when node === stop', () => {
    const tree = makeTree()
    const maps = buildNavMaps(tree)
    const parentOf = (n: FileNode) => maps.parent.get(n) ?? null

    const chain = collectAncestors(tree, tree, parentOf)
    expect(chain).toEqual([tree])
  })

  it('returns empty array when stop is not an ancestor of node', () => {
    const tree = makeTree()
    const maps = buildNavMaps(tree)
    const parentOf = (n: FileNode) => maps.parent.get(n) ?? null

    const unrelated: FileNode = { name: 'other', path: '/other', size: 10, type: 'file' }
    const chain = collectAncestors(tree.children![0], unrelated, parentOf)
    expect(chain).toEqual([])
  })

  it('works for immediate parent-child', () => {
    const tree = makeTree()
    const maps = buildNavMaps(tree)
    const parentOf = (n: FileNode) => maps.parent.get(n) ?? null

    const a = tree.children![0]
    const chain = collectAncestors(a, tree, parentOf)
    expect(chain).toEqual([tree, a])
  })

  it('works for deep chains', () => {
    const tree = makeTree()
    const maps = buildNavMaps(tree)
    const parentOf = (n: FileNode) => maps.parent.get(n) ?? null

    const a = tree.children![0]
    const b = a.children![0]
    const file = b.children![0]

    const chain = collectAncestors(file, tree, parentOf)
    expect(chain).toEqual([tree, a, b, file])
  })
})
