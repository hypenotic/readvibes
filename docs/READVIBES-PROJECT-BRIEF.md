# READVIBES — Project Brief for Claude Code

## What Readvibes Is

Readvibes is a book discovery application that generates personalized "Readings" — short, precisely observed paragraphs that describe how someone pays attention when they read. Not what they read. Not their personality. Their *mode of narrative attention*.

The product metaphor is a tarot reading for readers: ceremonial, slightly mystical, genuinely insightful. Users enter five books that stayed with them, answer a few questions about their reading preferences, and receive a Reading — a paragraph, a boundary statement, and a Field Signature that together describe the gravitational center of their reading taste.

**Naming conventions (locked):**
- The product generates a **"Reading"**
- The user's saved artifact is **"My Reading"**
- Tagline: **"Discover your Reading"**
- Use these consistently in routes, components, analytics events, and share cards

## Origins & Foundational Thinking (from early ChatGPT sessions)

> **Provenance note:** This section captures concepts from the earliest Readvibes development. The posture framework (Architect/Inhabitor/Linguist), resonance compression technique, temperature system, and validation interviews were developed later in Claude sessions. Both layers are valid; distinguishing them helps future-you know what was foundational intuition versus implementation-era invention.

The project originated as a "narrative fingerprinting system" — the core insight was that readers resonate with *how* story is experienced (structure, tone, character posture, emotional pacing) rather than what genre it falls into. The original framing described it as a non-spoiler, narrative-texture-based discovery platform.

Key early metaphors that shaped the product:
- **MBTI/16 Personalities** — the feeling of getting a profile that's identity-shaped and shareable
- **Tarot reading** — ceremonial, slightly mystical, "delivered by someone who reads Ursula Le Guin"
- **Sharp literary critic / dry observant friend** — the voice quality

The ideal user reaction was defined early: **"That's disturbingly accurate."**

### What It Explicitly Is NOT (established early, still holds)
- Not a Goodreads clone, genre recommender, or popularity engine
- Not an AI black box or summary generator
- Not a spoiler system, therapeutic quiz, or horoscope
- Not a "books like this" widget
- Rejects: trend-based recs, engagement farming, plot-spoiling metadata, generic flattery
- Avoids: "You love strong female characters" vagueness, "You are curious and intelligent" fluff, YA tone, academic analysis tone, clinical therapeutic tone

### The StoryGraph Five-Domain Model (pre-posture framework)
Before the Architect/Inhabitor/Linguist posture system was developed, the early taxonomy mapped five domains:

1. **Emotional Tone** — emotional thaw, quiet humanism under duress, deadpan intensity, found family under pressure, institutional melancholy
2. **Structural Complexity** — layered worldbuilding, multi-thread convergence, procedural competence, slow-burn reveal, systems-driven plot
3. **Thematic Vectors** — bureaucratic whistleblowing, institutional ethics, alien semiotics, civilizational collapse with dignity, competence in rigid systems
4. **Narrative Devices** — constrained POV, epistolary fragments, AI consciousness, ensemble cast, competence porn ("engineering-pron")
5. **Voice/Perspective** — dry intelligence, understated wit, observational restraint, political without sermonizing

These five domains can serve as the *input taxonomy* that feeds into posture determination. The posture system (Architect/Inhabitor/Linguist × Watcher/Momentum) is a more elegant synthesis for output, but the five domains remain useful for book tagging and fingerprint construction.

### Barry's Original Archetype: "The Peripheral Empath"
Before the posture framework refined this to "Architect-Watcher," the early archetype label was **"The Peripheral Empath"** — emotionally complex outsiders operating from the margins, revealing humanity through competence and restraint, navigating rigid systems with moral intelligence. Core traits: tactical competence, emotional thaw, deadpan intensity, quiet humanism, found-family under duress, ethical navigation of power.

### Loved vs Liked (established early)
The distinction between "Liked" (entertaining, well-executed) and "Loved" (identity-relevant, re-readable, archetype-defining, "feels like home") was a first-class concept from the start. Loved books shape fingerprint weight. This evolved into the Loved/Liked/Moved On triad in the intake form.

