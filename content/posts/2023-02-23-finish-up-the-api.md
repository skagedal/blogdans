---
layout: post
title: "Adding tests for the API:s to track habits"
summary: "The final API:s to get feature parity with the web app are first described and then implemented tests for."
---
We should finish the API:s so that they achieve feature parity with the web app. The lacking functionality is to be able to fetch the daily status of each habit, and to track a habit as having been achieved. 

I'm thinking the first will be at a `GET` endpoint at `/api/habits/{date}`, where `{date}` is written in ISO format. So today would be `/api/habits/2023-02-23`. 

And then you would achieve a habit – and I am really starting to wonder why I didn't just call that to "track" a habit – by posting to `/api/habits/{date}/{habit-id}/achieve` with an empty (but still JSON) body, i.e. `{}`. Is that a weird API? A bit weird, perhaps. 

It will be up to the client to determine what today's date is.  In other words, you'll be able to track days after the fact. Maybe I'll add some limits to that. 

Today, I'll start with just writing the tests for this. 

I'll write some methods to call the endpoints:

```java
public class ApiTests {
    // ...

    private void achieveHabit(String username, Long habitId, String date) {
        record Request() { }
        record Response() { }

        final var response = sendReceiving(
            Response.class,
            POST(
                uri("/api/habits/" + date + "/" + habitId + "/achieve"),
                new Request()
            )
                .header("Authorization", testDataManager.authHeader(username))
                .build()
        );

        assertThat(response.statusCode()).isEqualTo(200);
    }

    private List<HabitForDate> getHabitsForDate(String username, String date) {
        record GetHabitsForDateResponse(List<HabitForDate> habits) { }

        final var response = sendReceiving(
            GetHabitsForDateResponse.class,
            GET(uri("/api/habits/" + date))
                .header("Authorization", testDataManager.authHeader(username))
                .build()
        );

        assertThat(response.statusCode()).isEqualTo(200);
        return response.body().habits;
    }

    // ...
}
```

And then the test becomes:

```java
public class ApiTests {
    // ...

    @Test
    void create_habit_and_achieve_it() {
        final var username = testDataManager.createRandomUser();

        final var habitsBefore = getHabits(username);
        assertThat(habitsBefore).isEmpty();

        createHabit(username, "Go for a walk");

        final var habitsAfter = getHabits(username);
        assertThat(habitsAfter).hasSize(1);
        final var habit = habitsAfter.get(0);
        assertThat(habit.description()).isEqualTo("Go for a walk");

        String date = "2020-01-01";

        // Get habits-for-date before achieving
        final var habitsForDateBefore = getHabitsForDate(username, date);
        assertThat(habitsForDateBefore).hasSize(1);
        final var habitForDate = habitsForDateBefore.get(0);
        assertThat(habitForDate.description()).isEqualTo("Go for a walk");
        assertThat(habitForDate.achievementId()).isNull();

        // Achieve habit
        achieveHabit(username, habit.id(), date);

        // Get habits-for-date after achieving
        final var habitsForDateAfter = getHabitsForDate(username, date);
        assertThat(habitsForDateAfter).hasSize(1);
        final var habitForDateAfter = habitsForDateAfter.get(0);
        assertThat(habitForDateAfter.description()).isEqualTo("Go for a walk");
        assertThat(habitForDateAfter.achievementId()).isNotNull();
    }

    // ...
}
```

The test is failing as expected, as the endpoints are not implemented.

_[Continue to part thirty-nine.](/posts/2023-02-24-finishing-apis)_
