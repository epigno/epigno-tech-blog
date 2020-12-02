<i18n>
{
  "en": {
    "topics": "Topics",
    "by": "by {author}"
  },
  "ja" : {
    "topics": "タグ",
    "by": "{author}"
  }
}
</i18n>

<template>
  <div class="m-8">
    <TheHeader />

    <ul class="flex flex-wrap">
      <li
        v-for="article of articles"
        :key="article.slug"
        class="xs:w-full md:w-1/2 px-2 xs:mb-6 md:mb-12 article-card"
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
            :alt="article.title"
          />

          <div
            class="p-6 flex flex-col justify-between xxlmin:w-1/2 xxlmax:w-full"
          >
            <h2 class="font-bold">{{ article.title }}</h2>
            <p>{{ $t('by', { author: article.author.name }) }}</p>
            <p class="font-bold text-gray-600 text-sm">
              {{ article.description }}
            </p>
          </div>
        </NuxtLink>
      </li>
    </ul>
    <h3 class="mb-4 font-bold text-2xl uppercase text-center">
      {{ $t('topics') }}
    </h3>
    <ul class="flex flex-wrap mb-4 text-center">
      <li
        v-for="tag of tags"
        :key="tag.slug"
        class="xs:w-full md:w-1/3 lg:flex-1 px-2 text-center"
      >
        <NuxtLink :to="localePath(`/blog/tag/${tag.slug}`)" class="">
          <p
            class="font-bold text-gray-600 uppercase tracking-wider font-medium text-ss"
          >
            {{ tag.name }}
          </p>
        </NuxtLink>
      </li>
    </ul>

    <TheFooter />
  </div>
</template>

<script>
export default {
  async asyncData({ $content, params, app }) {
    const articles = await $content(`articles/${app.i18n.locale}`, params.slug)
      .only(['title', 'description', 'img', 'slug', 'author', 'tags'])
      .sortBy('createdAt', 'desc')
      .fetch()
    const tags = await $content('tags', params.slug)
      .only(['name', 'description', 'img', 'slug'])
      .sortBy('createdAt', 'asc')
      .fetch()
    const tagsWithArticles = tags.filter(tag => {
      return articles.find(article => article.tags.includes(tag.name))
    })

    return {
      articles,
      tags: tagsWithArticles,
    }
  },
}
</script>

<style class="postcss">
.article-card {
  border-radius: 8px;
}
.article-card a {
  background-color: #fff;
  border-radius: 8px;
}
.article-card img div {
  border-radius: 8px 0 0 8px;
}
</style>
