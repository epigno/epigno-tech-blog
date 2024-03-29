<i18n>
{
  "en": {
    "back": "Back to All Articles",
    "title": "Here are a list of articles by {name}:"
  },
  "ja": {
    "back": "ホームページに戻る",
    "title": "{name}の記事"
  }
}
</i18n>

<template>
  <div
    class="flex lg:h-screen w-screen lg:overflow-hidden xs:flex-col lg:flex-row"
  >
    <div class="relative lg:w-1/2 xs:w-full xs:h-84 lg:h-full post-left">
      <img
        :src="author.img"
        :alt="author.name"
        class="absolute h-full w-full object-cover"
      />
    </div>

    <div class="overlay"></div>
    <div class="absolute top-32 left-32 text-gray-500">
      <div class="flex">
        <NuxtLink :to="localePath('/')"><Logo /></NuxtLink>
        <NuxtLink
          v-for="locale in availableLocales"
          :key="locale.code"
          :to="switchLocalePath(locale.code)"
          class="py-2 px-4 text-white font-semibold"
          >{{ locale.name }}</NuxtLink
        >
      </div>

      <div class="mt-16 -mb-3 flex flex-col uppercase text-sm">
        <h1 class="text-4xl font-bold">
          {{ author.name }}
        </h1>
        <p class="mb-4">{{ author.bio }}</p>
      </div>
      <nuxt-content :document="author" />
    </div>
    <div
      class="relative xs:py-8 xs:px-8 lg:py-32 lg:px-16 lg:w-1/2 xs:w-full h-full overflow-y-scroll markdown-body post-right custom-scroll"
    >
      <NuxtLink :to="localePath('/')"
        ><p class="hover:underline">{{ $t('back') }}</p></NuxtLink
      >
      <h3 class="mb-4 font-bold text-4xl">
        {{ $t('title', { name: author.name }) }}
      </h3>
      <ul>
        <li
          v-for="article in articles"
          :key="article.slug"
          class="w-full px-2 xs:mb-6 md:mb-12 article-card"
        >
          <NuxtLink
            :to="
              localePath({ name: 'blog-slug', params: { slug: article.slug } })
            "
            class="flex transition-shadow duration-150 ease-in-out shadow-sm hover:shadow-md xxlmax:flex-col"
          >
            <img
              v-if="article.img"
              class="h-48 xxlmin:w-1/2 xxlmax:w-full object-cover"
              :src="article.img"
              :alt="article.alt"
            />

            <div
              class="p-6 flex flex-col justify-between xxlmin:w-1/2 xxlmax:w-full"
            >
              <h2 class="font-bold">{{ article.title }}</h2>
              <p>{{ article.description }}</p>
              <p class="font-bold text-gray-600 text-sm">
                {{ formatDate(article.updatedAt) }}
              </p>
            </div>
          </NuxtLink>
        </li>
      </ul>

      <TheFooter />
    </div>
  </div>
</template>

<script>
export default {
  async asyncData({ $content, params, app }) {
    const author = await $content(
      `authors/${app.i18n.locale}`,
      params.author,
    ).fetch()

    const articles = await $content(`articles/${app.i18n.locale}`)
      .where({
        'author.slug': params.author,
      })
      .without('body')
      .sortBy('createdAt', 'asc')
      .fetch()

    const availableLocales = []
    for (const locale of app.i18n.locales.filter(
      i => i.code !== app.i18n.locale,
    )) {
      try {
        await $content(`authors/${locale.code}`, params.author).fetch()
        availableLocales.push(locale)
      } catch {
        // Translated author article not found... Fall through
      }
    }
    return {
      author,
      articles,
      availableLocales,
    }
  },
  methods: {
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(date).toLocaleDateString(this.$i18n.locale, options)
    },
  },
}
</script>
