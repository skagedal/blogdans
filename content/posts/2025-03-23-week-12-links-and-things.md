---
layout: post
title: "Week 12, 2025: Links and things"
summary: "In which Java 24 gets released."
---

Continuing the trend from [last week](/posts/2025-03-16-week-11-links-and-things), here are some links and things that I've found interesting this week.

* [Why is Git Autocorrect too fast for Formula One drivers?](https://blog.gitbutler.com/why-is-git-autocorrect-too-fast-for-formula-one-drivers/) – fun story about a sequence of unfortunate design decisions that led to the unintended behavior of Git pausing for 0.1 seconds before executing a mistyped command. A patch has now landed in git 2.49 – see Github's [Highlights from Git 2.49](https://github.blog/open-source/git/highlights-from-git-2-49/) post, where I read about all this – making the behavior a bit more in line with expectations.
* [Why I'm no longer talking to architects about microserves](https://blog.container-solutions.com/why-im-no-longer-talking-to-architects-about-microservices) – nice post from Ian Miell, I agree completely that the conceptual confusion is one of the big problems in this area.  I really want to watch Ian Cooper's talk [Microservices, where did it all go wrong?](https://www.youtube.com/watch?v=j2AQ9eTZ3-0) linked in the post, since I'm a big fan of his similarly named talk [TDD, where did it all go wrong?](https://www.youtube.com/watch?v=EZ05e7EMOLM).
* Nadia Makarevich writes very interesting stuff about web page performance: [SSR deep dive for React developers](https://www.developerway.com/posts/ssr-deep-dive-for-react-developers).
* [Java 24 has been released](https://blogs.oracle.com/java/post/the-arrival-of-java-24)! I, for one, am hankerin' for some gatherin'! (You know, the new "Gatherers" API I linked to a post about last week.)
* Gunnar Morling writes about [The synchrony budget](https://www.morling.dev/blog/the-synchrony-budget/): "as much as possible, a service should minimize the number of synchronous requests which it makes to other services."
* I should take a closer look at [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview).
* Also, [tRPC version 11](https://trpc.io/blog/announcing-trpc-v11) was released. We use this thing at work.
