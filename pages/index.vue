<template>
  <main class="intake">
    <!-- Starfield background -->
    <StarfieldCanvas :temperature="reading?.temperature || 'warm'" />

    <!-- INTRO STATE -->
    <div v-if="step === 'intro'" class="intro">
      <div class="intro-glyph" aria-hidden="true">◈</div>
      <h1>Read Fortunes</h1>
      <p class="intro-sub">Uncover the forces currently working on you.<br>Then let them lead you to what's next.</p>
      <div class="intro-divider" aria-hidden="true">
        <span class="line"></span>
        <span class="dot"></span>
        <span class="line"></span>
      </div>
      <button class="btn-begin" @click="step = 'form'">Begin</button>
      <p class="intro-note">Takes about two minutes. No account needed.</p>
    </div>

    <!-- FORM STATE (step-by-step) -->
    <div v-if="step === 'form'" class="form-wrap">

      <!-- Error message -->
      <div v-if="error" class="error-message" role="alert" tabindex="-1" ref="errorRef">
        <p>{{ error }}</p>
      </div>

      <!-- Step transitions -->
      <Transition :name="transitionName" mode="out-in">

        <!-- Step 0: Books + Name -->
        <section v-if="formStep === 0" key="books" class="form-section" aria-labelledby="books-heading">
          <h2 id="books-heading">Books that have stayed with you</h2>
          <p class="section-desc">Not the best. The ones that linger. Three minimum — five or more is better.</p>

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
            </div>
          </div>

          <button
            v-if="books.length < 10"
            type="button"
            class="btn-add-book"
            @click="addBook"
          >
            + Add another book <span class="book-count-hint">({{ books.length }} of 10)</span>
          </button>

          <!-- Name field folded into books step -->
          <div class="name-field-inline">
            <input
              id="reader-name"
              v-model="readerName"
              type="text"
              placeholder="First name (optional)"
              class="book-input name-input"
              autocomplete="given-name"
              aria-label="First name (optional)"
              @keydown.enter.prevent="canAdvance ? advanceStep() : null"
            />
          </div>
        </section>

        <!-- Step 1: Forces -->
        <section v-else-if="formStep === 1" key="forces" class="form-section" aria-labelledby="forces-heading">
          <!-- Loading state while generating forces -->
          <div v-if="forcesLoading" class="forces-loading" role="status" aria-live="polite" aria-busy="true">
            <div class="forces-loading-glyph" aria-hidden="true">◈</div>
            <p class="forces-loading-text">Tracing the constellation…</p>
          </div>

          <!-- Force field display -->
          <template v-else-if="generatedForces.length > 0">
            <h2 id="forces-heading">You reach for…</h2>
            <p class="section-desc forces-instruction">Select the ones that feel like yours.</p>

            <div class="forces-field" role="group" aria-labelledby="forces-heading">
              <button
                v-for="(phrase, i) in generatedForces"
                :key="i"
                type="button"
                class="force-phrase"
                :class="{ selected: selectedForces.includes(phrase) }"
                :aria-pressed="selectedForces.includes(phrase)"
                @click="toggleForce(phrase)"
              >
                {{ phrase }}
              </button>
            </div>
          </template>

          <!-- Error state -->
          <div v-else-if="forcesError" class="forces-error" role="alert">
            <p>{{ forcesError }}</p>
            <button type="button" class="btn-retry" @click="fetchForces">Try again</button>
          </div>
        </section>

        <!-- Step 2: Spell Break + Cast -->
        <section v-else-if="formStep === 2" key="spellbreak" class="form-section" aria-labelledby="spellbreak-heading">
          <h2 id="spellbreak-heading">What breaks the spell?</h2>
          <p class="section-desc">Name the thing that pulls you out of a book.</p>

          <div class="spellbreak-field">
            <input
              id="spell-break"
              v-model="spellBreak"
              type="text"
              maxlength="300"
              placeholder="When a book…"
              class="book-input spell-break-input"
              aria-label="What breaks the spell"
              @keydown.enter.prevent="canSubmit ? submitReading() : null"
            />
          </div>

          <!-- Cast button — the climax -->
          <div class="cast-stage">
            <div class="cast-glow" aria-hidden="true"></div>
            <button
              type="button"
              class="btn-cast"
              :class="{ ready: canSubmit, charging: loading }"
              :disabled="!canSubmit || loading"
              @click="submitReading"
            >
              <span class="cast-text">{{ loading ? 'Casting…' : 'Cast your reading' }}</span>
            </button>
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
        <!-- Cast button lives inside the spell break section now, not here -->
        <span v-else></span>
      </div>

      <!-- Validation hint -->
      <div aria-live="polite" class="validation-live">
        <p v-if="formStep === 0 && filledBookCount < 3" class="step-hint">
          {{ filledBookCount === 0 ? 'Add at least three books to continue.' : `${filledBookCount} of 3 minimum books entered.` }}
        </p>
      </div>
    </div>

    <!-- LOADING STATE -->
    <div v-if="step === 'loading'" class="loading-state" role="status" aria-live="polite" aria-busy="true">
      <div class="loading-orb" aria-hidden="true">
        <div class="orb-ring ring-1"></div>
        <div class="orb-ring ring-2"></div>
        <div class="orb-ring ring-3"></div>
        <div class="orb-core">◈</div>
      </div>
      <Transition name="loading-fade" mode="out-in">
        <p class="loading-text" :key="loadingMessage">{{ loadingMessage }}</p>
      </Transition>
    </div>

    <!-- READING STATE -->
    <div v-if="step === 'reading'" class="reading-wrap">
      <ReadingCard :reading="reading" />

      <div class="reset-link">
        <button type="button" class="btn-reset" @click="resetEverything">Take another reading</button>
      </div>
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

