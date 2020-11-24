<template>
  <header class="flex">
    <NuxtLink :to="localePath('/')"><Logo class="mb-4" /></NuxtLink>
    <AppSearchInput class="ml-8" />
    <nuxt-link :to="switchLocalePath('ja')">日本語</nuxt-link>
    <nuxt-link :to="switchLocalePath('en')">English</nuxt-link>
  </header>
</template>
