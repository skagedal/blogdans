---
layout: post
title:  "Writing a habit tracker, part 21: Building a JAR"
---
You know what? We have a habit tracker now! As of the [previous post](/posts/2023-01-20-habit-tracker-storing-the-achievement), I can definitely track some habits! But only with the server running on my own machine. That's not how I want it. I want it accessible from [FidoNet](https://en.wikipedia.org/wiki/FidoNet). Or, allright, the Internet. 

So, we're going to deploy things to the Ubuntu machine we installed some software on [in part one](/posts/2023-01-01-writing-a-habit-tracker), and the thing we're going to deploy is going to be a JAR file, as we discussed [in part two](/posts/2023-01-02-habit-tracker-part-two-spring-boot). It's going to be not just a simple JAR file, but a _fat_ JAR file – one that includes all the dependencies, like all of the Spring code. 

Spring Boot gives us some tools to do that, wrapped in its Gradle plugin (or Maven plugin, if that's what you're using). We can check it out like this:

```shell
$ ./gradlew tasks

> Task :tasks

------------------------------------------------------------
Tasks runnable from root project 'hahabit'
------------------------------------------------------------

Application tasks
-----------------
bootRun - Runs this project as a Spring Boot application.

Build tasks
-----------
assemble - Assembles the outputs of this project.
bootBuildImage - Builds an OCI image of the application using the output of the bootJar task
bootJar - Assembles an executable jar archive containing the main classes and their dependencies.
build - Assembles and tests this project.
buildDependents - Assembles and tests this project and all projects that depend on it.
buildNeeded - Assembles and tests this project and all projects it depends on.
classes - Assembles main classes.
clean - Deletes the build directory.
jar - Assembles a jar archive containing the main classes.
resolveMainClassName - Resolves the name of the application's main class.
testClasses - Assembles test classes.

<more output...>
```

The `bootJar` task looks like our friend. (Remember, we're not doing container deployment, if so the `bootBuildImage` would be the thing. An OCI image is mostly the same as a Docker image, as far as I understand.) So, let's run it:

```shell
$ ./gradlew clean bootJar

> Task :compileJava
warning: unknown enum constant When.MAYBE
  reason: class file for javax.annotation.meta.When not found
1 warning

BUILD SUCCESSFUL in 953ms
5 actionable tasks: 5 executed
$
```

I like "successful", but what's that warning? I hate warnings. I haven't used any `When.MAYBE`. I found this [Github issue](https://github.com/spring-projects/spring-framework/issues/25095), and apparently this is a bug happens when you have `@Nullable` annotations and you do not include a dependency to `com.google.code.findbugs:jsr305:3.0.2`. I only have one such annotation, and it's really just there as a piece of documentation, but I want to rather improve on my null-safety situation than going the other direction. So let's add that dependency in my `build.gradle` dependencies section:

```groovy
dependencies {
    // ...
    // Because of https://github.com/spring-projects/spring-framework/issues/25095
    compileOnly 'com.google.code.findbugs:jsr305:3.0.2'
    // ... 
}
```

Great, now the build output is clean. Also by the way, good idea, guy from Github issue – I should also enable `-Werror` for this project, that is, treating warnings as errors. Adding it like this, also with the `-Xlint:unchecked` flag:

```groovy
tasks.withType(JavaCompile).configureEach {
    options.compilerArgs << "-Xlint:unchecked" << "-Werror"
}
```

I confirmed that it works by briefly commenting out that `findbugs` dependency. 

Cool, so we can now build a jar with `./gradlew bootJar`. It gets placed in `build/libs/hahabit-0.0.1-SNAPSHOT.jar`. A nice little 27 MB JAR. Would neatly fit on the hard disk of the first machine with such a unit I ever owned, which if I remember correctly was 30 MB. Anyway. Can we run it? Yes, with the Gungan command: `java -jar JAR`:

```text
$ java -jar build/libs/hahabit-0.0.1-SNAPSHOT.jar

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.0.1)

2023-01-15T17:15:55.801+01:00  INFO 35044 --- [           main] t.skagedal.hahabit.HahabitApplication    : Starting HahabitApplication using Java 19.0.1 with PID 35044 (/Users/simon/code/hahabit/build/libs/hahabit-0.0.1-SNAPSHOT.jar started by simon in /Users/simon/code/hahabit)
<continued log output>
```

Yup, it starts and runs, just like in IntelliJ. Honestly, I've had it with that enormous piece of ASCII art stealing my attention and vertical space. Adding this to `application.properties`:

```properties
spring.main.banner-mode=off
```

And then thanking myself. Now that my attention has been freed up – are there any messages logged in the startup sequence that might be relevant to deal with before we go live? There is one warning:

```text
2023-01-15T17:21:07.408+01:00  WARN 35159 --- [           main] ocalVariableTableParameterNameDiscoverer : Using deprecated '-debug' fallback for parameter name resolution. Compile the affected code with '-parameters' instead or avoid its introspection: org.springframework.session.config.annotation.web.http.SpringHttpSessionConfiguration
```

It seems like this is an instance of [this bug](https://github.com/spring-projects/spring-framework/issues/29612#issuecomment-1333705627) and I should be able to just ignore it. Annoying though.

But I think we're ready to try to upload that little guy to the server! Let's do that in next post! 

_[Continue reading part twenty-two.](/posts/2023-01-22-habit-tracker-deploying-the-jar)_
