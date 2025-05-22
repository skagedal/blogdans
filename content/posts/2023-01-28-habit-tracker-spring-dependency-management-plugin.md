---
layout: post
title:  "Writing a habit tracker, part 28: More on Spring dependency management"
---
Here's an update on the Spring Dependency Management plugin that we talked about in the [previous post](/posts/2023-01-27-habit-tracker-updating-dependencies).

I linked my blog post in the [Gradle Community Slack](https://discuss.gradle.org/t/introducing-gradle-community-slack/26731) and [asked](https://linen.dev/s/gradle-community/t/8566143/i-guess-this-channel-fits-for-this-i-m-writing-a-little-blog) for comments. It turns out that this plugin really is not needed at all. Quoting Björn Kautler who goes by the name of Vampire:

> It does nothing for you. It is just a relict from times where Gradle did not have built-in BOM support. You shouldn't use it, but the built-in support using platform(...). Even its maintainer says that.

Every successful online community needs at least one person who is this just incredibly helpful person, who knows the topic inside and out and is there to explain it. In the Gradle Community Slack, that seems to be this guy. Kudos to him. 

So anyway, through the [linked thread](https://linen.dev/s/gradle-community/t/2579116/what-is-the-proper-way-to-apply-a-bom-in-a-library-project-i) I found out that the right BOM coordinates to import is exported by the Spring Boot plugin. So I remove the Spring `dependency-management` plugin and add this row to my regular Gradle dependencies:

```groovy
    implementation(platform(org.springframework.boot.gradle.plugin.SpringBootPlugin.BOM_COORDINATES))
```

[Nice](https://github.com/skagedal/hahabit/commit/981ae21819df8483011ff6c9dc4abe11cdf0514b). Hmm, or actually, [let's import](https://github.com/skagedal/hahabit/commit/5344cd68c1a84871f03eeeeba53ea40b2dcd21e5) that `SpringBootPlugin` class at the top of the file so the dependencies section becomes a bit more readable. 

```groovy
    implementation(platform(SpringBootPlugin.BOM_COORDINATES))
```

I could have also just added the coordinates directly:

```groovy
    implementation(platform("org.springframework.boot:spring-boot-dependencies:3.0.2"))
```

However, since I am already using the Spring Boot plugin, I prefer to let it control this, and also only have to specify the Spring Boot version once. 

Do I need the Spring Boot plugin? 

My general take is that I'm quite happy with adding all kinds of third party dependencies as long as they provide value to me. However, if some task could instead just as well be handled by some already existing, more core piece of the stack, I prefer to use that, to reduce complexity. Hence, I feel good about removing that Spring dependency management plugin. 

The Spring Boot plugin provides the `bootJar` task [that I use](/posts/2023-01-21-habit-tracker-building-a-jar) to build the fat JAR file of my application. I could have not built a fatjar and just let Gradle build a regular [application](https://docs.gradle.org/current/userguide/application_plugin.html). However, it is quite convenient with the fatjar, given the way I [currently deploy](/posts/2023-01-22-habit-tracker-deploying-the-jar) it. There are [other](https://github.com/johnrengelman/shadow) fatjar solutions, but if I'm doing that, I might just stay with Spring-blessed solution. 

So Spring Boot plugin stays. It also provides some other things I think I'll want in the future, such as [integration with Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/gradle-plugin/reference/htmlsingle/#integrating-with-actuator) which gives you run-time information through an HTTP endpoint. I'll want that. 

I also noticed that the [Spring Boot Gradle Plugin Reference Guide](https://docs.spring.io/spring-boot/docs/current/gradle-plugin/reference/htmlsingle/) covers all of this stuff regarding whether to use the Dependency Management plugin or not. Of course it does.

_[Continue reading part twenty-nine.](/posts/2023-01-29-habit-tracker-so-far)_
