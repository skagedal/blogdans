---
layout: post
title:  "Writing a habit tracker, part 12: Connecting the model"
---

In the [previous post](/posts/2023-01-11-habit-tracker-the-habits-page), I created an HTML template with Thymeleaf, and now we want to inject some actual data from our app into that.  

I spent way too much time trying to figure out how that works, by haphazardly googling around and looking at examples, until I read found the appropriate chapter in the [Spring Framework Reference](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-controller). 

I do think the way these controllers seem to be typically written is a bit strange. The thing is, I've seen a few Spring REST API controllers before, and they might look a little something like this:

```java
@RestController
public class HabitsApiController {
    @GetMapping("/api/habit/{id}")
    Habit getHabit(@PathVariable Long id) {
        return new Habit(id, "simon", "Practice every day", Instant.now());
    }

    @GetMapping("/api/habit/{id}/description")
    String getHabitDescription(@PathVariable Long id) {
        return "Practice every day";
    }
}
```

A neat and simple model, where the inputs to the method represents the request, and the return value represents the response. Typically, you'd do something rather like the first example method (`getHabit`) and return a model object, which gets serialized into JSON. But if you want to, you can return a string directly like in the second example method (`getHabitDescription`), and it'll be returned with a `text/plain` content-type.

However – in the Spring Web view controller examples, where we bring a view and a model together to form a web page, this is how it looks: 

```java
@Controller
public class HelloController {
    @GetMapping("/hello")
    public String handle(Model model) {
        model.addAttribute("message", "Hello World!");
        return "index";
    }
}
```

This code is weird to me for two reasons:
* We just randomly return some string here, with very little clue for the reader of what will happen with that string – that it will be used to look up a HTML file in the `resources` folder. And with behavior that contradicts the behavior of a `@RestController`, an annotation which extends `@Controller`. This to me feels like a violation of the [Open–closed principle](https://en.wikipedia.org/wiki/Open%E2%80%93closed_principle), at least in spirit. Not that I believe that any of those principles are The Law that must always be followed, but they can be a good illustration of why some API designs are simply confusing. 
* Instead of returning our model in some representation, we get a reference to some Model as input, and modify it. This feels really weird. Almost like a good old C function where the authors where like "oh shit, we already have a return value and need to return something else, what do we do now? I guess we'll let the caller send in a pointer to where the other thing will get returned".

The difference between the behavior of `@RestController` and `@Controller` here is explained by the former behaving as if the annotation `@ResponseBody` is added to all methods. You could add this manually to a method in a plain `@Controller`-annotated class to get the return-value-is-response-body behavior.

But anyway – the good news here (although it's also a bit bad) is that Spring seems to follow the There Is More Than One Way To Do It school of thought. There are like a million variants of these request-mapping handler methods can take parameters and return values – see the [Handler Methods](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-ann-methods) chapter in the framework reference. This includes returning a `ModelAndView` object, which makes me a lot happier! The above example becomes this:

```java
@Controller
public class HelloController {
    @GetMapping("/hello")
    public ModelAndView handle() {
        return new ModelAndView(
            "index",
            Map.of("message", "Hello World!")
        );
    }
}
```

A lot better! (Although isn't it a _bit_ weird that it's called `ModelAndView` – not `ViewAndModel` – and then the view comes before the model in the arguments? Yes, it is a _bit_ weird.)

So, back to our app now. We're removing the programmatic way of adding a view controller we added before, i.e. the line that looked like this:

```java
public class MvcConfig implements WebMvcConfigurer {
    public void addViewControllers(ViewControllerRegistry registry) {
        // ... this one:
        registry.addViewController("/habits").setViewName("habits");
    }
}
```

And then we add a new, annotation-based controller – first off with some static data just do confirm that things are working:

```java
@Controller
public class HabitsController {
    @GetMapping("/habits")
    ModelAndView getHabits() {
        return new ModelAndView(
            "habits",
            Map.of(
                "habits", List.of(
                    Habit.create("simon", "Do thing"),
                    Habit.create("simon", "Do other thing")
                )
            )
        );
    }
}
```

Great, it looks nice – we get a list with two items, "Do thing" and "Do other thing". 

Should we also add the actual reading from the repository today, or should that wait until tomorrow? It can wait until tomorrow. We will do it tomorrow. 

_[Continue reading part thirteen.](/posts/2023-01-13-habit-tracker-reading-from-repository)_