// 3-step form: books+name → forces → spellbreak+cast
const formSteps = ['books', 'forces', 'spellbreak']
const formStep = ref(0)
const transitionDir = ref('forward')

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

// Form state
const readerName = ref('')
const makeBook = () => ({ title: '' })
const books = ref([makeBook(), makeBook(), makeBook()])

// Forces state
const generatedForces = ref([])
const selectedForces = ref([])
const forcesLoading = ref(false)
const forcesError = ref('')

// Spell break state
const spellBreak = ref('')

// Focus management on form step transitions
watch(() => formStep.value, async () => {
  await nextTick()
  focusFirstInput()
})

// Clear error when user interacts with form
watch([() => books.value.map(b => b.title).join(','), selectedForces, spellBreak], () => {
  if (error.value) error.value = ''
})

function focusFirstInput() {
  const wrap = document.querySelector('.form-section')
  if (!wrap) return
  const focusable = wrap.querySelector('input, button:not(.btn-add-book):not(.btn-retry):not(.btn-cast)')
  focusable?.focus()
}

const bookPlaceholders = [
  'A book that changed how you see things',
  'One you\'ve read more than once',
  'The one you recommend to people',
  'A book you think about unexpectedly',
  'One that felt written for you',
  'One you press into other people\'s hands',
  'A book you return to in your head',
  'One that rearranged something',
  'The one nobody else seems to know',
  'A book that still isn\'t finished with you',
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
  if (books.value[i].title.trim() && i < books.value.length - 1) {
    document.getElementById('book-' + (i + 1))?.focus()
  } else if (books.value[i].title.trim() && books.value.length < 10) {
    addBook()
  } else if (canAdvance.value) {
    advanceStep()
  }
}

function toggleForce(phrase) {
  if (selectedForces.value.includes(phrase)) {
    selectedForces.value = selectedForces.value.filter(f => f !== phrase)
  } else {
    selectedForces.value = [...selectedForces.value, phrase]
  }
}

