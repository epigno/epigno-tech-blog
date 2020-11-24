<template>
  <header class="flex">
    <NuxtLink :to="localePath('/')"><Logo class="mb-4" /></NuxtLink>
    <AppSearchInput class="ml-8" />
    <NuxtLink
      v-for="locale in availableLocales"
      :key="locale.code"
      :to="switchLocalePath(locale.code)"
      class="py-2 px-4 font-semibold"
      >{{ locale.name }}</NuxtLink
    >
  </header>
</template>

<script>
export default {
  computed: {
    availableLocales() {
      return this.$i18n.locales.filter(i => i.code !== this.$i18n.locale)
    },
  },
}
</script>
