---
layout: post
title: "Week 11, 2025: Links and things"
summary: "Did you know that the Typescript compiler is getting a slow rewrite in Go?"
---

Various links and things that I've found interesting this week.

- Julia Evans wrote a great post on [escape codes](https://jvns.ca/blog/2025/03/07/escape-code-standards/) and the standards, or lack of standards, or lack of well-working standards in the area, especially regarding the terminfo database. I've been feeling this problem lately as I moved to ghostty as my terminal emulator of choice, and haven't yet set it up properly on my remote hosts. ([This is how you do that](https://ghostty.org/docs/help/terminfo). I just haven't.) The [rant](https://twoot.site/@bean/113056942625234032) Julia links to is on point, but stops short on suggesting how we should do this instead.   
- [Rust 2024 edition](https://doc.rust-lang.org/nightly/edition-guide/rust-2024/index.html) was released as stable with version [1.85.0](https://releases.rs/docs/1.85.0/). I should update my little Rust programs. 
- The Typescript compiler is [getting rewritten in Go](https://devblogs.microsoft.com/typescript/typescript-native-port/) to make it faster. Very cool. I was a bit surprised at the choice of Go. A lot of frontend tooling have turned to Rust for this kind of task lately, and this is also a language that Microsoft has been investing in. But [this explanation](https://github.com/microsoft/typescript-go/discussions/411) makes a lot of sense. 
- I came over [this post](https://newsletter.scalablethread.com/p/what-is-saga-pattern-in-distributed) on the Saga pattern and was thinking (again) that you’re really kind of screwed if you've put yourself in a position where this complexity is needed. In reality, many microservice systems seem to ignore the data consistency issue altogether.
- Alex Kladov wrote a post called [MacOS for KDE users](https://matklad.github.io/2025/02/23/macos-for-kde-users.html) on his matklad blog. I'm not sure what KDE has to do with anything, I'm a GNOME person myself (or well, I was when I was a desktop Linux user), but I use many of the same things myself to manage my system, like Brewfiles and hammerspoon. Also got a few new tips.   
- Apparently there is an experimental [spring-grpc](https://github.com/spring-projects-experimental/spring-grpc/blob/main/README.md) project, might be relevant for work.
- [Nice tutorial](https://dev.java/learn/api/streams/gatherers/) on the new Gatherers API for Java Streams. I should read it more carefully. Mostly I want to use it to refactor some of my old Advent of Code solutions. In other words, important programming.
- I like Kent C. Dodds approach to [defining principles](https://www.epicweb.dev/the-power-of-principles-in-web-development-decision-making) for your work as a software engineer.  It reminds me of Spencer Greenberg's [Valuism](https://www.spencergreenberg.com/2023/02/doing-what-you-value-as-a-way-of-life-an-introduction-to-valuism/) concept.
- [State of the Configuration Cache](https://blog.gradle.org/road-to-configuration-cache) in Gradle. Interesting read.  
- I listened to [this podcast episode on Clearer Thinking](https://podcast.clearerthinking.org/episode/223/anders-sandberg-physical-limits-and-the-long-term-future/), named "Physical limits and the long-term future", with the ever interesting Anders Sandberg. It was fun. I am not very good at physics, but I recently ordered a bunch of books that I hope to read.
- Speaking of Swedes that think about the long-term future (there are a few of them), the [ongoing conversation](https://haggstrom.blogspot.com/2025/03/om-ai-och-fabeln-med-hastarna-svar-till.html) between Olle Häggström and the economist Andreas Bergh is interesting.  
