---
title: Military terms in computer science
description: Word etymology in computer science can be interesting. Here we will discuss about words based on military terms.
img: https://images.unsplash.com/photo-1580752300992-559f8e0734e0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80
alt: Random image
author:
  name: Malik Olivier Boussejra
  bio: CTO at Epigno
  img: https://images.unsplash.com/photo-1533636721434-0e2d61030955?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2550&q=80
createdAt: 2016-11-18
tags:
  - trivia
---

Word etymology in computer science can be interesting.
Most are knowledgeable about the origin of the word "bug" for example (An
insect was found roasted to death inside a mainframe, causing short-circuits,
that's what Grace Hopper called the first computer "bug"). Though the word
has been is used at least since Thomas Edison's time.
And when you must find the bug, you "debug", with a "debugger". Funny, right?

<!-- {% include figure.html
    url='/images/military/bug-grace-hopper.jpg'
    caption='First actual case of bug being found.'
%} -->
![First actual case of bug being found.](/img/military/bug-grace-hopper.jpg)

You may know that as most technological breakthroughs of the 20th century, computing
was first started by the military, as an answer to the necessary war effort.
And here we are, computing still has several words whose use was limited to
warfare or military strategies before their advent in computing.


## Staging

The staging area originally means the area where military personnel is
stationing before going to mission.
There dictionary says:

*"Stage: To move (as military personnel, supplies, or equipment) to or establish in a new base in preparation for a further movement or a planned operation."* —Webster's Third New International Dictionary

In computer science, it is used in several contexts. The mainly known use for
contemporary programmer is probably the staging environment.
Before an application is deployed into production, most businesses (hopefully)
will thoroughly check/test the program in a staging environment before sending
it to production use.
Before sending anything into production, it should be *battle*-tested.

Staging area is a term used in the hugely popular VCS [Git](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics).

<!-- {% include figure.html
    url='/images/military/git.png'
    caption='Staging area in git is the step where changes are before they are committed.'
%} -->
![Staging area in git is the step where changes are before they are committed.](/img/military/git.png)

Git staging area can be quite confusing for beginners, but it is a powerful
feature that allows you to selectively add changes from the working directory
to the repository, using for example the `git add --patch` feature.

## Deploy

As we just hinted at above, *deployment* is also a military term, designating
the strategic spreading of troops on the battle stage.

Are we using military term too lightly? Probably not, when your business heavily
relies on a web application, the right deployment of your application is critical
to the success of your venture.

## Cache

Cache is a very funny word, which has been used since the very beginning of modern
computing. Myself included, I suppose no few people have been using the word
without even thinking about where it comes from.

The first definition that pops ups on *Dictionary.com* is *a hiding place,
especially one in the ground, for ammunition, food, treasures, etc.*.
In computing, a cache is any kind of temporary storage space that allows fast
access to data. For example, if you've seen this page before, some of its
content has probably been cached by your browser so that it does not need to
reload a data from the web. Indeed, accessing a PC's internal storage is much
faster than getting contents with an HTTP request.

## Foobar

*Foo* and *bar* are the widely used placeholder words used in code snippets and
examples. When math-savvy people would use, *x* and *y*, computer geeks will
use *foo* and *bar*, like in the following example:

```c
/* C code */

#include <stdio.h>

int main(int argc, char* argv[])
{
   char foo[6] = "Hello";
   char bar[7] = "World!";
   printf("%s %s\n", foo, bar);

   return 0;
}
```

The etymology of *foobar* is obscure, yet it seems (at least according to
wikipedia) that the *FUBAR* acronym was a slang used during World War II (Fu\*\*ed
Up Beyond All Recognition/Any Repair/All Reason). *Foo* is said to have been in
used since circa 1900, and it is thus speculated that *bar* was added under the
influence of WWII *FUBAR*.
Whatever, if you need a third placeholder, *baz* should do the trick :).

By the way, did you know that Japanese programmers usually uses *hoge* or
*hogehoge* as a placeholder name?

## DMZ

A DMZ (De-Militarized Zone), apart from specifying a zone where no military action
should be undergone (e.g. at the border of two countries at war), is a computing
jargon which is used, as far as I know, in networking.

In networking, the DMZ refers to the subnetwork that responds to request from
the outside (public) but that also has access to private components. We could
say it is the *middleman*.

The most simple use case of a DMZ may be with a web application server fetching
user data from a database. The web app server itself is in the DMZ and
accessible by the public while the private database server containing sensitive
data is not publicly accessible.

## Ping

```sh
malik@my-pc:~/workspace/malikolivier.github.io$ ping -c 5 boussejra.com
PING boussejra.com (192.30.252.153) 56(84) bytes of data.
64 bytes from pages.github.com (192.30.252.153): icmp_seq=1 ttl=50 time=305 ms
64 bytes from pages.github.com (192.30.252.153): icmp_seq=2 ttl=50 time=286 ms
64 bytes from pages.github.com (192.30.252.153): icmp_seq=3 ttl=50 time=232 ms
64 bytes from pages.github.com (192.30.252.153): icmp_seq=4 ttl=50 time=290 ms
64 bytes from pages.github.com (192.30.252.153): icmp_seq=5 ttl=50 time=240 ms

--- boussejra.com ping statistics ---
5 packets transmitted, 5 received, 0% packet loss, time 4004ms
rtt min/avg/max/mdev = 232.139/270.924/305.335/28.924 ms
```
Phew, my blog may be online! Gamers might know ping because the use it to get a hint
at the latency of the connection between their PC and the server. The `ping`
command is mainly used as a diagnostic tool to check that a host is there in the
network.

Ping turned back later to be a vulnerability (the [Ping of Death](https://en.wikipedia.org/wiki/Ping_of_death)), though any
modern system is unaffected by such an attack.

Stating that ping is a jargon with military background may be a bit far-fetched,
but let us not forget that the name of the `ping` command comes from the sound
made by a sonar (**PING!**). And who else but the military uses a sonar?
(Probably a lot of persons, but [whatever](http://allthetropes.wikia.com/wiki/Did_Not_Do_the_Research).)
