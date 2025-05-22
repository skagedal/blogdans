---
layout: post
title:  "Let's start looking at API:s"
summary: "I want to add some JSON REST API:s to the habit tracker, and begin with writing a first failing test. Then I figure out some authentication details, add Basic Auth and disable CSRF."
---
I'm pretty happy with the test coverage now that we have worked on that for a few posts – [here's](/posts/2023-02-20-more-html-unit) the last one. I looked at what those remaining 10% consisted of, and did not deem them interesting enough to spend time writing tests for. Let's continue with other stuff.  

I want to eventually add some new kinds of user experiences for Hahabit. I'm not all that happy with the server-generated HTML, and might after all want to move to a frontend app written in React or similar, eventually. Or, I might consider writing an iOS app. Actually, for myself, most of all I want a nice CLI! 

In all those cases, I'll want some API:s.

I'll begin with some API:s that  over the current functionality of the web app, and I'm going to start with writing some tests.

What's nice with doing the [test-driven development](https://en.wikipedia.org/wiki/Test-driven_development) thing of writing the tests first for API:s is that you get to think about them a bit from the client's point of view, how they're supposed to be used, before you write them.

I'm going to create a new class called `ApiTests` and copy a whole bunch of boilerplate code from `WebTests`. Some day for sure I'll try to neaten things up a bit. 

To get going, here's my first test:

```java
public class ApiTests {
    // ...
    
    @Test
    void create_habit() {
        final var username = testDataManager.createRandomUser();

        final var response = send(
            POST(
                uri("/api/habits"),
                """
                   {
                       "description": "Go for a walk",
                   }
                """
            )
                .header("Authorization", testDataManager.authHeader(username))
                .build());

        assertThat(response.statusCode()).isEqualTo(200);
    }

    // ...
}
```

