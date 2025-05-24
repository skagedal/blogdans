---
layout: post
title:  "Writing a habit tracker, part 18: Getting the user's date"
---
In the [last post](/posts/2023-01-17-habit-tracker-reading-habits-for-date), we hard coded the date as 2023-01-13. But in the real world, the date is not always 2023-01-13. Most days, it's not. We'd like to show, and act upon, the current date. 

So, `LocalDate.now()`, right? No. That gives us the current date of whatever the timezone the server is configured to. We want the date it is at wherever the user is. 

I happened to see that in [The Big List](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-ann-methods), our request handler can ask for an argument of either a `java.util.TimeZone` or a `java.time.ZoneId`. Rule of thumb: when given a choice between a `java.util.SomeTimeRelatedConcept` and `java.time.SomeTimeRelatedConcept`, choose the latter. The `java.time` API:s are much better designed. 

So now we should just be able to do this:

```java
public class HomeController {
    // ...
    @GetMapping("/")
    ModelAndView getHome(Principal principal, ZoneId zoneId) {
        final var date = LocalDate.now(zoneId);
        return new ModelAndView(
            "home",
            Map.of(
                "date", date,
                "habits", getHabitsForDate(principal, date)
            )
        );
    }
    // ...
}
```

Beautiful. But how does this work? Does it work? How does it know what time zone I'm in? I logged the value of that `zoneId`, and it did say `Europe/Stockholm` for me, which is my time zone ID. 

According to the docs, it's determined by the [LocaleContextResolver](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/LocaleContextResolver.html). What does that do? I fiddled around with the debugger and managed to step myself to the place where that `ZoneId` argument was resolved, and it was using [RequestContextUtils.getTimeZone(HttpServletRequest)](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/support/RequestContextUtils.html#getTimeZone(jakarta.servlet.http.HttpServletRequest)), which was the method that tried to find a LocaleContextResolver and... didn't find one. (It only found a `LocaleResolver` which was not a `LocaleContextResolver` – which is an extended interface with support for various things like time zones.) 

And instead, it selected the system default. Which would be `Europe/Stockholm` since I'm running the server locally, and since I live in Stockholm. (Well, I live in the city of Uppsala; it's practically a suburb to Stockholm, but don't tell anyone from Uppsala I said that.) 

So, it turns out, this doesn't actually work the docs might make you think it does. And for valid reasons, now that I think about it – there simply is no way for the server to know; there is no header that the browser sets that the servlet can look at. The only option (according to [Stack Overflow](https://stackoverflow.com/questions/13/determine-a-users-timezone)) there is to figure out whatever timezone the user's device is set to is through JavaScript. You might try to make some guesses based on IP address and so on, but those will only be just that; guesses. I guess to _really_ know you'd have to ask the user, but that seems excessive as well – I'd be totally happy with knowing whatever time zone their current device is set to.       

The approach that I think I'll be going for is to figure out the time zone ID on the client side and set it on the server with a cookie. Probably, the best way would be something like: 
- do we have a cookie?
  - yes: use it
  - no: send a page that just figures out the time zone with Javascript, sets the cookie and reload 

Or something like that. There is a `CookieLocaleResolver` we can configure, and then it should be able to carry also timezone information. We can configure it by just putting the following in some `@Configuration`-annotated class:

```java
@Configuration
public class Configuration {
    @Bean
    public LocaleResolver localeResolver() {
        return new CookieLocaleResolver();
    }
}
```

But, hmm, I'm a bit confused about how this is all supposed to hang together, and I'm getting bored. Please let me know if you know.  Instead, I'll just be dealing with the cookie manually and skip the `LocaleContextResolver` system.  

In the `HomeController`, I'm reading the zone ID from a cookie, defaulting to `Europe/Stockholm`, and using that to get the current date:

```java
public class HomeController {
    // ...
    @GetMapping("/")
    ModelAndView getHome(Principal principal, @CookieValue(value = "zoneId", required = false) ZoneId zoneId) {
        final var date = LocalDate.now(zoneId);
        return new ModelAndView(
            "home",
            Map.of(
                "date", date,
                "zoneId", zoneId != null ? zoneId : ZoneId.of("Europe/Stockholm"),
                "habits", getHabitsForDate(principal, date)
            )
        );
    }
    // ...
}
```

And then in my `home.html` I'm just adding this little bit of JavaScript in the `head` of the `html` to se the cookie:

```html
<script>
    document.cookie = 'zoneId=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
</script>
```

This means that at the first view of the page, we'll need to reload it to get the right time zone. Not very nice, but let's view this part as a proof of concept; it'll do for now. If we add that to the login page later, and make the cookie live for at least as long as the session, we should be pretty good. (Also, there are libraries we could use that tries various fallback approaches if that `Intl` API is not available, apparently it's new-ish, but for now I'll just support modern browsers.)  

I'm adding this to the bottom of the page as well to just kind of remind me of this, and so I can be aware of what I'm actually looking at:   

```html
<p>Timezone ID: <span th:text="${zoneId}">Unknown</span></p>
```

_[Continue reading part nineteen.](/posts/2023-01-19-habit-tracker-achieving-some-habits)_