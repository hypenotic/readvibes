import Anthropic from '@anthropic-ai/sdk'
import { checkRateLimit } from '../utils/rateLimit'

const FORCE_MAPPING_PROMPT = `You are the force-mapping engine for Read Fortunes, a narrative resonance platform.

You receive a list of books. Your job is to identify the narrative forces active across this constellation and return them as short recognition phrases.

WHAT YOU ARE LOOKING FOR:
Analyze what these books share that is NOT genre, NOT topic, NOT prestige. Look for shared narrative mechanics: how they handle time, voice, emotional distance, structural risk, information control, causality, escalation, compression, attachment, scope.

Map forces across five domains:
- Emotional Tone (warmth, distance, intensity, withholding, catharsis)
- Structural Complexity (linearity, recursion, fragmentation, convergence, escalation)
- Thematic Vectors (power, survival, identity, systems, intimacy, justice)
- Narrative Devices (POV, reliability, ensemble, competence, found family, time shifts)
- Voice & Perspective (dryness, lyricism, restraint, maximalism, wit, precision)

WHAT YOU RETURN:
10–15 short phrases (2–6 words each). Each phrase names one active force in recognition language.

RECOGNITION LANGUAGE means:
- A reader sees it and immediately knows whether it's theirs or not
- It lands in under one second
- It names a dynamic, tension, or pattern — not a mood, trope, or genre
- It sounds like "found family" or "competence under pressure" — compressed, specific, felt
- Nobody would have invented this phrase on their own, but when they see it, they recognize it

DO NOT RETURN:
- Book jacket language ("a life in full," "rooms you can live in")
- Academic/mechanical terms ("escalation," "retrospection," "emotional modulation")
- Genre labels ("literary fiction," "hard sci-fi," "memoir")
- Trope names ("the chosen one," "the heist," "enemies to lovers")
- Phrases that sound like Reading paragraph output ("the voice stays level," "you stay for what settles")
- Anything that needs a tooltip or explanation

Return ONLY a JSON array of strings. No markdown, no backticks, no preamble.
Example: ["competence under pressure", "found family", "panache", "what gathers at the bottom", "the thing no one in the room is saying"]`

export default defineEventHandler(async (event) => {
  // Rate limit: 5 force generations per IP per hour
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const { allowed, remaining, resetAt } = checkRateLimit(`forces:${ip}`, { maxRequests: 5, windowMs: 60 * 60 * 1000 })

  if (!allowed) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
    setResponseHeader(event, 'Retry-After', String(retryAfter))
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again later.' })
  }

  setResponseHeader(event, 'X-RateLimit-Remaining', String(remaining))

  const config = useRuntimeConfig()
  const body = await readBody(event)

  // Validate: need at least 3 books
  if (!body || !Array.isArray(body.books) || body.books.length < 3) {
    throw createError({ statusCode: 400, statusMessage: 'At least 3 books are required' })
  }

  // Sanitize book titles
  function sanitizeText(val: unknown, maxLen = 150): string {
    if (typeof val !== 'string') return ''
    return val
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLen)
  }

  const titles = body.books
    .map((b: any) => {
      if (typeof b === 'string') return sanitizeText(b)
      if (b && typeof b.title === 'string') return sanitizeText(b.title)
      return ''
    })
    .filter((t: string) => t.length > 0)
    .slice(0, 10)

  if (titles.length < 3) {
    throw createError({ statusCode: 400, statusMessage: 'At least 3 valid book titles are required' })
  }

  const bookList = titles.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')

  const client = new Anthropic({
    apiKey: config.anthropicApiKey,
  })

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Generate recognition phrases for this constellation:\n\n${bookList}\n\nReturn ONLY a JSON array of strings. No other text.`
        }
      ],
      system: FORCE_MAPPING_PROMPT,
    })

    const text = message.content[0].text
    const cleaned = text.replace(/```json\n?|```\n?/g, '').trim()
    const forces = JSON.parse(cleaned)

    // Validate response shape
    if (!Array.isArray(forces) || forces.length === 0 || !forces.every((f: unknown) => typeof f === 'string')) {
      throw new Error('Invalid force field response format')
    }

    return forces
  } catch (err) {
    console.error('Force generation failed:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate forces',
    })
  }
})
