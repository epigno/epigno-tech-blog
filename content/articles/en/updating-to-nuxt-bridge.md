---
title: Updating to Nuxt Bridge
description: AKA how to bang head on desk and how to debug weird errors
img: /img/nuxt-gem.png
alt: "Updating to Nuxt Bridge"
author:
  name: Nathaniel Nasarow
  slug: nasarow
  bio: Engineer at Epigno
  img: /img/authors/pic-nasarow.jpg
createdAt: 2022-05-15
updatedAt: 2022-05-15
tags:
  - nuxtjs
  - bridge
---

In my last article, I wrote about the challenges I encountered with switching state management systems, from Vuex to Pinia. You can read that here in case you're interested: [Challenges switching to Pinia][1]

The switch to Pinia (or, at the least the attempt to switch) is related because Nuxt does wish to support Pinia in Nuxt three, as well as Nuxt Bridge. My coworker Olivier and I thought that switching to Pinia may make the upgrade to Nuxt Bridge easier. In the end, we decided not to use Pinia, but I'm not sure it would have made much of a difference either way.

This article will serve as documentation for the upgrade path to Nuxt Bridge from a Nuxt JS project using Vue2 and the Options API. I hope it will also help others who may be struggling with upgrading to Nuxt Bridge and, eventually, Nuxt 3.

As Mario would say, *Here we go!*

## First steps

