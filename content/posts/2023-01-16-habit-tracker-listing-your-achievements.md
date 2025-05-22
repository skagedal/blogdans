---
layout: post
title:  "Writing a habit tracker, part 16: Listing your achievements"
---

This is part sixteen of my Habit Tracker series, which started [here](/posts/2023-01-01-writing-a-habit-tracker). I parts [eleven](/posts/2023-01-11-habit-tracker-the-habits-page), [twelve](/posts/2023-01-12-habit-tracker-making-habits-page-work), [thirteen](/posts/2023-01-13-habit-tracker-reading-from-repository) and [fifteen](/posts/2023-01-15-habit-tracker-add-new-habit) we worked on the page where we can list our habits and add new ones. There are more things we could do regarding this management, like deleting and editing habits, and handling errors, but I'm eager to soon get going with the part where we actually _achieve_ (as we called it, if you remember from [part seven](/posts/2023-01-07-habit-tracker-achievements)) our daily habits!  

This is going to be in the main "home" screen of app, as it is what you will do most often. It'll show the current date, to just kind of clarify what day we are "achieving". It will list your habits and, if they have been achieved for this day, display a green checkmark. If not, present a way to achieve them. 

So we need to figure out how to render HTML elements conditionally with Thymeleaf. Let's deal with that first, before we add any buttons or anything. [Baeldung tells us](https://www.baeldung.com/spring-thymeleaf-conditionals) that we can use the `th:if` and `th:unless` tags. So let's try this as the `home.html` template:

```html
<!DOCTYPE html>
<html xmlns:th="https://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>hahabit</title>
</head>
<body>
<h1>hahabit</h1>
<h2 th:text="${date}">1970-01-02</h2>
<ul>
    <li th:each="habit: ${habits}">
        <span th:if="${habit.achieved}">✅ <span th:text="${habit.description}">Take a walk</span></span>
        <span th:unless="${habit.achieved}">😐 <span th:text="${habit.description}">Take a walk</span></span>
    </li>
</ul>

<p><a th:href="@{/habits}">Manage my habits</a></p>
</body>
</html>
```

The achieved habits get a ✅, the unachieved get a 😐. 

The thing with this kind of system is that... now you gotta learn some new little programming language. Or several. There's the "language" of which th-tags you can use and how, then there's the language of those expressions within `${ ... }`, which for the [Spring-dialect of Thymeleaf](https://www.thymeleaf.org/doc/tutorials/3.1/thymeleafspring.html) are "SpEL" (Spring Expression Language, we'll meet this one again) expressions, while for non-Spring-integrated Thymeleaf they are [OGML](https://commons.apache.org/proper/commons-ognl/language-guide.html) expressions.  

I always feel in those situations that, like, I already have a programming language, it's a pretty nice programming language, why can't I just use that? I know how `if` statements work and _lots_ of other cool things! 

We could of course totally put HTML together in code instead. That can get rather tedious as well, though, but there are libraries that help. [j2html](https://j2html.com/) looks pretty nice. It has a functional interface, which is nice in some ways, but often I feel that a imperative, "DSL" syntax like the ones you can do in languages like Kotlin or Swift work better for building documents and UI:s. Although I got to say that [kotlinx.html](https://github.com/kotlin/kotlinx.html) looks kind of ugly. [This approach](https://github.com/benjiman/java-html-dsl2) in Java with lambdas everywhere is interesting, also I was not aware that you could use `$` as a variable name in Java! 

Honestly though, the best approach for this of problem, combining readability, flexibility and recognizability is probably when you can truly mix the host programming language with the markup. PHP got this (and only this) right, and I find this aspect of [React](https://reactjs.org/) (with JSX) to work really well.

But, hey, this is fine! This will be fine. Nothing wrong with learning a new little language. I like languages. 

So. Anyway. Let's now hook up some model data to this. Now we don't just want the `Habit`, we want the habit with achievement data for a specific date. Let's call that `HabitForDate` and model it like this:

```java
public record HabitForDate(
    Long habitId,
    String description,
    LocalDate date,
    @Nullable Long achievementId
) {
    public boolean isAchieved() {
        return achievementId != null;
    }
}
```

I'm thinking we will want to have the `achievementId` for some later purposes. I think. Maybe not. But let's do this for now. And then just to test it, let's try this:

```java
@Controller
public class HomeController {
    @GetMapping("/")
    ModelAndView getHome(Principal principal) {
        return new ModelAndView(
            "home",
            Map.of(
                "date", "2023-01-16",
                "habits", List.of(
                    new HabitForDate(1L, "Eat breakfast", LocalDate.now(), 1L),
                    new HabitForDate(2L, "Shower", LocalDate.now(), null)
                )
            )
        );
    }
}
```

Yes – very nice, the "Eat breakfast" habit shows up as having been achieved, but I haven't showered yet. Nice.

Also, I'm now removing the `MvcConfig` class where we did programmatic setup of some view controllers, as they all now have their own `@Controller`-annotated class. And as we now also the home view to be protected, we're mostly reverting back to the default Spring Security setup. [Like this.](https://github.com/skagedal/hahabit/commit/1ff145cd4cea5804830a25270877d79d0460501e) Nice.

Let's read from the repository tomorrow.

_[Continue reading part seventeen.](/posts/2023-01-17-habit-tracker-reading-habits-for-date)_