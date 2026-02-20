<template>
  <main class="intake">
    <!-- Stars background -->
    <div class="stars" aria-hidden="true"></div>

    <!-- INTRO STATE -->
    <div v-if="step === 'intro'" class="intro">
      <div class="intro-glyph" aria-hidden="true">◈</div>
      <h1>Discover Your Reading</h1>
      <p class="intro-sub">Tell us a few books that stayed with you.<br>We'll tell you what they reveal.</p>
      <div class="intro-divider" aria-hidden="true">
        <span class="line"></span>
        <span class="dot"></span>
        <span class="line"></span>
      </div>
      <button class="btn-begin" @click="step = 'form'">Begin</button>
      <p class="intro-note">Takes about two minutes. No account needed.</p>
    </div>

    <!-- FORM STATE -->
    <form v-if="step === 'form'" class="form-wrap" @submit.prevent="submitReading">
      <div class="form-header">
        <span class="form-label">Your Reading</span>
        <div class="form-divider"></div>
      </div>

      <!-- Error message -->
      <div v-if="error" class="error-message" role="alert">
        <p>{{ error }}</p>
      </div>

      <!-- Section 1: The Constellation -->
      <section class="form-section">
        <h2>The Constellation</h2>
        <p class="section-desc">Five books that stayed with you. Not the "best." The ones that linger.</p>

        <div class="book-inputs">
          <div v-for="(book, i) in books" :key="i" class="book-row">
            <span class="book-num" aria-hidden="true">{{ i + 1 }}</span>
            <input
              :id="'book-' + i"
              v-model="books[i]"
              type="text"
              :placeholder="bookPlaceholders[i]"
              :aria-label="'Book ' + (i + 1) + ': ' + bookPlaceholders[i]"
              class="book-input"
            />
          </div>
        </div>

        <div class="optional-group">
          <div class="optional-row">
            <label for="admired-not-loved" class="optional-label">One you admired but didn't love</label>
            <input id="admired-not-loved" v-model="admiredNotLoved" type="text" placeholder="Title" class="book-input" />
          </div>
          <div class="optional-row">
            <label for="stopped-reading" class="optional-label">One you stopped reading</label>
            <input id="stopped-reading" v-model="stoppedReading" type="text" placeholder="Title" class="book-input" />
          </div>
        </div>
      </section>

      <!-- Name (optional) -->
      <div class="name-field">
        <label for="reader-name" class="name-label">What should we call you?</label>
        <input
          id="reader-name"
          v-model="readerName"
          type="text"
          placeholder="First name (optional)"
          class="book-input name-input"
          autocomplete="given-name"
        />
      </div>

      <!-- Section 2: The Tilt -->
      <section class="form-section" aria-labelledby="tilt-heading">
        <h2 id="tilt-heading">The Tilt</h2>
        <p class="section-desc">When a book works for you, what's doing the work?</p>
        <p id="tilt-hint" class="section-hint">Choose up to two.</p>

        <div class="choice-grid" role="group" aria-labelledby="tilt-heading" aria-describedby="tilt-hint" @keydown="(e) => navigateChoices(e)">
          <button
            v-for="option in tiltOptions"
            :key="option.id"
            role="checkbox"
            :aria-checked="tilt.includes(option.id)"
            class="choice-btn"
            :class="{ selected: tilt.includes(option.id) }"
            @click="toggleTilt(option.id)"
          >
            {{ option.text }}
          </button>
        </div>
      </section>

      <!-- Section 3: The Boundary -->
      <section class="form-section" aria-labelledby="boundary-heading">
        <h2 id="boundary-heading">The Boundary</h2>
        <p class="section-desc">Which disappointment bothers you more?</p>
        <p id="boundary-hint" class="section-hint">Choose one.</p>

        <div class="choice-grid" role="radiogroup" aria-labelledby="boundary-heading" aria-describedby="boundary-hint" @keydown="(e) => navigateChoices(e)">
          <button
            v-for="option in boundaryOptions"
            :key="option.id"
            role="radio"
            :aria-checked="boundary === option.id"
            class="choice-btn"
            :class="{ selected: boundary === option.id }"
            @click="boundary = option.id"
          >
            {{ option.text }}
          </button>
        </div>
      </section>

      <!-- Section 4: The Scale -->
      <section class="form-section" aria-labelledby="scale-heading">
        <h2 id="scale-heading">The Scale</h2>
        <p class="section-desc">Where do you feel most at home in a story?</p>
        <p id="scale-hint" class="section-hint">Choose one.</p>

        <div class="choice-grid" role="radiogroup" aria-labelledby="scale-heading" aria-describedby="scale-hint" @keydown="(e) => navigateChoices(e)">
          <button
            v-for="option in scaleOptions"
            :key="option.id"
            role="radio"
            :aria-checked="scale === option.id"
            class="choice-btn"
            :class="{ selected: scale === option.id }"
            @click="scale = option.id"
          >
            {{ option.text }}
          </button>
        </div>
      </section>

      <!-- Submit -->
      <div class="form-submit">
        <div class="form-divider"></div>
        <button
          class="btn-reveal"
          :disabled="!canSubmit || loading"
          @click="submitReading"
        >
          {{ loading ? 'Reading the field...' : 'Reveal My Reading' }}
        </button>
        <p v-if="!canSubmit" class="submit-hint">Add at least three books and one selection from each section.</p>
      </div>
    </form>

    <!-- LOADING STATE -->
    <div v-if="step === 'loading'" class="loading-state" role="status" aria-live="polite" aria-busy="true">
      <div class="loading-glyph" aria-hidden="true">◈</div>
      <p class="loading-text">{{ loadingMessage }}</p>
    </div>

    <!-- READING STATE -->
    <div v-if="step === 'reading'" class="reading-wrap">
      <ReadingCard :reading="reading" />
    </div>
  </main>
