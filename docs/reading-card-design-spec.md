# Reading Card — Design Spec for Implementation

## Overview
The Reading Card is the product moment of Read Fortunes. It's a text-forward card that presents a personalized reading inside an ornamental frame, floating in a living atmospheric background. The reading paragraph is the hero. Everything else serves it.

---

## Layout Structure

```
┌─────────────────────────────────────┐
│ ┌─ ornamental border frame ───────┐ │
│ │                                 │ │
│ │   [constellation — small]       │ │
│ │                                 │ │
│ │   YOUR READING POSTURE          │ │
│ │   The Inhabitor                 │ │
│ │                                 │ │
│ │   Accumulation                  │ │
│ │   measured in years.            │ │
│ │                                 │ │
│ │   JODI · [arcane temporal marker] │ │
│ │                                 │ │
│ │   ——— ◇ ———                     │ │
│ │                                 │ │
│ │   Reading paragraph text...     │ │
│ │                                 │ │
│ │   ─── (short centered line) ─── │ │
│ │   What tends not to hold you    │ │
│ │   Boundary text...              │ │
│ │                                 │ │
│ │   Your constellation            │ │
│ │   • Gilead            ●●●●●     │ │
│ │   • The Dutch House   ●●●●●     │ │
│ │   • etc.                        │ │
│ │                                 │ │
│ │   —— Read Fortunes ——           │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

Card max-width: **620px**
Card background: `#0d0b08`
Page background: `#060504`

---

## Spacing — Golden Ratio Scale

Base unit: 8px, scaled by φ (1.618):

| Token   | Value | Use |
|---------|-------|-----|
| `sp-xs` | 8px   | Tight gaps (label to heading) |
| `sp-sm` | 13px  | Related elements |
| `sp-md` | 21px  | Sub-section gaps |
| `sp-lg` | 34px  | Between sections |
| `sp-xl` | 55px  | Major section breaks, side padding (desktop) |
| `sp-2xl`| 89px  | Top padding (desktop) |

**Card padding:**
- Desktop: 89px top, 55px sides, 55px bottom
- Mobile (≤660px): 55px top, 34px sides, 34px bottom

---

## Typography

**Primary:** Cormorant (Google Fonts) — used for everything except small labels
**Secondary:** Spectral (Google Fonts) — used for small uppercase labels only

### Type Scale

| Element | Family | Size | Weight | Style | Tracking | Case |
|---------|--------|------|--------|-------|----------|------|
| Field Signature | Cormorant | 48px (34px mobile) | 300 | italic | 0.01em | Sentence |
| Posture name | Cormorant | 20px | 400 | italic | 0.05em | Sentence |
| Reading paragraph | Cormorant | 20px | 300 | normal | normal | Sentence |
| Boundary text | Cormorant | 18px | 300 | italic | normal | Sentence |
| Boundary label | Cormorant | 13px | 500 | italic | 0.06em | Sentence |
| Books label | Cormorant | 13px | 500 | italic | 0.06em | Sentence |
| Book titles | Cormorant | 16px | 300 | italic | normal | Sentence |
| Reader name | Spectral | 11px | 300 | normal | 0.3em | UPPERCASE |
| Posture label | Spectral | 10px | 300 | normal | 0.5em | UPPERCASE |
| "Moved on" label | Spectral | 10px | 300 | normal | 0.12em | UPPERCASE |
| Mark text | Cormorant | 12px | 400 | italic | 0.2em | Sentence |

**Line heights:**
- Reading paragraph: 2.0 (generous, airy)
- Boundary text: 1.85
- Field Signature: 1.2
- Everything else: default

---

## Color — Warm Temperature (Default)

All colors tested for WCAG AA compliance against card background `#0d0b08`:

| Token | Hex | Contrast | Use |
|-------|-----|----------|-----|
| `gold-glow` | `#e8c888` | 10.5:1 ✓ | Field Signature |
| `gold` | `#d0a060` | 7.8:1 ✓ | Posture name, book dots |
| `gold-dim` | `#a08040` | 4.6:1 ✓ | Section labels (bold/large) |
| `gold-dark` | `#6a5428` | — | Border elements, decorative |
| `gold-ink` | `#3a2a14` | — | Decorative lines |
| `cream-mid` | `#d8c8a8` | 9.8:1 ✓ | Reading text, book titles |
| `cream-bnd` | `#c8b898` | 8.2:1 ✓ | Boundary text |
| `cream-dim` | `#a89878` | 5.4:1 ✓ | Book relationships, reader name |
| `cream-ghost` | `#887868` | 3.6:1 | Decorative labels only (not relied on for meaning) |

