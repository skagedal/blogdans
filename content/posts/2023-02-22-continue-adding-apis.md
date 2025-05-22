---
layout: post
title: "HTTP clients for testing! Which one?"
summary: "As I continue the implementation and testing of the habits API, I realize I need a HTTP client with JSON support, discuss various alternatives and end up sticking with HttpClient, using a `BodyPublisher`/`BodyHandler` pair to deal with the JSON."
---
We ended the [previous post](/posts/2023-02-21-adding-apis) with a failing test for the "create habit" API. Let me now first just make that test green by creating that request handler, introducing a little `HabitsApiController`[^1]:

```java
@RestController
public class HabitsApiController {
    private final HabitRepository habits;

    public HabitsApiController(HabitRepository habits) {
        this.habits = habits;
    }

    @PostMapping("/api/habits")
    @ResponseStatus(HttpStatus.CREATED)
    HabitCreateResponse addHabit(@RequestBody HabitCreateRequest request, Principal principal) {
        habits.save(Habit.create(
            principal.getName(),
            request.description()
        ));
        return new HabitCreateResponse();
    }

    private record HabitCreateRequest(String description) {}
    private record HabitCreateResponse() {}
}
```

But now, of course, we want to assert that the habit was actually created. There's a couple of ways we could do that. We could inject a repository class and confirm on that level that the habit has been created. But then, again, we'd be testing the implementation rather than the functionality. From the API user's perspective, it doesn't matter how the habit is stored, it just matters that it's stored.

What makes sense here is to instead make a GET call to the API and confirm that the habit is returned. 

So let's continue on the test. We'll eventually make this one into a little "story"[^2], just like the one I did using HtmlUnit. 

### Choosing a HTTP client

As I start to write that, I realize that I'm going to need to improve on my HTTP client tooling. So far, as you saw in the last post, I used the Java 11 HttpClient and just put the JSON directly in a multi-line string. There's something kind of neat about that, I think, because you really see exactly what data is on the wire. But it really doesn't scale well when we'll need to do more refined things. 

There are several options we could use here. Spring has a few options of it's own, but it's an odd situation. There's the classic [RestTemplate](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/client/RestTemplate.html), but it's "in maintenance mode, with only minor requests for changes and bugs to be accepted going forward". Instead, they recommend that you use the reactive WebClient. But that brings in the whole Spring Reactive stack with Netty and Reactor and all that, and that seems really heavy to me for just making some HTTP calls.

There's also [Spring Boot's TestRestTemplate](https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/test/web/client/TestRestTemplate.html), which is a wrapper around RestTemplate that makes it easier to use for testing. It doesn't explicitly say whether this is also in "maintenance mode", but it seems like it should be regarded as being at the same level of semi-deprecatedness since it's following the same API and using RestTemplate internally. And then similarly, there's [WebTestClient](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/test/web/reactive/server/WebTestClient.html) that wraps the reactive WebClient, and seems to be the thing they [recommend](https://docs.spring.io/spring-framework/docs/current/reference/html/testing.html#webtestclient) for tests.

Not sure how Spring developers out in the wild deal with this situation. As my great friend Fredrik pointed out in a chat, the hype around reactive has died down a bit with Loom looming on the horizon; possibly someone regrets this decision. And I guess many people are happy with their continued use of `RestTemplate` and `TestRestTemplate`.

