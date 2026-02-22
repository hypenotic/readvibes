<template>
  <div class="constellation-wrap" ref="wrapRef">
    <canvas ref="canvasRef" class="constellation-canvas" aria-hidden="true"></canvas>
  </div>
</template>

<script setup>
const props = defineProps({
  books: { type: Array, default: () => [] },
  temperature: { type: String, default: 'warm' },
})

const wrapRef = ref(null)
const canvasRef = ref(null)

let animId = null
let observer = null

// Simple hash from string to 0-1 float (deterministic positioning)
function hashStr(str, seed = 0) {
  let h = seed
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return (Math.abs(h) % 10000) / 10000
}

// Gold color per temperature
function getGoldColor(temp) {
  const colors = {
    warm: [208, 160, 96],
    cool: [138, 176, 200],
    earthen: [168, 144, 112],
    neutral: [152, 152, 172],
  }
  return colors[temp] || colors.warm
}

onMounted(() => {
  const canvas = canvasRef.value
  const wrap = wrapRef.value
  if (!canvas || !wrap) return

  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let w, h

  function resize() {
    const rect = wrap.getBoundingClientRect()
    w = rect.width
    h = 80
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  resize()

  // Generate star data from books — all stars equal weight
  const bookStars = (props.books || []).map((book, i) => {
    const title = typeof book === 'string' ? book : book?.title || ''

    // Deterministic position from title
    const hx = hashStr(title, 1)
    const hy = hashStr(title, 2)
    const x = 40 + hx * (w - 80)
    const y = 15 + hy * (h - 30)

    return { x, y, radius: 3.5, brightness: 0.75, phase: hashStr(title, 3) * Math.PI * 2 }
  })

  // Dust particles
  const dust = Array.from({ length: 20 }, (_, i) => ({
    x: hashStr(`dust${i}`, 10) * w,
    y: hashStr(`dust${i}`, 20) * h,
    r: 0.2 + hashStr(`dust${i}`, 30) * 0.3,
    phase: hashStr(`dust${i}`, 40) * Math.PI * 2,
    speed: 0.001 + hashStr(`dust${i}`, 50) * 0.002,
  }))

  const gold = getGoldColor(props.temperature)

  function draw(t) {
    ctx.clearRect(0, 0, w, h)

    // Connection lines
    for (let i = 0; i < bookStars.length - 1; i++) {
      const a = bookStars[i]
      const b = bookStars[i + 1]
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.strokeStyle = `rgba(${gold[0]}, ${gold[1]}, ${gold[2]}, 0.12)`
      ctx.lineWidth = 0.6
      ctx.stroke()
    }

    // Book stars
    for (const star of bookStars) {
      const pulse = prefersReduced ? 1 : (Math.sin(t * 0.002 + star.phase) * 0.15 + 0.85)
      const alpha = star.brightness * pulse

      // Star dot
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${gold[0]}, ${gold[1]}, ${gold[2]}, ${alpha * 0.7})`
      ctx.fill()
    }

    // Dust particles
    for (const d of dust) {
      const twinkle = prefersReduced ? 0.5 : (Math.sin(t * d.speed + d.phase) * 0.3 + 0.5)
      ctx.beginPath()
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${gold[0]}, ${gold[1]}, ${gold[2]}, ${twinkle * 0.4})`
      ctx.fill()
    }
  }

  // Static render or animation loop
  if (prefersReduced) {
    draw(0)
  } else {
    function animate(t) {
      draw(t)
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)

    // Pause when not visible
    observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!animId) animId = requestAnimationFrame(animate)
      } else {
        if (animId) { cancelAnimationFrame(animId); animId = null }
      }
    }, { threshold: 0.1 })
    observer.observe(wrap)
  }

  // Handle resize
  const onResize = () => {
    resize()
    // Recalculate star x positions
    bookStars.forEach((star, i) => {
      const book = props.books[i]
      const title = typeof book === 'string' ? book : book?.title || ''
      star.x = 40 + hashStr(title, 1) * (w - 80)
      star.y = 15 + hashStr(title, 2) * (h - 30)
    })
    dust.forEach((d, i) => {
      d.x = hashStr(`dust${i}`, 10) * w
      d.y = hashStr(`dust${i}`, 20) * h
    })
    if (prefersReduced) draw(0)
  }

  window.addEventListener('resize', onResize)

  onUnmounted(() => {
    if (animId) cancelAnimationFrame(animId)
    if (observer) observer.disconnect()
    window.removeEventListener('resize', onResize)
  })
})
</script>

<style scoped>
.constellation-wrap {
  width: 100%;
  height: 80px;
}

.constellation-canvas {
  display: block;
}
</style>
