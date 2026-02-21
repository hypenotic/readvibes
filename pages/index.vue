<template>
  <main class="intake">
    <!-- Starfield background -->
    <StarfieldCanvas :temperature="reading?.temperature || 'warm'" />

    <!-- INTRO STATE -->
    <div v-if="step === 'intro'" class="intro">
      <div class="intro-glyph" aria-hidden="true">◈</div>
      <h1>Take a Reading</h1>
      <p class="intro-sub">A few books and a few questions.<br>We'll tell you what draws you in.</p>
      <div class="intro-divider" aria-hidden="true">
        <span class="line"></span>
        <span class="dot"></span>
        <span class="line"></span>
      </div>
      <button class="btn-begin" @click="step = 'form'">Take a Reading</button>
      <p class="intro-note">Takes about two minutes. No account needed.</p>
    </div>

    <!-- FORM STATE (step-by-step) -->
    <div v-if="step === 'form'" class="form-wrap">
      <div class="form-header">
        <span class="form-label">Your Reading</span>
        <div class="form-divider"></div>
      </div>

      <!-- Error message -->
      <div v-if="error" class="error-message" role="alert" tabindex="-1" ref="errorRef">
        <p>{{ error }}</p>
      </div>

      <!-- Step counter -->
      <div class="step-counter" aria-live="polite" aria-atomic="true">
        {{ formStep + 1 }} of {{ formSteps.length }}
      </div>

      <!-- Step transitions -->
      <Transition :name="transitionName" mode="out-in">

        <!-- Step 0: Books -->
        <section v-if="formStep === 0" key="books" class="form-section" aria-labelledby="books-heading">
          <h2 id="books-heading">Books that have stayed with you</h2>
          <p class="section-desc">Not the best. The ones that linger. Add at least three.</p>

          <div class="book-inputs">
            <div v-for="(book, i) in books" :key="i" class="book-entry">
              <div class="book-row">
                <span class="book-num" aria-hidden="true">{{ i + 1 }}</span>
                <input
                  :id="'book-' + i"
                  v-model="books[i].title"
                  type="text"
                  :placeholder="getBookPlaceholder(i)"
                  :aria-label="'Book ' + (i + 1) + ': ' + getBookPlaceholder(i)"
                  class="book-input"
                  @keydown.enter.prevent="handleBookEnter(i)"
                />
              </div>
              <!-- Immersion slider + moved-on flag (shown when title is entered) -->
              <div v-if="books[i].title.trim()" class="book-meta">
                <div class="immersion-wrap">
                  <span class="immersion-anchor anchor-low">background noise</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    v-model.number="books[i].immersion"
                    class="immersion-slider"
                    :style="{ '--immersion': books[i].immersion / 100 }"
                    :aria-label="'How deeply ' + books[i].title + ' stayed with you — from background noise to soul-piercing'"
                  />
                  <span class="immersion-anchor anchor-high">soul-piercing</span>
                </div>
                <label class="moved-on-toggle">
                  <input
                    type="checkbox"
                    v-model="books[i].movedOn"
                  />
                  <span class="moved-on-label">I've moved on from this one</span>
                </label>
              </div>
            </div>
          </div>

          <button
            v-if="books.length < 10"
            type="button"
            class="btn-add-book"
            @click="addBook"
          >
            + Add another book
          </button>
        </section>

        <!-- Step 1: Name -->
        <section v-else-if="formStep === 1" key="name" class="form-section" aria-labelledby="name-heading">
          <h2 id="name-heading">What should we call you?</h2>
          <p class="section-desc">First name is enough. Or skip it entirely.</p>

          <div class="name-field-step">
            <input
              id="reader-name"
              v-model="readerName"
              type="text"
              placeholder="First name (optional)"
              class="book-input name-input"
              autocomplete="given-name"
              aria-label="First name (optional)"
              @keydown.enter.prevent="advanceStep"
            />
          </div>
        </section>

        <!-- Step 2: Tilt -->
        <section v-else-if="formStep === 2" key="tilt" class="form-section" aria-labelledby="tilt-heading">
          <h2 id="tilt-heading">What pulls you into a book</h2>
          <p class="section-desc">When a book works for you, what's really doing the work?</p>
          <p id="tilt-hint" class="section-hint">Choose up to two.</p>

          <div class="choice-grid" role="group" aria-labelledby="tilt-heading" aria-describedby="tilt-hint" @keydown="(e) => navigateChoices(e)">
            <div v-for="option in tiltOptions" :key="option.id" class="choice-wrap">
              <button
                type="button"
                role="checkbox"
                :aria-checked="tilt.includes(option.id)"
                class="choice-btn"
                :class="{ selected: tilt.includes(option.id) }"
                @click="toggleTilt(option.id)"
              >
                <span class="choice-text">{{ option.text }}</span>
                <span class="tip-toggle" @click.stop="toggleTip(option.id)" aria-label="More info" role="button">?</span>
              </button>
              <div v-if="expandedTip === option.id" class="choice-tip" role="note">{{ option.tip }}</div>
            </div>
            <div class="choice-wrap">
              <input
                v-model="tiltCustom"
                type="text"
                maxlength="200"
                placeholder="Something else — tell us in your own words"
                class="choice-custom-input"
                aria-label="Something else that pulls you into a book"
                @focus="tilt.length < 2 && !tilt.includes('custom') ? tilt = [...tilt, 'custom'] : null"
              />
            </div>
          </div>
        </section>

        <!-- Step 3: Boundary -->
        <section v-else-if="formStep === 3" key="boundary" class="form-section" aria-labelledby="boundary-heading">
          <h2 id="boundary-heading">What tends to push you out</h2>
          <p class="section-desc">Which disappointment sticks with you?</p>
          <p id="boundary-hint" class="section-hint">Choose one.</p>

          <div class="choice-grid" role="radiogroup" aria-labelledby="boundary-heading" aria-describedby="boundary-hint" @keydown="(e) => navigateChoices(e)">
            <div v-for="option in boundaryOptions" :key="option.id" class="choice-wrap">
              <button
                type="button"
                role="radio"
                :aria-checked="boundary === option.id"
                class="choice-btn"
                :class="{ selected: boundary === option.id }"
                @click="boundary = option.id"
              >
                <span class="choice-text">{{ option.text }}</span>
                <span class="tip-toggle" @click.stop="toggleTip(option.id)" aria-label="More info" role="button">?</span>
              </button>
              <div v-if="expandedTip === option.id" class="choice-tip" role="note">{{ option.tip }}</div>
            </div>
            <div class="choice-wrap">
              <input
                v-model="boundaryCustom"
                type="text"
                maxlength="200"
                placeholder="Something else — tell us in your own words"
                class="choice-custom-input"
                aria-label="Something else that pushes you out of a book"
                @focus="boundary = 'custom'"
              />
            </div>
          </div>
        </section>

        <!-- Step 4: Scale -->
        <section v-else-if="formStep === 4" key="scale" class="form-section" aria-labelledby="scale-heading">
          <h2 id="scale-heading">What scale feels like home</h2>
          <p class="section-desc">Where do you feel most at home in a story?</p>
          <p id="scale-hint" class="section-hint">Choose one.</p>

          <div class="choice-grid" role="radiogroup" aria-labelledby="scale-heading" aria-describedby="scale-hint" @keydown="(e) => navigateChoices(e)">
            <div v-for="option in scaleOptions" :key="option.id" class="choice-wrap">
              <button
                type="button"
                role="radio"
                :aria-checked="scale === option.id"
                class="choice-btn"
                :class="{ selected: scale === option.id }"
                @click="scale = option.id"
              >
                <span class="choice-text">{{ option.text }}</span>
                <span class="tip-toggle" @click.stop="toggleTip(option.id)" aria-label="More info" role="button">?</span>
              </button>
              <div v-if="expandedTip === option.id" class="choice-tip" role="note">{{ option.tip }}</div>
            </div>
            <div class="choice-wrap">
              <input
                v-model="scaleCustom"
                type="text"
                maxlength="200"
                placeholder="Something else — tell us in your own words"
                class="choice-custom-input"
                aria-label="A different scale that feels like home"
                @focus="scale = 'custom'"
              />
            </div>
          </div>
        </section>
      </Transition>

      <!-- Navigation -->
      <div class="form-nav">
        <button
          v-if="formStep > 0"
          type="button"
          class="btn-back"
          @click="goBack"
        >
          Back
        </button>
        <span v-else></span>

        <button
          v-if="formStep < formSteps.length - 1"
          type="button"
          class="btn-continue"
          :disabled="!canAdvance"
          @click="advanceStep"
        >
          Continue
        </button>
        <button
          v-else
          type="button"
          class="btn-reveal"
          :disabled="!canSubmit || loading"
          @click="submitReading"
        >
          {{ loading ? 'Casting your reading...' : 'Cast' }}
        </button>
      </div>

      <!-- Validation hint -->
      <div aria-live="polite" class="validation-live">
        <p v-if="formStep === 0 && filledBookCount < 3" class="step-hint">
          {{ filledBookCount === 0 ? 'Add at least three books to continue.' : `${filledBookCount} of 3 minimum books entered.` }}
        </p>
        <p v-if="formStep === 2 && tilt.length === 0" class="step-hint">
          Choose at least one.
        </p>
        <p v-if="formStep === 3 && !boundary" class="step-hint">
          Choose one.
        </p>
        <p v-if="formStep === 4 && !scale" class="step-hint">
          Choose one to cast your reading.
        </p>
      </div>
    </div>

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
import StarfieldCanvas from '~/components/reading/StarfieldCanvas.vue'

