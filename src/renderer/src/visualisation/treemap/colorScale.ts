import type { LayoutNode } from './layout'
import type { ColorPalette } from '../palettes'

const EXTENSION_MAP: Record<string, string> = {
  // Code
  ts: 'code', tsx: 'code', js: 'code', jsx: 'code', vue: 'code',
  py: 'code', rb: 'code', go: 'code', rs: 'code', java: 'code',
  c: 'code', cpp: 'code', h: 'code', hpp: 'code', cs: 'code',
  swift: 'code', kt: 'code', php: 'code', sh: 'code', zsh: 'code',
  bash: 'code', css: 'code', scss: 'code', less: 'code', html: 'code',
  svg: 'code', sql: 'code',
  // Images
  png: 'image', jpg: 'image', jpeg: 'image', gif: 'image',
  webp: 'image', ico: 'image', bmp: 'image', tiff: 'image',
  // Documents
  pdf: 'document', md: 'document', txt: 'document', doc: 'document',
  docx: 'document', rtf: 'document', odt: 'document',
  // Archives
  zip: 'archive', tar: 'archive', gz: 'archive', bz2: 'archive',
  xz: 'archive', rar: 'archive', '7z': 'archive', dmg: 'archive',
  // Media
  mp4: 'media', mkv: 'media', avi: 'media', mov: 'media',
  mp3: 'media', wav: 'media', flac: 'media', ogg: 'media',
  m4a: 'media', aac: 'media',
  // Config
  json: 'config', yaml: 'config', yml: 'config', toml: 'config',
  xml: 'config', ini: 'config', env: 'config',
  // Data
  csv: 'data', tsv: 'data', parquet: 'data', sqlite: 'data', db: 'data'
}

function getCategory(name: string): string {
  const ext = name.includes('.') ? name.split('.').pop()!.toLowerCase() : ''
  return EXTENSION_MAP[ext] ?? 'other'
}

export function colorForNode(node: LayoutNode, palette: ColorPalette): string {
  if (node.data.type === 'directory') {
    const depth = Math.min(node.depth, palette.directories.length - 1)
    return palette.directories[depth]
  }
  const category = getCategory(node.data.name)
  return palette.categories[category]
}