// Per-step validation
const filledBookCount = computed(() => books.value.filter(b => b.title.trim()).length)

const canAdvance = computed(() => {
  switch (formStep.value) {
    case 0: return filledBookCount.value >= 3
    case 1: return selectedForces.value.length > 0
    case 2: return !!spellBreak.value.trim()
    default: return false
  }
})

const canSubmit = computed(() => {
  return filledBookCount.value >= 3 && selectedForces.value.length > 0 && !!spellBreak.value.trim()
})

async function fetchForces() {
  forcesLoading.value = true
  forcesError.value = ''

  try {
    const titles = books.value
      .filter(b => b.title.trim())
      .map(b => b.title.trim())

    const response = await $fetch('/api/generate-forces', {
      method: 'POST',
      body: { books: titles },
    })

    generatedForces.value = response
    selectedForces.value = []
  } catch (err) {
    console.error('Failed to generate forces:', err)
    if (err?.statusCode === 429 || err?.status === 429) {
      forcesError.value = 'Too many requests. Please wait a moment and try again.'
    } else {
      forcesError.value = 'Something went wrong generating your forces. Please try again.'
    }
  } finally {
    forcesLoading.value = false
  }
}

async function advanceStep() {
  if (!canAdvance.value) return
  if (formStep.value >= formSteps.length - 1) return

  const nextStep = formStep.value + 1

  // If moving to forces step and forces not yet loaded, fetch them
  if (formSteps[nextStep] === 'forces' && generatedForces.value.length === 0) {
    transitionDir.value = 'forward'
    formStep.value = nextStep
    await fetchForces()
    return
  }

  transitionDir.value = 'forward'
  formStep.value = nextStep
}

function goBack() {
  if (formStep.value > 0) {
    transitionDir.value = 'back'
    formStep.value--
  }
}

// Loading messages cycle with slower cadence
const loadingMessages = [
  'Casting your reading…',
  'Tracing the forces…',
  'Finding the posture…',
  'Writing your reading…',
]
const loadingMessage = ref(loadingMessages[0])

function resetEverything() {
  step.value = 'intro'
  formStep.value = 0
  reading.value = null
  error.value = ''
  readerName.value = ''
  books.value = [makeBook(), makeBook(), makeBook()]
  generatedForces.value = []
  selectedForces.value = []
  spellBreak.value = ''
  forcesError.value = ''
  loadingMessage.value = loadingMessages[0]
}