const step = ref('intro')
const loading = ref(false)
const reading = ref(null)
const error = ref('')
const errorRef = ref(null)

// Step-by-step form
const formSteps = ['books', 'name', 'tilt', 'boundary', 'scale']
const formStep = ref(0)
const transitionDir = ref('forward') // 'forward' or 'back'

const transitionName = computed(() => transitionDir.value === 'forward' ? 'step-forward' : 'step-back')

// Focus management on main step transitions
watch(() => step.value, async (newStep) => {
  await nextTick()
  if (newStep === 'form') {
    focusFirstInput()
  } else if (newStep === 'reading') {
    document.querySelector('.reading-wrap')?.scrollIntoView({ behavior: 'smooth' })
  }
})

// Focus management on form step transitions
watch(() => formStep.value, async () => {
  await nextTick()
  focusFirstInput()
  // Close any open tooltip when changing steps
  expandedTip.value = null
})

// Clear error when user interacts with form
watch([() => books.value.map(b => b.title).join(','), tilt, boundary, scale], () => {
  if (error.value) error.value = ''
})

function focusFirstInput() {
  const wrap = document.querySelector('.form-section')
  if (!wrap) return
  const focusable = wrap.querySelector('input, button:not(.btn-add-book):not(.tip-toggle)')
  focusable?.focus()
}

