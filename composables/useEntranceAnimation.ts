/**
 * Staggered entrance animation for the Reading Card.
 * Returns reactive `entered` object — each key flips to true at its scheduled delay.
 * Under prefers-reduced-motion, all keys are true immediately.
 */
export function useEntranceAnimation() {
  const entered = reactive({
    card: false,
    constellation: false,
    posture: false,
    signature: false,
    name: false,
    ornament: false,
    reading: false,
    boundary: false,
    books: false,
    mark: false,
  })

  const schedule: [keyof typeof entered, number][] = [
    ['card', 400],
    ['constellation', 1000],
    ['posture', 1800],
    ['signature', 2100],
    ['name', 2600],
    ['ornament', 2800],
    ['reading', 3000],
    ['boundary', 3400],
    ['books', 3700],
    ['mark', 4000],
  ]

  onMounted(() => {
    // Respect reduced motion preference
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      // Show everything immediately
      for (const key of Object.keys(entered) as (keyof typeof entered)[]) {
        entered[key] = true
      }
      return
    }

    // Schedule staggered reveals
    const timers: ReturnType<typeof setTimeout>[] = []

    for (const [key, delay] of schedule) {
      timers.push(
        setTimeout(() => {
          entered[key] = true
        }, delay)
      )
    }

    // Cleanup on unmount
    onUnmounted(() => {
      timers.forEach(clearTimeout)
    })
  })

  return { entered }
}
