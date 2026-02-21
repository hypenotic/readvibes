# Read Fortunes — UX Philosophy & Voice Instructions (Updated)

**For:** Claude Code implementation
**Status:** Source of truth for all copy, tone, and interaction design decisions
**Companion docs:** reading-card-design-spec.md (visual spec), readfortunes-claude-code-brief.md (technical spec)

---

## 1. What This Product Is

Read Fortunes is ritual language wrapped around serious pattern recognition, in service of better recommendations and deeper reader self-understanding — always fluid, never fixed.

The surface is slightly magical. The engine is quietly intelligent. The village witch is also a good psychologist.

**We are closer to:**
- A hyper-attentive bookseller who remembers what moved you
- A sharp literary critic who notices patterns you haven't articulated
- A friend who says "No — this is what you actually like"

**We are not:**
- An algorithmic recommender
- A horoscope generator
- A personality quiz
- MBTI for readers

---

## 2. The Two Equal Outputs

The product produces two things. They carry equal weight. Some users will value the profile more. Some will value the recommendations more. Neither is decoration for the other.

### The Profile (Reading)
A short narrative paragraph describing the alchemical properties working on the books in this reader's constellation. Not personality. Not cognitive style. The invisible texture, grain, and quality of light in the books that call to them right now.

**Must feel:** Precise. Resonant. "That's disturbingly accurate."

### The Recommendations
Books the reader hasn't found yet that match the pattern the profile identified.

**Must feel:** Surprising but inevitable. "I never would have picked this up, but I see why you think I should."

### How They Relate
- The profile earns trust. The recommendations demonstrate that trust was warranted.
- The recommendations aren't proof the profile is real — they're a separate, equally valuable output from the same casting.
- If the profile is evocative but the recs are generic, the experience disappoints.
- If the recs are strong but the profile is flat, the experience feels mechanical.

**Implementation note:** The current codebase already has a recommendations section ("Five Books for Your Field") with title/author/note per recommendation. This is live — not a future feature.

---

## 3. What We Are Not Claiming

We do not claim:
- Complete psychological mapping
- Neuroscientific authority
- A static personality type
- A permanent reading identity
- Objective truth about literature

The forces we map are fluid. Finishing a book changes you. What transports you evolves. The mapping must reflect motion.

**Practical implication:** Every piece of language should use present-tense observation, never permanent assignment.

| Do | Don't |
|----|-------|
| "Your reading tends toward..." | "You are a..." |
| "Right now your attention settles on..." | "You always..." |
| "What draws you in this moment..." | "Your personality type is..." |

---

## 4. Target Emotional Response

When someone finishes their Reading, the internal response should be:

**Yes:**
- "That's accurate."
- "That's useful."
- Maybe: "That's beautiful."

**No:**
- "That's clever."
- "That's cute."
- "That's a fun quiz."

If it feels like a quiz, we've failed.

---

## 5. Voice Rules for UI Copy

### The Spectrum

```
← Witch ————————————————————— Psychologist →
  Ritual language              Specific reasoning
  Evocative compression        Defensible claims
  Atmosphere                   Utility
```

Different parts of the product sit at different points on this spectrum:

| Element | Position | Example |
|---------|----------|---------|
| Landing page headline | Witch | "Take a Reading" |
| Intake form section headers | Witch-center | "Books that have stayed with you" |
| Intake form helper text / tooltips | Center-psychologist | "These are the ones that live in you — not necessarily the best, but the ones you carry" |
| Loading state | Witch | Atmospheric, minimal, ceremonial |
| Field Signature | Witch | "Accumulation measured in years." |
| Reading paragraph | Center | Precise but evocative — the village-witch-who-is-also-a-good-psychologist |
| Boundary statement | Center-psychologist | Clear, specific, testable |
| Recommendations | Psychologist-center | Specific books with reasoning that uses the Reading's own language |
| Error states | Psychologist | Clear, helpful, no forced mysticism |

### Copy Principles

1. **Ritual, not marketing.** "Take a Reading" not "Discover your reading profile." "Cast again" not "Retake quiz."

2. **Earned mysticism.** The arcane surface is permitted only because the engine beneath it is serious. Every piece of ritual language must be backed by genuine insight. If the fortune-teller framing ever makes the product feel less trustworthy, strip it back.

3. **Invitation, not instruction.** The product should feel like something you enter into, not something you complete. The user participates in a process, not fills out a form.

4. **No forced wonder.** Never tell the user to be amazed. Never use sparkle energy. The wonder should come from recognition ("that's accurate") not from presentation ("isn't this magical?").

5. **Quiet confidence.** The system knows what it's doing. It doesn't need to explain itself, justify itself, or hedge excessively. A good fortune teller doesn't say "this might be wrong but..."

