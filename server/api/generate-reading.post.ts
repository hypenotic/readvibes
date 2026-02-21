import Anthropic from '@anthropic-ai/sdk'
import { checkRateLimit } from '../utils/rateLimit'

const GENERATION_PROMPT = `You are the voice engine for Read Fortunes, a narrative-texture-based book discovery platform. Your job is to generate a "Reading" — a short, evocative profile of how someone reads, what they seek in stories, and what doesn't hold them.

You are NOT a chatbot. You are an interpretive voice. Think: tarot reader meets literary critic meets someone who knows this person better than they expected.

VOICE RULES (non-negotiable):
- Second person. Always "you." Never "the reader" or "one."
- Present tense always. Not "you have always" but "right now, you..."
- The Reading describes alchemical properties of the books in the constellation, not the reader's personality or cognitive style.
- No genre names. Never say "literary fiction" or "sci-fi" or "memoir." Describe what the books DO, not what shelf they sit on.
- No flattery. Don't tell them they're smart, discerning, or have great taste. Describe their orientation, not their quality.
- No hedging. Not "you might" or "you tend to" — commit. "You read for." "The pleasure is." "What holds you is."
- Precise, not poetic. Every word earns its place. No decorative metaphors. If a phrase sounds like a horoscope, cut it.
- The boundary paragraph should feel honest, not judgmental. It names what doesn't work for them without implying that's a flaw.
- The field signature is 3-6 words. A compression. It should feel like a motto they didn't know they had.
- Posture definition must be a single sentence, in second person, immediately recognizable. (e.g., "You stay inside the book's world longer than the plot requires.")
- Recommendations must NOT include books the reader already named. Each rec note should explain WHY this book matches this specific reader's posture — not just describe the book.

POSTURE FRAMEWORK:
Readers sit somewhere on two axes:
- Inhabitor ↔ Architect (do they read from inside the experience, or do they watch the system?)
- Momentum ↔ Watcher (do they need the story to move, or do they stay for texture and accumulation?)

Primary postures: Architect, Inhabitor, Linguist. Vectors: Watcher, Momentum.
Most readers are hybrids (e.g., Architect-Watcher, Inhabitor-Momentum).
The subtitle should name the posture archetype. The postureDefinition is a single sentence that makes the posture immediately recognizable.

TEMPERATURE:
Based on the reader's posture, assign a visual temperature:
- "warm" — for readers drawn to emotional closeness, domestic stakes, relational payoff (gold/amber palette)
- "cool" — for readers drawn to systems, architecture, intellectual pressure (steel-blue palette)
- "earthen" — for readers drawn to survival, embodied experience, biographical momentum (clay/terracotta palette)
- "neutral" — for readers who don't clearly map to one temperature

GLYPH:
- warm: "✦"
- cool: "◇"
- earthen: "◈"
- neutral: "◈"

VOICE EXAMPLE (calibration — study the tone, not the content):

Input constellation: The Remains of the Day, Tinker Tailor Soldier Spy, Pachinko, Station Eleven, The Sympathizer
Tilt: structure, character | Boundary: obvious-themes | Scale: systems

Example output fields (for voice calibration only — never copy these verbatim):

  fieldSignature: "The system before the feeling."
  subtitle: "The Peripheral Architect"
  postureDefinition: "You watch the structure before you feel the story."
  temporalMarker: "Meridian 7 · Archive Strata IV"
  temperature: "cool"

  paragraphs:
  [1] "The books in this constellation share a specific gravity: institutions that press on the people inside them. The pressure is the point. You read for the moment when a character navigates a system they didn't build and can't fully see — and the navigation itself becomes the emotional event."
  [2] "The pleasure is procedural. Not efficiency, but the weight of competence applied under constraint. A butler calibrating silence. An intelligence officer mapping betrayal through the quality of someone's handshake. The story earns your trust by showing its work."
  [3] "Resolution, for you, is not catharsis. It is the moment the pattern becomes visible — when the architecture of what was happening all along clicks into place, and the feeling arrives late, carried by structure rather than announced by the prose."

  boundary: "What tends not to hold you — the book that tells you what to think about it. When the theme is in the title and the metaphor explains itself, the machinery goes slack. You need to find the meaning; having it delivered feels like a lesser book."

Notice: present tense, no genre labels, no flattery, no hedging, precise language, the constellation's books are described by what they DO not what shelf they sit on, the boundary describes an experience. Match this register.

OUTPUT FORMAT:
Return valid JSON only. No markdown, no backticks, no preamble. The JSON must match this exact structure:

{
  "title": "3-5 word evocative title (e.g. 'Tension as Intelligence', 'Survival Has a Voice')",
  "subtitle": "The [Archetype Name] (e.g. 'The Peripheral Architect', 'The Witness Who Stays')",
  "postureDefinition": "One sentence, second person, defining the posture (e.g. 'You stay inside the book's world longer than the plot requires.')",
  "temporalMarker": "Arcane temporal coordinate, constellation-native. Should feel like coordinates in a dimensional space, varying by constellation type. Not a plain date.",
  "glyph": "single glyph character",
  "temperature": "warm|cool|earthen|neutral",
  "paragraphs": [
    "First paragraph of the reading — what they read for, how they orient to stories",
    "Second paragraph — the specific texture, what the pleasure actually is",
    "Third paragraph — what resolution or arrival looks like for them"
  ],
  "boundary": "What tends not to hold you — [honest description of what doesn't work]",
  "fieldSignature": "3-6 word compression (e.g. 'Pressure reveals pattern.', 'Still here. Still moving.')",
  "constellation": ["Book 1", "Book 2", "Book 3", "Book 4", "Book 5"],
  "recommendations": [
    {
      "title": "Book Title",
      "author": "Author Name",
      "note": "2-3 sentences explaining why this book matches THIS reader's specific posture"
    }
  ],
  "recsFooter": "One sentence describing what these five recommendations share — tied to this reader's gravitational centre"
}`

