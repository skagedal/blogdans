---
layout: post
title:  "Writing a habit tracker, part 27: Updating dependencies"
---

Welcome to the twenty-seventh part of the "Writing a Habit Tracker" series, which started [here](/posts/2023-01-01-writing-a-habit-tracker).

I got a first external contribution to `hahabit`! A nice little [pull request](https://github.com/skagedal/hahabit/pull/1) from a friendly Github account called Dependabot, updating the version of Spring Boot from 3.0.1 to 3.0.2. Thank you, little friend! 

I love updating dependencies – who knows, maybe one of the little bugs and annoyances mentioned before have been fixed?

There are currently two workaround things in `build.gradle`. One has been there [since](https://github.com/skagedal/hahabit/commit/c968ce4d2c5e839444a9b77a8435a963e01eceab) the following that [Spring Security tutorial](https://spring.io/guides/gs/securing-web/):

```
    //  Temporary explicit version to fix Thymeleaf bug
    implementation 'org.thymeleaf.extras:thymeleaf-extras-springsecurity6:3.1.1.RELEASE'
```

I think I noted before that I got some issues when this was not included. But I don't remember what it was, and don't seem to get any issues now when removing. So. Maybe fixed? Or maybe I no longer have the relevant code. I'll remove it. I filed a [small issue](https://github.com/spring-guides/gs-securing-web/issues/72) against that tutorial to include a reference.

 Another thing was mentioned in [part twenty-one](/posts/2023-01-21-habit-tracker-building-a-jar), I had to explicitly add a dependency on some findbugs annotations:

```
    // Because of https://github.com/spring-projects/spring-framework/issues/25095
    compileOnly 'com.google.code.findbugs:jsr305:3.0.2'
``` 

Can I get rid of that now? No, I can't. I then get a warning, which I treat as an error. I should try to find, or file, the more appropriate bug for this, as the one I'm linking above is closed. Oh well.  

**Dependabot is a nice tool.** If you're curious, by the way, I enabled it [like this](https://github.com/skagedal/hahabit/commit/9d4e6c470d202657fafb7212f7fe1b3d3d4f98d9), giving me weekly pull requests. Another nice tool for projects building with Gradle is the **[Gradle Versions Plugin](https://github.com/ben-manes/gradle-versions-plugin)** from Ben Manes, which I also added, like this:

```groovy
plugins {
    // ...
    id "com.github.ben-manes.versions" version '0.44.0' 
}
```

While Dependabot gives automatic pull requests, this can be used for manually checking whether there are any potential updates. If I run it now, I get the following report:

```
------------------------------------------------------------
: Project Dependency Updates (report to plain text file)
------------------------------------------------------------

The following dependencies are using the latest milestone version:
 - com.github.ben-manes.versions:com.github.ben-manes.versions.gradle.plugin:0.44.0
 - io.spring.dependency-management:io.spring.dependency-management.gradle.plugin:1.1.0
 - org.postgresql:postgresql:42.5.1
 - org.springframework.boot:org.springframework.boot.gradle.plugin:3.0.2
 - org.springframework.boot:spring-boot-starter-data-jdbc:3.0.2
 - org.springframework.boot:spring-boot-starter-security:3.0.2
 - org.springframework.boot:spring-boot-starter-test:3.0.2
 - org.springframework.boot:spring-boot-starter-thymeleaf:3.0.2
 - org.springframework.boot:spring-boot-starter-web:3.0.2
 - org.springframework.security:spring-security-test:6.0.1
 - org.springframework.session:spring-session-jdbc:3.0.0
 - org.testcontainers:junit-jupiter:1.17.6
 - org.testcontainers:postgresql:1.17.6

The following dependencies have later milestone versions:
 - org.flywaydb:flyway-core [9.5.1 -> 9.12.0]
     https://flywaydb.org

Gradle release-candidate updates:
 - Gradle: [7.6 -> 8.0-rc-2]
 ```

Upgrading Gradle [sounds like fun](https://docs.gradle.org/8.0-rc-2/release-notes.html)! I wouldn't use a "release candidate" version in a real production app, but here, why not. I'm doing this: 

```shell
$ ./gradlew wrapper --gradle-version 8.0-rc-2
```

I'm not going to update Flyway though, because that version is set by the Spring dependency management plugin, I think...? Maybe? I do not specify the version myself explicitly in my `build.gradle` in any case, and I'm happy with running the version that has been tested to work well together with the rest of the Spring suite. 

Yeah, what is that **Spring dependency management** plugin anyway? Why aren't we happy with just the dependency mananagement we get from Gradle? That is, after all, its job. 

The Spring dependency management plugin was added to the `plugins` section of our `build.gradle` file when we first generated it with Spring Initializr. According to the [README](https://github.com/spring-gradle-plugins/dependency-management-plugin), it is

> A Gradle plugin that provides Maven-like dependency management and exclusions. The plugin provides a DSL to configure dependency management directly and by importing existing Maven boms.

Skimming through [the manual](https://docs.spring.io/dependency-management-plugin/docs/current/reference/html/), it is still a bit unclear to me why Maven-like semantics is preferred, or, when it is preferred. One example that is explicitly mentioned is under "Maven exclusions":

> While Gradle can consume dependencies described with a Maven pom file, Gradle does not honour Maven’s semantics when it is using the pom to build the dependency graph. A notable difference that results from this is in how exclusions are handled.

I also remember something about how Gradle resolves a conflict between two version by choosing the latest version, while Maven will take the one that's most near the top in the dependency graph. Maybe that's what this plugin also implements. (Kinda weird behavior, the Maven one, if you ask me. And both seem kinda lame compared to what similar tools in other ecosystems do. I'll write about it some other time.)

Ok. But how is this dependency management plugin used in my build? The only place where it is explicitly invoked is in its own `dependencyManagement` section, which in my `build.gradle` is like this:

```
dependencyManagement {
    imports {
        mavenBom "org.testcontainers:testcontainers-bom:${testcontainersVersion}"
    }
}
```

So, only used for the testcontainers BOM ("bill of materials"), apparently. What difference would it make if we remove this and instead use the built-in Gradle solution?

I'm curious, so I remove the above section and add the following in the `dependencies` section:

```groovy
    testImplementation(platform("org.testcontainers:testcontainers-bom:${testcontainersVersion}"))
```

That should make it honour the BOM for resolving the versions of the testcontainers dependencies. How do we find out if we inadvertently changed anything now? I'm doing this to look at the current dependency resolution and save it to a file:

```shell
$ ./gradlew dependencies > ~/with-gradle-platform.txt
```

Then I run `git stash` to switch back to the original code. Then I run it again:

```shell
$ ./gradlew dependencies > ~/with-spring-dependency-management.txt
```

Then I check the diff between the two files using `diff -u`, and see that there are some differences in the output that look like this:

```
-\--- org.testcontainers:postgresql -> 1.17.6
-     \--- org.testcontainers:jdbc:1.17.6
-          \--- org.testcontainers:database-commons:1.17.6
-               \--- org.testcontainers:testcontainers:1.17.6 (*)
++--- org.testcontainers:postgresql -> 1.17.6
+|    \--- org.testcontainers:jdbc:1.17.6
+|         \--- org.testcontainers:database-commons:1.17.6
+|              \--- org.testcontainers:testcontainers:1.17.6 (*)
+\--- org.testcontainers:testcontainers-bom:1.17.6
+     +--- org.testcontainers:junit-jupiter:1.17.6 (c)
+     +--- org.testcontainers:postgresql:1.17.6 (c)
+     +--- org.testcontainers:testcontainers:1.17.6 (c)
+     +--- org.testcontainers:jdbc:1.17.6 (c)
+     \--- org.testcontainers:database-commons:1.17.6 (c)
```

I don't think it actually means a difference in the build output though; those `(c)` markings means that it's just a dependency constraint that Gradle knows about. To be even more confident, I ran a `./gradlew bootJar` with both configurations, and saw that they in both cases built a jar of the exact same size. 

So... if it were up to me – and it is – I'd rather use the Gradle native mechanism for this. So I will. Until someone explains why I shouldn't. 

Can I even remove the Spring dependency management plugin altogether? No, I can't[^1]. Then it no longer knows what version of the various Spring Boot starter libs it should import.  So apparently it's also doing some implicit things, aside from the `dependencyManagement` section.

I'll leave it at that. Enough of unsorted dependency management ramblings for today.  

_[Continue reading part twenty-eight.](/posts/2023-01-28-habit-tracker-spring-dependency-management-plugin)_

### Notes

[^1]: Yes, I can! Read the [next part](/posts/2023-01-28-habit-tracker-spring-dependency-management-plugin) for a continued investigation.