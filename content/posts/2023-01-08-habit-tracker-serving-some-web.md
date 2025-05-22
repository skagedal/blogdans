---
layout: post
title:  "Writing a habit tracker, part 8: Serving some web"
---

I was thinking it's time to go beyond the storage level and implement some API:s. First I thought I'd dig a bit into a part of Spring I have even less experience with than the basic Spring Web MVC stuff – authentication and authorization. 

This is generally handled by the Spring Security package. It has a big [reference manual](https://docs.spring.io/spring-security/reference/index.html) that I don't feel like digging into just now. I'm thinking I'd like to start with some step-by-step guide. 

And then [this guide](https://spring.io/guides/gs/securing-web/), "Securing a Web Application", comes up a lot as an official "first guide" type thing, so I thought I'd go through that. 

Funny thing is, though – it really means a Web Application, i.e. you're building a Java server application that is serving HTML. That seems like an anachronism to me? No? Do people still do this? Should I do this? Hey, maybe I should do this!

Yeah! Definitely not what I had in mind to begin with, I thought I'd maybe write some kind of React frontend or whatever – but actually, let's start with this approach. It will be fun. 

## Rendering some web

So, I start by adding the Thymeleaf Spring Boot starter, as per the guide. [Thymeleaf](https://www.thymeleaf.org/index.html) is some kind of templating engine for Java.

Then I add the `home.html` and `hello.html` templates from the guide, and configure some view controllers:

```java
@Configuration
public class MvcConfig implements WebMvcConfigurer {
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/home").setViewName("home");
        registry.addViewController("/").setViewName("home");
        registry.addViewController("/hello").setViewName("hello");
        registry.addViewController("/login").setViewName("login");
    }
}
```

And then, supposedly, I should be able to run the app and get myself some HTML web pages locally! 

Oh, but I can't run the app though – we still get the "APPLICATION FAILED TO START" I mentioned in [part three](/posts/2023-01-03-habit-tracker-part-three-making-it-run). I only fixed that for the test suite (with Testcontainers), I didn't set up a way to run the app locally. 

I could install PostgreSQL locally, just like I did on my Linux server [in part one](/posts/2023-01-01-writing-a-habit-tracker), but with Homebrew since I'm running on a Mac. Or I could run it using a Dockerized approach. Both methods are fun. But I'll go with the latter one for now. 

I'm creating a `docker-compose.yml` file like this:

```yaml
version: '3.8'
services:
  db:
    image: postgres:12.12
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=hahabit
    ports:
      - '5432:5432'
```

The reason I'm using PostgreSQL version 12.12, by the way – both here and in the Testcontainers setup – is that that's the version that got installed by doing `apt install postgres` on my Ubuntu machine. Doing development against the same version seems generally a good idea. 

And then I start it by just running:

```shell
$ docker compose up
```

Now, just need to configure the app. Going to postpone thinking about different profiles for a bit and just put this in `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hahabit
spring.datasource.username=postgres
spring.datasource.password=postgres
```

Now the app starts! And the logs claim that it has started up a web server at port 8080. So let's go to `http://localhost:8080`, where I should expect to see that "home" template. 

But hey, no, I actually see a login form, asking me for username and password! I haven't even gotten that far into the tutorial yet, how can it... ohh right, I added Spring Security to the project already in [part 2](/posts/2023-01-02-habit-tracker-part-two-spring-boot), and of course everything just gets automatically configured. 

Let's try to comment out the relevant line in `build.gradle`:

```groovy
dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-data-jdbc'
//	implementation 'org.springframework.boot:spring-boot-starter-security'
	implementation 'org.springframework.boot:spring-boot-starter-web'
```

Then refresh the Gradle sync in my IDE (which happens to be IntelliJ IDEA) and re-run the project.

Yepsidoodle, now the `localhost.se:8080` page shows the unprotected "home" template, with a link to the likewise unprotected "hello" template. 

In tomorrow's episode, I think we will... add Spring Security back again!  

_[Continue reading part nine.](/posts/2023-01-09-habit-tracker-securing-things)_