### MVP Philosophy
Inspired by **37signals**: pragmatic, feature-light, value-dense. Transparent logic, no black box magic, visible scoring mechanics, user agency. No social feed, no reviews, no public scoring, no gamification.

### Long-Term Vision (from early sessions)
- Community clustering by narrative fingerprint
- Archetype gallery
- Annual **"Readvibes Wrapped"** (shareable annual recap)
- Mood tuning ("lean into melancholy systems fiction")
- Public archetype language shareables

### Vocabulary Clusters as First-Class Signals
Early development identified high-signal phrase clusters as differentiators: "engineering-pron," "alien semiotics," "bureaucratic whistleblowing," "institutional melancholy." These evolved into the texture tags and resonance compression fragments in the current system.

## Who It's For

Serious readers who want to understand their own reading patterns — not get recommendations, not get sorted into genres, but see their taste articulated in language they've never encountered. The target user screenshots their Reading and shares it. The product succeeds when someone reads their paragraph and says "I've never heard anyone describe that, but yes."

## The Voice

The voice is the product's core asset. Early tonal targets (from ChatGPT sessions): "literary critic," "Le Guin essay voice," "understated tarot," "smart friend who sees you clearly." The voice was explicitly refined away from therapy language, BuzzFeed energy, academic jargon, hype voice, and identity politics framing.

It is:
- **Calm** — never enthusiastic, never performative
- **Observational** — describes what it sees, never prescribes
- **Precise** — every word earns its place
- **Non-flattering** — never tells the reader they're special, rare, or sophisticated
- **Posture-aware** — syntax changes based on the reader's mode of attention

The voice speaks about narrative patterns, never about the reader's personality or character. It assumes intelligence. It avoids meta-discourse ("based on your answers...") and epistemic handwringing, but may use observational hedging ("your reading tends to...") when input signal is thin — better to be honestly uncertain than overconfidently wrong.

## The Voice Constitution (20 Rules)

These rules govern every generated Reading:

