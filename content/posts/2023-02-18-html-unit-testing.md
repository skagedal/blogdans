---
layout: post
title:  "Testing with HtmlUnit"
summary: "I add the HtmlUnit library and use it to test the form login in the habit tracker, and touch upon things like the deprecation of the `java.net.URL` constructors and whether I like HtmlUnit's approach with generic return types or not."
---

Continuing on the testing adventures from [yesterday](/posts/2023-02-17-spring-boot-test-with-random-port)! I'd like to actually test this as if I were clicking around on the web page, or as close as possible. I know of [Selenium](https://www.selenium.dev/) and things like that, but that's too heavy. I'd like to still stay within the comfy Java world of Junit 5. 

So I found [HtmlUnit](http://htmlunit.sourceforge.net/), which is a Java library that can load HTML and even do things like execute JavaScript. Spring Testing also integrates with it, so you can use it for the MockMvc style of tests, which is cool. I'm still doing real-server tests for now. 

So, adding HtmlUnit to my test target:

```groovy
dependencies {
    // ...
    testImplementation 'net.sourceforge.htmlunit:htmlunit:2.70.0'
    // ...
}
```

I instantiate a web client as a field in my test class:

```java
public class WebTests {
    // ...
    private final WebClient webClient = new WebClient();
    // ...
}
```

The [HtmlUnit guide](https://htmlunit.sourceforge.io/gettingStarted.html) does it by creating the instance in each test method using try-with-resources, which is cool I guess, but I like to have such setup already dealt with and let my test methods just do the testing. But sure, let's remember to close that client:

```java
public class WebTests {
    // ...
    @AfterEach
    void closeWebClient() {
        webClient.close();
    }
    // ...
}
```

Now, we want to access the start page. We earlier did a helper method, `uri`, that takes a path and returns a URI for that resource with the port that the server is running on. HtmlUnit's `getPage` method instead takes an URL. (There's also a variant that takes a string, but I like strong types.) 

Fun fact: the constructors of `java.net.URL` are [deprecated](https://download.java.net/java/early_access/jdk20/docs/api/java.base/java/net/URL.html#constructor-deprecation) in the (as of this writing yet to be released) Java 20, and if you need one you're supposed to create an URI and convert it to a URL. So we're also future-proof here when we do this:

```java
public class WebTests {
    // ...
    private URL url(String path) {
        try {
            return uri(path).toURL();
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
    }
    // ...
}
```

Now, let's try this:

```java
public class WebTests {
    // ...
    @Test
    void can_login() throws IOException {
        final HtmlPage start = webClient.getPage(url("/"));
        System.out.println(start.getBody().asXml());
    }
    // ...
}
```

Yeah, that follows the redirect from the start page to the login page, which we now see the XML representation of. Nice. 

You may have noticed before my tendency to use the local type inference introduced in Java 10 – typically I declare local variables with `final var` (dreaming that this could instead be spelled using a single word, like `let` or `val`). That doesn't work well for the HtmlUnit API, because it's typically using generic types for the return values of its methods. So, this `getPage` method is declared like this:

```java
public class WebClient {
    // ...
    public <P extends Page> P getPage(final URL url) throws IOException, FailingHttpStatusCodeException {
        // ...
    }
    // ...
}
```

So if I'd do `var start = webClient.getPage(url("/"));` then I'd just get the `Page` type, which doesn't have all the stuff I need. I guess they went with this style of API because when you later wish to get some page element of a specific type, you can do that with a single method, and if what it finds is not the right type you'll get a casting exception. I think there would have been some benefits to use specific methods for each type instead, because it would have allowed for more fluent style of writing, but I guess they wanted to keep the API small. 

Anyway.

So, now we have the login page. Let's try to log in. The login form has a username and password field, and a submit button. We can get the elements by name, except that our form and our submit button doesn't have a name (we're still using the default login page from Spring). So I'm going like this:

```java
public class WebTests {
    // ...
    @Test
    void can_login() throws IOException {
        final HtmlPage start = webClient.getPage(url("/"));
        final HtmlForm signInForm = start.getForms().get(0);
        final HtmlTextInput username = signInForm.getInputByName("username");
        final HtmlPasswordInput password = signInForm.getInputByName("password");
        final HtmlButton button = signInForm.getFirstByXPath("//button[@type='submit']");

        username.type("admin");
        password.type("admin");
        final HtmlPage loggedInPage = button.click();

        System.out.println(loggedInPage.getBody().asXml());
    }
    // ...
}
```

Whee, that gets us our logged-in Hahabit start page! The `admin` user is [set up by my Flyway migration scripts](/posts/2023-01-10-habit-tracker-securing-things-2), so it's there by default.

Just gonna replace that `System.out.println` with some kind of assertion, for now I'll just go with checking for the existence of the text "Manage my habits" which should be there:

```java
public class WebTests {
    // ...
    @Test
    void can_login() throws IOException {
        // ...
        assertThat(loggedInPage.asNormalizedText()).contains("Manage my habits");
    }
    // ...
}
```

Nice! 

Did we improve our test coverage today? Yes we did:

```shell
$ ./test.sh

BUILD SUCCESSFUL in 495ms
6 actionable tasks: 6 up-to-date

Coverage: 46.0967%
```

Sweet. 

_[Continue reading part thirty-four.](/posts/2023-02-19-creating-random-test-users
)_