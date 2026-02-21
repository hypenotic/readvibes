// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Read Fortunes',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Tell us a few books that stayed with you. We\'ll map what draws you in.' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Read Fortunes' },
        { property: 'og:description', content: 'Tell us a few books that stayed with you. We\'ll map what draws you in.' },
        { property: 'og:image', content: '/og-image.svg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:site_name', content: 'Read Fortunes' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Read Fortunes' },
        { name: 'twitter:description', content: 'Tell us a few books that stayed with you. We\'ll map what draws you in.' },
        { name: 'twitter:image', content: '/og-image.svg' },
        // Theme
        { name: 'theme-color', content: '#060504' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Spectral:wght@200;300;400&display=swap' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    resendApiKey: process.env.RESEND_API_KEY || '',
  }
})
