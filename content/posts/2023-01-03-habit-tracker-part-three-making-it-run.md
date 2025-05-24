---
layout: post
title:  "Writing a habit tracker, part 3: Setting up Testcontainers"
---

Here is part three of my little series on writing a habit tracker in Java with Spring Boot. In the [first part](/posts/2023-01-01-writing-a-habit-tracker), I set up some infrastructure on my server, and in the [second part](/posts/2023-01-02-habit-tracker-part-two-spring-boot) I created a skeleton app in Spring Boot. 

Now I'd like to just make this skeleton app work! Success criteria is to successfully do nothing.  

## Making it run

Right now, as we try to run the app, we get an error:

```text
***************************
APPLICATION FAILED TO START
***************************

Description:

Failed to configure a DataSource: 'url' attribute is not specified and no embedded datasource could be configured.

Reason: Failed to determine a suitable driver class
```

The same thing happens when we run the test suite, which looks like this:

```java
@SpringBootTest
class HahabitApplicationTests {
    @Test
    void contextLoads() {
    }
}
```

It tries to start up the app, and fails in the same way. I'm going to start with getting the test suite work, because that's where I want to work most of the time.  

What we we need to is to configure Testcontainers and set up the PostgreSQL URL setting, so that Spring Data knows where to connect to. [Googling around](https://www.atomicjar.com/2022/08/integration-testing-for-spring-boot-with-testcontainers/), I'm finding a nice way to set up Testcontainers using `@DynamicPropertySource`:

We can add something like this:

```java
class HahabitApplicationTests {
    // ...
    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgreSQL::getJdbcUrl);
        registry.add("spring.datasource.username", postgreSQL::getUsername);
        registry.add("spring.datasource.password", postgreSQL::getPassword);
    }
    // ...
}
```

Turns out [this annotation](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/test/context/DynamicPropertySource.html) was specifically added with the purpose of supporting setting up Testcontainers this way.  

But first, we need to create the container – the `postgreSQL` property in the above example. Testcontainers has a Junit 5 extension we could use, which is what the text I liked a few paragraphs ago does. Then you use a `@Testcontainers` annotation and it manages the lifecycle of the container for you. 

But I want to do it another way. There's a feature of Testcontainers that I really enjoy, called _reusable testcontainers_. You see, the thing is, starting up containers can be kind of slow. And tests should run fast. Some people will tell you that, for this reason, you should dogmatically write most of your tests as unit tests that do not access any kind of database. Don't listen to those people. Good tests should be realistic and test the functionality of your application, not the implementation. _And_ they should be fast – as fast as they can be. Reusable testcontainers helps with that.

It is, however, [still an experimental feature](https://www.testcontainers.org/features/reuse/), and it isn't supported with the `@Testcontainers` annotation. It should be stored in a static variable and started up manually. This is how I like to do it:

```java
public class Containers {
    private static PostgreSQLContainer<?> postgreSQLContainer;

    synchronized public static PostgreSQLContainer<?> postgres() {
        if (postgreSQLContainer == null) {
            postgreSQLContainer = new PostgreSQLContainer<>("postgres:12.12")
                .withDatabaseName("hahabit")
                .withUsername("test")
                .withPassword("password")
                .withLabel("reuse-label", "hahabit")
                .withReuse(true);
            postgreSQLContainer.start();
        }
        return postgreSQLContainer;
    }
}
```

We want to start the container as late as possible. I should be able to run tests that don't use the database without suffering even the overhead of setting up the reusable container. So I use a lazy-initialized singleton property. 

The `PostgreSQLContainer` class comes from the `org.testcontainers:postgresql` package, which was kindly added to our build.gradle by the Spring Initializr since we asked for both Testcontainers and the PostgreSQL driver. Very nice of it. 

I should perhaps explain the line that says `.withLabel("reuse-label", "hahabit")`. Testcontainers uses a combination of the properties to figure out which containers it can reuse. I like to set a label to just make sure we don't by mistake reuse the wrong container. (I wish Testcontainers forced some kind of identifier for reuse.)  

Anyway. Now I want to use this container in the tests. I set up the `@DynamicPropertySource` method like this:

```java
class HahabitApplicationTests {
    // ...
    @DynamicPropertySource
    static void registerPostgreSQLProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> Containers.postgres().getJdbcUrl());
        registry.add("spring.datasource.username", () -> Containers.postgres().getUsername());
        registry.add("spring.datasource.password", () -> Containers.postgres().getPassword());
    }
    // ... 
}
```

Here I make use of the fact that the `DynamicPropertyRegistry::add` method takes a supplier so that we can be lazy, again, to avoid not starting up the container when we don't have to.   

## Ok, so does it work?

Yes! It works! The `contextLoads` test is now green, and we can see stuff like this in logs:

```text
INFO o.f.c.i.database.base.BaseDatabaseType   : Database: jdbc:postgresql://localhost:49171/hahabit (PostgreSQL 12.12)
INFO o.f.core.internal.command.DbValidate     : Successfully validated 0 migrations (execution time 00:00.016s)
WARN o.f.core.internal.command.DbValidate     : No migrations found. Are your locations set up correctly?

```

Nice. 

_[Continue reading part four.](/posts/2023-01-04-habit-tracker-functionality-and-first-migration)_
