---
layout: post
title: "Finalize API:s to track habits"
summary: "We discuss how we can use the IDE:s refactoring tools to move logic from the web controller to the service layer, and then reuse that from the API controller to finish the habit tracking API:s."
---

Finally, let's add those last API:s that we added tests for in the previous post. 

This will be an API-ification of the "achievement" functionality that we already have in the web app, as described in parts [sixteen](/posts/2023-01-16-habit-tracker-listing-your-achievements) through twenty. So, we have the logic for this already, but it lives in the `HomeController`. We need to refactor a bit. 

The recommended architecture for Spring Boot is to have a _controller_ for each entity, and then have the controller call a _service_ for the more business logic related stuff. So, we'll do that.

When I refactor I like to do as much as possible using the safe refactoring tools of my IDE, IntelliJ IDEA. It gives me a nice fuzzy feeling when you can refactor and know it's correct, plus if you learn it well, it can speed up common tasks.

Honestly, that's also a bit why I don't really believe in the kind of thinking where every line of code has to follow the Best Practices, the Right Way, from the get-go. For example, the fact that I put this code in the `HomeController` first. Someone who read that maybe went: "Noooo! That should be in the _service_ layer!". 

But instead of stressing over the structure of the code, I think you should get good at _changing_ the code. Optimize for change, and learn tools that help you change things.  

So. Let's refactor. 

First, we'll create the new component, `HabitService`:

```java
package tech.skagedal.hahabit.service;

import org.springframework.stereotype.Service;
import tech.skagedal.hahabit.repository.AchievementRepository;
import tech.skagedal.hahabit.repository.HabitRepository;

@Service
public class HabitService {
    private final HabitRepository habits;
    private final AchievementRepository achievements;

    public HabitService(HabitRepository habits, AchievementRepository achievements) {
        this.habits = habits;
        this.achievements = achievements;
    }
}
```

We inject it in the `HomeController`:

```java
@Controller
public class HomeController {
    private final HabitService habitService;
    private final HabitRepository habits;
    private final AchievementRepository achievements;

    public HomeController(HabitService habitService, HabitRepository habits, AchievementRepository achievements) {
        this.habitService = habitService;
        this.habits = habits;
        this.achievements = achievements;
    }

    // ...
}
```

Now we want to move the `getHabitsForDate` method from `HomeController` to `HabitService`. We can use the refactoring "Move instance method" to do that.

The method looks like this:

```java
private List<HabitForDate> getHabitsForDate(Principal principal, LocalDate date) {
    return habits.findHabitsForDate(principal.getName(), date);
}
```

By pressing F6 with the cursor in it, we get this dialog:

![Move instance method dialog from IntelliJ IDEA](/images/habit-tracker/move-instance-method.png)

We want `habitService` to be the target, so we select that as the instance expression. We press "Refactor", and get this little dialog:

![Move instance method dialog from IntelliJ IDEA - problems were found](/images/habit-tracker/move-instance-method-problems-were-found.png)

We're ok with that as well, and press "Continue". 

Now we get this method in `HabitService`:

```java
public List<HabitForDate> getHabitsForDate(Principal principal, LocalDate date, HomeController homeController) {
    return homeController.habits.findHabitsForDate(principal.getName(), date);
}
```

We just have to do one small manual edit, which is to remove `homeController.` so it instead uses its own `habits` field: 

```java
public List<HabitForDate> getHabitsForDate(Principal principal, LocalDate date, HomeController homeController) {
    return habits.findHabitsForDate(principal.getName(), date);
}
```

We can then get rid of the unused `HoemController` parameter with a safe refactoring by pressing Option+Enter/Alt+Enter on it and selecting "Safe delete homeController".

What's nice about this way of working – rather than cutting and pasting – is that we know for sure that all the call sites were updated correctly.

We do in a similar way with the other service-level methods in `HomeController`,  `userOwnsHabitsWithId` and most of the `achieve` method.  Now we can just add the glue in `HabitsApiController`:

```java
@RestController
public class HabitsApiController {
    /// ,,,
    
    @GetMapping("/api/habits/{date}")
    ListHabitsForDateResponse listHabitsForDate(Principal principal, @PathVariable LocalDate date) {
        return new ListHabitsForDateResponse(
            habitService.getHabitsForDate(principal, date)
        );
    }

    private record ListHabitsForDateResponse(List<HabitForDate> habits) { }

    @PostMapping("/api/habits/{date}/{habitId}/achieve")
    EmptyResponse achieveHabit(Principal principal, @PathVariable LocalDate date, @PathVariable Long habitId) {
        habitService.achieve(
            principal,
            date,
            habitId
        );
        return new EmptyResponse();
    }

    private record EmptyResponse() { }
}
```

And we're done! Tests are now green. And test coverage has risen to 92.74%.

_[Continue to part fourty.](/posts/2023-02-25-changing-names)_