</template>

<script setup>
const step = ref('intro')
const loading = ref(false)
const reading = ref(null)
const error = ref('')

// Focus management on step transitions
watch(() => step.value, async (newStep) => {
  await nextTick()
  if (newStep === 'form') {
    document.getElementById('book-0')?.focus()
  } else if (newStep === 'reading') {
    document.querySelector('.reading-wrap')?.scrollIntoView({ behavior: 'smooth' })
  }
})

// Form state
const readerName = ref('')
const books = ref(['', '', '', '', ''])
const admiredNotLoved = ref('')
const stoppedReading = ref('')
const tilt = ref([])
const boundary = ref(null)
const scale = ref(null)

const bookPlaceholders = [
  'A book that changed how you see things',
  'One you\'ve read more than once',
  'The one you recommend to people',
  'A book you think about unexpectedly',
  'One that felt written for you'
]

const tiltOptions = [
  { id: 'world', text: 'The world feels real enough to live in' },
  { id: 'character', text: 'The characters feel psychologically true' },
  { id: 'structure', text: 'The structure is tight and purposeful' },
  { id: 'prose', text: 'The prose is precise or striking' },
  { id: 'momentum', text: 'The story moves — I need momentum' },
]

const boundaryOptions = [
  { id: 'beautiful-nothing', text: 'Beautifully written but nothing really happened' },
  { id: 'fast-unearned', text: 'It moved fast but didn\'t feel earned' },
  { id: 'obvious-themes', text: 'It made its themes obvious' },
  { id: 'emotionally-flat', text: 'It felt emotionally flat' },
  { id: 'ending-failed', text: 'The ending didn\'t land' },
]

const scaleOptions = [
  { id: 'intimate', text: 'Intimate and interior' },
  { id: 'human', text: 'Mid-scale human stakes' },
  { id: 'systems', text: 'Large systems / big worlds' },
  { id: 'planetary', text: 'Planetary / civilisational' },
]

