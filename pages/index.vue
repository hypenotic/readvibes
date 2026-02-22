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

        <!-- Step 2: Forces -->
        <section v-else-if="formStep === 2" key="forces" class="form-section" aria-labelledby="forces-heading">
          <!-- Loading state while generating forces -->
          <div v-if="forcesLoading" class="forces-loading" role="status" aria-live="polite" aria-busy="true">
            <div class="forces-loading-glyph" aria-hidden="true">◈</div>
            <p class="forces-loading-text">Tracing the constellation…</p>
          </div>

          <!-- Force field display -->
          <template v-else-if="generatedForces.length > 0">
            <h2 id="forces-heading">You reach for…</h2>

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

        <!-- Step 3: Spell Break -->
        <section v-else-if="formStep === 3" key="spellbreak" class="form-section" aria-labelledby="spellbreak-heading">
          <h2 id="spellbreak-heading">What breaks the spell?</h2>
          <p class="section-desc">The moment a book lost your trust.</p>

          <div class="spellbreak-field">
            <input
              id="spell-break"
              v-model="spellBreak"
              type="text"
              maxlength="300"
              placeholder="When a book…"
              class="book-input spell-break-input"
              aria-label="What breaks the spell — the moment a book lost your trust"
              @keydown.enter.prevent="canAdvance ? advanceStep() : null"
            />
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
        <p v-if="formStep === 2 && !forcesLoading && generatedForces.length > 0 && selectedForces.length === 0" class="step-hint">
          Touch the ones that resonate.
        </p>
        <p v-if="formStep === 3 && !spellBreak.trim()" class="step-hint">
          One sentence to cast your reading.
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
const formSteps = ['books', 'name', 'forces', 'spellbreak']
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
  const focusable = wrap.querySelector('input, button:not(.btn-add-book):not(.btn-retry)')
  focusable?.focus()
}

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
    case 1: return true // name is optional
    case 2: return selectedForces.value.length > 0
    case 3: return !!spellBreak.value.trim()
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
    // Clear any previous selections when forces are regenerated
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
  if (!canAdvance.value && formStep.value !== 1) return
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

// Loading messages cycle
const loadingMessages = [
  'Casting your reading…',
  'Tracing the forces…',
  'Finding the posture…',
  'Writing your reading…',
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

    // Attach reader name to the response (display only, not sent to Claude)
    response.readerName = readerName.value.trim() || null

    // Constellation is now just title strings
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

/* ---- FORCES ---- */
.forces-loading {
  text-align: center;
  padding: 40px 0;
}
.forces-loading-glyph {
  font-size: 28px;
  color: var(--accent);
  opacity: 0.3;
  margin-bottom: 20px;
  animation: pulse 2s ease-in-out infinite;
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
  margin-top: 24px;
}

.force-phrase {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 9px 20px;
  color: var(--text-secondary);
  font-family: var(--font-serif, 'Cormorant', 'Cormorant Garamond', 'Georgia', serif);
  font-size: 15px;
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
.btn-retry:focus-visible,
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
}
</style>