// Form state
const readerName = ref('')
const makeBook = () => ({ title: '', immersion: 75, movedOn: false })
const books = ref([makeBook(), makeBook(), makeBook()])
const tilt = ref([])
const boundary = ref(null)
const scale = ref(null)

const bookPlaceholders = [
  'A book that changed how you see things',
  'One you\'ve read more than once',
  'The one you recommend to people',
  'A book you think about unexpectedly',
  'One that felt written for you',
  'Another one that stayed',
  'Another one that stayed',
  'Another one that stayed',
  'Another one that stayed',
  'Another one that stayed',
]

function getBookPlaceholder(i) {
  return bookPlaceholders[i] || 'Another one that stayed'
}

function addBook() {
  if (books.value.length < 10) {
    books.value.push(makeBook())
    nextTick(() => {
      document.getElementById('book-' + (books.value.length - 1))?.focus()
    })
  }
}

function handleBookEnter(i) {
  // If this book has a title and next book exists, focus it
  if (books.value[i].title.trim() && i < books.value.length - 1) {
    document.getElementById('book-' + (i + 1))?.focus()
  } else if (books.value[i].title.trim() && books.value.length < 10) {
    addBook()
  } else if (canAdvance.value) {
    advanceStep()
  }
}

const tiltOptions = [
  { id: 'world', text: 'The world feels real enough to live in', tip: 'You notice the weather, the architecture, the way light falls. The world isn\u2019t backdrop \u2014 it\u2019s a character.' },
  { id: 'character', text: 'The characters feel psychologically true', tip: 'You\u2019re tracking interior logic. When a character acts, you need to believe they would.' },
  { id: 'structure', text: 'The structure is tight and purposeful', tip: 'You notice when scenes earn their place. Pacing, reveals, the shape of the whole thing matters to you.' },
  { id: 'prose', text: 'The prose is precise or striking', tip: 'The sentence-level craft is where the book lives for you. Voice, rhythm, word choice.' },
  { id: 'momentum', text: 'The story moves \u2014 I need momentum', tip: 'You need to feel pulled forward. Doesn\u2019t have to be fast \u2014 but it has to be going somewhere.' },
]

const boundaryOptions = [
  { id: 'beautiful-nothing', text: 'Beautifully written but nothing really happened', tip: 'Gorgeous prose that never arrives anywhere. Style without stakes.' },
  { id: 'fast-unearned', text: 'It moved fast but didn\u2019t feel earned', tip: 'Things happened, but the consequences felt hollow. Speed without weight.' },
  { id: 'obvious-themes', text: 'It made its themes obvious', tip: 'You could feel the author underlining. The meaning was announced, not discovered.' },
  { id: 'emotionally-flat', text: 'It felt emotionally flat', tip: 'Technically fine but you didn\u2019t feel anything. Competent but cold.' },
  { id: 'ending-failed', text: 'The ending didn\u2019t land', tip: 'Everything was working until it wasn\u2019t. The landing matters to you.' },
]