Another option is to use some other third-party HTTP client. [Feign](https://github.com/OpenFeign/feign) seems popular. There are also clients specifically made for testing, such as [REST Assured](https://rest-assured.io/), which we use quite a bit at work.  

Those made-for-testing HTTP clients tend to combine doing HTTP calls and asserting the results as a single, fluent method call chain. For example, with REST Assured:

```java
get("/lotto").then().body("lotto.lottoId", equalTo(5));
```

Or with Spring's `WebTestClient`:

```java
client.get().uri("/persons/1")
    .accept(MediaType.APPLICATION_JSON)
    .exchange()
    .expectStatus().isOk()
    .expectHeader().contentType(MediaType.APPLICATION_JSON);
```

While convenient for many cases, there's something about this that doesn't rub me the right way. I'm a great fan of composability – I like to have small things that do one thing well, and then smaller things compose into bigger things. So you have your HTTP client that you know the ins and outs of, and you have your assertion library that you know the ins and outs of. Then you put them together.  

I also like those components to, if possible, be the ones delivered by the most core part of the ecosystem we're dealing with. See where I'm going with this? Yeah, I'm gonna continue down the HttpClient path! 

### Object mapping handler and publisher for HttpClient 

The thing we lack with HttpClient is encoding and decoding JSON. Fortunately, we have a tool in the toolkit that does that well – Jackson. And HttpClient allows you to write custom `HttpResponse.BodyHandler` implementations for deserializing responses, and `HttpRequest.BodyPublisher` for serializing request bodies. 

I wish there was a standard way of gluing these things together, like with some small library – let me know if you know of any! This could be done in much smarter ways than what I'll be presenting below (see for example discussions in [this Stack Overflow question](https://stackoverflow.com/questions/57629401/deserializing-json-using-java-11-httpclient-and-custom-bodyhandler-with-jackson)), but I'm gonna go with a simple approach that works on complete buffers. Here we go with the whole thing:

```java
package tech.skagedal.hahabit.http;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.springframework.stereotype.Component;

@Component
public class BodyMapper {
    private final ObjectMapper objectMapper;

    public BodyMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public <T> HttpResponse.BodyHandler<T> receiving(Class<T> klass) {
        return new ResponseHandler<>(klass, objectMapper);
    }

    public <T> HttpRequest.BodyPublisher sending(T body) {
        try {
            return HttpRequest.BodyPublishers.ofByteArray(objectMapper.writeValueAsBytes(body));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private static class ResponseHandler<Type> implements HttpResponse.BodyHandler<Type> {
        private final Class<Type> klass;
        private final ObjectMapper mapper;

        public ResponseHandler(Class<Type> klass, ObjectMapper mapper) {
            this.klass = klass;
            this.mapper = mapper;
        }

        private Type deserializeBytes(byte[] bytes) {
            try {
                return mapper.readValue(bytes, klass);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }

        @Override
        public HttpResponse.BodySubscriber<Type> apply(HttpResponse.ResponseInfo responseInfo) {
            return HttpResponse.BodySubscribers.mapping(
                HttpResponse.BodySubscribers.ofByteArray(),
                this::deserializeBytes
            );
        }
    }
}
```

My first version had static methods to create our body mappers and publishers, so the usage would be similar to the way we'd write `HttpResponse.BodyHandlers.ofString()`, but I soon realized that we'd either need to use a static `ObjectMapper` or pass it in on every method call, neither of which I liked. So now it's a little Spring component instead. 

### Bringing it all together

In the test class, I inject the `BodyMapper` and made further adjustments to my little helpers:

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ApiTests {
    // ...

    @Autowired
    private BodyMapper bodyMapper;

    // ...

    private <T> HttpResponse<T> sendReceiving(Class<T> type, HttpRequest request) {
        try {
            return httpClient.send(request, bodyMapper.receiving(type));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private <T> HttpRequest.Builder POST(URI uri, T json) {
        return HttpRequest
            .newBuilder(uri)
            .POST(bodyMapper.sending(json))
            .header("content-type", "application/json");
    }

    // ...
}
```

Then I have these little methods to make my specific API calls:

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ApiTests {
    // ...

    // Client methods

    record Habit(Long id, String description) {
    }

    void createHabit(String username, String description) {
        record Request(String description) {
        }
        record Response() {
        }

        final var response = sendReceiving(
            Response.class,
            POST(
                uri("/api/habits"),
                new Request(description)
            )
                .header("Authorization", testDataManager.authHeader(username))
                .build()
        );

        assertThat(response.statusCode()).isEqualTo(201);
    }

    List<Habit> getHabits(String username) {
        record GetHabitsResponse(List<Habit> habits) {
        }

        final var response = sendReceiving(
            GetHabitsResponse.class,
            GET(uri("/api/habits"))
                .header("Authorization", testDataManager.authHeader(username))
                .build()
        );

        assertThat(response.statusCode()).isEqualTo(200);
        return response.body().habits;
    }

    // ...
}
```

And now my test becomes just this:

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ApiTests {
    // ...

    @Test
    void create_habit() {
        final var username = testDataManager.createRandomUser();

        final var habitsBefore = getHabits(username);
        assertThat(habitsBefore).isEmpty();

        createHabit(username, "Go for a walk");

        final var habitsAfter = getHabits(username);
        assertThat(habitsAfter).hasSize(1);
        assertThat(habitsAfter.get(0)).extracting(Habit::description).isEqualTo("Go for a walk");
    }

    // ...
}
```

I feel that's a nice level of a readability for the test. I will also be going against the common recommendation that tests should only test "one thing". Just with the HtmlUnit test in the previous post, I think I'm going to make this be a little "story" of API calls as a single test. 

But first, let's make that test green. It's now failing because we don't have a `/api/habits` GET endpoint. There is a POST registered on that endpoint though, so we get a [405 Method Not Allowed](https://http.cat/405) error. (That might be my favorite http.cat image, by the way.)

So yeah, let's just do that before we go home. 

```java
@RestController
public class HabitsApiController {
    // ...

    @GetMapping("/api/habits")
    ListHabitsResponse listHabits(Principal principal) {
        return new ListHabitsResponse(
            habits.findAllByOwnedBy(principal.getName())
        );
    }

    private record ListHabitsResponse(List<Habit> habits) { }

    // ...
}
```

Test coverage is stable at 90.3394%! 

_[Continue to part thirty-eight.](/posts/2023-02-23-finish-up-the-api)_

### Notes

[^1]: There are a number of things we could discuss with this simple piece of code. Should we return the "full object" here, i.e. the Habit with it's ID and all the attributes populated? Some say that's the REST-y thing to do. And certainly getting the ID of the thing you just created seems useful. I however chose not to for the time being, because of API simplicity. I did however want it to return an empty JSON object, so that I can extend the API when needed without breaking clients (which, I argue, should ignore unknown properties). There's probably a better way of dong that than creating a record without properties, as I did here. 
[^2]: Breaking another "law" of testing, that your test methods should test One Thing.  Don't know if that's a law I believe in. If applicable, then yeah, sure it's good to isolate things. But sometimes a story is easier to write and read and reason about. 