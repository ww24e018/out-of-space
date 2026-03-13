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

export const hslRadialVariant2: ColorPalette = {
  name: 'HSL Radial 0°/37%/19% CA',
  categories: {
    code: 'hsl(135, 37%, 19%)',
    image: 'hsl(180, 37%, 19%)',
    document: 'hsl(225, 37%, 19%)',
    archive: 'hsl(0, 37%, 19%)',
    media: 'hsl(270, 37%, 19%)',
    config: 'hsl(45, 37%, 19%)',
    data: 'hsl(315, 37%, 19%)',
    other: 'hsl(90, 37%, 19%)'
  },
  directories: ['hsl(315, 0%, 19%)', 'hsl(315, 0%, 16%)', 'hsl(315, 0%, 13%)']
}

export const hslRadialVariant3: ColorPalette = {
  name: 'HSL Radial 9 step 298°/65%/21% IS',
  categories: {
    code: 'hsl(298, 65%, 21%)',
    image: 'hsl(338, 65%, 21%)',
    document: 'hsl(18, 65%, 21%)',
    archive: 'hsl(58, 65%, 21%)',
    media: 'hsl(98, 65%, 21%)',
    config: 'hsl(138, 65%, 21%)',
    data: 'hsl(178, 65%, 21%)',
    other: 'hsl(218, 65%, 21%)'
  },
  directories: ['hsl(258, 65%, 21%)', 'hsl(258, 65%, 19%)', 'hsl(258, 65%, 17%)']
}

export const palettes: Record<string, ColorPalette> = {
  solarized: solarizedPalette,
  legacy: legacyPalette,
  hslRad8_1: hslRadialVariant2,
  hslRad9_1: hslRadialVariant3
}
