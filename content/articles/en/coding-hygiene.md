---
title: Coding Hygiene
description: Coding practices to get high-quality software released fast
img: /img/hygiene.jpg
alt: "Coding hygiene, photo by Jernej Furman (https://www.flickr.com/photos/91261194@N06/49820964568)"
author:
  name: Malik Olivier Boussejra
  slug: olivier
  bio: CTO at Epigno
  img: /img/authors/pic-malik-olivier-boussejra.png
tags:
  - trivia
---

In this document, we provide a list of "good" practices to release reliable
applications fast.

Of course, there are exceptions to everything, but these practices should provide
a good base for working in a team that ships reliable software fast.

## Continuous delivery

If code is to be merged into the main trunk, consider it to be production-ready.
It will be released into a staging server for testing, then into production
within a day.

We don't make big releases: *[We make small releases often](https://en.wikipedia.org/wiki/Release_early,_release_often)*.

It's better to spend **everyday an hour** testing a small subset of released
fixes and features, than pushing hard 2 or 3 weeks testing and hot-fixing huge
features and many bugfixes every 3 months.

## Readability first

When editing mature software, you spend 80% of your time reading code, rather
than writing it.

Readability matters.

## Keep It Simple, Stupid

Known as *[KISS](https://en.wikipedia.org/wiki/KISS_principle)*.

- Is the implementation the simplest implementation that can solve the given problem?
- Can even a stupid person understand it?

As you write code, always think about those two questions.
It is easy to fall down a rabbit hole of over-complicated design.

Always *come back* and simplify.

You are not paid by the line. On the contrary, reducing line count in a module
without loss in functionality is the prerogative of a great programmer.

The only code that has no bug is code that is not written.
So the less code, the less bugs.

## Put related code close to each other

When reading code, nothing is worse than having to jump to a completely
different file in a completely different directory to understand a code snippet.

Put related code close to each other. Ideally, code should be structured so that
a single logical unit can easily hold within the height of a single screen (say,
at most 20 lines).

## Not too much duplications

You never want to fix the same bug in 10 different places.

Code duplicated twice can be left duplicated (provided the snippet is not too
long).
More than that, and you should refactor.
This concept is usually called the *[rule of three](https://en.wikipedia.org/wiki/Rule_of_three_(computer_programming))*.


## Be stateless

State is the source of most of your application's bugs.

Keep the state contained to the bare minimum that satisfies the spec.
Always avoid using state (especially mutable state) when it can be avoided.

Always enforce *[single source of truth](https://en.wikipedia.org/wiki/Single_source_of_truth)*. You never want to edit the same value at several places,
lest you or your co-worker forget one place and cause nasty bugs.


## No commented out code

Commented out code is debt.

Never push commented out code into production.

No one will understand why this code exists and why it is commented out.

And you too will forget why it is commented out within a few months, anyway.

## Code styling

Use the linter and code formatter set up for your project. Don't complain.

Enforced team conventions and consistency always trump personal preferences.
You will get used to the formatter's rules anyway.

## Naming conventions

Follow naming conventions. This includes case (`camelCase`, `PascalCase`,
`snake_case`, `kebab-case`, `ALL_CAPS`), but also usage of singular/plural form
of names, and verb usage.

Focus on readability and context.
For example, if you write a function that mutates some state, always use a
descriptive action verb.

In doubt, look at the code surrounding the place your editing and follow the
same convention.

## Comments

> - Good comments are good.
> - Bad comments are bad.

> - Comments should be clear, useful and on point.
> - Comments should be next to the code they are commenting.
> - Comments should be **correct**.
> - Comments **must** be maintained.

No comment is better than bad or misleading comments.

*[Self-documenting code](https://en.wikipedia.org/wiki/Self-documenting_code)* is good.

### Story-telling comments

If splitting by sub-function is not as simple, splitting code into logical units
separated by explanatory comments is a good idiom for readability.

```js
// Retrieve foo via the X API to achieve better performance because of Y
const x = ...
/* more lines */
const foo = f(x)

// Do Z with foo
const bar = g(foo)
/* more lines */
```

## Code transparency and back-up

While drafting code, do whatever you want that is productive to you.
However, keep your work-in-progress (WIP) code in check with a merge request (MR).

Thus your WIP will always be backed up in version control (back-up), and
everyone in the team can jump in and help if you have an issue with your MR
(transparency).

## Divide and conquer

Split big tasks into individual (divide) into testable and achievable smaller
tasks (conquer).

Make many small merge requests to accomplish a big task.

Incremental improvements build up over time. Rome was not made in one day.

## Commit history and version control

We use `git` as version control.

Consider a merge request that you submit as a collection of patches, where each
patch is a commit. As such, commit history should be linear.

While drastic, we do this to prevent regressions and make the review process more efficient (more efficient → easier to find bugs → better quality).

The *[Linux Kernel patch submission process](https://www.kernel.org/doc/html/v4.12/process/submitting-patches.html#describe-your-changes)* is very appropriate.
It is so good that I am going to cite the parts I deem most important below.

<style>
blockquote p {
  display: block;
}
</style>

> ### Describe your changes
>
> Describe your problem. Whether your patch is a one-line bug fix or 5000 lines of a new feature, there must be an underlying problem that motivated you to do this work.
>
> Describe user-visible impact. Straight up crashes [...] are pretty convincing, but not all bugs are that blatant.

> ### Separate your changes
>
> Separate each **logical change** into a separate patch.
>
> For example, if your changes include both bug fixes and performance enhancements for a single \[component\], separate those changes into two or more patches. If your changes include an API update, and a new \[component\] which uses that new API, separate those into two patches.
>
> On the other hand, if you make a single change to numerous files, group those
> changes into a single patch. Thus a single logical change is contained within a
> single patch.
>
> The point to remember is that each patch should make an easily understood change that can be verified by reviewers. Each patch should be justifiable on its own merits.
>
> When dividing your change into a series of patches, take special care to ensure that the \[application\] builds and runs properly after each patch in the series. Developers using `git bisect` to track down a problem can end up splitting your patch series at any point; they will not thank you if you introduce bugs in the middle.

For good measure, rebase your patch set on top the latest commit in the main
trunk before testing it.

## Commit messages

For bigger projects, commit message can be structured as follows:

```
[$component] $subComponent: $Title

This commit fixes the issue X, by using the method Y.
Y is preferable over Z because *foo*.
```

If no component or sub-component exists for the given changeset, feel free to
leave out "`[$component]`" or "`$subComponent:`" from the title.

If in doubt look at the commit history and be consistent with existing, similar
commits.

## Code reviews

To ensure code quality, we do reviews before merging a code contribution.
It's better to be a few days late than sorry because we merged broken code.

When asking for reviews, ensure that all the coding hygiene points discussed
above are dealt with. If not, explain why.

Ideally, a reviewer should not have to waste time pointing at obvious issues.

When everything is checked, use the "Needs review" label and appoint an
available reviewer.
The reviewer shall review within a day, so that the submitted does not lose
momentum.

The review shall point issues that should be dealt with, then remove the "Needs
review" label. Through discussion, they will work together possible enhancements
with the submitter about possible enhancements. Rinse and repeat until the merge
request is as good as it can get.