async function submitReading() {
  error.value = ''
  loading.value = true
  step.value = 'loading'

  // Cycle loading messages — slower for ceremony
  let msgIndex = 0
  const msgInterval = setInterval(() => {
    msgIndex = (msgIndex + 1) % loadingMessages.length
    loadingMessage.value = loadingMessages[msgIndex]
  }, 4200)

  try {
    const filledBooks = books.value
      .filter(b => b.title.trim())
      .map(b => ({ title: b.title.trim() }))

    const payload = {
      books: filledBooks,
      forces: selectedForces.value,
      spellBreak: spellBreak.value.trim(),
    }

    const response = await $fetch('/api/generate-reading', {
      method: 'POST',
      body: payload,
    })

    response.readerName = readerName.value.trim() || null
    response.constellation = filledBooks.map(b => b.title)

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
  justify-content: center;
  padding: 60px 20px 100px;
  position: relative;
}

/* ---- INTRO ---- */
.intro {
  text-align: center;
  max-width: 500px;
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
  font-size: 54px;
  font-weight: 300;
  font-style: italic;
  color: var(--text-primary);
  font-family: var(--font-serif);
  letter-spacing: 0.02em;
  margin-bottom: 24px;
  line-height: 1.1;
}
.intro-sub {
  font-size: 19px;
  color: var(--text-secondary);
  line-height: 1.8;
  font-weight: 300;
  margin-bottom: 44px;
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
  padding: 16px 56px;
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
  max-width: 580px;
  animation: fadeIn 0.8s ease;
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
  font-size: 26px;
  font-weight: 400;
  color: var(--text-primary);
  letter-spacing: 0.04em;
  margin-bottom: 10px;
}
.section-desc {
  font-size: 17px;
  color: var(--text-secondary);
  font-weight: 300;
  line-height: 1.7;
  margin-bottom: 24px;
}
.forces-instruction {
  color: var(--text-muted);
  font-style: italic;
  margin-bottom: 20px;
}

/* Book inputs */
.book-inputs {
  margin-bottom: 16px;
}
.book-entry {
  margin-bottom: 4px;
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
  padding: 12px 0;
  font-size: 18px;
  color: var(--text-primary);
  font-weight: 300;
  outline: none;
  transition: border-color 0.3s ease;
}
.book-input::placeholder {
  color: var(--text-muted);
  font-style: italic;
  font-size: 16px;
}
.book-input:focus {
  border-color: var(--accent);
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
  margin-bottom: 8px;
  transition: color 0.2s ease;
}
.btn-add-book:hover {
  color: var(--text-secondary);
}
.book-count-hint {
  opacity: 0.6;
  font-size: 12px;
}

/* Name field (inline at bottom of books step) */
.name-field-inline {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  max-width: 320px;
}
.name-input {
  width: 100%;
}

/* ---- FORCES ---- */
.forces-loading {
  text-align: center;
  padding: 60px 0;
}
.forces-loading-glyph {
  font-size: 32px;
  color: var(--accent);
  opacity: 0.3;
  margin-bottom: 24px;
  animation: pulse 2.5s ease-in-out infinite;
}
.forces-loading-text {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 300;
  font-style: italic;
}

.forces-field {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 8px;
}

.force-phrase {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 10px 22px;
  color: var(--text-secondary);
  font-family: var(--font-serif, 'Cormorant', 'Cormorant Garamond', 'Georgia', serif);
  font-size: 17px;
  font-weight: 400;
  font-style: italic;
  cursor: pointer;
  transition: all 0.25s ease;
  line-height: 1.3;
}
.force-phrase:hover {
  border-color: var(--border-light);
  color: var(--text-primary);
}
.force-phrase.selected {
  border-color: var(--accent);
  color: var(--text-primary);
  background: rgba(154, 138, 106, 0.08);
  box-shadow: 0 0 12px rgba(184, 168, 120, 0.08);
}

.forces-error {
  text-align: center;
  padding: 40px 0;
}
.forces-error p {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 300;
  margin-bottom: 16px;
}
.btn-retry {
  background: none;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  padding: 10px 24px;
  color: var(--text-secondary);
  font-size: 13px;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-retry:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

/* ---- SPELL BREAK ---- */
.spellbreak-field {
  margin-top: 16px;
}
.spell-break-input {
  width: 100%;
  border-bottom: 1px solid var(--border-light);
}

/* ---- CAST BUTTON — THE CLIMAX ---- */
.cast-stage {
  position: relative;
  display: flex;
  justify-content: center;
  margin-top: 56px;
  padding-top: 40px;
}

.cast-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 280px;
  height: 120px;
  border-radius: 60px;
  background: radial-gradient(ellipse at center, rgba(232,200,136,0.12) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.6s ease;
  pointer-events: none;
}

.btn-cast {
  position: relative;
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 22px 64px;
  color: var(--text-muted);
  font-size: 16px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-family: var(--font-body, 'Source Serif 4', 'Georgia', serif);
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  z-index: 1;
}

.btn-cast::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 6px;
  background: linear-gradient(135deg, transparent 30%, rgba(232,200,136,0.15) 50%, transparent 70%);
  background-size: 200% 200%;
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: -1;
}

.btn-cast::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 300%;
  height: 300%;
  background: radial-gradient(circle, rgba(232,200,136,0.2) 0%, transparent 60%);
  border-radius: 50%;
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease;
  opacity: 0;
  z-index: -1;
}