function toggleTilt(id) {
  if (tilt.value.includes(id)) {
    tilt.value = tilt.value.filter(t => t !== id)
  } else if (tilt.value.length < 2) {
    tilt.value = [...tilt.value, id]
  }
}

// Arrow key navigation within choice groups
function navigateChoices(e) {
  const buttons = Array.from(e.currentTarget.querySelectorAll('.choice-btn'))
  const current = buttons.indexOf(e.target)
  if (current === -1) return

  let next = -1
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    next = (current + 1) % buttons.length
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    next = (current - 1 + buttons.length) % buttons.length
  }

  if (next !== -1) {
    e.preventDefault()
    buttons[next].focus()
  }
}

const canSubmit = computed(() => {
  const filledBooks = books.value.filter(b => b.trim()).length
  return filledBooks >= 3 && tilt.value.length > 0 && boundary.value && scale.value
})

// Loading messages cycle
const loadingMessages = [
  'Reading the constellation...',
  'Tracing the through-lines...',
  'Finding the posture...',
  'Writing your reading...',
]
const loadingMessage = ref(loadingMessages[0])

async function submitReading() {
  error.value = ''
  loading.value = true
  step.value = 'loading'

  // Cycle loading messages
  let msgIndex = 0
  const msgInterval = setInterval(() => {
    msgIndex = (msgIndex + 1) % loadingMessages.length
    loadingMessage.value = loadingMessages[msgIndex]
  }, 2800)

  try {
    const payload = {
      books: books.value.filter(b => b.trim()),
      admiredNotLoved: admiredNotLoved.value.trim() || null,
      stoppedReading: stoppedReading.value.trim() || null,
      tilt: tilt.value,
      boundary: boundary.value,
      scale: scale.value,
    }

    const response = await $fetch('/api/generate-reading', {
      method: 'POST',
      body: payload,
    })

    // Attach reader name to the response (display only, not sent to Claude)
    response.readerName = readerName.value.trim() || null
    reading.value = response
    step.value = 'reading'
  } catch (err) {
    console.error('Failed to generate reading:', err)
    if (err?.statusCode === 429 || err?.status === 429) {
      error.value = 'You\u2019ve generated a few readings recently. Please wait a bit before trying again.'
    } else {
      error.value = 'Something went wrong generating your reading. Please try again.'
    }
    step.value = 'form'
  } finally {
    clearInterval(msgInterval)
    loading.value = false
  }
}
</script>

<style scoped>
.intake {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px 100px;
  position: relative;
}

.stars {
  position: fixed; inset: 0; z-index: 0; opacity: 0.025;
  background-image:
    radial-gradient(circle at 30% 20%, #8a8a8a 0.5px, transparent 0.5px),
    radial-gradient(circle at 65% 55%, #8a8a8a 0.3px, transparent 0.3px),
    radial-gradient(circle at 45% 85%, #8a8a8a 0.6px, transparent 0.6px);
  background-size: 140px 140px, 90px 90px, 220px 220px;
  pointer-events: none;
}

/* ---- INTRO ---- */
.intro {
  text-align: center;
  max-width: 460px;
  animation: fadeIn 1.2s ease;
}
.intro-glyph {
  font-size: 28px;
  color: var(--accent);
  opacity: 0.4;
  margin-bottom: 28px;
  letter-spacing: 0.3em;
}
.intro h1 {
  font-size: 36px;
  font-weight: 400;
  color: var(--text-primary);
  letter-spacing: 0.04em;
  margin-bottom: 16px;
  line-height: 1.15;
}
.intro-sub {
  font-size: 17px;
  color: var(--text-secondary);
  line-height: 1.7;
  font-weight: 300;
  margin-bottom: 36px;
}
.intro-divider {
  display: flex;
  align-items: center;
  gap: 14px;
  max-width: 140px;
  margin: 0 auto 36px;
}
.intro-divider .line {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-light));
}
.intro-divider .line:last-child {
  background: linear-gradient(90deg, var(--border-light), transparent);
}
.intro-divider .dot {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--text-muted);
}
.btn-begin {
  background: none;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  padding: 14px 44px;
  color: var(--text-secondary);
  font-size: 14px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-family: var(--font-system);
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-begin:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}
.intro-note {
  margin-top: 20px;
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 0.1em;
}