Going off of the [Nuxt Bridge migration guide](https://v3.nuxtjs.org/bridge/overview/) we must first remove any `package-lock.json` or `yarn.lock` files (why, I'm not sure, but that's what the docs state, so that's what we do). In our case, we use `package.json` for adding new dependencies, so we need to remove `nuxt` and add `nuxt-edge`.

```
- "nuxt": "^2.15.0"
+ "nuxt-edge": "latest"
```

Then run `yarn install`

After we test our `dev` and `production` builds, we need to then add the nuxt bridge dependency. We use `yarn`, so we'll run the command:

`yarn add --dev @nuxt/bridge@npm:@nuxt/bridge-edge`

## Nuxi CLI command and updating scripts

At first, I had no idea why Nuxt decided to switch from the `nuxt` CLI command to `nuxi`. Seemed a little strange.

It comes down to the fact that you can, in fact, still run the `nuxt` command to run your local nuxt server. In order to utilize Nuxt Bridge, we have to update our scripts to use `nuxt` instead of `nuxt`.

In our case, we have scripts such as this:

```
"dev": "cross-env NODE_ENV=development nuxt",
```

Which needs to be changed to something like this:

```
"dev": "cross-env NODE_ENV=development nuxi dev",
```

Here is the [official documentation](https://v3.nuxtjs.org/bridge/overview/#nuxi)

# And now the problems

Normally, this is where I would test things; run `yarn install` or `yarn`, then run `yarn dev` and see if it works. But it won't, because we haven't updated our `nuxt.config.js` file yet.

To give you an example, if you run `nuxi dev` right now before updating the config file, you'll have error like this:

```
Nuxt CLI v3.0.0-rc.2-27530889.9e5a3cd                                                          09:39:39
                                                                                               09:39:39
  > Local:    http://localhost:3000/
  > Network:  http://##.##.###.###:3000/


 ERROR  Cannot start nuxt:  Cannot read properties of undefined (reading 'callHook')           09:39:41

  at load (node_modules/nuxi-edge/dist/chunks/dev.mjs:6735:33)
  ...

```

This was actually an error very similar to the one i received when I first attempted to upgrade directly from Nuxt.js to Nuxt 3. The reason is the config file.

Going back to the [documentation](https://v3.nuxtjs.org/bridge/overview/#update-nuxtconfig), we see that we need to import and use `defineNuxtConfig`:

```
import { defineNuxtConfig } from '@nuxt/bridge'

export default defineNuxtConfig({
  // Your existing configuration
})
```

However, in our case we still receive an error:

```
FATAL  Please remove @nuxt/typescript-build from buildModules or set bridge.typescript: false to avoid conflict with bridge.

  at setupTypescript (node_modules/@nuxt/bridge/dist/chunks/module.mjs:1173:11)
  ...
```

So, what's interesting is that the documentation does not explicityly state that this is an optional parameter that you can pass. It does tell you to remove typescript modules though.

So, if you are attempting to upgrade, make sure you go through each step of the upgrade process. Step by step. Don't try to test each individual step like I did, or you'll give yourself a headache.

## Remove incompatible and obsolete modules

We only had the `typescript-build` module, so we remove this from our dependencies.

> Remove @nuxt/typescript-build: Bridge enables same functionality

```
- "@nuxt/typescript-build": "^2.0.3",
```

We at Epigno do not use the `composition-api`, but you will have to remove it if you use it in your project. Note, that you may have an issue here if you are using `pinia`, since I'm petty sure that pinia actually requires the composition-api as a dependency.

Also, make sure you update your `.gitignore` file.

```
# Nitro folder
.output
```

## Update your nuxt.config file!

Remember that you might have something in your config file that is looking for the old modules that you removed! So you need to remove these from your config. In our case, it was `typescript-build` in our build-modules configuration.

```
- buildModules: ['@nuxt/typescript-build', '@aceforth/nuxt-optimized-images'],

+ buildModules: ['@aceforth/nuxt-optimized-images'],
```

After running `yarn`, we can run `yarn dev` (or `nuxi dev`) and our project is up and running!

## But now we have other issues

First, it's important to note that I have been building and testing this repository on both Linux and MacOS. The results are _mostly_ the same. I will note what differences there are, if any.

### An (almost) Infinite Loop

When I run `yarn dev`, the config file will run `nuxi dev`. Everything seems to be running OK!

However, when I open the browser (Google Chrome as usual) and enter the localhost address (127.0.0.1:3000), the terminal will show that there is an infinite loop as it looks for a variable.

```
 $axios.onError
 [Vue warn] Error in render: "TypeError: Cannot read properties of null (reading 'name')"
 Error: Request failed with status code 401
     at createError (/frontend/node_modules/axios/lib/core/createError.js:16:15)
     at settle (/frontend/node_modules/axios/lib/core/settle.js:17:12)
     at IncomingMessage.handleStreamEnd (/frontend/node_modules/axios/lib/adapters/http.js:269:11)
     at IncomingMessage.emit (node:events:402:35)
     at endReadableNT (node:internal/streams/readable:1343:12)
     at processTicksAndRejections (node:internal/process/task_queues:83:21) {
   config: {
     url: '/auth',

...

```

There is a whole stack trace and it just continues to loop over and over again. This _only_ appears to happen when you go directly to `127.0.0.1:3000`. 

When this first happened, I decided to just let it run in the background. Eventually it did stop, and returned a 404 error. 

![Initial 404 Error](/img/nuxtBridge/initial404Error.png "Initial 404 Error")

If I tried typing in the address again, I would get a page that displayed a 503 error:

![503 Server Error](/img/nuxtBridge/503ServerError.png "503 Server Error")

Looking at the terminal window, the stack trace eventually reveals that the user is "Unauthenticated"

```
...

data: { message: 'Unauthenticated.' }
  },
  isAxiosError: true,
  toJSON: [Function: toJSON]
}
$axios.onError

```

So I suspect that there must be something wrong with `auth` or redirection, which wasn't a problem in NuxtJS.

### Difference between Linux and MacOS

In MacOS, the infinite loop seems to be a true infinite loop; it never crashes, the server never stops, and I never receive any server error. However, the loop continues even if I manually navigate successfully to `127.0.0.1:3000/login`.

### Related issues?

Some research reveals that there may actually be a problem with Nuxt Bridge and compatibility with NuxtJS/Auth package, though the users have different problems.

Links: https://github.com/nuxt-community/auth-module/issues/1519#issuecomment-1112153311

### Other errors

There are occasions where the authentication error just happens at random, causing the infinite loop problem.

Also, occasionally I would get a write error:

In the browser:

```
{
  "statusCode": 500,
  "statusMessage": "H3Error",
  "stack": []
}
```

In the terminal we see the following:

```
ERROR  [h3] write EPIPE

at afterWriteDispatched (node:internal/stream_base_commons:164:15)
at writeGeneric (node:internal/stream_base_commons:155:3)
at Socket._writeGeneric (node:net:795:11)
at Socket.connect (node:net:777:12)
at Object.onceWrapper (node:events:509:28)
at Socket.emit (node:events:402:35)
at Socket.emit (node:domain:475:12)
at PipeConnectWrap.afterConnect [as oncomplete] (node:net:1147:10)

````

I had no idea what this was! However, I did find two github issues, one closed and one that was opened a couple weeks ago.

First issue (Closed): https://github.com/nuxt/framework/issues/4085

Second issue (Open): https://github.com/nuxt-community/tailwindcss-module/issues/471

## CSS loading problem

A separate issue is a problem loading the CSS correctly.

Upon any initial page load, the CSS styling does not get preloaded. So, the user will see a flash of unstyled HTML elements, images, etc, for just a moment before the styles are loaded and set.

I have tried importing the style sheet directly, but this did absolutely nothing.

This appears to be an ongoing issue. You can read more about it here: https://github.com/nuxt/bridge/issues/26

# Conclusion

Unfortunately, as it stands, upgrading to Nuxt Bridge is a total non-starter for the Epital project. Two things need to be fixed before we could consider releasing this into production:

1) Nuxt Auth needs to work out of the box, or a replacement needs to be recommended
2) CSS processing needs to be updated and fixed

For now, it seems like we are stuck using the current version of NuxtJS and Vue2. Although the Nuxt team seems to beleive that Nuxt Bridge is stable and should allow current users of NuxtJS / Vue2 to be able to upgrade, it obviously still has some issues. Hopefully they can be addressed soon.

Due to these issues, Epigno will continue to use NuxtJS, Vuex, and Vue2 for the foreseeable future.


[1]: <https://blog.epigno.jp/en/blog/challenges-with-switching-to-pinia/>
[2]: <https://blog.epigno.jp/en/blog/author/olivier/>
