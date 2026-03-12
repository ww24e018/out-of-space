import { hierarchy, treemap, type HierarchyRectangularNode } from 'd3'
import type { FileNode } from '@shared/types'

const MIN_AREA_PX = 16

export type LayoutNode = HierarchyRectangularNode<FileNode>

export function computeTreemapLayout(
  data: FileNode,
  width: number,
  height: number
): LayoutNode[] {
  if (width <= 0 || height <= 0) return []

  const root = hierarchy(data)
    .sum((d) => (d.type === 'file' ? d.size : 0))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

  treemap<FileNode>().size([width, height]).padding(2).round(true)(root)

  const positioned = root as LayoutNode

  return positioned.descendants().filter((node) => {
    const w = node.x1 - node.x0
    const h = node.y1 - node.y0
    return w * h >= MIN_AREA_PX
  })
}
