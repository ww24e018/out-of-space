import { describe, it, expect } from 'vitest'
import { computeTreemapLayout } from '../../../../../src/renderer/src/visualisation/treemap/layout'
import type { FileNode } from '../../../../../src/shared/types'

function makeTree(): FileNode {
  return {
    name: 'root',
    path: '/root',
    size: 300,
    type: 'directory',
    children: [
      { name: 'big.ts', path: '/root/big.ts', size: 200, type: 'file' },
      { name: 'small.txt', path: '/root/small.txt', size: 100, type: 'file' }
    ]
  }
}

describe('computeTreemapLayout', () => {
  it('returns positioned nodes for a simple tree', () => {
    const nodes = computeTreemapLayout(makeTree(), 800, 600)

    expect(nodes.length).toBeGreaterThanOrEqual(2)
    for (const node of nodes) {
      expect(node.x0).toBeGreaterThanOrEqual(0)
      expect(node.y0).toBeGreaterThanOrEqual(0)
      expect(node.x1).toBeLessThanOrEqual(800)
      expect(node.y1).toBeLessThanOrEqual(600)
      expect(node.x1).toBeGreaterThan(node.x0)
      expect(node.y1).toBeGreaterThan(node.y0)
    }
  })

  it('returns empty array for zero dimensions', () => {
    expect(computeTreemapLayout(makeTree(), 0, 600)).toEqual([])
    expect(computeTreemapLayout(makeTree(), 800, 0)).toEqual([])
  })

  it('includes the root node', () => {
    const nodes = computeTreemapLayout(makeTree(), 800, 600)
    const root = nodes.find((n) => n.data.path === '/root')
    expect(root).toBeDefined()
  })

  it('handles an empty directory', () => {
    const empty: FileNode = {
      name: 'empty',
      path: '/empty',
      size: 0,
      type: 'directory',
      children: []
    }
    const nodes = computeTreemapLayout(empty, 800, 600)
    // Root node is still returned (it has area), but no file children
    expect(nodes).toHaveLength(1)
    expect(nodes[0].data.name).toBe('empty')
  })

  it('larger files get more area', () => {
    const nodes = computeTreemapLayout(makeTree(), 800, 600)
    const big = nodes.find((n) => n.data.name === 'big.ts')!
    const small = nodes.find((n) => n.data.name === 'small.txt')!
    const bigArea = (big.x1 - big.x0) * (big.y1 - big.y0)
    const smallArea = (small.x1 - small.x0) * (small.y1 - small.y0)
    expect(bigArea).toBeGreaterThan(smallArea)
  })
})