We should figure out something better for the API authentication later, but [Basic Auth](https://en.wikipedia.org/wiki/Basic_access_authentication) will do for now. So, that `testDataManager.authHeader(String userName)` function is just this:

```java
public class TestDataManager {
    // ...
    public String authHeader(String username) {
        return "Basic " + base64Encoder.encodeToString((username + ":" + PASSWORD).getBytes());
    }
    // ...
}
```

I currently don't have Basic Auth enabled in Spring Security, only form authentication. So the above test fails like this:

```
org.opentest4j.AssertionFailedError: 
expected: 200
 but was: 302
 ```

It's directing everyone to the login form using a [302 Found](https://http.cat/302), the most confusingly named HTTP status code. Let's add Basic Auth to our Spring Security configuration:

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
            .formLogin(Customizer.withDefaults())
            // 👇 I now just added this line
            .httpBasic();

        return http.build();
    }
}
```

Now I expect the authentication to work, but as I haven't implemented the API yet, I should get a [404 Not Found](https://http.cat/404) response!

```
org.opentest4j.AssertionFailedError: 
expected: 200
 but was: 401
 ```

Hmm no – instead, I get a [401 Unauthorized](https://http.cat/401). Did I mess up my Basic Auth header somehow? I don't think I did. I see nothing relevant in the service logs. But they are not very informative. I'd like to have more logs please. 

I think I'll do that by adding a little `dev` profile for myself, an `application-dev.properties` file in resources:

```properties
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web=DEBUG
``` 

Running my tests now with the `-Dspring.profiles.active=dev` flag in the VM arguments, I see this in the logs:

```
o.s.security.web.FilterChainProxy        : Securing POST /api/habits
o.s.security.web.csrf.CsrfFilter         : Invalid CSRF token found for http://127.0.0.1:51295/api/habits
o.s.s.w.access.AccessDeniedHandlerImpl   : Responding with 403 status code
o.s.security.web.FilterChainProxy        : Securing POST /error
s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped to org.springframework.boot.autoconfigure.web.servlet.error.BasicErrorController#error(HttpServletRequest)
o.s.s.w.a.AnonymousAuthenticationFilter  : Set SecurityContextHolder to anonymous SecurityContext
s.w.a.DelegatingAuthenticationEntryPoint : Trying to match using And [Not [RequestHeaderRequestMatcher [expectedHeaderName=X-Requested-With, expectedHeaderValue=XMLHttpRequest]], MediaTypeRequestMatcher [contentNegotiationStrategy=org.springframework.web.accept.ContentNegotiationManager@3691df0e, matchingMediaTypes=[application/xhtml+xml, image/*, text/html, text/plain], useEquals=false, ignoredMediaTypes=[*/*]]]
s.w.a.DelegatingAuthenticationEntryPoint : Trying to match using Or [RequestHeaderRequestMatcher [expectedHeaderName=X-Requested-With, expectedHeaderValue=XMLHttpRequest], And [Not [MediaTypeRequestMatcher [contentNegotiationStrategy=org.springframework.web.accept.ContentNegotiationManager@3691df0e, matchingMediaTypes=[text/html], useEquals=false, ignoredMediaTypes=[]]], MediaTypeRequestMatcher [contentNegotiationStrategy=org.springframework.web.accept.ContentNegotiationManager@3691df0e, matchingMediaTypes=[application/atom+xml, application/x-www-form-urlencoded, application/json, application/octet-stream, application/xml, multipart/form-data, text/xml], useEquals=false, ignoredMediaTypes=[*/*]]], MediaTypeRequestMatcher [contentNegotiationStrategy=org.springframework.web.accept.ContentNegotiationManager@3691df0e, matchingMediaTypes=[*/*], useEquals=true, ignoredMediaTypes=[]]]
s.w.a.DelegatingAuthenticationEntryPoint : Match found! Executing org.springframework.security.web.authentication.DelegatingAuthenticationEntryPoint@16e84d93
s.w.a.DelegatingAuthenticationEntryPoint : Trying to match using RequestHeaderRequestMatcher [expectedHeaderName=X-Requested-With, expectedHeaderValue=XMLHttpRequest]
s.w.a.DelegatingAuthenticationEntryPoint : No match found. Using default entry point org.springframework.security.web.authentication.www.BasicAuthenticationEntryPoint@517fbb55
```

Allright, so the first two lines of this at least makes sense! I have protection for [cross-site request forgery](https://en.wikipedia.org/wiki/Cross-site_request_forgery) (CSRF) enabled, but I'm not sending a CSRF token. The rest of the output is confusing, however; it says it's responding with a [403 Forbidden](https://http.cat/403) but I clearly see a 401 as the end result of the call?  

Anyway, let's just deal with the CSRF stuff. I don't think this is relevant to have enabled for the API.[^1] I'll disable it:

```java
public class WebSecurityConfig {
    // ...
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 👇 Adding these lines
            .csrf().ignoringRequestMatchers(request ->
                request.getRequestURI().startsWith("/api"))
            .and()
            // 👆 
            .authorizeHttpRequests(requests -> requests
                .requestMatchers("/actuator/*").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(Customizer.withDefaults())
            .httpBasic();

        return http.build();
    }
}
```

Now I get my expected 404 Not Found!

```
org.opentest4j.AssertionFailedError:
expected: 200
but was: 404
```

I did some manual tests to confirm that CSRF is still enabled as expected in the web pages. 

However, I now notice that another test is failing – this one:

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

We no longer get a 302 here, but a 401. However, as I test the app locally and connect through the browser, I can confirm that the redirect is working as expected there. This is exactly the behavior I described [back in part nine](/posts/2023-01-09-habit-tracker-securing-things). I still want to know what it is that causes this difference between browsers and straight HTTP calls. It seems that also HtmlUnit is getting the redirect, so it's doing whatever browsers are doing.  

I went so far as to [write a question on Stack Overflow](https://stackoverflow.com/questions/75511353/how-does-spring-determine-whether-to-redirect-to-form-login/75511354#75511354), and then, when I was writing the question I took a look again at the headers that the browsers were sending (again, see [part nine](/posts/2023-01-09-habit-tracker-securing-things)) and had a face-palm moment. I had overlooked a very basic thing: the `Accept` header. So, with `Accept: text/html`, we get the redirect; with `Accept: */*`, we get the 401. 

Rubberducking for the win. 

Now that this knowledge is in my brain, I'm going to also encode it into the test suite. First, I'm moving the test to `ApiTests` so that `WebTests` only deals with the HtmlUnit tests and `ApiTests` is the one doing direct HTTP calls. Then I break it into these two:

```java
public class ApiTests {
    // ...

    @Test
    void apis_get_unauthorized_response() {
        final var response = send(GET(uri("/")).build());

        assertThat(response.statusCode())
            .isEqualTo(HttpStatus.UNAUTHORIZED.value());
        assertThat(response.headers().firstValue("WWW-Authenticate"))
            .isPresent()
            .hasValueSatisfying(value -> assertThat(value).startsWith("Basic"));
    }

    @Test
    void home_redirects_to_login_in_browsers() {
        final var responseAcceptingHtml = send(GET(uri("/")).header("Accept", "text/html").build());

        assertThat(responseAcceptingHtml.statusCode())
            .isEqualTo(HttpStatus.FOUND.value()); // that's a 302 redirect
        assertThat(responseAcceptingHtml.headers().firstValue("Location"))
            .isPresent()
            .hasValue(uri("/login").toString());
    }
    
    // ...
}
```

Cool! I mean, actually, not sure this is the behavior I want – I'd like to just have the form login protect the web endpoints and basic auth protect the API endpoints. But Spring Security setup is confusing to me. I'll need to dig deeper into it later, because also I don't want basic auth at all. 

Let's continue with making our new `create_habit` test green tomorrow!  

_[Continue reading part thirty-seven.](/posts/2023-02-22-continue-adding-apis)_

### Notes

[^1]: But see [here](https://docs.spring.io/spring-security/reference/features/exploits/csrf.html#csrf-when-json) regarding CSRF and JSON API:s. If I ever open this tool up to the public, I'll hopefully have revisited the security setup.