---
layout: post
title:  "DI, Spring, Micronaut and GraalVM"
---

The wiring up of different components in my `next` program (now called `simons-assistant`) was getting annoying, so I wanted to try a Dependency Injection framework. No, it was far from necessary, but I also wanted to play more with such tools. 

I went with Spring, as it is something I wanted to explore. Spring is mostly known (often with the "Boot" qualifier) as a web framework, but the core framework of it that handles such things as Dependency Injection can be used for any Java codebase. 

Adding that and converting some code into autowiring was easy and fun. There's a bit of a trial and error process in putting the annotations in the right places, with unfortunately a lot of such errors discovered at run time rather than compile time; I'll get to that later. But I then discovered that my program had become slow to start up. It now takes 1.6 seconds to run `simons-assistant --help`. This I don't find acceptable for a command line program, which should be "instant" to invoke, especially one whose purpose is to be run many times a day, such as my little assistant tool. 

So, I decided to test out Micronaut (which I did play with as a web programming framework a while back) some more. Just as Spring, it can be used as a stand-alone framework for Dependency Injection (and other, related concepts such as Aspect-Oriented Programming), but it works in a different way. It does the wiring up at compile time, and works well together with GraalVM (compiling Java to native code), which speaks to me for two reasons: performance, and the possibility of finding these "wiring up" errors discussed before already at compile time. 

Micronaut is nice to use with its command line client that scaffolds projects. I installed it with:

```shell
brew install --cask micronaut-projects/tap/micronaut
```

Creating my app with:

```shell
mn create-cli-app --jdk=11 --build=gradle --inplace --lang=kotlin --test=junit another-micronaut-test
```

Sadlly, the "Hello World" style app that's created with this still takes far too much time to execute to be usable for command line apps. Around 1.1 second on my machine. So, I went further down the rabbit hole and installed GraalVM.

```shell
brew install --cask graalvm/tap/graalvm-ce-java11
# Brew told me this might be necessary, and it was:
xattr -r -d com.apple.quarantine /Library/Java/JavaVirtualMachines/graalvm-ce-java11-21.0.0
```

I generated a new Micronaut app, this time with GraalVM functionality:

```shell
mn create-cli-app --jdk=11 --build=gradle --inplace --lang=kotlin --test=junit another-micronaut-test --features=graalvm
```

And compiled:

```shell
JAVA_HOME=/Library/Java/JavaVirtualMachines/graalvm-ce-java11-21.0.0/Contents/Home/ ./gradlew nativeImage
```

The program now runs fast! (0.04 s.) At least on a second start up.

Bud, sadly (again), compiling this simple "Hello, World" program takes a whopping 2 minutes 30 seconds. I am guessing this is because it also compiles all the dependencies, and was hoping that subsequent runs would be faster. They were, but only because the weren't doing anything. If I change something in the program, and ran `./gradlew nativeImage` again, the changes are not picked up. I had to do `./gradlew clean nativeImage`, which takes all that time to run again. 

I might play some more with all of this and see what I can find. Preliminary lessons learned however is that Java might not be the best environment to write neat command line apps with. 