### Field Signature glow:
```css
text-shadow: 0 0 40px rgba(232,200,136,0.18), 0 0 80px rgba(232,200,136,0.06);
```

---

## Color — Additional Temperature Palettes

Each posture/temperature shifts the entire palette. Architecture is CSS custom properties so switching is one function call.

**Cool (Architect):**
- Glow: `#a8cce0` | Gold: `#8ab0c8` | Mids shift blue-grey
- Card bg: `#0a0e12` | Page bg: `#030508`

**Earthen (biographical):**
- Glow: `#c8b090` | Gold: `#a89070` | Mids shift brown
- Card bg: `#0e0c08` | Page bg: `#040306`

**Neutral:**
- Glow: `#b0b0c0` | Gold: `#9898ac` | Mids shift grey
- Card bg: `#0d0d10` | Page bg: `#030308`

Implementation: define all four palettes as JS objects, apply via `document.documentElement.style.setProperty()` on all CSS vars. Temperature is determined server-side from posture analysis.

---

## Ornamental Border Frame

SVG-based, rendered via a single `<svg>` overlaying the card with `pointer-events: none`.

Elements:
- **Outer rect:** 1px stroke with linear gradient (gold-dark to gold-dim to gold-dark), rounded corners
- **Inner rect:** 0.5px stroke, gold-dark at 30% opacity, inset ~12px from outer
- **Four corner ornaments:** Each corner has three concentric circles (r=8, r=3, r=1), two flourish lines extending along the edges (~40px), and a small curved path
- **Top cartouche:** Centered on top edge. Two horizontal lines flanking a lens/eye shape (two mirrored quadratic curves forming a pointed oval) with a center dot
- **Bottom cartouche:** Same structure, slightly smaller
- **Side whisper lines:** Dashed vertical lines (1px dash, 12px gap) at very low opacity (0.15) running along the outer edges

All border elements use gold-dim and gold-dark at 30-50% opacity. They should be felt, not studied.

---

## Constellation (Top Accent)

Small canvas element, ~80-89px tall, full width of content area.

Contents:
- **Book stars:** One per book in the constellation. Positioned algorithmically (not random). Star size and glow intensity correspond to the reader's immersion slider value — high immersion books are larger (4-5px) with glow halos, lower immersion books are smaller (2.5-3px) and dimmer. Books flagged as "moved on" get a distinct visual treatment: a ring or outline instead of a filled core, suggesting a connection that was once strong but has gone quiet.
- **Connection lines:** Between related books. Stroke: gold at 12% opacity, 0.6px width.
- **Dust particles:** ~20 tiny dots (0.2-0.5px radius) that subtly twinkle via sin() oscillation.
- **High-immersion halos:** Radial gradient glow (r × 5) at 8% opacity, plus a thin ring at r × 2. Intensity scales with slider value.

Animation: stars pulse gently via `sin(t * 0.002 + offset)`. Dust twinkles. No rotation, no movement — this is atmospheric, not distracting.

In production, star positions should be derived from book data (e.g., narrative distance mapping). For MVP, distribute them in an aesthetically pleasing arrangement that varies per reader.

---

## Book List

Vertical list, not tags/pills. Each row:

```
[dot]  Book Title                    [moved on indicator if flagged]
```

- Dot: 6px circle, gold fill, with box-shadow glow scaled to immersion depth (brighter = deeper immersion)
- Title: 16px Cormorant italic, cream-mid color
- "Moved on" label (if flagged): 10px Spectral uppercase, cream-dim, right-aligned
- Rows separated by 1px border-bottom at gold 5% opacity
- "Moved on" books: dot rendered as a ring/outline instead of filled, text slightly dimmer (cream-dim). The immersion dot still reflects how deep the book once pulled — a moved-on book at high immersion shows a bright ring, acknowledging the connection was real.

---

## Dividers

**Main ornamental divider** (between name and reading):
SVG, ~220px wide, centered. Structure:
- Horizontal lines extending from center
- Small circles at transition points
- Paired quadratic curves (one arching up, one down) flanking center
- Center: rotated square (diamond) with inner dot
- All elements gold-dim/gold-dark at 30-45% opacity

**Boundary divider:**
CSS pseudo-element. 120px wide, centered, 1px height.
Gradient: transparent → gold-ink → gold-dark → gold-ink → transparent

---

## Background

### Starfield (canvas, fixed position, behind everything)

- Canvas at 2× resolution for retina
- Star count: `(width × height) / 2200`
- Each star: random position, radius (0.3-1px normal, 1.5-3.5px for 3% "bright" stars), base opacity, twinkle speed, phase offset, warm-shift
- Color: `rgba(180+warm*40, 168+warm*22, 148-warm*20, opacity)`
- Bright stars get an additional glow pass at 4× radius, 7% of star opacity
- Animation: `sin(t * speed + phase) * 0.3 + 0.7` multiplier on opacity
- `requestAnimationFrame` loop

