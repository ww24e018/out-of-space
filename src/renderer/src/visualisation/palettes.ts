export interface ColorPalette {
  name: string
  categories: Record<string, string>
  directories: string[]
}

export const legacyPalette: ColorPalette = {
  name: 'Legacy',
  categories: {
    code: '#e94560',
    image: '#f5a623',
    document: '#50c4ed',
    archive: '#a855f7',
    media: '#ec4899',
    config: '#8b95a5',
    data: '#10b981',
    other: '#6b7280'
  },
  directories: ['#2a2a4a', '#33335a', '#3d3d6a']
}

export const solarizedPalette: ColorPalette = {
  name: 'Solarized',
  categories: {
    code: '#268bd2',
    image: '#b58900',
    document: '#2aa198',
    archive: '#6c71c4',
    media: '#d33682',
    config: '#93a1a1',
    data: '#859900',
    other: '#839496'
  },
  directories: ['#073642', '#0a4050', '#0d4d5e']
}

export const palettes: Record<string, ColorPalette> = {
  solarized: solarizedPalette,
  legacy: legacyPalette
}
