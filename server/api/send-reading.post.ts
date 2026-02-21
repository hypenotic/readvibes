import { Resend } from 'resend'
import { checkRateLimit } from '../utils/rateLimit'

export default defineEventHandler(async (event) => {
  // Rate limit: 10 emails per IP per hour
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const { allowed } = checkRateLimit(`email:${ip}`, { maxRequests: 10, windowMs: 60 * 60 * 1000 })

  if (!allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many email requests. Please try again later.' })
  }

  const config = useRuntimeConfig()
  const body = await readBody(event)

  // Validate
  if (!body?.email || !body?.reading) {
    throw createError({ statusCode: 400, statusMessage: 'Email and reading data are required' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address' })
  }

  const { email, reading } = body
  const resend = new Resend(config.resendApiKey)

  const readerName = reading.readerName || 'My Reading'
  const paragraphs = (reading.paragraphs || []).map((p: string) => `<p style="margin: 0 0 14px; line-height: 1.8;">${p}</p>`).join('')
  const constellation = (reading.constellation || []).map((b: any) => {
    const title = typeof b === 'string' ? b : b?.title || ''
    return `<span style="display: inline-block; font-size: 12px; color: #788098; padding: 3px 10px; border: 1px solid #2a2f3a; border-radius: 14px; font-style: italic; margin: 2px;">${title}</span>`
  }).join(' ')

  const recs = (reading.recommendations || []).map((rec: { title: string; author: string; note: string }, i: number) => {
    const numerals = ['I', 'II', 'III', 'IV', 'V']
    return `
      <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #1a1c20;">
        <div style="margin-bottom: 4px;">
          <span style="font-size: 11px; color: #4a5268; font-family: Georgia, serif;">${numerals[i]}</span>
          <span style="font-size: 17px; color: #b8a878; margin-left: 10px;">${rec.title}</span>
          <span style="font-size: 13px; color: #788098; margin-left: 8px;">\u2014 ${rec.author}</span>
        </div>
        <p style="margin: 0 0 0 26px; font-size: 14px; line-height: 1.65; color: #788098;">${rec.note}</p>
      </div>`
  }).join('')

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background: #0a0b0e; font-family: 'Georgia', serif;">
  <div style="max-width: 520px; margin: 0 auto; padding: 48px 24px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 9px; letter-spacing: 0.35em; text-transform: uppercase; color: #788098; font-family: Georgia, serif;">${readerName}</div>
      <div style="width: 40px; height: 1px; margin: 16px auto; background: #3a4050;"></div>
    </div>

    <!-- Glyph -->
    <div style="text-align: center; margin-bottom: 22px; font-size: 22px; color: #b8a878; opacity: 0.5; letter-spacing: 0.3em;">
      ${reading.glyph || '\u25C8'}
    </div>

    <!-- Title -->
    <h1 style="text-align: center; margin: 0 0 6px; font-size: 28px; font-weight: 400; color: #e2e5ec; letter-spacing: 0.06em; line-height: 1.1; font-family: 'Cormorant Garamond', Georgia, serif;">
      ${reading.title}
    </h1>
    <div style="text-align: center; margin-bottom: 30px; font-size: 12px; color: #788098; letter-spacing: 0.2em; text-transform: uppercase; font-family: Georgia, serif;">
      ${reading.subtitle}
    </div>

    <!-- Divider -->
    <div style="width: 80px; height: 1px; margin: 0 auto 28px; background: #2a2f3a;"></div>

    <!-- Reading -->
    <div style="font-size: 17px; color: #a0a8b8; font-weight: 300; margin-bottom: 28px; font-family: 'Cormorant Garamond', Georgia, serif;">
      ${paragraphs}
    </div>

    <!-- Boundary -->
    <div style="border-top: 1px solid #2a2f3a; padding-top: 20px; margin-bottom: 26px;">
      <p style="font-size: 15px; line-height: 1.7; color: #788098; font-style: italic; margin: 0; font-family: 'Cormorant Garamond', Georgia, serif;">
        ${reading.boundary}
      </p>
    </div>

    <!-- Field Signature -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 10px; letter-spacing: 0.25em; color: #788098; text-transform: uppercase; font-family: Georgia, serif; margin-bottom: 5px;">Field Signature</div>
      <div style="font-size: 21px; color: #b8a878; font-style: italic; letter-spacing: 0.03em; font-family: 'Cormorant Garamond', Georgia, serif;">
        ${reading.fieldSignature}
      </div>
    </div>

    <!-- Constellation -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 9px; letter-spacing: 0.35em; color: #4a5268; text-transform: uppercase; font-family: Georgia, serif; margin-bottom: 14px;">The Constellation</div>
      <div>${constellation}</div>
    </div>

    <!-- Recommendations -->
    ${reading.recommendations?.length ? `
    <div style="margin-top: 32px;">
      <div style="text-align: center; font-size: 9px; letter-spacing: 0.35em; color: #4a5268; text-transform: uppercase; font-family: Georgia, serif; margin-bottom: 24px;">Five Books for Your Field</div>
      ${recs}
      ${reading.recsFooter ? `
      <div style="text-align: center; padding-top: 16px; border-top: 1px solid #1a1c20;">
        <p style="font-size: 12.5px; line-height: 1.7; color: #4a5268; font-style: italic; margin: 0; font-family: 'Cormorant Garamond', Georgia, serif;">
          ${reading.recsFooter}
        </p>
      </div>` : ''}
    </div>` : ''}

    <!-- Footer -->
    <div style="text-align: center; margin-top: 48px; font-size: 9px; letter-spacing: 0.4em; color: #2a2f3a; text-transform: uppercase; font-family: Georgia, serif;">
      Read Fortunes
    </div>

  </div>
</body>
</html>`

  try {
    await resend.emails.send({
      from: 'Read Fortunes <onboarding@resend.dev>',
      to: email,
      subject: `Your Reading${reading.readerName ? `, ${reading.readerName}` : ''}`,
      html,
    })

    return { success: true }
  } catch (err) {
    console.error('Email send failed:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send email',
    })
  }
})
