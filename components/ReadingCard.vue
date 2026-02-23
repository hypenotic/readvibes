<template>
  <article class="card-wrap" :style="themeVars" :aria-label="reading.title || 'Your reading result'">

    <!-- Card body with ornamental frame -->
    <div class="card-body">

      <!-- Ornamental frame overlay (Phase 2) -->
      <OrnamentalFrame aria-hidden="true" />

      <!-- Nebula background (Phase 3) -->
      <NebulaBackground aria-hidden="true" />

      <div class="card-content">

        <!-- Constellation canvas (Phase 3) -->
        <div class="constellation-slot enter-constellation" :class="{ 'pre-enter': !entered.constellation }">
          <ConstellationCanvas
            :books="reading.constellation"
            :temperature="reading.temperature"
            aria-hidden="true"
          />
        </div>

        <!-- Signal trace (decorative, top placement) -->
        <div v-if="reading.signalTrace?.length" class="signal-trace enter-constellation" :class="{ 'pre-enter': !entered.constellation }">
          {{ reading.signalTrace.join(' · ') }}
        </div>

        <!-- Field Signature — HERO (leads the card) -->
        <div class="field-signature enter-signature" :class="{ 'pre-enter': !entered.signature }">
          {{ reading.fieldSignature }}
        </div>

        <!-- Reader name + temporal marker -->
        <div class="reader-info enter-name" :class="{ 'pre-enter': !entered.name }">
          {{ displayName }}<span v-if="displayName && temporalMarker"> &middot; </span>{{ temporalMarker }}
        </div>

        <!-- Posture (context, after the hook) -->
        <div class="posture-label enter-posture" :class="{ 'pre-enter': !entered.posture }">Your reading posture</div>

        <div class="posture-name enter-posture" :class="{ 'pre-enter': !entered.posture }">{{ reading.subtitle }}</div>

        <div v-if="reading.postureDefinition" class="posture-definition enter-posture" :class="{ 'pre-enter': !entered.posture }">
          {{ reading.postureDefinition }}
        </div>

        <!-- Ornamental divider (Phase 2) -->
        <div class="divider-slot enter-ornament" :class="{ 'pre-enter': !entered.ornament }">
          <OrnamentalDivider aria-hidden="true" />
        </div>

        <!-- Reading paragraphs -->
        <div class="reading-text enter-reading" :class="{ 'pre-enter': !entered.reading }">
          <p v-for="(para, i) in reading.paragraphs" :key="i">{{ para }}</p>
        </div>

        <!-- Boundary divider -->
        <div class="boundary-divider enter-boundary" :class="{ 'pre-enter': !entered.boundary }" aria-hidden="true"></div>

        <!-- Boundary -->
        <div class="boundary enter-boundary" :class="{ 'pre-enter': !entered.boundary }">
          <div class="boundary-label">What breaks the spell</div>
          <p>{{ reading.boundary }}</p>
        </div>

        <!-- Book list -->
        <div class="enter-books" :class="{ 'pre-enter': !entered.books }">
          <BookList :books="reading.constellation" />
        </div>

        <!-- Mark -->
        <div class="mark enter-mark" :class="{ 'pre-enter': !entered.mark }">
          <span class="mark-line"></span>
          <span class="mark-text">Read Fortunes</span>
          <span class="mark-line"></span>
        </div>

      </div>
    </div>

    <!-- Recommendations toggle (outside frame) -->
    <div class="recs-toggle">
      <button
        @click="showRecs = !showRecs"
        :aria-expanded="showRecs"
        aria-controls="recommendations-panel"
      >
        {{ showRecs ? 'Hide recommendations' : 'Books that might find you' }}
      </button>
    </div>

    <Transition name="recs-reveal">
      <div v-if="showRecs" id="recommendations-panel" class="recs">
        <div v-if="reading.recsFooter" class="recs-footer">
          <p>{{ reading.recsFooter }}</p>
        </div>

        <ol class="recs-list">
          <li v-for="(rec, i) in reading.recommendations" :key="i" class="rec-item">
            <div class="rec-header">
              <span class="rec-num" aria-hidden="true">{{ numerals[i] }}</span>
              <div>
                <span class="rec-title">{{ rec.title }}</span>
                <span class="rec-author">&mdash; {{ rec.author }}</span>
              </div>
            </div>
            <button
              type="button"
              class="rec-why"
              :aria-expanded="expandedRecs.includes(i)"
              @click="toggleRecNote(i)"
            >
              {{ expandedRecs.includes(i) ? 'Less' : 'Why this?' }}
            </button>
            <Transition name="rec-note-reveal">
              <p v-if="expandedRecs.includes(i)" class="rec-note">{{ rec.note }}</p>
            </Transition>
          </li>
        </ol>

      </div>
    </Transition>

    <!-- Email Reading (always visible, below recs toggle) -->
    <div class="email-section">
      <div v-if="!emailSent" class="email-form">
        <p class="email-prompt">Keep a copy of your Reading?</p>
        <div class="email-row">
          <input
            v-model="email"
            type="email"
            placeholder="your@email.com"
            class="email-input"
            aria-label="Email address"
            @keyup.enter="sendEmail"
          />
          <button
            class="email-btn"
            :disabled="!email.trim() || emailSending"
            @click="sendEmail"
          >
            {{ emailSending ? 'Sending...' : 'Send' }}
          </button>
        </div>
        <p v-if="emailError" class="email-error" role="alert">{{ emailError }}</p>
      </div>
      <p v-else class="email-sent">Sent. Check your inbox.</p>
    </div>
  </article>
