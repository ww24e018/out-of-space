import { describe, it, expect } from 'vitest'
import { buildNavMaps } from '@/utils/tree'
import type { FileNode } from '@shared/types'

function makeTree(): FileNode {
  return {
    name: 'root',
    path: '/root',
    size: 300,
    type: 'directory',
    children: [
      {
        name: 'big',
        path: '/root/big',
        size: 200,
        type: 'directory',
        children: [
          { name: 'big-child-a', path: '/root/big/big-child-a', size: 120, type: 'file' },
          { name: 'big-child-b', path: '/root/big/big-child-b', size: 80, type: 'file' }
        ]
      },
      { name: 'medium', path: '/root/medium', size: 70, type: 'file' },
      { name: 'small', path: '/root/small', size: 30, type: 'file' }
    ]
  }
}

describe('buildNavMaps', () => {
  it('maps children to their parent', () => {
    const tree = makeTree()
    const maps = buildNavMaps(tree)

    expect(maps.parent.get(tree.children![0])).toBe(tree) // big → root
    expect(maps.parent.get(tree.children![1])).toBe(tree) // medium → root
    expect(maps.parent.get(tree.children![2])).toBe(tree) // small → root
    expect(maps.parent.get(tree.children![0].children![0])).toBe(tree.children![0]) // big-child-a → big
  })

  it('root has no parent entry', () => {
    const tree = makeTree()
    const maps = buildNavMaps(tree)

    expect(maps.parent.has(tree)).toBe(false)
  })

  it('maps next sibling with wrapping', () => {
    const tree = makeTree()
    const maps = buildNavMaps(tree)
    const [big, medium, small] = tree.children!

    expect(maps.nextSibling.get(big)).toBe(medium)
    expect(maps.nextSibling.get(medium)).toBe(small)
    expect(maps.nextSibling.get(small)).toBe(big) // wraps
  })

  it('maps prev sibling with wrapping', () => {
    const tree = makeTree()
    const maps = buildNavMaps(tree)
    const [big, medium, small] = tree.children!

    expect(maps.prevSibling.get(big)).toBe(small) // wraps
    expect(maps.prevSibling.get(medium)).toBe(big)
    expect(maps.prevSibling.get(small)).toBe(medium)
  })

  it('single child maps to itself for next/prev', () => {
    const tree: FileNode = {
      name: 'root',
      path: '/root',
      size: 100,
      type: 'directory',
      children: [{ name: 'only', path: '/root/only', size: 100, type: 'file' }]
    }
    const maps = buildNavMaps(tree)
    const only = tree.children![0]

    expect(maps.nextSibling.get(only)).toBe(only)
    expect(maps.prevSibling.get(only)).toBe(only)
  })

  it('handles leaf root (no children)', () => {
    const leaf: FileNode = { name: 'leaf', path: '/leaf', size: 50, type: 'file' }
    const maps = buildNavMaps(leaf)

    expect(maps.parent.has(leaf)).toBe(false)
    expect(maps.nextSibling.has(leaf)).toBe(false)
    expect(maps.prevSibling.has(leaf)).toBe(false)
  })
})
