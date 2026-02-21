<template>
  <canvas ref="canvasRef" class="starfield" aria-hidden="true"></canvas>
</template>

<script setup>
const props = defineProps({
  temperature: { type: String, default: 'warm' },
})

const canvasRef = ref(null)

let animId = null

// Warm shift per temperature
function getWarmShift(temp) {
  const shifts = { warm: 1, cool: -0.5, earthen: 0.7, neutral: 0 }
  return shifts[temp] ?? 0
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let w, h, stars = []

  function generateStars() {
    w = window.innerWidth
    h = window.innerHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const count = Math.floor((w * h) / 2200)
    stars = []

    for (let i = 0; i < count; i++) {
      const isBright = Math.random() < 0.03
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: isBright ? 1.5 + Math.random() * 2 : 0.3 + Math.random() * 0.7,
        baseOpacity: isBright ? 0.5 + Math.random() * 0.5 : 0.15 + Math.random() * 0.35,
        speed: 0.0005 + Math.random() * 0.002,
        phase: Math.random() * Math.PI * 2,
        warm: Math.random() * 0.6,
        bright: isBright,
      })
    }
  }

  generateStars()

  const warmShift = getWarmShift(props.temperature)

  function draw(t) {
    ctx.clearRect(0, 0, w, h)

    for (const s of stars) {
      const twinkle = prefersReduced ? 1 : (Math.sin(t * s.speed + s.phase) * 0.3 + 0.7)
      const alpha = s.baseOpacity * twinkle
      const wm = s.warm * Math.max(0, warmShift)

      const r = Math.round(180 + wm * 40)
      const g = Math.round(168 + wm * 22)
      const b = Math.round(148 - wm * 20)

      // Glow pass for bright stars
      if (s.bright) {
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.07})`
        ctx.fill()
      }

      // Star dot
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
      ctx.fill()
    }
  }

  if (prefersReduced) {
    draw(0)
  } else {
    function animate(t) {
      draw(t)
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
  }

  // Debounced resize
  let resizeTimer
  const onResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      generateStars()
      if (prefersReduced) draw(0)
    }, 200)
  }

  window.addEventListener('resize', onResize)

  onUnmounted(() => {
    if (animId) cancelAnimationFrame(animId)
    clearTimeout(resizeTimer)
    window.removeEventListener('resize', onResize)
  })
})
</script>

<style scoped>
.starfield {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
}
</style>
