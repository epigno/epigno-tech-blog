---
title: Challenges with switching to Pinia.
description: Why we are staying with Vuex instead of switching to Pinia for state management
img: https://pinia.vuejs.org/logo.svg
alt: "Challenges with switching to Pinia for state management"
author:
  name: Nathaniel Nasarow
  slug: nasarow
  bio: Engineer at Epigno
  img: /img/authors/pic-nasarow.jpg
createdAt: 2022-04-21
updatedAt: 2022-04-21
tags:
  - nuxtjs
  - pinia
---

Upgrading dependencies can be hit and miss. Sometimes it's a breeze; type in `yarn upgrade`, your dependencies update to the latest version, and nothing breaks.

Sometimes it is not as simple as updating a dependency; sometimes the newest version of the system you are using makes so many changes that it breaks your entire system.

This is the challenge I faced when given the task to update our frontend dependencies. Specifically, updating Nuxt from version two to version three. During this process, I found that the new version of Nuxt prefers users to use Pinia instead of Vuex.


## What is Pinia?

Pinia is a state management system that is similar to Vuex for Vue.js apps. It works in Vue 2 and above.

## Why Pinia?

Nuxt is promoting Pinia as the system they will be supporting starting with Nuxt Bridge and Nuxt Three. However, Vuex is still useable, just not suggested.

More importantly, Vuex itself has stated that Pinia is the new default. You can read about it in https://vuex.vuejs.org/#what-is-vuex in their Introduction page. In it, they state that Pinia has almost the same API as Vuex 5, just under a different name.

In _practice_ the Pinia API is still pretty different, at least for Epigno's use case.

### Migration Guide:

The migration guide is here, if you wish to use it for reference: https://pinia.vuejs.org/cookbook/migration-vuex.html#preparation

### Post-installation bug

Immediately after installing the `Pinia` dependency, I ran into `import` errors:

```
ERROR  Failed to compile with 21 errors

Can't import the named export 'Vue2' from non EcmaScript module (only default export is available)

...

```

This isn't _supposed_ to happen, but I also wasn't surprised. We're trying to replace Vuex with a completely different system, so there are bound to be problems.

Other developers have encountered the same problem, as seen here: https://github.com/vuejs/pinia/issues/675

This appears to be a problem with Webpack 4. This is documented in the Pinia Cookbook here: https://github.com/vuejs/pinia/blob/v2/packages/docs/cookbook/migration-v1-v2.md#webpack-4-support

The only solution is to add this `rule` to the `nuxt.config` file:

```
rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
    ],
```

What was not mentioned is that there may be other import errors. In our case, I also needed to add `/.nuxt/` to this ruleset. Because this is due to Webpack 4, I'm guessing (and only guessing) that upgrading to Webpack 5 would fix these import issues.


### Composition API and why it's required

The Epital project does not use Vue's Composition API; instead we use the Options API. This isn't necessarily by preference, it just happens to be what Epital has already been using when I came on board.

`Pinia` actually _requires_ the Composition API as a dependency. Personally, I feel like this is a waste of resources if you do not already use the Composition API. Here at Epigno, our frontend app uses the Options API. However, Pinia does requires it and one would be required to include it as a dependency.

If you decide to use Pinia in your project, keep in mind that the Pinia documentation assumes you are utilizing the Composition API.

## Pinia is not necessarily better than Vuex

While converting two of our stores from Vuex to Pinia, I came across a few issues with the Pinia API. However, let's focus on the positive first.

### Creating a store uses less code.

Using Vuex:

```js
// profile.js

export const state = () => ({
  user: {},
  options: {},
})

export const getters = {
  getUser: state => state.user,
  getOptions: state => state.options,
}

export const actions = {
  // This is retrieving data from a different store
  async retrievePendingUserSurveys(
    { commit, getters, rootGetters },
    { force = false } = {}
  ) {

    const userSurvey = rootGetters['surveys'].filter(s => s.userId === getters.getUser.id)
    return userSurvey
  }
}

export const mutations = {
  setUser(state, user) {
    state.user = user
  },

  setOptions(state, payload) {
    const { key, value } = payload
    state.options[key] = value
  },
}
```

Using Pinia, we can remove the `getters` block and replace mutations with the actions block:

```ts
import { defineStore } from 'pinia'

// When using Vuex alongside Pinia, we have to import the store
import { getters as surveyState } from '~/store/survey'

interface State {
  user: Object,
  options: Object,
}

// `profile` is the ID for the store. We'll get back to this later
export const useProfileStore = defineStore('profile', {
  state: (): State => ({
    user: {},
    options: {},
  }),

  actions: {
    // mutations can now become actions. Instead of `state` as the first argument, use `this`
    setUser(user) {
      this.user = user
    },

    setOptions(payload) {
      const { key, value } = payload
      this.options[key] = value
    },

    // Now we can get rid of the rootGetters and getters functions!
    async retrievePendingUserSurveys(
       { force = false } = {}
     ) {
       const userSurvey = surveyStore.surveys.filter(s => s.userId === this.user.id)
       return userSurvey
    }
  },
})
```

