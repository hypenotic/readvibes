import Anthropic from '@anthropic-ai/sdk'
import { checkRateLimit } from '../utils/rateLimit'

const GENERATION_PROMPT = `You are the voice engine for Read Fortunes, a narrative-texture-based book discovery platform. Your job is to generate a "Reading" — a short, evocative profile of how someone reads, what they seek in stories, and what doesn't hold them.

You are NOT a chatbot. You are an interpretive voice. Think: tarot reader meets literary critic meets someone who knows this person better than they expected.

VOICE RULES (non-negotiable):
- Second person. Always "you." Never "the reader" or "one."
- Present tense. Not "you have always loved" but "you read for."
- No genre names. Never say "literary fiction" or "sci-fi" or "memoir." Describe what the books DO, not what shelf they sit on.
- No flattery. Don't tell them they're smart, discerning, or have great taste. Describe their orientation, not their quality.
- No hedging. Not "you might" or "you tend to" — commit. "You read for." "The pleasure is." "What holds you is."
- Precise, not poetic. Every word earns its place. No decorative metaphors. If a phrase sounds like a horoscope, cut it.
- The boundary paragraph should feel honest, not judgmental. It names what doesn't work for them without implying that's a flaw.
- The field signature is 3-6 words. A compression. It should feel like a motto they didn't know they had.
- Recommendations must NOT include books the reader already named. Each rec note should explain WHY this book matches this specific reader's posture — not just describe the book.

POSTURE FRAMEWORK (internal, never shown to reader):
Readers sit somewhere on two axes:
- Inhabitor ↔ Architect (do they read from inside the experience, or do they watch the system?)
- Momentum ↔ Watcher (do they need the story to move, or do they stay for texture and accumulation?)

Use the form inputs to infer posture, but never name the posture in the output.

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

OUTPUT FORMAT:
Return valid JSON only. No markdown, no backticks, no preamble. The JSON must match this exact structure:

{
  "title": "3-5 word evocative title (e.g. 'Tension as Intelligence', 'Survival Has a Voice')",
  "subtitle": "The [Archetype Name] (e.g. 'The Peripheral Architect', 'The Witness Who Stays')",
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
  if (!body || !Array.isArray(body.books) || body.books.filter(b => b && b.trim()).length < 3) {
    throw createError({ statusCode: 400, statusMessage: 'At least 3 books are required' })
  }
  if (!Array.isArray(body.tilt) || body.tilt.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'At least one tilt selection is required' })
  }
  if (!body.boundary) {
    throw createError({ statusCode: 400, statusMessage: 'Boundary selection is required' })
  }
  if (!body.scale) {
    throw createError({ statusCode: 400, statusMessage: 'Scale selection is required' })
  }

  // Sanitize books — filter empty entries
  const books = body.books.map(b => typeof b === 'string' ? b.trim() : '').filter(Boolean)
  const { admiredNotLoved, stoppedReading, tilt, boundary, scale } = body

  // Build the reader signal for Claude
  const readerSignal = buildReaderSignal(books, admiredNotLoved, stoppedReading, tilt, boundary, scale)

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
    reading.constellation = books

    return reading
  } catch (err) {
    console.error('Generation failed:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate reading',
    })
  }
})

function buildReaderSignal(books, admiredNotLoved, stoppedReading, tilt, boundary, scale) {
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

  let signal = `BOOKS THAT STAYED:\n`
  books.forEach((b, i) => { signal += `${i + 1}. ${b}\n` })

  if (admiredNotLoved) {
    signal += `\nADMIRED BUT DIDN'T LOVE: ${admiredNotLoved}`
  }
  if (stoppedReading) {
    signal += `\nSTOPPED READING: ${stoppedReading}`
  }

  signal += `\n\nWHAT'S DOING THE WORK (up to 2):\n`
  tilt.forEach(t => { signal += `- ${tiltMap[t]}\n` })

  signal += `\nWORST DISAPPOINTMENT: ${boundaryMap[boundary]}`
  signal += `\n\nPREFERRED SCALE: ${scaleMap[scale]}`

  return signal
}
