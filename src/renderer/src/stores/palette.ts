import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { palettes, type ColorPalette } from '../visualisation/palettes'

export const usePaletteStore = defineStore('palette', () => {
  const currentPaletteId = ref('solarized')

  const currentPalette = computed<ColorPalette>(
    () => palettes[currentPaletteId.value] ?? palettes.solarized
  )

  const availablePalettes = computed(() =>
    Object.entries(palettes).map(([id, palette]) => ({ id, name: palette.name }))
  )

  function setPalette(id: string): void {
    if (palettes[id]) {
      currentPaletteId.value = id
    }
  }

  return { currentPaletteId, currentPalette, availablePalettes, setPalette }
})
