---
layout: post
title:  "Writing a habit tracker, part 7: Achieving habits"
---

So, finally, our last table is the one where we track whether we actually did the thing on a specific day. I'm gonna call this `achievements`, and it'll look like this to start with:

```sql
CREATE TABLE achievements
(
    id              SERIAL PRIMARY KEY,
    achieving_habit INTEGER,
    date            DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT achieving_habit_fk FOREIGN KEY (achieving_habit) REFERENCES habits (id),
    UNIQUE (achieving_habit, date)
);
```

You might think that it's duplication to have both `date` and `created_at`, but those are different things. `date` is the date that should be marked as achieved, and `created_at` is exactly when this row was created. We might allow to retrospectively track achievements. (And I think we should. Currently, until my own system is ready for use, I am using an app called [Done](https://apps.apple.com/us/app/done-a-simple-habit-tracker/id1103961876). It does not allow this, and I find it annoying. Please drop me a note if you have any advice for awesome habit trackers, by the way!)

I also debated a bit with myself whether I want to have that `UNIQUE` constraint. I do want to enforce that logic – these should be daily habit, and you should only be able to achieve each habit once every day. Either it's achieved or not. But we could have enforced that constraint in application logic instead. I guess there are pros and cons to both approaches. But for now, I'm going with this.

So, I created an AchievementRepository as well, and I think this is going to be it for the store layer for now!

_[Continue reading part eight.](/posts/2023-01-08-habit-tracker-serving-some-web)_
