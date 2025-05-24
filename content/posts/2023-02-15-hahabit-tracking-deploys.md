---
layout: post
title:  "Hahabit: Setting up Spring Actuator"
summary: "I discuss setting up Spring Actuator for the habit tracker, and how to make sure that the expected version comes online."
--- 
I'm in the mood for continuing on my habit tracker! We left off [here](/posts/2023-01-29-habit-tracker-so-far). I do use it every day, you know. I click those buttons. It feels good because I built it. I'm proud of it. I'm proud of myself. I'm proud of you. I'm proud of us. I'm proud of the world. I'm proud of the universe. I'm proud of the multiverse.

(The sentences from "I'm proud of it" on were added by Github Copilot; and I could not resist.)

There's a lot of actual functionality I'd love to have, but you know me. I'm gonna spend some time on the tech foundations first instead.

So, one thing is that I'd like to track the deploys better. I want to make sure that after I have run my deploy script, the new version has come up and become healthy. I also want improved ways of monitoring what's going on with the service.

The Spring Boot tool that you use for this kind of stuff is called Actuator. [This chapter](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html) of the Spring Boot reference manual explains it. Apparently, this is why it's called Actuator:

> An actuator is a manufacturing term that refers to a mechanical device for moving or controlling something. Actuators can generate a large amount of motion from a small change.

Cool, cool. So, I'm adding this to `build.gradle`:

```groovy
implementation 'org.springframework.boot:spring-boot-starter-actuator'
```

And then the guide tells me that there is one endpoint that is enabled and exposed by default, `/actuator/health`:

```shell
$ curl http://localhost:8080/actuator/health
{"status":"UP"}
```

Great! With this I could wait for the status to be `UP` before I consider the deploy done. But I'd like to know that i's not just some version that is up, but actually the new version. What would make me happy is if I could see the git commit hash of the deployed code. Apparently, the `info` endpoint can do that, if it gets the information passed to it in `git.properties`. And there's a plugin that can do that for Gradle:

```groovy
plugins {
        // ...
	id "com.gorylenko.gradle-git-properties" version "2.4.1"
	// ...
}
``` 

Now, I can see that a `git.properties` file gets included when I build the jar:

```shell
$ ./gradlew bootJar

BUILD SUCCESSFUL in 759ms
5 actionable tasks: 1 executed, 4 up-to-date
$ jar tf ./build/libs/hahabit-0.0.1-SNAPSHOT.jar | grep git
BOOT-INF/classes/git.properties
```

I can also find the file in the `build` directory and take a look at it:

```shell
$ find . -name git.properties
./build/resources/main/git.properties
$ cat ./build/resources/main/git.properties
git.branch=main
git.build.host=Simons-MBP-2
git.build.user.email=skagedal@gmail.com
git.build.user.name=Simon K\u00E5gedal Reimer
git.build.version=0.0.1-SNAPSHOT
git.closest.tag.commit.count=
git.closest.tag.name=
git.commit.id=5344cd68c1a84871f03eeeeba53ea40b2dcd21e5
git.commit.id.abbrev=5344cd6
git.commit.id.describe=
git.commit.message.full=Add import for SpringBootPlugin class\n
git.commit.message.short=Add import for SpringBootPlugin class
git.commit.time=2023-01-28T09\:20\:34+0100
git.commit.user.email=skagedal@gmail.com
git.commit.user.name=Simon K\u00E5gedal Reimer
git.dirty=true
git.remote.origin.url=git@github.com\:skagedal/hahabit.git
git.tags=
git.total.commit.count=50
```

Allright, lots of interesting stuff in there, including a confused version of my last name. So do I get some interesting stuff from the `/actuator/info` endpoint now? No, I get a 401. Only `/actuator/health` is exposed by default. First I need to enable the info one in `application.properties`:

```properties
management.endpoints.web.exposure.include=health,info 
```

...but I also need to configure Spring Security again. I had a configuration bean for it earlier in the project, but then I removed it because I realized that the default was exactly what I wanted. But now, I need this guy again:

```java
public class WebSecurityConfig {
    // ...
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(requests -> requests
                .requestMatchers("/actuator/*").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(Customizer.withDefaults());

        return http.build();
    }
}
```

The reference guide says you shouldn't expose your actuator endpoints to the whole wide world. But since this is an educational project, and none of the stuff in `health` or `info` is particularly sensitive – not any more than anything you can figure out from this blog or from the public source code – I"m fine with it.

So now, when we curl the info endpoint, we get this:

```shell
$ curl http://localhost:8080/actuator/info
{"git":{"branch":"main","commit":{"id":"5344cd6","time":"2023-01-28T08:20:34Z"}}}
```

Very cool! Let's use `jq` to extract the commit id:

```shell
$ curl -s http://localhost:8080/actuator/info | jq -r .git.commit.id
5344cd6
```

This is the same short version of the SHA hash as we get from 
```shell
$ git rev-parse --short HEAD
```

So, now I can use this in my deploy script to wait for the new version to come up. We'll do it with a loop like this:

```bash
while true; do
    if [ "$(curl -s http://localhost:8080/actuator/info | jq -r .git.commit.id)" = "$(git rev-parse --short HEAD)" ]; then
        echo "Done!"
        exit 0
    else 
        echo "Waiting for commit $(git rev-parse --short HEAD) to come up..."
    fi
    sleep 1
done
```

(Github Copilot mostly wrote that for me!)

Now, with [this commit](https://github.com/skagedal/hahabit/commit/ebcf38f0f1fc8fa67aef1512f36c033cb1dc8f26), I have a working Actuator and a deploy script that waits for the new version to come up. It also makes sure that I don't try to deploy from a dirty working directory (and yeah, Copilot wrote that too). After just a [few](https://github.com/skagedal/hahabit/commit/bd66e74dcc1e3a61dc881ae79cb870f5189e382a) [more](https://github.com/skagedal/hahabit/commit/d35093e2c28e5513caeb3de90086df0d3dd1b65f) tweaks, this is what running my deploy script looks like:

```shell
$ ./deploy.sh
👋 Building JAR with Java 19...

BUILD SUCCESSFUL in 735ms
6 actionable tasks: 6 executed

👋 Uploading JAR and run script to skagedal.tech...
hahabit-0.0.1-SNAPSHOT.jar                                                       100%   29MB   7.9MB/s   00:03
run.sh                                                                           100%  198     5.7KB/s   00:00

👋 Sending SIGTERM to running service...

👋 Waiting for commit d35093e to come up...
Waiting...
Waiting...
Waiting...
Waiting...
Waiting...
Waiting...
Waiting...
Waiting...
Done!
```

_[Continue reading part thirty-one.](/posts/2023-02-16-setting-up-jacoco)_