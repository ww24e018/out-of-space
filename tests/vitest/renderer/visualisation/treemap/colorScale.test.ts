import { describe, it, expect } from 'vitest'
import { hierarchy, treemap } from 'd3'
import { colorForNode } from '../../../../../src/renderer/src/visualisation/treemap/colorScale'
import { legacyPalette, solarizedPalette } from '../../../../../src/renderer/src/visualisation/palettes'
import type { FileNode } from '../../../../../src/shared/types'
import type { LayoutNode } from '../../../../../src/renderer/src/visualisation/treemap/layout'

function makeLayoutNode(data: FileNode, depth = 0): LayoutNode {
  const root = hierarchy(data)
    .sum((d) => (d.type === 'file' ? d.size : 0))
  treemap<FileNode>().size([100, 100]).padding(0)(root)
  // Find the node at the right depth
  const all = (root as LayoutNode).descendants()
  return all.find((n) => n.data.path === data.path) ?? (root as LayoutNode)
}

describe('colorForNode', () => {
  it('returns a code colour for .ts files', () => {
    const node = makeLayoutNode({ name: 'index.ts', path: '/index.ts', size: 100, type: 'file' })
    expect(colorForNode(node, legacyPalette)).toBe('#e94560')
  })

  it('returns an image colour for .png files', () => {
    const node = makeLayoutNode({ name: 'logo.png', path: '/logo.png', size: 100, type: 'file' })
    expect(colorForNode(node, legacyPalette)).toBe('#f5a623')
  })

  it('returns fallback colour for unknown extensions', () => {
    const node = makeLayoutNode({ name: 'data.xyz', path: '/data.xyz', size: 100, type: 'file' })
    expect(colorForNode(node, legacyPalette)).toBe('#6b7280')
  })

  it('returns a directory colour for directories', () => {
    const dir: FileNode = {
      name: 'src', path: '/src', size: 100, type: 'directory',
      children: [{ name: 'a.ts', path: '/src/a.ts', size: 100, type: 'file' }]
    }
    const node = makeLayoutNode(dir)
    const colour = colorForNode(node, legacyPalette)
    expect(['#2a2a4a', '#33335a', '#3d3d6a']).toContain(colour)
  })

  it('directory colour differs from file colour', () => {
    const file = makeLayoutNode({ name: 'a.ts', path: '/a.ts', size: 100, type: 'file' })
    const dir: FileNode = {
      name: 'src', path: '/src', size: 100, type: 'directory',
      children: [{ name: 'a.ts', path: '/src/a.ts', size: 100, type: 'file' }]
    }
    const dirNode = makeLayoutNode(dir)
    expect(colorForNode(dirNode, legacyPalette)).not.toBe(colorForNode(file, legacyPalette))
  })

  it('solarized palette returns different colours than default', () => {
    const node = makeLayoutNode({ name: 'index.ts', path: '/index.ts', size: 100, type: 'file' })
    expect(colorForNode(node, solarizedPalette)).toBe('#268bd2')
    expect(colorForNode(node, solarizedPalette)).not.toBe(colorForNode(node, legacyPalette))
  })

  it('solarized palette returns correct directory colours', () => {
    const dir: FileNode = {
      name: 'src', path: '/src', size: 100, type: 'directory',
      children: [{ name: 'a.ts', path: '/src/a.ts', size: 100, type: 'file' }]
    }
    const node = makeLayoutNode(dir)
    const colour = colorForNode(node, solarizedPalette)
    expect(['#073642', '#0a4050', '#0d4d5e']).toContain(colour)
  })
})
