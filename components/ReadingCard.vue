<template>
  <article class="card-wrap" :style="cardVars" aria-label="Your reading result">
    <div class="card-outer">
      <div class="card-inner">
        <div class="corner tl" aria-hidden="true"></div>
        <div class="corner tr" aria-hidden="true"></div>
        <div class="corner bl" aria-hidden="true"></div>
        <div class="corner br" aria-hidden="true"></div>

        <div class="top-label">{{ reading.readerName || 'My Reading' }}</div>
        <div class="line-divider" aria-hidden="true"></div>
        <div class="glyph" aria-hidden="true">{{ reading.glyph || '◈' }}</div>

        <h1 class="title">{{ reading.title }}</h1>
        <div class="subtitle">{{ reading.subtitle }}</div>

        <div class="rule-divider" aria-hidden="true">
          <div class="line l"></div>
          <div class="dot"></div>
          <div class="line r"></div>
        </div>

        <div class="reading-text">
          <p v-for="(para, i) in reading.paragraphs" :key="i">{{ para }}</p>
        </div>

        <div class="boundary">
          <p>{{ reading.boundary }}</p>
        </div>

        <div class="rule-divider" style="margin-bottom: 20px;" aria-hidden="true">
          <div class="line l"></div>
          <div class="dot"></div>
          <div class="line r"></div>
        </div>

        <div class="sig-label">Field Signature</div>
        <div class="sig-value">{{ reading.fieldSignature }}</div>
      </div>
    </div>

    <!-- Constellation -->
    <div class="constellation">
      <h2 class="constellation-label">The Constellation</h2>
      <ul class="constellation-pills">
        <li v-for="book in reading.constellation" :key="book">{{ book }}</li>
      </ul>
    </div>

    <!-- Recommendations toggle -->
    <div class="recs-toggle">
      <button
        @click="showRecs = !showRecs"
        :aria-expanded="showRecs"
        aria-controls="recommendations-panel"
      >
        {{ showRecs ? 'Close' : 'Five Books for Your Field' }}
      </button>
    </div>

    <Transition name="recs-reveal">
      <div v-if="showRecs" id="recommendations-panel" class="recs">
        <ol class="recs-list">
          <li v-for="(rec, i) in reading.recommendations" :key="i" class="rec-item">
            <div class="rec-header">
              <span class="rec-num" aria-hidden="true">{{ numerals[i] }}</span>
              <div>
                <span class="rec-title">{{ rec.title }}</span>
                <span class="rec-author">— {{ rec.author }}</span>
              </div>
            </div>
            <p class="rec-note">{{ rec.note }}</p>
          </li>
        </ol>

        <div class="recs-footer">
          <p>{{ reading.recsFooter }}</p>
        </div>
      </div>
    </Transition>

    <div class="mark">Readvibes</div>

    <!-- Email Reading -->
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
        <p v-if="emailError" class="email-error">{{ emailError }}</p>
      </div>
      <p v-else class="email-sent">Sent. Check your inbox.</p>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  reading: {
    type: Object,
    required: true
  }
})

const showRecs = ref(false)
const numerals = ['I', 'II', 'III', 'IV', 'V']

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
    emailError.value = 'Couldn\u2019t send. Try again?'
  } finally {
    emailSending.value = false
  }
}

// Dynamic color theming based on posture temperature
const cardVars = computed(() => {
  const temp = props.reading.temperature || 'neutral'

  const themes = {
    warm: {
      '--card-accent': '#c4a265',
      '--card-text': '#c8b898',
      '--card-text-body': '#a89878',
      '--card-text-muted': '#6a5a42',
      '--card-text-dim': '#3a3020',
      '--card-border': '#2a2418',
      '--card-border-light': '#352e20',
      '--card-bg-start': '#16130e',
      '--card-bg-mid': '#0e0c08',
      '--card-bg-end': '#16130e',
      '--card-glow': 'rgba(180, 150, 90, 0.04)',
    },
    cool: {
      '--card-accent': '#7a8ba8',
      '--card-text': '#c0c8d8',
      '--card-text-body': '#97a3b8',
      '--card-text-muted': '#5a6578',
      '--card-text-dim': '#3a4255',
      '--card-border': '#1a1e28',
      '--card-border-light': '#252a35',
      '--card-bg-start': '#10121a',
      '--card-bg-mid': '#0a0b10',
      '--card-bg-end': '#10121a',
      '--card-glow': 'rgba(120, 140, 180, 0.04)',
    },
    earthen: {
      '--card-accent': '#a07850',
      '--card-text': '#d4c0a8',
      '--card-text-body': '#b0a090',
      '--card-text-muted': '#6a5a48',
      '--card-text-dim': '#3a3028',
      '--card-border': '#221c18',
      '--card-border-light': '#2e2520',
      '--card-bg-start': '#171210',
      '--card-bg-mid': '#0e0c0a',
      '--card-bg-end': '#171210',
      '--card-glow': 'rgba(160, 120, 70, 0.04)',
    },
    neutral: {
      '--card-accent': '#9a8a6a',
      '--card-text': '#c8cdd8',
      '--card-text-body': '#97a3a8',
      '--card-text-muted': '#5a6068',
      '--card-text-dim': '#3a3a40',
      '--card-border': '#1a1c20',
      '--card-border-light': '#252830',
      '--card-bg-start': '#121418',
      '--card-bg-mid': '#0a0b0e',
      '--card-bg-end': '#121418',
      '--card-glow': 'rgba(150, 140, 120, 0.04)',
    },
  }

  return themes[temp] || themes.neutral
})
</script>

