<template>
  <div class="ornamental-frame" aria-hidden="true">
    <svg
      class="frame-svg"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      :viewBox="`0 0 ${width} ${height}`"
    >
      <defs>
        <linearGradient id="frame-stroke-h" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" :stop-color="goldDark" stop-opacity="0.3" />
          <stop offset="50%" :stop-color="goldDim" stop-opacity="0.45" />
          <stop offset="100%" :stop-color="goldDark" stop-opacity="0.3" />
        </linearGradient>
        <linearGradient id="frame-stroke-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="goldDark" stop-opacity="0.3" />
          <stop offset="50%" :stop-color="goldDim" stop-opacity="0.45" />
          <stop offset="100%" :stop-color="goldDark" stop-opacity="0.3" />
        </linearGradient>
      </defs>

      <!-- Outer rectangle -->
      <rect
        x="8" y="8"
        :width="width - 16" :height="height - 16"
        rx="6" ry="6"
        fill="none"
        stroke="url(#frame-stroke-h)"
        stroke-width="1"
      />

      <!-- Inner rectangle -->
      <rect
        x="20" y="20"
        :width="width - 40" :height="height - 40"
        rx="4" ry="4"
        fill="none"
        :stroke="goldDark"
        stroke-width="0.5"
        opacity="0.3"
      />

      <!-- Corner ornaments -->
      <g v-for="corner in corners" :key="corner.id" :transform="corner.transform">
        <!-- Concentric circles -->
        <circle cx="0" cy="0" r="8" fill="none" :stroke="goldDim" stroke-width="0.5" opacity="0.3" />
        <circle cx="0" cy="0" r="3" fill="none" :stroke="goldDim" stroke-width="0.5" opacity="0.4" />
        <circle cx="0" cy="0" r="1" :fill="goldDim" opacity="0.35" />
        <!-- Flourish lines -->
        <line x1="12" y1="0" x2="50" y2="0" :stroke="goldDark" stroke-width="0.5" opacity="0.3" />
        <line x1="0" y1="12" x2="0" y2="50" :stroke="goldDark" stroke-width="0.5" opacity="0.3" />
      </g>

      <!-- Top cartouche -->
      <g :transform="`translate(${width / 2}, 8)`">
        <line x1="-50" y1="0" x2="-16" y2="0" :stroke="goldDim" stroke-width="0.5" opacity="0.35" />
        <line x1="16" y1="0" x2="50" y2="0" :stroke="goldDim" stroke-width="0.5" opacity="0.35" />
        <!-- Lens / eye shape -->
        <path d="M-12,0 Q0,-6 12,0 Q0,6 -12,0 Z" fill="none" :stroke="goldDim" stroke-width="0.5" opacity="0.4" />
        <circle cx="0" cy="0" r="1.5" :fill="goldDim" opacity="0.4" />
      </g>

      <!-- Bottom cartouche -->
      <g :transform="`translate(${width / 2}, ${height - 8})`">
        <line x1="-40" y1="0" x2="-12" y2="0" :stroke="goldDim" stroke-width="0.5" opacity="0.3" />
        <line x1="12" y1="0" x2="40" y2="0" :stroke="goldDim" stroke-width="0.5" opacity="0.3" />
        <path d="M-10,0 Q0,-5 10,0 Q0,5 -10,0 Z" fill="none" :stroke="goldDim" stroke-width="0.5" opacity="0.35" />
        <circle cx="0" cy="0" r="1.2" :fill="goldDim" opacity="0.35" />
      </g>

      <!-- Side whisper lines -->
      <line
        :x1="4" :y1="height * 0.15" :x2="4" :y2="height * 0.85"
        :stroke="goldDark" stroke-width="0.5" opacity="0.15"
        stroke-dasharray="1 12"
      />
      <line
        :x1="width - 4" :y1="height * 0.15" :x2="width - 4" :y2="height * 0.85"
        :stroke="goldDark" stroke-width="0.5" opacity="0.15"
        stroke-dasharray="1 12"
      />
    </svg>
  </div>
</template>

<script setup>
const el = ref(null)
const width = ref(620)
const height = ref(800)

// Default gold values — will be overridden by CSS custom properties read at runtime
const goldDim = ref('#a08040')
const goldDark = ref('#6a5428')

// Compute corner positions
const corners = computed(() => {
  const w = width.value
  const h = height.value
  const inset = 30
  return [
    { id: 'tl', transform: `translate(${inset}, ${inset})` },
    { id: 'tr', transform: `translate(${w - inset}, ${inset}) scale(-1, 1)` },
    { id: 'bl', transform: `translate(${inset}, ${h - inset}) scale(1, -1)` },
    { id: 'br', transform: `translate(${w - inset}, ${h - inset}) scale(-1, -1)` },
  ]
})

onMounted(() => {
  const parent = document.querySelector('.card-body')
  if (!parent) return

  // Read actual dimensions
  const updateSize = () => {
    const rect = parent.getBoundingClientRect()
    width.value = Math.round(rect.width)
    height.value = Math.round(rect.height)
  }

  // Read theme colors from CSS custom properties
  const updateColors = () => {
    const styles = getComputedStyle(parent)
    goldDim.value = styles.getPropertyValue('--gold-dim').trim() || '#a08040'
    goldDark.value = styles.getPropertyValue('--gold-dark').trim() || '#6a5428'
  }

  updateSize()
  updateColors()

  const observer = new ResizeObserver(() => {
    updateSize()
  })
  observer.observe(parent)

  onUnmounted(() => {
    observer.disconnect()
  })
})
</script>

<style scoped>
.ornamental-frame {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.frame-svg {
  width: 100%;
  height: 100%;
}
</style>