const scaleOptions = [
  { id: 'intimate', text: 'Intimate and interior', tip: 'One mind, one room, one relationship. The drama is internal.' },
  { id: 'human', text: 'Mid-scale human stakes', tip: 'Families, communities, a life unfolding. Stakes you can hold in your hands.' },
  { id: 'systems', text: 'Large systems / big worlds', tip: 'Institutions, cities, interconnected fates. You like seeing the machinery.' },
  { id: 'planetary', text: 'Planetary / civilisational', tip: 'History-scale. The sweep of time, the fate of peoples. You read wide.' },
]

// Tooltip expand state
const expandedTip = ref(null)
function toggleTip(id) {
  expandedTip.value = expandedTip.value === id ? null : id
}

// "Something else" free-text state
const tiltCustom = ref('')
const boundaryCustom = ref('')
const scaleCustom = ref('')

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

// Per-step validation
const filledBookCount = computed(() => books.value.filter(b => b.title.trim()).length)

const canAdvance = computed(() => {
  switch (formStep.value) {
    case 0: return filledBookCount.value >= 3
    case 1: return true // name is optional
    case 2: return tilt.value.length > 0
    case 3: return !!boundary.value
    case 4: return !!scale.value
    default: return false
  }
})

const canSubmit = computed(() => {
  return filledBookCount.value >= 3 && tilt.value.length > 0 && boundary.value && scale.value
})

function advanceStep() {
  if (canAdvance.value && formStep.value < formSteps.length - 1) {
    transitionDir.value = 'forward'
    formStep.value++
  }
}

function goBack() {
  if (formStep.value > 0) {
    transitionDir.value = 'back'
    formStep.value--
  }
}

// Loading messages cycle
const loadingMessages = [
  'Casting your reading...',
  'Tracing the constellation...',
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
    const filledBooks = books.value
      .filter(b => b.title.trim())
      .map(b => ({
        title: b.title.trim(),
        immersion: b.immersion / 100,
        movedOn: b.movedOn,
      }))

    const payload = {
      books: filledBooks,
      tilt: tilt.value,
      tiltCustom: tiltCustom.value.trim() || null,
      boundary: boundary.value,
      boundaryCustom: boundaryCustom.value.trim() || null,
      scale: scale.value,
      scaleCustom: scaleCustom.value.trim() || null,
    }

    const response = await $fetch('/api/generate-reading', {
      method: 'POST',
      body: payload,
    })

    // Attach reader name to the response (display only, not sent to Claude)
    response.readerName = readerName.value.trim() || null

    // Enrich constellation with immersion data for the card display
    response.constellation = filledBooks.map(b => ({
      title: b.title,
      immersion: b.immersion,
      movedOn: b.movedOn,
    }))

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
    // Focus the error message
    await nextTick()
    errorRef.value?.focus()
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
  font-size: 13px;
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
  margin-bottom: 32px;
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

/* Step counter */
.step-counter {
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
  font-style: italic;
  margin-bottom: 24px;
  letter-spacing: 0.05em;
}

/* Error message */
.error-message {
  border-left: 2px solid var(--accent);
  padding: 14px 18px;
  margin-bottom: 24px;
  background: rgba(184, 168, 120, 0.04);
  border-radius: 0 4px 4px 0;
}
.error-message:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.error-message p {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 300;
  line-height: 1.5;
  margin: 0;
}

.form-section {
  min-height: 200px;
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
  font-size: 13px;
  color: var(--text-muted);
  font-style: italic;
  margin-bottom: 20px;
}

/* Book inputs */
.book-inputs {
  margin-bottom: 16px;
}
.book-entry {
  margin-bottom: 6px;
}
.book-row {
  display: flex;
  align-items: center;
  gap: 12px;
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

/* Book immersion meta */
.book-meta {
  padding: 8px 0 12px 28px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.immersion-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.immersion-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 120px;
  height: 3px;
  border-radius: 2px;
  background: linear-gradient(
    to right,
    var(--accent) 0%,
    var(--accent) calc(var(--immersion) * 100%),
    var(--border) calc(var(--immersion) * 100%),
    var(--border) 100%
  );
  outline: none;
  cursor: pointer;
}

.immersion-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  transition: transform 0.15s ease;
}

.immersion-slider::-webkit-slider-thumb:hover {
  transform: scale(1.3);
}

.immersion-slider::-moz-range-thumb {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  border: none;
  cursor: pointer;
}

.immersion-anchor {
  font-size: 10px;
  color: var(--text-muted);
  font-style: italic;
  white-space: nowrap;
  flex-shrink: 0;
}
.anchor-low { opacity: 0.55; }
.anchor-high { opacity: 0.7; }

.moved-on-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.moved-on-toggle input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border: 1px solid var(--border-light);
  border-radius: 2px;
  background: transparent;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
}