### Nebula (CSS, fixed position)

Three `<i>` elements with `border-radius: 50%`, `filter: blur(100px)`:
1. Top-left: 650×500px, warm brown rgba(150,90,25,0.07), drifts right/down over 32s
2. Bottom-right: 500×450px, cool purple rgba(55,35,85,0.05), drifts left/up over 42s
3. Center: 350×280px, warm gold rgba(170,100,35,0.035), breathes scale over 26s

Each animates between 50% and 95% opacity with slight translate and scale.

---

## Animations (Entrance Sequence)

All elements enter in sequence using `animation-delay`. Total reveal: ~4 seconds.

| Element | Delay | Duration | Easing | Effect |
|---------|-------|----------|--------|--------|
| Card container | 0.4s | 2.2s | cubic-bezier(0.16,1,0.3,1) | translateY(50px) + scale(0.97) → 0 |
| Constellation | 1.0s | 2.0s | ease | opacity + blur(3px) → clear |
| Posture | 1.8s | 1.5s | ease | opacity 0 → 1 |
| Field Signature | 2.1s | 1.8s | cubic-bezier(0.16,1,0.3,1) | translateY(12px) + blur(4px) → clear |
| Name | 2.6s | 1.0s | ease | opacity 0 → 1 |
| Ornament | 2.8s | 1.0s | ease | opacity 0 → 1 |
| Reading | 3.0s | 1.5s | ease | translateY(12px) + opacity |
| Boundary | 3.4s | 1.2s | ease | translateY(12px) + opacity |
| Books | 3.7s | 1.0s | ease | translateY(12px) + opacity |
| Mark | 4.0s | 1.5s | ease | opacity 0 → 1 |

The Field Signature entrance is special: it deblurs as it rises, like something resolving into focus.

---

## Card border breathing

The card has a `::before` pseudo-element creating an ambient halo:
- `inset: -20px`, `border-radius: 30px`
- `radial-gradient` from gold at 7% opacity center to transparent
- Animates opacity between 0.4 and 0.85 over 7s ease-in-out infinite

---

## Share Card (Future — design now, implement later)

The card should be exportable as a 1200×630 image for Open Graph / social sharing.

Content for share image:
- Field Signature as headline
- Posture label
- "Read Fortunes" mark
- Constellation visual
- Warm/cool background tint

Consider `html2canvas` or server-side rendering for image generation.

---

## Posture Definitions on Card

Each posture name is an invented term. It must be accompanied by a one-line definition — not clinical, more like a whispered aside. Appears below the posture name in smaller italic text.

| Posture | Definition |
|---------|------------|
| The Inhabitor | *You stay inside the book's world longer than the plot requires.* |
| The Architect | *You watch the structure before you feel the story.* |
| The Linguist | *The sentence is where the book lives for you.* |
| The Momentum Reader | *You need the story to move, and you'll forgive almost anything if it does.* |

Hybrids compose from parts. Typography: Cormorant, 14px, 300 weight, italic, cream-dim color.

---

## Arcane Temporal Marker

Instead of a plain date ("February 2026"), the card displays a temporal marker that feels like coordinates in the dimensional space the reading comes from. This marker varies by constellation type — it should feel native to the reader's world.

Examples (illustrative, not final):
- Fantasy-heavy constellation: something evoking invented calendars, seasons of a world
- Historical fiction constellation: something medieval, ancient Greek, archival
- Literary fiction constellation: language of literary criticism turned sideways
- Genre fiction constellation: something that nods to the texture of that genre's world

The marker is generated alongside the Reading by the LLM, not hardcoded. It should feel specific, not random — tied to the constellation's character.

Typography: same as reader name row — Spectral, 11px, 300 weight, 0.3em tracking, uppercase, cream-dim.

---

## What NOT to Build

- No mandala / sacred geometry illustration
- No drop caps
- No bold weight type (heaviest is 500 for small labels)
- No pill-shaped tags for books
- No progress bars or gamification elements
- No literal texture images (parchment, paper, copper)
- No full-width divider lines

---

## Implementation Notes

- All colors as CSS custom properties for temperature switching
- Starfield and constellation as `<canvas>` elements with `requestAnimationFrame`
- SVG border frame as inline SVG (not background image)
- Test at 375px (mobile), 768px (tablet), 1200px+ (desktop)
- The card should feel complete and beautiful at every viewport width
- Ensure all animated canvases pause when not visible (Intersection Observer) to save resources