</template>

<script setup>
import { useTemperatureTheme } from '~/composables/useTemperatureTheme'
import { useEntranceAnimation } from '~/composables/useEntranceAnimation'
import BookList from '~/components/reading/BookList.vue'
import OrnamentalFrame from '~/components/reading/OrnamentalFrame.vue'
import OrnamentalDivider from '~/components/reading/OrnamentalDivider.vue'
import ConstellationCanvas from '~/components/reading/ConstellationCanvas.vue'
import NebulaBackground from '~/components/reading/NebulaBackground.vue'

const props = defineProps({
  reading: {
    type: Object,
    required: true
  }
})

// Temperature-based color theming
const temperature = computed(() => props.reading.temperature || 'warm')
const { themeVars } = useTemperatureTheme(temperature)

// Entrance animation
const { entered } = useEntranceAnimation()

// UI state
const showRecs = ref(false)
const expandedRecs = ref([])
const numerals = ['I', 'II', 'III', 'IV', 'V']

function toggleRecNote(index) {
  if (expandedRecs.value.includes(index)) {
    expandedRecs.value = expandedRecs.value.filter(i => i !== index)
  } else {
    expandedRecs.value = [...expandedRecs.value, index]
  }
}

// Display name
const displayName = computed(() => props.reading.readerName || '')

// Temporal marker (arcane coordinate from API, fallback to formatted date)
const temporalMarker = computed(() => {
  return props.reading.temporalMarker || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
})

// Email state
const email = ref('')
const emailSending = ref(false)
const emailSent = ref(false)
const emailError = ref('')

async function sendEmail() {
  if (!email.value.trim()) return
  emailSending.value = true
  emailError.value = ''

  try {
    await $fetch('/api/send-reading', {
      method: 'POST',
      body: {
        email: email.value.trim(),
        reading: props.reading,
      },
    })
    emailSent.value = true
  } catch (err) {
    if (err?.statusCode === 429 || err?.status === 429) {
      emailError.value = 'Too many emails sent recently. Try again later.'
    } else {
      emailError.value = 'Couldn\u2019t send. Try again?'
    }
  } finally {
    emailSending.value = false
  }
}
</script>

<style scoped>
/* ── Spacing tokens (golden ratio, base 8px) ── */
.card-wrap {
  --sp-xs: 8px;
  --sp-sm: 13px;
  --sp-md: 21px;
  --sp-lg: 34px;
  --sp-xl: 55px;
  --sp-2xl: 89px;
}