If anything, I do like how Pinia is used to create a store. Also, `Pinia` uses `stores` instead of `store` as part of its folder structure. You can see more about that here in their migration guide: https://pinia.vuejs.org/cookbook/migration-vuex.html#restructuring-modules-to-stores

Now, this makes sense. If we are going to be naming our stores with the `use` prefix, then it makes sense that the folder is named `stores`.

Using Pinia's store API in practice makes things a little more difficult (or perhaps just different) when you compare it to Vuex.

## How we utilize Vuex in code

If we want to use our profile store in a page, we do not have to import anything. This is because the state is accessed with the `$store` property. This can be accessed anywhere in our site using `this.$store`.

The exception is when we want to use it in middleware, `asyncData`, or other lifecycle hooks that do not have access to the store. In these cases, we normally pass the `store` property. For example:

```js
asyncData({ axios, store }) {
  const currentProfile = store.profile.user
  ...
}
```

## How does this change in Pinia?

Pinia makes things just a little more difficult and a little more verbose.

Let's take the most annoying part. If we want to access the store in `asyncData`, we cannot just pass `store` (in fact, it would no longer exist when using Pinia). Instead, we have to pass the `$pinia` property.

```js
asyncData({ axios, $pinia }) {
  ...
}
```

But that's not all. We _also_ have to import the store that we want to use, and then pass the `$pinia` property to the store function to "activate" it.

```js
import useProfileStore from '~stores/profile'

...

asyncData(axios, $pinia) {
  const profileStore = useProfileStore($pinia)

  // now we can access our states
  const user = profileStore.user
  const options = profileStore.options
}
```

Whether you think this is better or worse depends on your idea of ease of use and maintainability. Personally, I think it makes things a little harder to use since we now have to import all the stores that we need to access in a particular file. Basically, it takes longer to set up. However, this may mean that maintainability may be a little better (not necessarily easier), but that depends on you.

### My solution

I wanted to replicate how we could use `this.$store` anywhere in the code to access our state. I created a global mixin that would be initialized when the frontend is spun up.

```js

import Vue from 'vue'
import { mapStores } from 'pinia'

// As we create more stores, we need to import each one
import { useProfileStore } from '~/stores/profile'
import { useSurveyStore } from '~/stores/survey'

Vue.mixin({
  computed: {
    $stores() {
      const stores = mapStores(useProfileStore, useSurveyStore)
      return stores
    },
  },
})

```

Now I can access `$stores` from anywhere in the app, except from certain lifecycle hooks, such as `asyncData`, and `middleware`.

Granted, I can probably spend some time to change this so that it's a plugin or module that is available everywhere at any time.

However, because the Pinia stores are functions, how we call them will be confusing to developers.

```js
// We have to write the code like this if we use a global mixin to access the stores.
this.$stores.profileStore().user

/**
 * But in this case, the following will return an error.
 */
this.$stores.profileStore.user
/**
 * However, if we imported the `useProfileStore` function directly into the file where it is being accessed,
 * then the above code would not return an error.
 */
```

## Should you use Pinia?

Well, it depends. If your project is small and you want to use a state management system that will continue to have new features added, then sure, Pinia might be for you.

But, if you're like us and you're already using Vuex, I honestly cannot make the recommendation to switch over to the Pinia system. From what I can see, it simply does not improve anything.

The Pinia team made one thing less verbose: creating a state that does not require `mutations` or `getters` blocks.

But, then they made another part of it _more_ verbose: Importing your states in each file that uses them, and requiring more code to initiate them.

Furthermore, I think Pinia makes it pretty clear that they assume you are using the Composition API, instead of the Options API.

## Final Thoughts

I understand why the Vuex team decided to make Pinia the new standard. They saw that Pinia incorporated different things that they already wanted to add in the new version of Vuex. So, instead of making a new version, they decided to make Pinia the defacto standard.

Because of that, if I was making a new project, I would use Pinia instead of Vuex.

That doesn't necessarily mean that Pinia is better than Vuex, though.

As it stands, Vuex is currently in maintenance mode, so bugs will continue to be fixed. However, I cannot fathom converting a project from Vuex to Pinia; the benefits, if any, are minimal at best.

If you are using `Nuxt`, especially Nuxt 3, then you should probably use Pinia instead of Vuex, since Nuxt 3 will support Pinia. However, Vuex still remains a viable option if you are in the process of updating your project from nuxtjs to Nuxt 3.

In conclusion, use Pinia if you are making a new project. Otherwise, stick with what you have. Epital will be sticking with what works for it, and in this case that is Vuex.

> If it's not broke, don't fix it.
> -- Me. And probably a million other people.

[Nuxt Bridge](https://v3.nuxtjs.org/bridge/overview)
[Composition API](https://vuejs.org/api/composition-api-setup.html)
[Options API](https://vuejs.org/api/options-state.html)
