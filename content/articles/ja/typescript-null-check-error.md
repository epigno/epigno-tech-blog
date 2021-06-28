---
title: 情報工学の用語に軍由来のものが多いという話
description: コンピューターサイエンスには面白い語源ももった用語があります．当記事では，それらのうちいくつかを紹介します．
img: https://images.unsplash.com/photo-1580752300992-559f8e0734e0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80
alt: Random image
author:
  name: Malik Olivier Boussejra
  slug: olivier
  bio: CTO at Epigno
  img: /img/authors/pic-malik-olivier-boussejra.png
tags:
  - javascript
  - nuxtjs
  - web_development
---

```ts
interface Nurse {
  affiliationHistory: Array<Affiliation>,
}
interface Affiliation {
  id: number,
  /** YYYY-MM-DD */
  transferAtRaw: string | null,
  byoto: {
    id: number,
  },
}

/**
 * Helper functions for instances of user object, as received from the backend.
 */

/**
 * Get the specified nurse's affiliation at the specified date
 * @param {Nurse} nurse
 * @param {string} date - YYYY-MM-DD
 *
 * @example affiliationAt(nurse, '2020-01-01')
 */
export function affiliationAt(nurse: Nurse, date: string): Affiliation | null {
  const len = nurse.affiliationHistory.length
  for (let i = len - 1; i >= 0; i--) {
    const affiliation = nurse.affiliationHistory[i]
    if ((affiliation.transferAtRaw || '0000-00-00') <= date) {
      return affiliation
    }
  }

  return null
}

/**
 * Get the specified nurse's first affiliation in this byoto after the
 * specified date
 * @param {Nurse} nurse
 * @param {Object} params
 * @param {string} params.date - YYYY-MM-DD
 * @param {number} params.byotoId
 * @return {Object|null}
 *
 * @example firstAffiliationIn(nurse, { date: '2020-01-01', byotoId: 1 })
 */
export function firstAffiliationIn(nurse: Nurse, { date, byotoId }: { date: string, byotoId: number }) {
  const currentAffiliation = affiliationAt(nurse, date)
  let affiliation = currentAffiliation
  while (affiliation && affiliation.byoto.id !== byotoId) {
    const index = nurse.affiliationHistory.findIndex(
      a => a.id === affiliation!.id
    )
    affiliation = nurse.affiliationHistory[index + 1] || null
  }
  return affiliation
}
```
