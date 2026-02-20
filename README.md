# Readvibes

**Discover Your Reading.**

Narrative-texture-based book discovery. Tell us a few books that stayed with you — we'll tell you what they reveal.

## What is this?

Readvibes builds a reader fingerprint from your favourite books and a few questions about how you read. It generates a personalised "Reading" — an evocative profile of your narrative orientation, what you seek in stories, and what doesn't hold you.

Think: MBTI clarity + Tarot mystique + serious reader tone.

## Stack

- **Nuxt 3** (Vue 3)
- **Anthropic Claude API** for Reading generation
- Static hosting ready (Vercel, Netlify, etc.)

## Setup

```bash
npm install
cp .env.example .env
# Add your Anthropic API key to .env
npm run dev
```

## How it works

1. **Form** — You provide 5 books that stayed with you, answer 3 quick questions
2. **Engine** — Claude interprets your signal and generates a structured Reading
3. **Card** — Your Reading is rendered as a personalised card with visual temperature matching your posture

## Status

Prototype. Testing with friends.