1. **Identity rules (1-3):** Subject of sentences = narrative patterns, not the reader's personality. Observes reading behavior, never attributes character. Assumes intelligence.
2. **Contrast (4):** At most one "not X but Y" construction per paragraph. (Don't force it if the paragraph doesn't need it; don't use two.)
3. **Reframing sentence (5):** One sentence that names a familiar reading experience in language the reader has never encountered. This is the most important sentence. Screenshot-worthy.
4. **Posture-syntax alignment (6):** Sentence construction reflects narrative posture (see below).
5. **Compression (7):** Maximum four sentences before the boundary.
6. **Boundary as experience (8):** Begins "What tends not to hold you —" and describes the *experience* of the wrong book, not a feature list.
7. **No jacket copy (9):** Never "sweeping," "unforgettable," "masterful."
8. **No praise (10):** Never "sophisticated," "rare," "refined."
9. **No identity language (11):** Never "you are the kind of reader who."
10. **No "complex"/"nuanced" (12):** Banned descriptors.
11. **Opening variation (13):** Prefer openings where the narrative pattern is the grammatical subject, not "You."
12. **One metaphor system (14):** One frame, fully committed.
13. **Sensory anchor (15):** At least one concrete/physical detail. No abstract stacking.
14. **Temperature control (20):** One sentence that lowers emotional temperature.
15. **Abundance respect (added):** Never frame abundance-oriented readers as less rigorous than restraint-oriented readers.
16. **Swap test (16):** A mismatched reader should feel the paragraph is wrong for them.
17. **Field Signature (17):** ≤7 words, doesn't repeat paragraph phrasing.
18. **Lexical watch list (19):** Track: structure, structural, spectacle, ornament, constraint, negative space, inhabited, earned, under pressure.
19. **Screenshot test (20):** At least one sentence someone would screenshot.

## The Posture Framework

Every reader has a "narrative posture" — their default mode of attention when reading. Postures determine syntax, rhythm, and vocabulary of the generated Reading.

### Primary Postures
- **Architect:** Tracks structure, systems, patterns. Compound sentences, subordinate clauses, causal logic. Verbs of tracking and design.
- **Inhabitor:** Lives inside the book. Shorter declaratives, sensory verbs, emotional immediacy. Breath-rhythm pacing.
- **Linguist:** Attends to the sentence itself. Parallel clauses, sonic attention, rhythmic variation. The paragraph rewards close reading of its own prose.

### Vectors (sub-orientations)
- **Watcher:** Slight analytical distance even within posture
- **Momentum:** Forward-driven, escalating, propulsive

### Hybrids
Most readers are hybrids: Architect-Watcher, Inhabitor-Momentum, Linguist-Architect, etc. The syntax blends accordingly.

## Resonance Compression

The system's most powerful technique. A clause that briefly *inhabits the texture* of the reader's loved books — not quotation or plot summary, but a sensory fragment that could exist inside those books.

Examples:
- "the way a hand pauses on a doorknob and decides what not to say" (Ishiguro/Barnes reader)
- "the long walk that doubles as meditation, the red wing that carries both myth and ache, the light falling through a window until it holds an argument about grace" (Sebald/Carson/Robinson reader)
- "the small room, the ash-covered road, the memory that refuses to stay buried" (Donoghue/McCarthy/Morrison reader)

Works best for Inhabitor and Linguist postures. Rarely works for pure Architect postures. **Hard switch: only permitted for Inhabitor, Linguist, or their hybrids.**

**Safety rails:** Compression fragments should be concrete and ordinary (hands, rooms, doors, light, breath) rather than defaulting to "ache/grace/myth" — unless the reader's books genuinely demand lyric register. One fragment maximum per paragraph.

## Temperature System (Visual Design)

Each Reading card adapts its visual temperature based on posture:

- **Warm** (gold/amber tones): Inhabitor-Momentum readers. Jenny's card.
- **Cool** (steel-blue tones): Architect-Watcher readers. Barry's card.
- **Earthen** (clay/terracotta tones): Inhabitor-Momentum with biographical propulsion. Jodi's card.
- **Neutral** (silver/grey): Default fallback.

Temperature maps to CSS custom properties that shift the card's color palette.

## Reading Card Structure

Each card displays:
1. **Diamond icon** (◇) — ceremonial marker
2. **Reader's name** — personalization
3. **Posture label** — e.g., "Architect-Watcher" or "Inhabitor-Momentum"
4. **Main paragraph** — 3-4 sentences, the core Reading
5. **Boundary statement** — "What tends not to hold you —"
6. **Field Signature** — ≤7 word compressed identity
7. **Divider** — visual separator (⸻)
8. **Book recommendations** — (future feature, not in MVP)

## Validated Readings (Three Test Subjects)

### Jenny — Inhabitor-Momentum (Relational Propulsion)
- Warm gold aesthetic
- Books: historical fiction, relationship-driven narratives
- Validated: recognized herself, pointed to reframing sentence independently

### Barry — Architect-Watcher (Peripheral Empathy)
- Cool steel-blue aesthetic
- Books: systems thinking, competence under constraint
- Validated: identified with the procedural attention description

### Jodi — Inhabitor-Momentum (Biographical Propulsion)
- Earthen amber/clay aesthetic
- Books: memoir, biographical narrative, lived-experience stories
- Validated: new posture variant discovered through interview

## Intake Design Rationale

### Why "books that stayed with you" (not favorites/best)
The phrasing biases toward *resonance* over *quality judgment*. "Stayed with you" captures the books that shaped reading identity — the ones that feel like home — rather than the ones a reader thinks are objectively best. This maps directly to the Loved vs Liked distinction: the system needs books that reveal posture, not books that demonstrate taste credentials.

### Why five books
Five creates enough constellation data for meaningful pattern recognition while remaining achievable for any reader. Fewer than five risks thin signal; more risks cognitive burden and diminishing returns. Five is the minimum for reliable cross-book pattern synthesis — enough to find what's shared that isn't genre.

**Fallback:** If a user provides fewer than five (or repeats series titles), the system can still generate but should tag confidence lower and avoid overly specific claims. A thin-signal Reading is better than a broken flow, but should not overcommit.

### The prototype fork (established early)
Two paths were identified: (A) conversational intake via Claude (fastest, closest to what was working in validation interviews) or (B) structured tagging against a pulse matrix (more scalable, needs tagging infrastructure). The current MVP chose path A.

## Technical Stack

- **Framework:** Nuxt 3 with Vue 3
- **Hosting:** Vercel (free tier, auto-deploys on push to main)
- **Repository:** github.com/hypenotic/readvibes (public)
- **AI:** Anthropic Claude API (server-side, key in Vercel env vars)
- **Live URL:** readvibes-sepia.vercel.app

## Current Prototype State

### What's Working
- Four-state intake flow: intro → form → loading → reading card
- Form collects: 5 books, reading preferences (tilt, boundary, scale)
- Claude API integration via server-side route
- Dynamic temperature theming on Reading card
- Basic accessibility pass on form contrast

### Known Issues / Next Steps
- UX refinements needed on form (Barry noted accessibility issues, first pass done but more work needed)
- Form design principle: "The ceremony is for the output. The intake needs to be usable first."
- Generation quality needs testing end-to-end
- Loading states need refinement
- Mobile responsiveness needs attention

## File Structure
```
readvibes/
├── nuxt.config.ts
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── README.md
├── app.vue
├── assets/
│   └── css/
│       └── main.css          # Global styles, CSS variables, temperature theming
├── components/
│   └── ReadingCard.vue        # The Reading card display component
├── pages/
│   └── index.vue              # Main page with all four states
└── server/
    └── api/
        └── generate-reading.post.ts  # Claude API integration
```

## Calibration Corpus

15 calibration paragraphs exist across 10+ postures, covering both restraint-oriented and abundance-oriented readers. These are embedded in the generation prompt and serve as few-shot examples. The full corpus is documented in our conversation history and in the Voice Constitution.

## System Prompt Architecture (for Claude API)

The generation prompt has 5 layers:
1. **System Identity** — who the model is
2. **Input Specification** — structured reader data schema
3. **Voice Constitution** — 20 rules, machine-readable
4. **Resonance Compression Guidance** — optional technique instructions
5. **Anti-Pattern Library** — examples of what NOT to produce

## Design Principles

### What Makes a Reading Feel True (vs Generic)
Established early and refined throughout:
- **True:** Identifies tension, names patterns across unrelated books, uses specific vocabulary, avoids genre shorthand, feels observed not categorized
- **Generic:** Lists genres, mentions surface themes, flatters personality, sounds like MBTI-lite
- Precision comes from cross-book pattern recognition, tone awareness, and character posture analysis
- The system reads *constellations* (what books share when held together), not individual titles

**Self-evaluation checklist** (for prompt-tuning and QA):
1. Does it name a cross-book pattern not reducible to genre?
2. Does it include one reframing sentence?
3. Does the boundary describe experience, not features?
4. Is there zero praise and zero personality attribution?
5. Would a mismatch reader find it wrong?

### Signal Trace (optional, below the Reading)
To reinforce non-black-box values, each Reading may include a small signal trace below the divider — 2-3 texture tags in plain language that show the reader *why* this Reading fits. Not explanatory, not meta — just a visible thread.

Example: **Signal trace:** procedural competence · institutional ethics · dry restraint

### Other Core Principles
1. The ceremony is for the output — the intake form must be usable, clear, inviting
2. Dark/ceremonial aesthetic reserved for the Reading card display
3. Form should feel warm and accessible, not intimidating
4. The Reading should feel like being *seen*, not being *diagnosed*
5. No hierarchy between reading tastes — abundance is as rigorous as restraint
6. The product name "My Reading" carries double meaning: the system's interpretation AND the reader's practice

## Deployment Notes

- Vercel auto-deploys on every push to `main` branch
- Environment variables set in Vercel dashboard (ANTHROPIC_API_KEY)
- After adding/changing env vars, need to redeploy for them to take effect
- GitHub Personal Access Tokens used for authentication (revoke after use)