---

## 6. Key Interaction Language

### CTAs and Actions

| Action | Language | Not |
|--------|----------|-----|
| Start the process | "Take a Reading" | "Start your reading" / "Discover your profile" / "Begin" / "Get started" |
| Submit the form | "Cast" | "Submit" / "Generate" / "See results" / "Reveal My Reading" |
| View results | "Your Reading" | "Your results" / "Your profile" |
| Do it again | "Cast again" | "Retake" / "Start over" |
| Share | "Send your Reading" | "Share your results" |
| Loading state | "Casting your reading..." / "Tracing the constellation..." | "Reading the field..." / "Generating..." |
| Recommendations reveal | "Books that might find you" | "Five Books for Your Field" (current — too declarative) |

### Section Headers (Intake Form)

| Section | Header | Supporting text |
|---------|--------|-----------------|
| Books | "Books that have stayed with you" | Encourage 5, require 3, allow 10 |
| Book immersion | (per book) Immersion slider + "moved on" flag | See detail below table |
| Tilt | "What pulls you into a book" | Tooltip: deeper explanation per option |
| Boundary | "What tends to push you out" | Tooltip: deeper explanation per option |
| Scale | "What scale feels like home" | Tooltip: deeper explanation per option |

### Book Immersion Model

Each book in the constellation gets two inputs:

**1. Immersion slider** — a continuous control answering "How deep did this one pull you in?" No numbered scale. Minimal or no labels. The interaction should feel like adjusting a warmth dial or signal strength — full brightness at one end, dim at the other. The user drags intuitively.

**2. "I've moved on" flag** — a small toggle or checkbox per book. This is a separate signal from immersion depth. A reader can have been fully immersed in a book and still have grown past it. The moved-on flag means the tether broke — not that it was never strong. This is boundary data: it tells the engine what the reader has outgrown, which is different from what failed to land.

**Why this replaces Loved/Liked/Moved On:** The old triad forced a three-bucket sort. The slider gives the engine a continuous signal about resonance depth. The moved-on flag preserves the most important categorical signal (outgrowth) without collapsing it into the same axis as intensity. A book at full immersion + moved-on is a completely different and richer signal than a book at low immersion, and the engine should treat them differently.

---

## 7. Reading Card — Content Hierarchy

The card presents content in this order of importance:

1. **Field Signature** — the card's name. Seven words or fewer. Evocative compression. The screenshot line.

2. **Posture** — the reader's orientation (e.g., "The Inhabitor"). Since these are invented terms, each should include a brief definition — not clinical, more like a whispered aside. E.g., *"The Inhabitor — you stay inside the book's world longer than the plot requires."*

3. **Reading paragraph** — 3-4 sentences. Describes the alchemical properties working on the books in the reader's constellation. Part of the product, not THE product alone.

4. **Boundary** — what doesn't hold the reader. Described as experience, not feature list.

5. **Constellation** — the books that generated this reading, with immersion depth indicated visually (brightness/glow corresponding to slider position) and moved-on books marked distinctly.

6. **Arcane temporal marker** — instead of plain "February 2026," use a marker that feels like coordinates in the dimensional space we're reading from. This marker should vary by constellation type: a fantasy-oriented reader might get something that evokes Middle Earth; a historical fiction reader something medieval or ancient Greek; a literary fiction reader something from the language of literary criticism turned sideways. This is the "date stamp" that makes each card feel native to its reader's world.

7. **Read Fortunes mark** — maker's mark. The potter signing the bowl.

8. **Recommendations** — appear after or alongside the card. Equal output to the profile, not secondary. "Books that might find you."

---

## 8. Fluidity and Return Visits

Readings describe what someone is drawn to *right now*, not a permanent profile. Your reading fortune changes. You come back and cast again.

### Practical Decisions

- Each casting is a standalone event. It does not reference previous Readings.
- If a user casts multiple times, they should be able to see their history — but the product does not compare or narrate change. The user notices it themselves.
- The landing page for a returning user should feel like returning to a fortune teller's table, not logging into a dashboard.
- Language: "Your most recent Reading" not "Your current profile."

---

## 9. Recommendations Voice

Recommendations use the Reading's language to explain themselves. They sit slightly toward the psychologist end of the spectrum but stay in the same voice world.

1. **Surprising but inevitable.** The reader should not have already read or dismissed the recommended book. But when they read the reasoning, they should see why it was chosen.

2. **Reasoning in the Reading's language.** Don't say "Because you liked Gilead." Say "This book does the same thing with time that your constellation does — it lets decades settle before it measures them."

