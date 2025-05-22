---
layout: post
title:  "Writing a habit tracker, part 2: A skeleton Spring Boot app"
---

Welcome to part two of my blog series on writing a habit tracker! In [part one](/posts/2023-01-01-writing-a-habit-tracker), I described the project and set up some tools on my server where I eventually hope to deploy this. Today I'll create a skeleton Spring Boot app.  

## Creating a Spring Boot app

Allright! So let's create a Spring Boot app for the backend of my habit tracker. I have never done much in Spring Boot, besides some other simple example apps like this one, so this is a project about me learning it. 
I'm going to [Spring Initializr](https://start.spring.io/), and this is my basic setup: 

* Gradle (Groovy) as the build system, since that's what I'm used to.
* Java 19 as implementation language. (Some day I will write my thoughts about the relative merits of Java and Kotlin, but not today[^1].)
* Packaging it as a Jar because what is even a "War"?!

Then it's the dependencies section. I'm going with the following as a start:

* Spring Web. For building HTTP endpoints.
* Spring Security. I will want to protect the endpoints.  
* Spring Data JDBC. This choice is a bit random, and I may change it later, but it seems like a good choice – getting some nice and simple repositories without having to deal with JPA just yet.
* Flyway Migration. Because I want to control my migrations, and I have some experience with Flyway.
* PostgreSQL Driver. 
* Testcontainers - would probably be good enough for this project to just use H2 repositories for testing, but I like Testcontainers.

Great, now we just press "Generate" and have ourselves a little skeleton app! But does it run...?

That'll be the cliffhanger for today's post – today I'm going to sit all day in a car, driving home from the ski resort. But I expect to pause somewhere to charge the car, and then I hope to get my 30 minutes of outdoors.  

_[Continue reading part three.](/posts/2023-01-03-habit-tracker-part-three-making-it-run)_

### Notes
[^1]: I realized I did write something along the lines of what I had in mind here back in 2020, [read here](/posts/2020-06-27-new-words)! 