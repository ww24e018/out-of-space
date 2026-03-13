import type { FileNode } from '@shared/types'

/** Supported visualisation modes */
export type VisualisationMode = 'treemap' | 'sunburst'

/** Props shared by all visualisation components */
export interface VisualisationProps {
  /** The root node of the scanned directory tree */
  data: FileNode
  /** Currently selected node (highlighted in the visualisation) */
  selectedNode?: FileNode | null
}

/** Events emitted by visualisation components */
export interface VisualisationEmits {
  /** Emitted when the user clicks a node */
  (e: 'select', node: FileNode): void
  /** Emitted when the user drills into a directory */
  (e: 'drillDown', node: FileNode): void
  /** Emitted when the user hovers a node (null when leaving) */
  (e: 'hover', node: FileNode | null): void
  /** Emitted on right-click; x/y are viewport coordinates for menu positioning */
  (e: 'contextMenu', payload: { node: FileNode; x: number; y: number }): void
}