/* ── Card wrapper ── */
.card-wrap {
  width: 100%;
  max-width: 740px;
  margin: 0 auto;
  position: relative;
}

/* ── Breathing halo ── */
.card-wrap::before {
  content: '';
  position: absolute;
  inset: -20px;
  border-radius: 20px;
  background: radial-gradient(ellipse at center, var(--gold-glow, #e8c888) 0%, transparent 70%);
  opacity: 0;
  animation: breathe 7s ease-in-out infinite;
  pointer-events: none;
  z-index: -1;
}

@keyframes breathe {
  0%, 100% { opacity: 0.05; }
  50% { opacity: 0.12; }
}

/* ── Card body ── */
.card-body {
  background: var(--card-bg, #0d0b08);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

/* ── Card content ── */
.card-content {
  position: relative;
  z-index: 1;
  padding: var(--sp-2xl) var(--sp-2xl) var(--sp-xl);
}

/* ── Constellation slot ── */
.constellation-slot {
  margin-bottom: var(--sp-lg);
}

/* ── Posture ── */
.posture-label {
  text-align: center;
  font-family: var(--font-body, 'Source Serif 4', 'Georgia', serif);
  font-size: 11px;
  font-weight: 200;
  letter-spacing: 0.5em;
  text-transform: uppercase;
  color: var(--cream-ghost, #887868);
  margin-bottom: var(--sp-md);
}

.posture-name {
  text-align: center;
  font-family: var(--font-serif, 'Pinyon Script', cursive);
  font-size: 28px;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: var(--gold, #d0a060);
  margin-bottom: var(--sp-md);
}

.posture-definition {
  text-align: center;
  font-family: var(--font-body, 'Source Serif 4', 'Georgia', serif);
  font-size: 16px;
  font-weight: 300;
  font-style: italic;
  color: var(--cream-dim, #a89878);
  margin-bottom: var(--sp-xl);
  line-height: 1.75;
}

/* ── Field Signature — HERO ── */
.field-signature {
  text-align: center;
  font-family: 'Pinyon Script', cursive;
  font-size: 56px;
  font-weight: 400;
  letter-spacing: 0.01em;
  line-height: 1.2;
  color: var(--gold-glow, #e8c888);
  text-shadow: 0 0 40px rgba(232,200,136,0.22), 0 0 80px rgba(232,200,136,0.08);
  margin-bottom: var(--sp-md);
}

/* ── Reader info ── */
.reader-info {
  text-align: center;
  font-family: var(--font-body, 'Source Serif 4', 'Georgia', serif);
  font-size: 11px;
  font-weight: 200;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--cream-dim, #a89878);
  margin-bottom: var(--sp-lg);
}

/* ── Divider slot ── */
.divider-slot {
  display: flex;
  justify-content: center;
  margin-bottom: var(--sp-lg);
}

/* ── Reading text ── */
.reading-text {
  font-family: var(--font-body, 'Source Serif 4', 'Georgia', serif);
  font-size: 20px;
  font-weight: 300;
  line-height: 2.05;
  color: var(--cream-mid, #d8c8a8);
  margin-bottom: var(--sp-lg);
}

.reading-text p {
  margin: 0 0 var(--sp-lg);
}

.reading-text p:last-child {
  margin: 0;
}

/* ── Boundary divider ── */
.boundary-divider {
  width: 120px;
  height: 1px;
  margin: 0 auto var(--sp-lg);
  background: linear-gradient(90deg, transparent, var(--gold-ink, #3a2a14), var(--gold-dark, #6a5428), var(--gold-ink, #3a2a14), transparent);
}

/* ── Boundary ── */
.boundary {
  margin-bottom: var(--sp-lg);
}

.boundary-label {
  font-family: var(--font-body, 'Source Serif 4', 'Georgia', serif);
  font-size: 13px;
  font-weight: 300;
  font-style: italic;
  letter-spacing: 0.06em;
  color: var(--gold-dim, #a08040);
  margin-bottom: var(--sp-sm);
}

.boundary p {
  font-family: var(--font-body, 'Source Serif 4', 'Georgia', serif);
  font-size: 18px;
  font-weight: 300;
  font-style: italic;
  line-height: 2.0;
  color: var(--cream-bnd, #c8b898);
  margin: 0;
}

/* ── Mark ── */
.mark {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: var(--sp-xl);
}

.mark-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold-ink, #3a2a14));
}

.mark-line:last-child {
  background: linear-gradient(90deg, var(--gold-ink, #3a2a14), transparent);
}

.mark-text {
  font-family: var(--font-serif, 'Pinyon Script', cursive);
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0.08em;
  color: var(--gold-dim, #a08040);
}

/* ── Signal trace (decorative, top placement) ── */
.signal-trace {
  text-align: center;
  font-family: var(--font-body, 'Source Serif 4', 'Georgia', serif);
  font-size: 11px;
  font-weight: 300;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cream-ghost, #887868);
  opacity: 0.5;
  margin-bottom: var(--sp-lg);
}

/* ── Recommendations ── */
.recs-toggle {
  margin-top: var(--sp-xl, 55px);
  text-align: center;
}

.recs-toggle button {
  background: none;
  border: 1px solid var(--gold-dark, #6a5428);
  border-radius: 4px;
  padding: 11px 26px;
  color: var(--cream-dim, #a89878);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-family: var(--font-body, 'Source Serif 4', 'Georgia', serif);
  cursor: pointer;
  transition: all 0.3s ease;
}

.recs-toggle button:hover {
  border-color: var(--gold-dim, #a08040);
  color: var(--cream-mid, #d8c8a8);
}

.recs {
  margin-top: var(--sp-lg, 34px);
  padding: 0 4px;
}

.recs-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rec-item {
  margin-bottom: 22px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--gold-ink, #3a2a14);
}

.rec-item:last-child {
  border-bottom: none;
}

.rec-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 5px;
}

.rec-num {
  font-size: 10px;
  color: var(--gold-dark, #6a5428);
  font-family: var(--font-body, 'Source Serif 4', 'Georgia', serif);
  min-width: 16px;
}

.rec-title {
  font-size: 19px;
  color: var(--gold, #d0a060);
  font-weight: 400;
}

.rec-author {
  font-size: 14px;
  color: var(--cream-dim, #a89878);
  margin-left: 8px;
}

.rec-why {
  background: none;
  border: none;
  padding: 0;
  margin: 6px 0 0 26px;
  font-size: 12px;
  font-style: italic;
  color: var(--cream-ghost, #887868);
  cursor: pointer;
  letter-spacing: 0.06em;
  transition: color 0.2s ease;
}

.rec-why:hover {
  color: var(--cream-dim, #a89878);
}

.rec-note {
  margin: 8px 0 0 26px;
  font-size: 16px;
  line-height: 1.8;
  color: var(--cream-dim, #a89878);
  font-weight: 300;
}

/* Rec note reveal transition */
.rec-note-reveal-enter-active {
  transition: all 0.35s ease;
}
.rec-note-reveal-leave-active {
  transition: all 0.25s ease;
}
.rec-note-reveal-enter-from {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
}
.rec-note-reveal-leave-to {
  opacity: 0;
}

.recs-footer {
  text-align: center;
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--gold-ink, #3a2a14);
}

.recs-footer p {
  font-size: 14px;
  line-height: 1.8;
  color: var(--cream-ghost, #887868);
  font-style: italic;
  max-width: 420px;
  margin: 0 auto;
}

/* ── Focus ── */
.recs-toggle button:focus-visible,
.rec-why:focus-visible,
.email-btn:focus-visible,
.email-input:focus-visible {
  outline: 2px solid var(--gold, #d0a060);
  outline-offset: 2px;
}

/* ── Email section ── */
.email-section {
  margin-top: var(--sp-xl, 55px);
  text-align: center;
}

.email-prompt {
  font-size: 13px;
  color: var(--cream-dim, #a89878);
  margin-bottom: 12px;
  letter-spacing: 0.05em;
}

.email-row {
  display: flex;
  gap: 8px;
  max-width: 320px;
  margin: 0 auto;
}

.email-input {
  flex: 1;
  background: transparent;
  border: 1px solid var(--gold-dark, #6a5428);
  border-radius: 4px;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--cream-mid, #d8c8a8);
  font-family: inherit;
  outline: none;
  transition: border-color 0.3s ease;
}

.email-input::placeholder {
  color: var(--cream-ghost, #887868);
  font-style: italic;
}

.email-input:focus {
  border-color: var(--gold-dim, #a08040);
}

.email-btn {
  background: none;
  border: 1px solid var(--gold-dark, #6a5428);
  border-radius: 4px;
  padding: 10px 20px;
  color: var(--cream-dim, #a89878);
  font-size: 12px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-family: var(--font-body, 'Source Serif 4', 'Georgia', serif);
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.email-btn:hover:not(:disabled) {
  border-color: var(--gold-dim, #a08040);
  color: var(--cream-mid, #d8c8a8);
}

.email-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.email-error {
  margin-top: 8px;
  font-size: 12px;
  color: var(--cream-dim, #a89878);
  font-style: italic;
}

.email-sent {
  font-size: 13px;
  color: var(--cream-dim, #a89878);
  font-style: italic;
  letter-spacing: 0.05em;
}

/* ── Entrance animation classes ── */
.pre-enter {
  opacity: 0;
}

.enter-constellation.pre-enter {
  filter: blur(3px);
}

.enter-posture.pre-enter,
.enter-name.pre-enter,
.enter-ornament.pre-enter,
.enter-mark.pre-enter {
  /* pure fade */
}

.enter-signature.pre-enter {
  transform: translateY(12px);
  filter: blur(4px);
}

.enter-reading.pre-enter,
.enter-boundary.pre-enter,
.enter-books.pre-enter {
  transform: translateY(12px);
}

/* Transition durations per element */
.enter-constellation { transition: opacity 2.0s ease, filter 2.0s ease; }
.enter-posture { transition: opacity 1.5s ease; }
.enter-signature { transition: opacity 1.8s cubic-bezier(0.16,1,0.3,1), transform 1.8s cubic-bezier(0.16,1,0.3,1), filter 1.8s cubic-bezier(0.16,1,0.3,1); }
.enter-name { transition: opacity 1.0s ease; }
.enter-ornament { transition: opacity 1.0s ease; }
.enter-reading { transition: opacity 1.5s ease, transform 1.5s ease; }
.enter-boundary { transition: opacity 1.2s ease, transform 1.2s ease; }
.enter-books { transition: opacity 1.0s ease, transform 1.0s ease; }
.enter-mark { transition: opacity 1.5s ease; }

/* ── Recs transition ── */
.recs-reveal-enter-active { transition: all 0.4s ease; }
.recs-reveal-leave-active { transition: all 0.3s ease; }
.recs-reveal-enter-from { opacity: 0; transform: translateY(10px); }
.recs-reveal-leave-to { opacity: 0; }

/* ── Responsive ── */
@media (max-width: 780px) {
  .card-content {
    padding: var(--sp-xl) var(--sp-lg) var(--sp-lg);
  }

  .field-signature {
    font-size: 38px;
  }

  .reading-text {
    font-size: 18px;
    line-height: 2.0;
  }

  .boundary p {
    font-size: 16px;
  }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .card-wrap::before {
    animation: none;
    opacity: 0.04;
  }

  .pre-enter {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }

  .enter-constellation,
  .enter-posture,
  .enter-signature,
  .enter-name,
  .enter-ornament,
  .enter-reading,
  .enter-boundary,
  .enter-books,
  .enter-mark {
    transition: none !important;
  }
}
</style>
