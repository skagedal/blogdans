---
layout: post
title:  "Writing a habit tracker, part 19: A button to achieve a habit"
---
In [part eighteen](/posts/2023-01-18-habit-tracker-getting-the-users-date), we figured out what date it is, to know what daily achievements to show and act on. Now, finally, let's add the actual button you can push to mark a habit as having been achieved.

In the `home.html` template, we build our habits list like this instead:

```html
<ul>
    <li th:each="habit: ${habits}">
        <span th:if="${habit.achieved}">✅ <span th:text="${habit.description}">Take a walk</span></span>
        <form th:unless="${habit.achieved}" th:action="@{/achieve}" method="post">
            <input type="hidden" name="habitId" th:value="${habit.habitId}">
            <input type="hidden" name="date" th:value="${date}">
            <input type="submit" th:value="${habit.description}">
        </form>
    </li>
</ul>
```

The entries that are yet unachieved will show up as a big button to push, and we submit some hidden inputs to identify what habit and date this corresponds to. 

I'm starting out with a little handler like this:

```java
public class HomeController {
    // ...
    private record AchieveForm(String habitId, LocalDate date) {}

    @PostMapping("/achieve")
    View achieve(Principal principal, AchieveForm achieveForm) {
        System.out.println("Achieve: " + achieveForm);
        return new RedirectView("/");
    }
    // ...
}
```

Actually, I guess instead of sending the hidden fields, I could have done this in a slightly more REST-like fashion by putting these as path parameters. Turns out the syntax to set those [in Thymeleaf](https://www.thymeleaf.org/doc/tutorials/3.0/usingthymeleaf.html#link-urls) is a bit finicky – I would have expected this to work: 

```html
<form th:unless="${habit.achieved}" th:action="@{/habit/${habit.habitId}/${date}/achieve">
    <input type="submit" th:value="${habit.description}"
</form>
```

(Disregard the syntax highlighter doing something weird with that `</`, I don't know why it does that.)


But no, I have to go like this:

```html
<form th:unless="${habit.achieved}" th:action="@{/habit/{habitId}/{date}/achieve(habitId=${habit.habitId},date=${date})}" method="post">
    <input type="submit" th:value="${habit.description}">
</form>
```

Oh well. Still kinda nice I guess, and the handler works just the same, just have to change the mapping a little bit:

```java
@PostMapping("/habit/{habitId}/{date}/achieve")
View achieve(Principal principal, AchieveForm achieveForm) {
    System.out.println("Achieve: " + achieveForm);
    return new RedirectView("/");
}
```

I redirect back to the home screen rather than keeping the URL as `/achieve` because that looks a bit weird – and also, if the user tries to reload, they will get an annoying "do you want to sent form input again?" popup. This is called the [Post/Redirect/Get](https://en.wikipedia.org/wiki/Post/Redirect/Get) pattern, and I should have also used it in [part fifteen](/posts/2023-01-15-habit-tracker-add-new-habit) when we saved new habits. 

The way I send this redirect is by returning `View` directly, which happens to be a `RedirectView`. Simple and clean, I feel? The well-known Java site Baeldung, however, [thinks differently](https://www.baeldung.com/spring-redirect-and-forward):

> The previous approach — using RedirectView — is suboptimal for a few reasons.
> 
> First, we're now coupled to the Spring API because we're using the RedirectView directly in our code.
> 
> Second, we now need to know from the start, when implementing that controller operation, that the result will always be a redirect, which may not always be the case.
> 
> A better option is using the prefix redirect:. The redirect view name is injected into the controller like any other logical view name. The controller is not even aware that redirection is happening.

Hmmm. In my view, this controller is absolutely totally without-a-doubt coupled to the Spring API. We're already importing five other classes from `org.springframework` – and that's fine, I want to be coupled to the Spring framework because I want it to do specific, cool things for me.  There is little use in pretending that it's not and assuming that if I instead return a String with the value `redirect:/`, I am somehow not relying on some specific Spring functionality. 

(Maybe I'm making a fool of myself here, maybe there is a Very Defined Standard For Specifying Redirects As Strings that hundreds of other web frameworks also comply to, if so please let me know.) (Also, there are of course layers in the app that you could and should write in a non-framework-coupled way; I do think that's a great idea.)

And regarding the second point, about "knowing from start" that it will be a redirect – well no, you don't have to return that concrete type, you can return `View` like I did. But also, changing the return types of these request handlers seems like it should be pretty cheap? The framework is calling them for me through reflection; I don't expect to be referencing them myself – not even from the test suite, I think those tests should call it via the API. We'll get back to that. 

But I could of course sort of perhaps identify the feeling that it would be a bit nice and clean if those methods just all returned the same type, identified from the start. We can totally do that:

```java
@PostMapping("/habit/{habitId}/{date}/achieve")
ModelAndView achieve(Principal principal, AchieveForm achieveForm) {
    System.out.println("Achieve: " + achieveForm);
    return new ModelAndView(new RedirectView("/"));
}
```

Sure, let's do that. I'm fine with that. That also helps if we want to add some query parameters or such to the redirect URL, instead of using that _ghastly_ method that Baeldung also uses here and that I ranted about in [part twelve](/posts/2023-01-12-habit-tracker-making-habits-page-work), where you get some kind of Model object as input to the handler and then call setters on that. It's just really, really weird.

_[Continue reading part twenty.](/posts/2023-01-20-habit-tracker-storing-the-achievement)_