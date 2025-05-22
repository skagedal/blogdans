---
layout: post
title: "Week 13, 2025: Links and things"
summary: "Another week of internet treasures and mini-musings on the meta-mechanics of our digital world!"
---

Let's do another links and things! [Last week](/posts/2025-03-23-week-12-links-and-things) was fun! Let's start with some Java stuff.

* I linked to a Gunnar Morling post last week as well. I would say he is one of the best Java bloggers out there. And this week he's doing my favorite kind of blog posts, a "let's take a look at..." post – about [Ahead-of-Time Class loading and Linking](https://www.morling.dev/blog/jep-483-aot-class-loading-linking/).  
* Since I've mentioned gatherers for two weeks in a row, here's another one: [more-gatherers](https://github.com/pivovarit/more-gatherers) is a collection of gatherers, written by some guy called Grzegorz Piwowarek. 

Moving on the frontend world.
* [Migrating the ecosystem to ES modules](https://e18e.dev/blog/migrating-the-ecosystem-to-esm.html) – the e18e people are doing the Lord's work in trying to clean up and modernize the Javascript ecosystem. Let's all just do ESM. 
* [Components are just sparkling hooks](https://www.bbss.dev/posts/sparkling-hooks/) – great title, great post.
* Kyle Gill is [done with Next.js](https://www.kylegill.com/essays/next-vs-tanstack/) and I feel him.  

Other software:
* [Don't make these feature flag mistakes](https://newsletter.posthog.com/p/dont-make-these-classic-feature-flag) wrote Ian Vanagas. As an advocate for feature flags, I find this a very important topic. Just the other week I shipped a bug which annoyed me very much. I had implemented the feature-flag very incorrectly.  
* Faster than lime is a great blogger, but not one I ussually read for infra inspo. I got some thoughts from [this one](https://fasterthanli.me/articles/impromptu-disaster-recovery) though.
* I have sort of an unhealthy interest in the software that is used to manage software that is used to build software. This week in toolchain managers, Apple is shipping a [rustup](https://rustup.rs/) kind of thing – [swiftly](https://www.swift.org/blog/introducing-swiftly_10/). It's a bit annoying that each programming language has to have its own toolchain manager (as well as its own package manager, build system, and so on), but at least it's a bit nice when there's an official one. 
  
  In the Node world, I read this week that Corepack – the experimental Node.js package-manager-manager which Yarn Modern expects you to use – will [not be included in future versions of Node](https://github.com/nodejs/TSC/pull/1697). In Python world, i came across [uv](https://github.com/astral-sh/uv) which seems to be a reasonable tool. In the Java world, I came across [Mill](https://mill-build.org/mill/index.html) and immediately thought: "oh cool, we need something better than Maven and Gradle", but hmm, this is not what I want either. I want cargo for Java.      
* "[Triptych](https://alexanderpetros.com/triptych/) is three simple proposals that make HTML much more expressive in how it can make and handle network requests."
* "[Mean time to recover (MTTR) is lying to you](https://resilienceinsoftware.org/news/1157532)".
* [Kafka 4.0 was released](https://www.mail-archive.com/announce@apache.org/msg09933.html) and I for one am happy about having one less thing to deal with (they have removed the dependency on the Zookeeper thing which I don't know what it is.)

Other things:
* The Asterisk magazine came out with another issue – the [Weird](https://asteriskmag.com/issues/09) issue. 
* The Wikipedia on [Existential risk from artificial intelligemce](https://en.wikipedia.org/wiki/Existential_risk_from_artificial_intelligence).
* Sometimes I think about wanting to self-host a good authentication system for various seems, [Authelia](https://www.authelia.com/) seems like a good option.
