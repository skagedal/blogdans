---
layout: post
title:  "Writing a habit tracker, part 13: Reading habits from the repository"
---

In the [last post](/posts/2023-01-12-habit-tracker-making-habits-page-work) I wrote a `HabitsController` that put some static data in a model Map that gets inserted into our HTML page. Now I want to actually use the `HabitRepository` (whoa, inconsistent use of singular/plural in my class names here) that I created in [part six](/posts/2023-01-06-habit-tracker-records-and-other-improvements).

Easy, just inject it the controller. At the very core of Spring is a Dependency Injection framework, which can even be used as a standalone thing (I explored it briefly [here](/posts/2021-03-15-micronaut-and-graalvm)).  The least-amount-of-typing way is by using the `@Autowired` annotation (as I did [earlier](/posts/2023-01-05-habit-tracker-repository) in test suite):

```java
@Controller
public class HabitsController {
    @Autowired
    private HabitRepository habits;
    // ...
}
```

This is called "field injection", and it works. But hey, what's this – IntelliJ IDEA puts a squiggly yellow line on the annotation. Hovering over it tells me this:

<figure>
<img src="/images/habit-tracker/field-injection-not-recommended.png" alt="Screenshot of IntelliJ IDEA, saying that field injection with @Autowired is not recommended." />
</figure>

"Field injection is not recommended." It would be really sweet if it would also link to some page, explaining in more detail why this is. But I think I know why, and I agree. If I press Option-Enter (on Mac), it offers me the quick fix "Create constructor HabitsController(HabitsRepository)", and agreeing with that, I press enter and my code gets transformed to:

```java
@Controller
public class HabitsController {
    private final HabitRepository habits;

    public HabitsController(HabitRepository habits) {
        this.habits = habits;
    }
    // ...
}
```

This gives us the compile-time guarantee that when we have a `HabitsController`, it always has a habit repository. (Well, it could still be `null` if that's what we gave the constructor – I want to discuss this in some later post on what we could do to guard against that – but it protects against some common mistakes.) And it doesn't change during the lifetime of the controller. I find that just generally preferring `final` and immutability-by-default makes code simpler to reason about and protects against some common bugs. 

So that's what we do. And then we want to use our HabitRepository to list the habits of a specific user. Since the field in the `habits` table that connects it to a user is called `owned_by`, we just add this to the `HabitRepository` interface:

```java
public interface HabitRepository extends CrudRepository<Habit, Long> {
    List<Habit> findAllByOwnedBy(String user);
}
```

(Maybe it was a weird choice to name it `owned_by` instead of just `user`. Kind of nice to clarify the _relation_, though.)

Then, we need to figure out who the authenticated user is. Looking at the [big list](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-ann-methods) of possible method arguments to, and return values from, handler methods that we mentioned in the previous post, I find this:

> **`java.security.Principal`**:
> Currently authenticated user — possibly a specific `Principal` implementation class if known.
>
> Note that this argument is not resolved eagerly, if it is annotated in order to allow a custom resolver to resolve it before falling back on default resolution via `HttpServletRequest#getUserPrincipal`. For example, the Spring Security `Authentication` implements `Principal` and would be injected as such via `HttpServletRequest#getUserPrincipal`, unless it is also annotated with `@AuthenticationPrincipal` in which case it is resolved by a custom Spring Security resolver through `Authentication#getPrincipal`.

Umm, a lot to unpack there. [Baeldung explains](https://www.baeldung.com/get-user-in-spring-security) some of it, but for now it seems I can just ask for the `Principal`, which has a `getName()` method I can use to get the username of the authenticated user. 

And thus, we do this in our request handler:

```java
public class HabitsController {
    // ...
    
    @GetMapping("/habits")
    ModelAndView getHabits(Principal userDetails) {
        return new ModelAndView(
            "habits",
            Map.of(
                "habits",
                habits.findAllByOwnedBy(userDetails.getName())
            )
        );
    }
}
```

Coolio! We can now run the app and find that it successfully lists no habits! We don't have a functioning "Add" button yet, but we can still test that it works by going to the database and run:

```sql
INSERT INTO habits (description, owned_by) 
    VALUES ('Be outside for 30 minutes', 'admin');
```

I now have an interface where I can list the habit I committed to – and have so far also followed, I would like to point out! – in the first part of this series:


<figure>
<img src="/images/habit-tracker/your-habits-be-outside-for-30-minutes.png" alt="Screenshot of the hahabit habits page, listing my first habit." />
</figure>

NICE.

_[Continue reading part fourteen.](/posts/2023-01-14-habit-tracker-spring-session-jdbc)_
