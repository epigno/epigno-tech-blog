const title = 'Epigno Tech Blog'
const description = 'Epigno社内で出会う技術問題の特集'
const baseUrl = 'https://blog.epigno.jp'

export default {
  /*
   ** Nuxt target
   ** See https://nuxtjs.org/api/configuration-target
   */
  target: 'static',
  /*
   ** Headers of the page
   ** See https://nuxtjs.org/api/configuration-head
   */
  head: {
    title,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: description,
      },

      // OGP meta-data
      // https://ogp.me/
      {
        hid: 'og:title',
        name: 'og:title',
        content: title,
      },
      {
        hid: 'og:type',
        name: 'og:type',
        content: 'website',
      },
      {
        hid: 'og:image',
        name: 'og:image',
        content:
          'https://u.jimcdn.com/cms/o/seec97e996b647a8d/userlayout/img/logo-small.png?t=1583479236',
      },
      {
        hid: 'og:url',
        name: 'og:url',
        content: baseUrl,
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   ** https://nuxtjs.org/guide/plugins
   */
  plugins: [],
  /*
   ** Auto import components
   ** See https://nuxtjs.org/api/configuration-components
   */
  components: true,
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    // Doc: https://github.com/nuxt-community/stylelint-module
    '@nuxtjs/stylelint-module',
    // Doc: https://github.com/nuxt-community/nuxt-tailwindcss
    '@nuxtjs/tailwindcss',
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://github.com/nuxt/content
    '@nuxt/content',
    '@nuxtjs/sitemap',
    // Doc: https://i18n.nuxtjs.org/
    [
      '@nuxtjs/i18n',
      {
        locales: [
          { code: 'ja', iso: 'ja', name: '日本語' },
          { code: 'en', iso: 'en', name: 'English' },
        ],
        defaultLocale: 'ja',
        strategy: 'prefix_and_default',
        detectBrowserLanguage: {
          redirectOn: 'root',
        },
        vueI18n: {
          fallbackLocale: 'ja',
        },
        vueI18nLoader: true,
      },
    ],
  ],
  /*
   ** Content module configuration
   ** See https://content.nuxtjs.org/configuration
   */
  content: {
    markdown: {
      prism: {
        theme: 'prism-themes/themes/prism-material-oceanic.css',
      },
    },
    nestedProperties: ['author.name', 'author.slug'],
  },

  sitemap: {
    hostname: baseUrl,
    gzip: true,
    routes: async () => {
      const routes = []
      const { $content } = require('@nuxt/content')
      for (const locale of ['ja', 'en']) {
        const posts = await $content(`articles/${locale}`).fetch()
        for (const post of posts) {
          let route = `blog/${post.slug}`
          if (locale !== 'ja') {
            route = `${locale}/${route}`
          }
          routes.push(route)
        }
      }
      return routes
    },
  },

  /*
   ** Build configuration
   ** See https://nuxtjs.org/api/configuration-build/
   */
  build: {},
}
