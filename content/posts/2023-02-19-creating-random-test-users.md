---
layout: post
title:  "Creating a random user"
summary: "In order to start tests from a clean slate, since we can't use the Spring framework's `@Transactional` annotation in full-server tests, I set up a way to create a random user for each test. And ask myself how to inject beans from the test package."
---
[Yesterday](/posts/2023-02-18-html-unit-testing), we set up HtmlUnit and managed to log in from the test suite. Next, we want to test the actual functionality: add a habit and track it.

As this would change the state of the database, we need to think a bit about that, so that the tests run independently. 

Previously, when we did some repository tests, we used the `@Transactional` annotation from Spring. This brings the state back to what it was before the test. But that doesn't work here, because we're running the server in a different thread than the test. If we were instead using MockMvc testing, it would work, as I understand it.

But there are other things we could do. We could run a little bit of code before each test that clears all the tables. That works. Or we can generate a random user to use for each test. That's what I'll be doing.

We created a user before, in the `RepositoryTests`:

```java
class RepositoryTests {
    // ...
    private void createSimonUser() {
        final var simon = User.withDefaultPasswordEncoder()
            .username("simon")
            .password("bestpassword")
            .roles("USER")
            .build();
        userDetailsManager.createUser(simon);
    }
    // ...
}
```

I think I'll move that to a little `TestDataManager` class. Also, there's an annoying deprecation warning attached to that `User.withDefaultPasswordEncoder()` call. Because it's unsafe and stuff – you shouldn't have real passwords in code. It's provided for "getting started" purposes, and it seems to me like testing would be a perfectly valid use case as well. But then you're stuck with that warning. I decided to just inline that very small method, getting this instead:   

```java
public class TestDataManager {
    private final UserDetailsManager userDetailsManager;

    public TestDataManager(UserDetailsManager userDetailsManager) {
        this.userDetailsManager = userDetailsManager;
    }

    public void createSimonUser() {
        final var passwordEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
        final var simon = User.builder().passwordEncoder(passwordEncoder::encode)
            .username("simon")
            .password("bestpassword")
            .roles("USER")
            .build();
        userDetailsManager.createUser(simon);
    }
}
```

And then we should create a random user name instead of "simon", which, although it is my name, is not a very random name; it is always "simon". I'll just be going for a UUID.

```java
public class TestDataManager {
    private static String PASSWORD = "password";

    private final UserDetailsManager userDetailsManager;

    public TestDataManager(UserDetailsManager userDetailsManager) {
        this.userDetailsManager = userDetailsManager;
    }

    public String createRandomUser() {
        final var passwordEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
        final var username = UUID.randomUUID().toString();
        final var user = User.builder().passwordEncoder(passwordEncoder::encode)
            .username(username)
            .password(PASSWORD)
            .roles("USER")
            .build();
        userDetailsManager.createUser(user);
        return username;
    }
}
```

Now, I'd really like to inject this into my `RepositoryTests` and `WebTests` class. I tried annotating the `TestDataManager` with `@Component` and then injecting it with `@Autowired` in test classes. (Spring constructor injection doesn't work with Junit test classes, it has it's own "parameter resolver" system for injection.) But the application context couldn't find the bean. So I guess I need to set up component scanning for the test packages somehow?  

I tried a few approaches, but failed. For now, I'll just let the test classes get a `UserDetailsManager` injected, and then create a `TestDataManager` instance with that. 

Anyway, now we can let the `can_login` HtmlUnit test that we wrote last time use a random user name. 

```java
public class WebTests {
    // ...
    @Test
    void can_login() throws IOException {
        final var username = testDataManager.createRandomUser();

        final HtmlPage start = webClient.getPage(url("/"));
        final HtmlForm signInForm = start.getForms().get(0);
        final HtmlTextInput usernameField = signInForm.getInputByName("username");
        final HtmlPasswordInput passwordField = signInForm.getInputByName("password");
        final HtmlButton button = signInForm.getFirstByXPath("//button[@type='submit']");

        usernameField.type(username);
        passwordField.type(TestDataManager.PASSWORD);
        final HtmlPage loggedInPage = button.click();

        assertThat(loggedInPage.asNormalizedText()).contains("Manage my habits");
    }
    // ...
}
```

Allright, that's it for today, and coverage remains at 46.0967%, but we've done some useful refactorings for the continued work!

_[Continue reading part thirty-five.](/posts/2023-02-20-more-html-unit)_