.moved-on-toggle input[type="checkbox"]:checked {
  border-color: var(--accent);
  background: rgba(184, 168, 120, 0.15);
}

.moved-on-toggle input[type="checkbox"]:checked::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 4px;
  width: 4px;
  height: 8px;
  border: solid var(--accent);
  border-width: 0 1.5px 1.5px 0;
  transform: rotate(45deg);
}

.moved-on-label {
  font-size: 13px;
  color: var(--text-muted);
  font-style: italic;
}

/* Add book button */
.btn-add-book {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 13px;
  font-style: italic;
  cursor: pointer;
  padding: 12px 0;
  margin-bottom: 20px;
  transition: color 0.2s ease;
}
.btn-add-book:hover {
  color: var(--text-secondary);
}

/* Name field (step view) */
.name-field-step {
  max-width: 320px;
  margin-top: 16px;
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
.choice-wrap {
  /* wrapper for button + tooltip */
}
.choice-btn {
  width: 100%;
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
  display: flex;
  align-items: center;
  gap: 10px;
}
.choice-text {
  flex: 1;
}
.tip-toggle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid var(--border-light);
  color: var(--text-muted);
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.2s ease;
  cursor: pointer;
  /* Enlarge touch target without changing visual size */
  position: relative;
}
.tip-toggle::after {
  content: '';
  position: absolute;
  inset: -13px;
}
.tip-toggle:hover {
  opacity: 0.8;
}
.choice-tip {
  padding: 8px 18px 10px;
  font-size: 13px;
  color: var(--text-secondary);
  font-style: italic;
  font-weight: 300;
  line-height: 1.65;
  animation: fadeIn 0.25s ease;
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

/* Custom "something else" input */
.choice-custom-input {
  width: 100%;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 13px 18px;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 300;
  outline: none;
  transition: border-color 0.25s ease;
}
.choice-custom-input::placeholder {
  color: var(--text-muted);
  font-style: italic;
  font-size: 14px;
}
.choice-custom-input:focus {
  border-color: var(--accent);
}

/* ---- FORM NAV ---- */
.form-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 36px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.btn-back {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 13px;
  font-style: italic;
  cursor: pointer;
  padding: 10px 16px;
  transition: color 0.2s ease;
}
.btn-back:hover {
  color: var(--text-secondary);
}

.btn-continue {
  background: none;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  padding: 12px 36px;
  color: var(--text-secondary);
  font-size: 14px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-family: var(--font-system);
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-continue:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--text-primary);
}
.btn-continue:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-reveal {
  background: none;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  padding: 14px 44px;
  color: var(--text-secondary);
  font-size: 14px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-family: var(--font-system);
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-reveal:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--text-primary);
}
.btn-reveal:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Validation hint */
.validation-live {
  text-align: center;
  min-height: 24px;
  margin-top: 12px;
}
.step-hint {
  font-size: 13px;
  color: var(--text-muted);
  font-style: italic;
}

/* ---- STEP TRANSITIONS ---- */
.step-forward-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.step-forward-leave-active {
  transition: all 0.2s ease;
}
.step-forward-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.step-forward-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.step-back-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.step-back-leave-active {
  transition: all 0.2s ease;
}
.step-back-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.step-back-leave-to {
  opacity: 0;
  transform: translateY(10px);
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
  max-width: 660px;
}

/* ---- FOCUS ---- */
.btn-begin:focus-visible,
.btn-reveal:focus-visible,
.btn-continue:focus-visible,
.btn-back:focus-visible,
.btn-add-book:focus-visible,
.choice-btn:focus-visible,
.book-input:focus-visible,
.email-input:focus-visible,
.choice-custom-input:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.immersion-slider:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}
.moved-on-toggle input[type="checkbox"]:focus-visible {
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
  .step-forward-enter-active,
  .step-forward-leave-active,
  .step-back-enter-active,
  .step-back-leave-active {
    transition: none !important;
  }
}
</style>
