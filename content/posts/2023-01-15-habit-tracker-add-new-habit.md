---
layout: post
title:  "Writing a habit tracker, part 15: Adding a new habit"
---

In [part 13](/posts/2023-01-13-habit-tracker-reading-from-repository), we implemented the listing of our habits from the database. But we can't yet add any new habits. There's an "Add" button there, but it doesn't do anything. Let's make it do something. 

The common thing to do these days is to have a REST API that you post things to. That however requires Javascript on the web page, and I'm trying to not have that yet, for simplicity. Good old forms are still legal, let's use those! We already have, actually – the login form. We [removed](https://github.com/skagedal/hahabit/commit/e8960e3ba06fcff9c4ca46d564317a81538f4366) the custom one and replaced it with the default Spring Boot one, but we could take inspiration from it on how to build a Thymeleaf-enabled form. Let's do it like:

```html
<form th:action="@{/habits}" method="post">
    <label>Add new habit: <input type="text" name="description"></label>
    <input type="submit" value="Add">
</form>
```

So, it'll post the form as form-encoded to the `/habits` POST-endpoint on our service. The simplest thing I could think of to start with is just adding this to our controller:

```java
public class HabitsController {
    // ...
    @PostMapping("/habits")
    void addHabit() {
        System.out.println("Add a habit!");
    }
    // ...
}
```

It works great – I can confirm that "Add a habit!" now gets printed on the console when we hit that button. But we want it to also get some data from the form, so I look once again in that [big list of request handler method parameters](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-ann-methods). And then I notice that I'm feeling confused and overwhelmed, and decide to just try a couple of things. 

Let's try this:

```java
    @PostMapping("/habits")
    void addHabit(Habit habit) {
        System.out.println("Add a habit: " + habit);
    }
```

Cool, that works! I type "Very good habit" in the text field, press "Add", and my Java service logs:

```
Add a habit: Habit[id=null, ownedBy=null, description=Very good habit, createdAt=null]
```

There's a lot of `null` in there. I don't feel so good about that. I've already accepted that some of those (`id` and `createdAt`) will sometimes be `null` because of the way Spring Data works – to create a new `Habit`, we let those things be null, we save it and then it gets created in the database[^1]. But if I have a language where I could properly annotate things as nullable or not, then I would want as few things as possible to be nullable. 

Let's explore some alternatives. One thing I could think of is that there might be some annotation we could add somewhere so that the authenticated user name somehow gets injected in the `ownedBy` field. If anyone knows of a way, let me know. I could also just do this:

```java
    private record HabitFromForm(String description) {}

    @PostMapping("/habits")
    void addHabit(HabitFromForm habit) {
        System.out.println("Add a habit: " + habit);
    }
```

We then get a little clean object, representing the actual data posted in the form, which I feel is kind of _right_. Also just showing this example to illustrate that creating little data types in Java is now much cheaper than it used to be. But in fact, I think I'm gonna just go with this signature: 

```java
    @PostMapping("/habits")
    void addHabit(String description) {
        System.out.println("Add a habit: " + description);
    }
```

This also works, and then I can create my `Habit` model with the right user – getting it from the `Principal` as we did in the `getHabits` endpoint – and save it in the repository:

```java
    @PostMapping("/habits")
    void addHabit(String description, Principal principal) {
        habits.save(Habit.create(
            principal.getName(),
            description
        ));
    }
```

We can now type a habit name, press "Add", load the "habits" page again and boom, there it is! Yay! 

Obviously, we shouldn't have to reload anything – it should just show up. Can we perhaps just return a `ModelAndView`[^2], just like with the `getHabits` handler?

```java
    @PostMapping("/habits")
    ModelAndView addHabit(String description, Principal principal) {
        habits.save(Habit.create(
            principal.getName(),
            description
        ));
        return new ModelAndView(
            "habits",
            Map.of(
                "habits",
                habits.findAllByOwnedBy(principal.getName())
            )
        );
    }
```

BOOM, that works! I can now just WRITE the name of a habit, PRESS that flippin' Add button, and then it's just RIGHT THERE IN THE LIST! AMAZING!

> Simon, why are you getting so excited by something you first did with a CGI-script in Perl almost 30 years ago?

I don't know and I don't care (who are you?).

Anyway, I'm gonna just refactor a bit to not repeat that whole ModelAndView-block in two methods, and that's my commit.

There is a potential problem here I thought I should mention. So, first we save some stuff to the database, and then we read some stuff to the database. Since we're using Spring Data JDBC, our `save`  and `find...` methods always represent actual queries to the database, not some in-memory cache. One common approach to handle scale when applications get big is to use database replicas for read operations, so that we spread the work a bit and don't let the slower writes hog the database connections for quicker reads. In such a setup, we might find that when we read our habits with `habits.findAllByOwnedBy(...)`, we're reading from a database that does not just yet have this new `habits` row we just inserted, and so it'll look stupid for the user. 

There are various ways around this, one of which I guess would be to use something like Spring Data JPA instead, which if I understand the passage I quoted [in part six](/posts/2023-01-06-habit-tracker-records-and-other-improvements) of this series handles this kind of stuff for us, at the cost of some more conceptual complexity.

For now, I am very happy with just using my single PostgreSQL server for this "this could have been a text file" use case, and am going to leave it at that. 

### Notes

[^1]: As a side node – when we use `repository.save(habit)`, we get a new object returned, and that will have the `id`, but not the `createdAt` filled in. How does it even get the id...? I should investigate that at some point.
[^2]: While this works, a better pattern to use here is Post/Redirect/Get, as discussed in [part nineteen](/posts/2023-01-19-habit-tracker-achieving-some-habits), as you avoid the annoying "resubmit form data?" popup when reloading.  

_[Continue reading part sixteen.](/posts/2023-01-16-habit-tracker-listing-your-achievements)_