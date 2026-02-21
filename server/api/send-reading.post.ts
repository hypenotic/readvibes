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

  const readerName = reading.readerName || ''
  const temporalMarker = reading.temporalMarker || ''
  const readerLine = [readerName, temporalMarker].filter(Boolean).join(' \u00B7 ')

  const paragraphs = (reading.paragraphs || []).map((p: string) => `<p style="margin: 0 0 14px; line-height: 1.9; font-family: 'Spectral', Georgia, serif;">${p}</p>`).join('')
  const constellation = (reading.constellation || []).map((b: any) => {
    const title = typeof b === 'string' ? b : b?.title || ''
    return `<span style="display: inline-block; font-size: 12px; color: #9ea6b8; padding: 3px 10px; border: 1px solid #2a2f3a; border-radius: 14px; font-style: italic; margin: 2px;">${title}</span>`
  }).join(' ')

  const signalTrace = (reading.signalTrace || []).join(' \u00B7 ')

  const recs = (reading.recommendations || []).map((rec: { title: string; author: string; note: string }, i: number) => {
    const numerals = ['I', 'II', 'III', 'IV', 'V']
    return `
      <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #1a1c20;">
        <div style="margin-bottom: 4px;">
          <span style="font-size: 11px; color: #4a5268; font-family: Georgia, serif;">${numerals[i]}</span>
          <span style="font-size: 17px; color: #b8a878; margin-left: 10px;">${rec.title}</span>
          <span style="font-size: 13px; color: #9ea6b8; margin-left: 8px;">\u2014 ${rec.author}</span>
        </div>
        <p style="margin: 0 0 0 26px; font-size: 14px; line-height: 1.65; color: #9ea6b8; font-family: 'Spectral', Georgia, serif;">${rec.note}</p>
      </div>`
  }).join('')

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background: #0a0b0e; font-family: Georgia, serif;">
  <div style="max-width: 520px; margin: 0 auto; padding: 48px 24px;">

    <!-- Posture label + name -->
    <div style="text-align: center; margin-bottom: 8px;">
      <div style="font-size: 9px; letter-spacing: 0.35em; text-transform: uppercase; color: #9ea6b8; font-family: Georgia, serif;">Your reading posture</div>
    </div>

    <!-- Posture name (subtitle) -->
    <div style="text-align: center; margin-bottom: 6px; font-size: 14px; color: #9ea6b8; letter-spacing: 0.2em; text-transform: uppercase; font-family: Georgia, serif;">
      ${reading.subtitle}
    </div>

    <!-- Posture definition -->
    ${reading.postureDefinition ? `
    <div style="text-align: center; margin-bottom: 24px; font-size: 14px; color: #887868; font-style: italic; font-family: 'Spectral', Georgia, serif;">
      ${reading.postureDefinition}
    </div>` : ''}

    <!-- Field Signature (hero) -->
    <div style="text-align: center; margin-bottom: 12px;">
      <div style="font-size: 36px; font-weight: 500; font-style: italic; color: #e8c888; letter-spacing: 0.02em; line-height: 1.15; font-family: 'Cormorant', 'Cormorant Garamond', Georgia, serif;">
        ${reading.fieldSignature}
      </div>
    </div>

    <!-- Reader info + temporal marker -->
    ${readerLine ? `
    <div style="text-align: center; margin-bottom: 24px; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #9ea6b8; font-family: 'Spectral', Georgia, serif;">
      ${readerLine}
    </div>` : ''}

    <!-- Divider -->
    <div style="width: 80px; height: 1px; margin: 0 auto 28px; background: #2a2f3a;"></div>

    <!-- Reading paragraphs -->
    <div style="font-size: 17px; color: #d8c8a8; font-weight: 300; margin-bottom: 28px;">
      ${paragraphs}
    </div>

    <!-- Boundary -->
    <div style="border-top: 1px solid #2a2f3a; padding-top: 20px; margin-bottom: 26px;">
      <div style="font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #887868; margin-bottom: 8px; font-family: Georgia, serif;">What tends not to hold you</div>
      <p style="font-size: 15px; line-height: 1.7; color: #c8b898; font-weight: 300; margin: 0; font-family: 'Spectral', Georgia, serif;">
        ${reading.boundary}
      </p>
    </div>

    <!-- Constellation -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 9px; letter-spacing: 0.35em; color: #4a5268; text-transform: uppercase; font-family: Georgia, serif; margin-bottom: 14px;">Your constellation</div>
      <div>${constellation}</div>
    </div>

    <!-- Signal trace -->
    ${signalTrace ? `
    <div style="text-align: center; margin-bottom: 24px; font-size: 11px; letter-spacing: 0.12em; color: #887868; font-family: 'Spectral', Georgia, serif;">
      ${signalTrace}
    </div>` : ''}

    <!-- Mark -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="width: 40px; height: 1px; margin: 0 auto 12px; background: #2a2f3a;"></div>
      <div style="font-size: 9px; letter-spacing: 0.4em; color: #a08040; text-transform: uppercase; font-style: italic; font-family: Georgia, serif;">
        Read Fortunes
      </div>
      <div style="width: 40px; height: 1px; margin: 12px auto 0; background: #2a2f3a;"></div>
    </div>

    <!-- Recommendations -->
    ${reading.recommendations?.length ? `
    <div style="margin-top: 32px;">
      <div style="text-align: center; font-size: 9px; letter-spacing: 0.35em; color: #4a5268; text-transform: uppercase; font-family: Georgia, serif; margin-bottom: 24px;">Books that might find you</div>
      ${recs}
      ${reading.recsFooter ? `
      <div style="text-align: center; padding-top: 16px; border-top: 1px solid #1a1c20;">
        <p style="font-size: 12.5px; line-height: 1.7; color: #4a5268; font-style: italic; margin: 0; font-family: 'Spectral', Georgia, serif;">
          ${reading.recsFooter}
        </p>
      </div>` : ''}
    </div>` : ''}

  </div>
</body>
</html>`

  try {
    await resend.emails.send({
      // TODO: Update to hello@readfortune.es once domain is verified with Resend
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