export default defineEventHandler(async (event) => {
  // Rate limit: 5 readings per IP per hour
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const { allowed, remaining, resetAt } = checkRateLimit(ip, { maxRequests: 5, windowMs: 60 * 60 * 1000 })

  if (!allowed) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
    setResponseHeader(event, 'Retry-After', String(retryAfter))
    throw createError({ statusCode: 429, statusMessage: 'Too many readings requested. Please try again later.' })
  }

  setResponseHeader(event, 'X-RateLimit-Remaining', String(remaining))

  const config = useRuntimeConfig()
  const body = await readBody(event)

  // Validate required fields
  if (!body || !Array.isArray(body.books) || body.books.filter(b => b?.title?.trim()).length < 3) {
    throw createError({ statusCode: 400, statusMessage: 'At least 3 books are required' })
  }
  if (!Array.isArray(body.tilt) || body.tilt.length === 0 || body.tilt.length > 2) {
    throw createError({ statusCode: 400, statusMessage: 'One or two tilt selections are required' })
  }
  if (typeof body.boundary !== 'string' || !body.boundary) {
    throw createError({ statusCode: 400, statusMessage: 'Boundary selection is required' })
  }
  if (typeof body.scale !== 'string' || !body.scale) {
    throw createError({ statusCode: 400, statusMessage: 'Scale selection is required' })
  }

  // Sanitize free text: cap length, strip control chars, collapse whitespace
  function sanitizeText(val: unknown, maxLen = 200): string | null {
    if (typeof val !== 'string') return null
    const cleaned = val
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip control chars
      .replace(/\s+/g, ' ')                                 // collapse whitespace
      .trim()
      .slice(0, maxLen)
    return cleaned || null
  }

  // Sanitize books — filter empty entries and normalize
  const books = body.books
    .filter(b => b?.title?.trim())
    .slice(0, 10) // enforce max 10 books
    .map(b => ({
      title: sanitizeText(b.title, 150) || '',
      immersion: typeof b.immersion === 'number' ? Math.max(0, Math.min(1, b.immersion)) : 0.75,
      movedOn: Boolean(b.movedOn),
    }))
    .filter(b => b.title) // drop any that cleaned to empty
  const { tilt, boundary, scale } = body
  const tiltCustom = sanitizeText(body.tiltCustom)
  const boundaryCustom = sanitizeText(body.boundaryCustom)
  const scaleCustom = sanitizeText(body.scaleCustom)

  // Build the reader signal for Claude
  const readerSignal = buildReaderSignal(books, tilt, boundary, scale, { tiltCustom, boundaryCustom, scaleCustom })

  const client = new Anthropic({
    apiKey: config.anthropicApiKey,
  })

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Generate a Reading for the following reader.\n\n${readerSignal}\n\nReturn ONLY valid JSON matching the specified format. No other text.`
        }
      ],
      system: GENERATION_PROMPT,
    })

    const text = message.content[0].text
    
    // Parse the JSON response
    const cleaned = text.replace(/```json\n?|```\n?/g, '').trim()
    const reading = JSON.parse(cleaned)

    // Validate the constellation matches their input
    reading.constellation = books.map(b => b.title)

    return reading
  } catch (err) {
    console.error('Generation failed:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate reading',
    })
  }
})

function buildReaderSignal(books, tilt, boundary, scale, custom = {}) {
  const tiltMap = {
    'world': 'The world feels real enough to live in',
    'character': 'The characters feel psychologically true',
    'structure': 'The structure is tight and purposeful',
    'prose': 'The prose is precise or striking',
    'momentum': 'The story moves — they need momentum',
  }

  const boundaryMap = {
    'beautiful-nothing': 'Beautifully written but nothing really happened',
    'fast-unearned': 'It moved fast but didn\'t feel earned',
    'obvious-themes': 'It made its themes obvious',
    'emotionally-flat': 'It felt emotionally flat',
    'ending-failed': 'The ending didn\'t land',
  }

  const scaleMap = {
    'intimate': 'Intimate and interior',
    'human': 'Mid-scale human stakes',
    'systems': 'Large systems / big worlds',
    'planetary': 'Planetary / civilisational',
  }

  function describeImmersion(val) {
    if (val >= 0.9) return 'deeply immersed'
    if (val >= 0.65) return 'strongly immersed'
    if (val >= 0.4) return 'moderately immersed'
    return 'lightly immersed'
  }

  let signal = `BOOKS THAT STAYED:\n`
  books.forEach((b, i) => {
    const depth = describeImmersion(b.immersion)
    const status = b.movedOn ? 'moved on' : 'still active'
    signal += `${i + 1}. ${b.title} (${depth}, ${status})\n`
  })

  signal += `\nWHAT'S DOING THE WORK (up to 2):\n`
  tilt.forEach(t => {
    if (t === 'custom' && custom.tiltCustom) {
      signal += `- (in their words) ${custom.tiltCustom}\n`
    } else {
      signal += `- ${tiltMap[t] || t}\n`
    }
  })

  if (boundary === 'custom' && custom.boundaryCustom) {
    signal += `\nWORST DISAPPOINTMENT: (in their words) ${custom.boundaryCustom}`
  } else {
    signal += `\nWORST DISAPPOINTMENT: ${boundaryMap[boundary] || boundary}`
  }

  if (scale === 'custom' && custom.scaleCustom) {
    signal += `\n\nPREFERRED SCALE: (in their words) ${custom.scaleCustom}`
  } else {
    signal += `\n\nPREFERRED SCALE: ${scaleMap[scale] || scale}`
  }

  return signal
}