<style scoped>
.card-wrap {
  width: 100%; max-width: 420px;
  margin: 0 auto;
}

.card-outer {
  background: linear-gradient(175deg, var(--card-bg-start) 0%, var(--card-bg-mid) 50%, var(--card-bg-end) 100%);
  border: 1px solid var(--card-border-light);
  border-radius: 8px;
  padding: 2px;
  box-shadow: 0 0 60px var(--card-glow), 0 20px 60px rgba(0,0,0,0.6);
}

.card-inner {
  border: 1px solid var(--card-border);
  border-radius: 7px;
  padding: 36px 28px 32px;
  position: relative;
  overflow: hidden;
}

.corner {
  position: absolute;
  width: 14px; height: 14px;
  border-color: var(--card-text-dim);
  border-style: solid;
  border-width: 0;
}
.corner.tl { top: 10px; left: 14px; border-top-width: 1px; border-left-width: 1px; }
.corner.tr { top: 10px; right: 14px; border-top-width: 1px; border-right-width: 1px; }
.corner.bl { bottom: 10px; left: 14px; border-bottom-width: 1px; border-left-width: 1px; }
.corner.br { bottom: 10px; right: 14px; border-bottom-width: 1px; border-right-width: 1px; }

.top-label {
  text-align: center; margin-bottom: 22px;
  letter-spacing: 0.35em; font-size: 11px;
  color: var(--card-text-muted); text-transform: uppercase;
  font-family: 'Georgia', serif;
}

.line-divider {
  width: 40px; height: 1px; margin: 0 auto 26px;
  background: linear-gradient(90deg, transparent, var(--card-text-dim), transparent);
}

.glyph {
  text-align: center; margin-bottom: 22px;
  font-size: 22px; color: var(--card-accent);
  opacity: 0.5; line-height: 1;
  letter-spacing: 0.3em;
}

.title {
  text-align: center; margin: 0 0 6px;
  font-size: 30px; font-weight: 400;
  color: var(--card-text);
  letter-spacing: 0.06em;
  line-height: 1.1;
}

.subtitle {
  text-align: center; margin-bottom: 30px;
  font-size: 12px; color: var(--card-text-muted);
  letter-spacing: 0.2em; text-transform: uppercase;
  font-family: 'Georgia', serif;
}

.rule-divider {
  display: flex; align-items: center; gap: 16px;
  margin: 0 auto 28px; max-width: 180px;
}
.rule-divider .line { flex: 1; height: 1px; }
.rule-divider .line.l { background: linear-gradient(90deg, transparent, var(--card-border)); }
.rule-divider .line.r { background: linear-gradient(90deg, var(--card-border), transparent); }
.rule-divider .dot { width: 3px; height: 3px; border-radius: 50%; background: var(--card-text-dim); }

.reading-text {
  font-size: 17px; line-height: 1.8;
  color: var(--card-text-body);
  text-align: left;
  margin-bottom: 28px;
  font-weight: 300;
}
.reading-text p { margin: 0 0 14px; }
.reading-text p:last-child { margin: 0; }

.boundary {
  border-top: 1px solid var(--card-border);
  padding-top: 20px; margin-bottom: 26px;
}
.boundary p {
  font-size: 15px; line-height: 1.7;
  color: var(--card-text-muted);
  font-style: italic;
  margin: 0;
}