/* ---- FORM ---- */
.form-wrap {
  width: 100%;
  max-width: 520px;
  animation: fadeIn 0.8s ease;
}
.form-header {
  text-align: center;
  margin-bottom: 48px;
}
.form-label {
  font-size: 11px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-family: var(--font-system);
}
.form-divider {
  width: 40px;
  height: 1px;
  margin: 16px auto 0;
  background: linear-gradient(90deg, transparent, var(--border-light), transparent);
}

/* Error message */
.error-message {
  border-left: 2px solid var(--accent);
  padding: 14px 18px;
  margin-bottom: 32px;
  background: rgba(184, 168, 120, 0.04);
  border-radius: 0 4px 4px 0;
}
.error-message p {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 300;
  line-height: 1.5;
  margin: 0;
}

.form-section {
  margin-bottom: 48px;
}
.form-section h2 {
  font-size: 22px;
  font-weight: 400;
  color: var(--text-primary);
  letter-spacing: 0.04em;
  margin-bottom: 8px;
}
.section-desc {
  font-size: 15px;
  color: var(--text-secondary);
  font-weight: 300;
  line-height: 1.6;
  margin-bottom: 6px;
}
.section-hint {
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
  margin-bottom: 20px;
}

/* Book inputs */
.book-inputs {
  margin-bottom: 24px;
}
.book-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.book-num {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-system);
  min-width: 16px;
  text-align: right;
}
.book-input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-light);
  padding: 10px 0;
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 300;
  outline: none;
  transition: border-color 0.3s ease;
}
.book-input::placeholder {
  color: var(--text-muted);
  font-style: italic;
  font-size: 14px;
}
.book-input:focus {
  border-color: var(--accent);
}

.optional-group {
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
.optional-row {
  margin-bottom: 14px;
}
.optional-label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  font-style: italic;
  margin-bottom: 6px;
}

/* Name field */
.name-field {
  margin-bottom: 48px;
  max-width: 280px;
}
.name-label {
  display: block;
  font-size: 15px;
  color: var(--text-secondary);
  font-weight: 300;
  margin-bottom: 8px;
}
.name-input {
  width: 100%;
}

/* Choice buttons */
.choice-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.choice-btn {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 13px 18px;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 300;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s ease;
  line-height: 1.4;
}
.choice-btn:hover {
  border-color: var(--border-light);
  color: var(--text-primary);
}
.choice-btn.selected {
  border-color: var(--accent);
  color: var(--text-primary);
  background: rgba(154, 138, 106, 0.06);
}

/* Submit */
.form-submit {
  text-align: center;
  padding-top: 20px;
}
.btn-reveal {
  background: none;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  padding: 16px 48px;
  color: var(--text-secondary);
  font-size: 14px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-family: var(--font-system);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 24px;
}
.btn-reveal:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--text-primary);
}
.btn-reveal:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.submit-hint {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
}

/* ---- LOADING ---- */
.loading-state {
  text-align: center;
  animation: fadeIn 0.8s ease;
}
.loading-glyph {
  font-size: 32px;
  color: var(--accent);
  opacity: 0.3;
  margin-bottom: 24px;
  animation: pulse 2s ease-in-out infinite;
}
.loading-text {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 300;
  font-style: italic;
  transition: opacity 0.3s ease;
}

/* ---- READING ---- */
.reading-wrap {
  width: 100%;
  max-width: 440px;
  animation: fadeIn 1.2s ease;
}

/* ---- FOCUS ---- */
.btn-begin:focus-visible,
.btn-reveal:focus-visible,
.choice-btn:focus-visible,
.book-input:focus-visible,
.email-input:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* ---- ANIMATIONS ---- */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