3. **Not genre matching.** The whole point is that genre is a blunt instrument. Recommendations should cross genre lines when the narrative texture matches.

4. **Small number, high conviction.** 3-5 recommendations. Each one should feel chosen, not surfaced.

5. **No hedging.** Don't say "You might enjoy..." Say "This is for you" or "Start here."

---

## 10. Posture Definitions

The posture framework uses invented terms. Each needs a one-line definition that makes the made-up word instantly recognizable — not a dictionary entry, more like a whispered aside.

| Posture | Definition |
|---------|------------|
| The Inhabitor | *You stay inside the book's world longer than the plot requires.* |
| The Architect | *You watch the structure before you feel the story.* |
| The Linguist | *The sentence is where the book lives for you.* |
| The Momentum Reader | *You need the story to move, and you'll forgive almost anything if it does.* |

Hybrids combine two (e.g., "The Systems Architect" = Architect + systems scale). Definitions for hybrids should be composed from their parts.

These definitions appear on the card below the posture name, in smaller italic text.

---

## 11. Anti-Patterns (UX and Copy)

### Never do:
- Call it a "quiz" or "test" anywhere, even internally
- Use sparkle emoji energy in copy
- Say "your personality type" or "your reading personality"
- Use "Discover" as a CTA verb
- Show a percentage or score
- Use a progress bar during the intake
- Reference the AI/Claude/LLM in the user-facing product
- Use the word "algorithm" in user-facing copy
- Gamify any part of the experience
- Auto-play sound or music

### Be careful with:
- "Magic" / "magical" — the experience should feel magical; the copy shouldn't announce it
- Astrology/zodiac imagery — the energy is adjacent but never literal zodiac. Alchemical > astrological
- Purple prose in UI — the Reading paragraph can be literary; the UI chrome should be clean and direct
- Exclamation marks — almost never. The tone is warm, not excited

---

## 12. Error and Edge Case Voice

When something goes wrong, drop the mysticism entirely. Be clear, helpful, human.

| Situation | Copy |
|-----------|------|
| API failure | "Something went wrong generating your Reading. Give it another moment, or try again." |
| Email not received | "If you don't see it, check your spam folder. You can also copy a link to your Reading below." |
| Minimum books not met | "We need at least three books to cast a Reading — the more you share, the more specific it gets." |
| Form validation | Direct and clear. No themed language for error states. |

---

## 13. Current Codebase to Target State (Key Changes)

These are the specific copy/UX changes needed in the existing code:

| Current (in codebase) | Target | File |
|----------------------|--------|------|
| "Discover Your Reading" | "Take a Reading" | index.vue, nuxt.config.ts |
| "Begin" button | "Take a Reading" (same text as headline, button IS the invitation) | index.vue |
| "Reveal My Reading" | "Cast" | index.vue |
| "Reading the field..." (loading) | "Casting your reading..." / "Tracing the constellation..." | index.vue |
| "Five Books for Your Field" | "Books that might find you" | ReadingCard.vue |
| "Readvibes" mark | "Read Fortunes" | ReadingCard.vue |
| "My Reading" top label | "Your Reading" | ReadingCard.vue |
| Field Signature at bottom of card | Field Signature as hero/headline (top, large) | ReadingCard.vue |
| Title at top | Posture name + definition (after constellation) | ReadingCard.vue |
| Fixed 5 book inputs | 3 minimum, encourage 5, allow up to 10 | index.vue |
| "Admired but didn't love" / "Stopped reading" | Immersion slider per book + "moved on" flag | index.vue |
| All form sections visible at once | Section-by-section reveal with ceremonial transitions | index.vue |
| No tooltips | Tooltips with deeper explanation per option | index.vue |
| No "something else" option | Free-text "something else" field per section | index.vue |
| All hardcoded "Readvibes" strings | "Read Fortunes" | All files |

---

## 14. The One-Line Test

Every piece of copy, every interaction, every design decision should pass this test:

**Does this make the reader feel seen — or does it make the product feel clever?**

If the product is showing off, cut it. The reader is the subject. The product is invisible.

---

## Summary for Implementation

- **Tone:** Warm. Confident. Ritual without gimmick. The witch who's also a psychologist.
- **Voice spectrum:** Witch on the surface, psychologist in the engine, center in the product moment.
- **Two equal outputs:** Profile (Reading) and Recommendations. Neither is secondary.
- **Temporal stance:** Present tense. Always fluid. Cast again.
- **Postures need definitions:** one-line whispered asides, not clinical.
- **Arcane temporal marker:** replace plain dates with constellation-native coordinates.
- **Copy test:** "Does this make the reader feel seen?"
- **Anti-pattern test:** "Does this feel like a quiz?" If yes, fix it.
