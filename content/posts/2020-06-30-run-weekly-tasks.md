---
layout: post
title:  "Next on next and a small argument regarding upgrading."
---

Yesterday I told you about [next](/posts/2020-06-29-next-the-digital-assistant), the digital assistant. Today's [task](https://github.com/skagedal/next/issues/4) will be to make it run a specific task on a specific interval. 

I'm writing really stupid and straightforward code. I intend to refactor it heavily as I discover what I'm actually building. You should, for example, probably be able to configure what things you want to run and when, but I'm not quite sure yet how. So I'm hardcoding stuff.

The specific thing I'm hardcoding it to do is to run `brew upgrade` on a weekly basis. [Homebrew](https://brew.sh/), of course, is the package manager for macOS. You run `brew upgrade` to upgrade your packages.

I know some people whose eyebrows would be raised while reading the previous paragraph. Do you really want to run `brew upgrade` when you don't need to? Every week?? But it may break things! If it ain't broke, don't fix it. 

I disagree with this viewpoint, for the following reasons:

1. I like upgrading stuff, it's fun. Sometimes you get new features, sometimes bugs and security holes are fixed.
2. Sometimes new bugs, or incompatibilities with the way you work, are introduced. That is true. But such issues are going to have to be dealt with sooner or later, by someone. It might as well be me. Because of reason #1, it's better than it happens to me than to someone who do not even have that affinity for upgrading stuff in the first place. 

Specifically, if a new version of tool we use at work introduces some incompatibility with stuff that we do, it's better that this is discovered (and corrected for) by someone who has been on the team for a while, than by someone who is just setting up their system. 

It's also better to discover such issues one by one than all at once (which would inevitably happen for example when changing work computer).

Anyway, where was I. Next now runs brew upgrade when more than seven days have passed since the last time. I introduced a very tiny persistance model: touching the time stamp of a file to keep track  of when it last was run.

I am not liking the name "next". It's clumsy in sentences.

