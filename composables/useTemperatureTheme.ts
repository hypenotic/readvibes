import type { Ref } from 'vue'

type Temperature = 'warm' | 'cool' | 'earthen' | 'neutral'

interface ThemePalette {
  [key: string]: string
}

const themes: Record<Temperature, ThemePalette> = {
  warm: {
    '--gold-glow': '#e8c888',
    '--gold': '#d0a060',
    '--gold-dim': '#a08040',
    '--gold-dark': '#6a5428',
    '--gold-ink': '#3a2a14',
    '--cream-mid': '#d8c8a8',
    '--cream-bnd': '#c8b898',
    '--cream-dim': '#a89878',
    '--cream-ghost': '#887868',
    '--card-bg': '#0d0b08',
    '--page-bg': '#060504',
  },
  cool: {
    '--gold-glow': '#a8cce0',
    '--gold': '#8ab0c8',
    '--gold-dim': '#6890a8',
    '--gold-dark': '#3a5a70',
    '--gold-ink': '#1a2a38',
    '--cream-mid': '#c0c8d8',
    '--cream-bnd': '#a8b8c8',
    '--cream-dim': '#8898a8',
    '--cream-ghost': '#687888',
    '--card-bg': '#0a0e12',
    '--page-bg': '#030508',
  },
  earthen: {
    '--gold-glow': '#c8b090',
    '--gold': '#a89070',
    '--gold-dim': '#887058',
    '--gold-dark': '#5a4838',
    '--gold-ink': '#2a2018',
    '--cream-mid': '#d0c0a8',
    '--cream-bnd': '#c0b098',
    '--cream-dim': '#a09078',
    '--cream-ghost': '#807060',
    '--card-bg': '#0e0c08',
    '--page-bg': '#040306',
  },
  neutral: {
    '--gold-glow': '#b0b0c0',
    '--gold': '#9898ac',
    '--gold-dim': '#787890',
    '--gold-dark': '#484860',
    '--gold-ink': '#282838',
    '--cream-mid': '#c0c0c8',
    '--cream-bnd': '#a8a8b8',
    '--cream-dim': '#888898',
    '--cream-ghost': '#707080',
    '--card-bg': '#0d0d10',
    '--page-bg': '#030308',
  },
}

export function useTemperatureTheme(temperature: Ref<string>) {
  const themeVars = computed(() => {
    const temp = (temperature.value || 'warm') as Temperature
    return themes[temp] || themes.warm
  })

  return { themeVars }
}
