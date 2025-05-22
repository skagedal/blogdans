---
layout: post
title:  "Writing a habit tracker, part 17: Reading achievement data"
---

Let's continue the work from [part sixteen](/posts/2023-01-16-habit-tracker-listing-your-achievements) of the habit tracker series – listing our daily achievements.

For each habit, on a certain date, we want to find the achievements for it. Since we can't add achievements yet, let's prepare some test data by going into the database and executing:

```sql
INSERT INTO habits (description, owned_by) VALUES ('Eat food', 'admin');
INSERT INTO habits (description, owned_by) VALUES ('Shower', 'admin');
INSERT INTO achievements (achieving_habit, date) VALUES (10, '2023-01-13');
```

So, how do we get our `HabitForDate` list using Spring Data JDBC? We'll start with a naïve approach. Let's just first refactor the home handler to extract that into a method:

```java
public class HomeController {
    @GetMapping("/")
    ModelAndView getHome(Principal principal) {
        return new ModelAndView(
            "home",
            Map.of(
                "date", "2023-01-13",
                "habits", getHabitsForDate(
                    principal,
                    LocalDate.of(2023, 1, 13)
                )
            )
        );
    }
}
```

And then we inject the `HabitRepository` and the `AchievementRepository` in the `HomeController`:

```java
public class HomeController {
    private final HabitRepository habits;
    private final AchievementRepository achievements;

    public HomeController(HabitRepository habits, AchievementRepository achievements) {
        this.habits = habits;
        this.achievements = achievements;
    }
    // ...
}
```

We add a method to the `AchievementRepository` interface, that Spring Data will auto-implement for us:

```java
public interface AchievementRepository extends CrudRepository<Achievement, Long> {
    // ...
    Optional<Achievement> findOneByAchievingHabitAndDate(Long id, LocalDate date);
}
```

Then we can write the `getHabitsForDate` method like this:

```java
public class HomeController {
    // ...
    private List<HabitForDate> getHabitsForDate(Principal principal, LocalDate date) {
        return habits.findAllByOwnedBy(principal.getName())
            .stream()
            .map(habit -> new HabitForDate(
                habit.id(),
                habit.description(),
                date,
                achievements.findOneByAchievingHabitAndDate(habit.id(), date)
                    .map(Achievement::id)
                    .orElse(null)
            ))
            .toList();
    }
}
```

This works, but it's a bit lame. We will be doing first one SELECT query to fetch the habits, then one SELECT for each habit to get the achievements. This is sometimes called the [select N+1 problem](https://stackoverflow.com/questions/97197/what-is-the-n1-selects-problem-in-orm-object-relational-mapping). The N here will be small, though, if you expect each user to have just a few habits. I mean, I have a hard time maintaining even a single one.  

So, how could we do it as a single query? We could do a `LEFT JOIN` and get all of the user's achievements for all of their habits:

```sql
SELECT habit.id AS habit_id, habit.description, ach.date, ach.id AS achievement_id
FROM habits habit LEFT JOIN achievements ach on habit.id = ach.achieving_habit
WHERE habit.owned_by = 'the-user';
```

But that seems excessive, we're just interested in a single date. We can't add a `AND date = 'the-date'` clause, because that will filter out the habits that haven't been achieved.  

How does one do this? I know I've been in this kind of situation before, but I don't remember what the solution was. Obviously, I'm no SQL guru. But I guess we can use a subquery:

```sql
SELECT habit.id AS habit_id, habit.description,
       (SELECT id as achievement_id
        FROM achievements a
        WHERE a.achieving_habit = habit.id AND a.date = '2023-01-13')
FROM habits habit
WHERE habit.owned_by = 'the-user';
```

Is this better? It seems that it's still, conceptually, N+1 selects – but there's only one round trip to the database, so in that sense it's better, and as we give it as a single job to the database it also at least has a chance to somehow optimize it. So, uhm, probably. 

Either way, I'm curious about how to make Spring Data JDBC execute this query. I'm getting it to work by putting this in `HabitRepository`:

```java
public interface HabitRepository extends CrudRepository<Habit, Long> {
    // ...
    
    @Query("""
        SELECT habit.id AS habit_id, habit.description,
               (SELECT id as achievement_id
                FROM achievements a
                WHERE a.achieving_habit = habit.id AND a.date = :date)
        FROM habits habit
        WHERE habit.owned_by = :user;
        """)
    List<HabitForDate> findHabitsForDate(
        @Param("user") String user,
        @Param("date") LocalDate date
    );
}
```

We have to help out a little bit by telling it what parameters in the query should be replaced by with arguments to the methods, using the `@Param` annotations. Apparently, according to error log message that shows when you don't include those, you can also "use the javac flag -parameters", but messing with compile flags feels unneccessary; I'd rather keep it simple. 

So, here we go again with another language-in-the-language, in this case SQL. No one is escaping SQL, so that's fine – at least we have multiline strings in Java now. Similarly to our discussion with HTML in the [previous post](/posts/2023-01-16-habit-tracker-listing-your-achievements), we could consider options for building SQL queries with type-safe, compile checked Java code – I'm curious to play with [jOOQ](https://www.jooq.org/) at some point. But not today. 

At least Java's got multiline strings now! Cause for celebration!

I'll just go with this for now, although it feels like I'm not really doing things how they're meant to be done (for one thing, it's a bit odd that this method is placed in the `HabitRepository` when it has nothing to do with the generic types used in this repository). But whatever, it works. 

_[Continue reading part eighteen.](/posts/2023-01-18-habit-tracker-getting-the-users-date)_