.sig-label {
  text-align: center;
  font-size: 10px; letter-spacing: 0.25em;
  color: var(--card-text-muted); text-transform: uppercase;
  font-family: 'Georgia', serif;
  margin-bottom: 5px;
}
.sig-value {
  text-align: center;
  font-size: 21px; color: var(--card-accent);
  font-weight: 400; font-style: italic;
  letter-spacing: 0.03em;
}

/* Constellation */
.constellation {
  margin-top: 32px; padding: 0 8px;
}
.constellation-label {
  text-align: center; margin-bottom: 18px;
  font-size: 11px; letter-spacing: 0.35em;
  color: var(--card-text-dim); text-transform: uppercase;
  font-family: 'Georgia', serif;
  font-weight: 400;
}
.constellation-pills {
  display: flex; flex-wrap: wrap;
  justify-content: center; gap: 5px;
  list-style: none;
  padding: 0;
}
.constellation-pills li {
  font-size: 11px; color: var(--card-text-muted);
  padding: 3px 9px;
  border: 1px solid var(--card-border);
  border-radius: 14px;
  font-family: 'Georgia', serif;
  font-style: italic;
}

/* Recommendations */
.recs-toggle {
  margin-top: 40px; text-align: center;
}
.recs-toggle button {
  background: none; border: 1px solid var(--card-border);
  border-radius: 4px; padding: 11px 26px;
  color: var(--card-text-muted); font-size: 12px;
  letter-spacing: 0.18em; text-transform: uppercase;
  font-family: 'Georgia', serif;
  cursor: pointer;
  transition: all 0.3s ease;
}
.recs-toggle button:hover {
  border-color: var(--card-text-dim);
  color: var(--card-text-body);
}

.recs { margin-top: 28px; padding: 0 4px; }
.recs-list { list-style: none; padding: 0; margin: 0; }
.rec-item {
  margin-bottom: 22px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--card-bg-start);
}
.rec-item:last-child { border-bottom: none; }
.rec-header {
  display: flex; align-items: baseline; gap: 10px;
  margin-bottom: 5px;
}
.rec-num {
  font-size: 10px; color: var(--card-text-dim);
  font-family: 'Georgia', serif;
  min-width: 16px;
}
.rec-title {
  font-size: 17px; color: var(--card-accent);
  font-weight: 400;
}
.rec-author {
  font-size: 13px; color: var(--card-text-muted);
  margin-left: 8px;
}
.rec-note {
  margin: 0 0 0 26px;
  font-size: 14px; line-height: 1.65;
  color: var(--card-text-muted);
  font-weight: 300;
}

.recs-footer {
  text-align: center; margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--card-bg-start);
}
.recs-footer p {
  font-size: 12.5px; line-height: 1.7;
  color: var(--card-text-dim);
  font-style: italic;
  max-width: 340px; margin: 0 auto;
}

.mark {
  text-align: center; margin-top: 48px;
  font-size: 11px; letter-spacing: 0.4em;
  color: var(--card-border); text-transform: uppercase;
  font-family: 'Georgia', serif;
}

/* Focus */
.recs-toggle button:focus-visible,
.email-btn:focus-visible,
.email-input:focus-visible {
  outline: 2px solid var(--card-accent);
  outline-offset: 2px;
}

/* Email section */
.email-section {
  margin-top: 40px;
  text-align: center;
}
.email-prompt {
  font-size: 13px;
  color: var(--card-text-muted);
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
  border: 1px solid var(--card-border);
  border-radius: 4px;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--card-text);
  font-family: inherit;
  outline: none;
  transition: border-color 0.3s ease;
}
.email-input::placeholder {
  color: var(--card-text-dim);
  font-style: italic;
}
.email-input:focus {
  border-color: var(--card-text-muted);
}
.email-btn {
  background: none;
  border: 1px solid var(--card-border);
  border-radius: 4px;
  padding: 10px 20px;
  color: var(--card-text-muted);
  font-size: 12px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-family: 'Georgia', serif;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}
.email-btn:hover:not(:disabled) {
  border-color: var(--card-text-dim);
  color: var(--card-text-body);
}
.email-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.email-error {
  margin-top: 8px;
  font-size: 12px;
  color: var(--card-text-muted);
  font-style: italic;
}
.email-sent {
  font-size: 13px;
  color: var(--card-text-muted);
  font-style: italic;
  letter-spacing: 0.05em;
}

/* Transition */
.recs-reveal-enter-active { transition: all 0.4s ease; }
.recs-reveal-leave-active { transition: all 0.3s ease; }
.recs-reveal-enter-from { opacity: 0; transform: translateY(10px); }
.recs-reveal-leave-to { opacity: 0; }
</style>
