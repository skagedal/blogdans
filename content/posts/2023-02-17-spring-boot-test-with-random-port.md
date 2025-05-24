---
layout: post
title:  "A Spring Boot test that runs the full service"
summary: "Discussing my views on automated testing a little bit and start adding some full service web tests to Hahabit."
---
People have a lot of opinions about unit testing and throw around things like "the testing pyramid" as if it's the law. To me, the most important property of good automated tests is that they should test the functionality, not the implementation, so that we can refactor and feel confident that our tests will catch any problems. If the tests all rely on a lot of internal mocking, then that's not the case.

A great talk on this subject is [TDD, Where Did It All Go Wrong](https://www.youtube.com/watch?v=EZ05e7EMOLM) by Ian Cooper. Go watch it, it's quite inspiring. 

This also means that I think tests should test as realistic a scenario as possible. This is often contrasted against tests being quick and stable. I do agree that tests should run quickly, but I think there's a good balance to be found. Testcontainers – especially when [set up for reuse](/posts/2023-01-03-habit-tracker-part-three-making-it-run) – is a great way to get a realistic environment for your tests, without paying too big of a price in terms of time.

Spring Boot comes with a set of tools for testing various slices of the app. I am not against that at all, it's awesome to have different tools in the box and I'm looking forward to learn more about it. But to begin with, I'm going to start with some tests that test the whole Spring Boot app, spun up as a real HTTP-listening service.

The very small test class I already have is the one that Spring Initializr created for me and called `HahabitApplicationTests`. It contains some repository tests right now, so I think I'll rename it `RepositoryTests`. That one uses a mock web environment, which is the default for Spring Boot tests. I'm going to add a new test class that uses the real thing, and I'll call it `WebTests`. In it I add an empty test just to make sure everything starts up: 

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class WebTests {
    @Test
    void some_test() {

    }
}
```

`WebEnvironment.RANDOM_PORT` triggers the mode where it starts up a real server and listens to a port.  

But that test fails to start up, because it can't load the Application Context. We need to set up the dynamic property sources to hook up the Testcontainers database, just like we did back in [part three](/posts/2023-01-03-habit-tracker-part-three-making-it-run):

```java
public class WebTests {
    @DynamicPropertySource
    static void registerPostgreSQLProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> Containers.postgres().getJdbcUrl());
        registry.add("spring.datasource.username", () -> Containers.postgres().getUsername());
        registry.add("spring.datasource.password", () -> Containers.postgres().getPassword());
    }
    // ...
}
```

That makes it run! But I don't want to have to repeat this for every test class that needs the database. I would rather not have a common base class either.  Something like what Baeldung mentions [here](https://www.baeldung.com/spring-dynamicpropertysource) under "An Alternative: Test Fixtures" is more appealing, I think. For now I'm gonna just abstract it into a method in my `Containers` class and just do this:

```java 
public class WebTests {
    // ...
    @DynamicPropertySource
    static void registerPostgreSQLProperties(DynamicPropertyRegistry registry) {
        Containers.registerDynamicProperties(registry);
    }
    // ...
}
```

That's fine. 

So, now we want to send some requests to that random port. Which random port was it assigned to? We can get that by asking for a `ServletWebServerApplicationContext` to be injected. I'm gonna do that, and I'm going to create a little `java.net.http.HttpClient` (the one from Java 11) and some helpers to fetch from that port of my local machine. 

```java
public class WebTests {
    @Autowired
    private ServletWebServerApplicationContext servletContext;

    private final HttpClient httpClient = HttpClient.newBuilder()
        .version(HttpClient.Version.HTTP_1_1)
        .build();

    // ...

    // Helpers

    private URI uri(String path) {
        return URI.create("http://127.0.0.1:" + servletContext.getWebServer().getPort() + path);
    }

    private HttpResponse<String> send(HttpRequest request) {
        try {
            return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static HttpRequest.Builder GET(URI uri) {
        return HttpRequest.newBuilder(uri).GET();
    }
}
```

Right, so let's see if we can fetch the root of the hahabit site:

```java
public class WebTests {
    // ...
    @Test
    void get_home() {
        final var response = send(GET(uri("/")).build());

        System.out.println("Status:  " + response.statusCode());
        System.out.println("Headers: " + response.headers());
        System.out.println("Body:    " + response.body());
    }
    // ...
}
```

It prints this:

```text
Status:  302
Headers: java.net.http.HttpHeaders@e1bcad42 { {cache-control=[no-cache, no-store, max-age=0, must-revalidate], content-length=[0], date=[Thu, 16 Feb 2023 20:28:07 GMT], expires=[0], location=[http://127.0.0.1:64687/login], pragma=[no-cache], set-cookie=[SESSION=ZTMyMThkOTctYjlkNy00ODRhLWI2NTgtYjYyNTI1YmJhMzc3; Path=/; HttpOnly; SameSite=Lax], x-content-type-options=[nosniff], x-frame-options=[DENY], x-xss-protection=[0]} }
Body:    
```

Right, it redirects to `/login`. That's exactly what we want it to do. We can make this into a test that asserts that this is indeed the case. I'm choosing to write my asserts using AssertJ now, because I haven't used that much and it seems fun.

```java
public class WebTests {
    // ...

    @Test
    void home_redirects_to_login() {
        final var response = send(GET(uri("/")).build());

        assertThat(response.statusCode())
            .isEqualTo(HttpStatus.FOUND.value()); // that's a 302 redirect
        assertThat(response.headers().firstValue("Location"))
            .isPresent()
            .hasValue(uri("/login").toString());
    }

    // ...
}
```

That's pretty clean!

So! Did we improve the test coverage now? No, we did not; it is still at 36.803. The test suite isn't exercising any code it wasn't doing before; the 302 redirect is set up by the framework and hitting that endpoint doesn't execute any of my code. 

But did we at least reach our stated goal of testing the behavior, not the implementation? Also no, not really – the user doesn't care that there's a redirect to some place called `/login`, they care that they can log in.   

But we had fun! And we prepared a bit for the next things to come! 

_[Continue reading part thirty-three.](/posts/2023-02-18-html-unit-testing)_