/* Ready state — spell break is filled */
.btn-cast.ready {
  border-color: var(--accent);
  color: var(--text-primary);
  box-shadow: 0 0 20px rgba(184, 168, 120, 0.08), 0 0 60px rgba(184, 168, 120, 0.04);
}

.btn-cast.ready::before {
  opacity: 1;
  animation: shimmer 3s ease-in-out infinite;
}

.btn-cast.ready ~ .cast-glow {
  opacity: 1;
  animation: castBreathe 4s ease-in-out infinite;
}

.btn-cast.ready:hover {
  transform: scale(1.03);
  box-shadow: 0 0 30px rgba(184, 168, 120, 0.15), 0 0 80px rgba(184, 168, 120, 0.06);
  border-color: var(--gold, #d0a060);
}

.btn-cast.ready:hover::after {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}

/* Charging state — clicked, submitting */
.btn-cast.charging {
  animation: castPulse 1.5s ease-in-out infinite;
  border-color: var(--gold, #d0a060);
}

.btn-cast:disabled:not(.ready):not(.charging) {
  opacity: 0.25;
  cursor: not-allowed;
}

.cast-text {
  position: relative;
  z-index: 2;
}

@keyframes shimmer {
  0% { background-position: 200% 200%; }
  50% { background-position: 0% 0%; }
  100% { background-position: 200% 200%; }
}

@keyframes castBreathe {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
}

@keyframes castPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(184, 168, 120, 0.1); }
  50% { box-shadow: 0 0 40px rgba(184, 168, 120, 0.25), 0 0 80px rgba(184, 168, 120, 0.1); }
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

/* Validation hint */
.validation-live {
  text-align: center;
  min-height: 24px;
  margin-top: 12px;
}
.step-hint {
  font-size: 14px;
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

.loading-orb {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 40px;
}

.orb-core {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: var(--accent);
  opacity: 0.5;
  animation: pulse 3s ease-in-out infinite;
}

.orb-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid transparent;
}

.ring-1 {
  border-color: rgba(184, 168, 120, 0.15);
  animation: orbSpin1 8s linear infinite;
}
.ring-2 {
  inset: 10px;
  border-color: rgba(184, 168, 120, 0.1);
  border-style: dashed;
  animation: orbSpin2 12s linear infinite reverse;
}
.ring-3 {
  inset: 22px;
  border-color: rgba(184, 168, 120, 0.08);
  animation: orbSpin1 16s linear infinite;
}

@keyframes orbSpin1 {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes orbSpin2 {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 300;
  font-style: italic;
}

/* Loading message fade transition */
.loading-fade-enter-active {
  transition: all 0.6s ease;
}
.loading-fade-leave-active {
  transition: all 0.4s ease;
}
.loading-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.loading-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ---- READING ---- */
.reading-wrap {
  width: 100%;
  max-width: 780px;
}

.reset-link {
  text-align: center;
  margin-top: 55px;
}
.btn-reset {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 13px;
  font-style: italic;
  letter-spacing: 0.08em;
  cursor: pointer;
  padding: 10px 20px;
  transition: color 0.3s ease;
}
.btn-reset:hover {
  color: var(--text-secondary);
}

/* ---- FOCUS ---- */
.btn-begin:focus-visible,
.btn-cast:focus-visible,
.btn-continue:focus-visible,
.btn-back:focus-visible,
.btn-add-book:focus-visible,
.btn-retry:focus-visible,
.btn-reset:focus-visible,
.force-phrase:focus-visible,
.book-input:focus-visible,
.spell-break-input:focus-visible {
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
  .loading-fade-enter-active,
  .loading-fade-leave-active {
    transition: none !important;
  }
  .btn-cast.ready::before {
    animation: none;
    opacity: 0;
  }
  .cast-glow {
    display: none;
  }
}
</style>
