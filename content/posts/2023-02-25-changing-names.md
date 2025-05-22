---
layout: post
title: "Achieving is now tracking"
summary: "We rename the \"achievement\" concept to the more obvious \"tracking\", and discuss why it is sometimes difficult to name and rename things. At least we're wearing clean underwear."
---
So, naming is hard. Every programmer will tell you so. 

Sometimes it's hard because it really is difficult to find a name that matches the abstraction you're creating, without becoming super-clumsy. Sometimes, that's because you're trying to create a way too smart and complex abstraction. 

At other times, you do find what seems to be a good name. But then requirements change and the well-named thing gets different responsibilities, and all of a sudden the name no longer fits.  

Then there are times when you're just stupid.

Back in [part seven](/posts/2023-01-07-habit-tracker-achievements) of the "Writing a habit tracker", I needed a name for the thing you do every day in the application with your habits, you know when you... you complete them... you _achieve_ them, perhaps? That's the best I came up with. But it never felt quite right. 

Well.

As I noted in [part thirty-eight](/posts/2023-02-23-finish-up-the-api), how about just... tracking? I mean, that's what you do. You track your habits. It's a "habit tracker". The name is right there. 

In verb form, it's clear to me that "track" is the word we want. The noun is perhaps a bit more non-obvious, but I think "tracking" will do. You track a tracking. 

### Renaming is hard

Naming is hard, but renaming is hard in a different way.

Internal code constructs like methods and variables are easy to rename, especially in modern IDE:s. In IntelliJ IDEA, I used the search functionality to find all suspects, and then used the Shift+F6 shortcut to rename things. 

Exposed API:s are harder. In a running application with existing clients, you'll have to make sure not to break existing clients. A common strategy would be to add a new API with the good naming, and then deprecate the old one.  

In our case, we just added the API:s and have no clients, so we can just rename them.

How about database tables and columns? 

Again, in a running application where you can't accept any downtime, it would be a bit tricky. I think one reasonable way would be to create a _view_ of the old table with the new name, effectively working as an alias. Then you can change the code to use the new name, and then finally rename it. I have no experience doing this, though. 

In the habit tracker so far, we're fine with downtime. We can just rename it with a migration like this:

```sql
ALTER TABLE achievements
    RENAME TO trackings;

ALTER TABLE trackings
    RENAME achieving_habit TO habit_id;
```

And we're good. 

For some reason the Marge Simpsons quote "at least they're wearing clean underwear" comes to mind ([YouTube link](https://www.youtube.com/watch?v=jHkhexAQXLA)). So that concludes this post. 

_[Continue to part fourty-one.](/posts/2023-02-26-adding-openapi)_
