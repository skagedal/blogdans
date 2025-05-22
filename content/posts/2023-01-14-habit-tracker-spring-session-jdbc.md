---
layout: post
title:  "Writing a habit tracker, part 14: Storing sessions"
---

Before I continue on the habit management, I want to fix a little annoyance. Readers who pay close attention will remember that in [part three](/posts/2023-01-03-habit-tracker-part-three-making-it-run), I wrote:

> I’m going to start with getting the test suite work, because that’s where I want to work most of the time.

And then, since [part eight](/posts/2023-01-08-habit-tracker-serving-some-web), I have been testing things only by running the app. I do find it I rather satisfying to work test-driven, but in some situations, testing things by running can be much more simple and direct. I do however hope to come back to the topic of how to test this stuff soon. 

But now, as I work by writing some code and then restarting the app, there is something really annoying that I'd like to fix, and that is that I keep getting logged out every time I start the app again. Very annoying. 

Also, when I go to production, obviously I don't want people (me...) to get logged out every time I happen to restart the server application. We need to store the sessions somehow. 

Naturally, Spring Session has support for a number of persistence mechanisms, and I'm gonna go with JDBC. No need to add a Redis or anything like that for this little project now. [Here](https://docs.spring.io/spring-session/reference/guides/boot-jdbc.html) is a getting-started guide for this, and it seems to say that I should really just have to add a dependency in `build.gradle`:

```groovy
dependencies {
    // ...
    implementation 'org.springframework.session:spring-session-jdbc'
    // ...
}
```

Really, is that it...? Don't I need a schema also? Or will it just create it automatically? No. When I run this, it fails when trying to store the session after logging in, because there is no `SPRING_SESSION` table. It seems that we _can_ configure it do create the schema automatically, with some configuration:

```properties
spring.session.jdbc.initialize-schema=embedded # Database schema initialization mode.
spring.session.jdbc.schema=classpath:org/springframework/session/jdbc/schema-@@platform@@.sql # Path to the SQL file to use to initialize the database schema.
spring.session.jdbc.table-name=SPRING_SESSION # Name of the database table used to store sessions.
```

But that seems uncool to me. I want all my schema to be created by Flyway (as I described [here](/posts/2023-01-04-habit-tracker-functionality-and-first-migration)). So I'm in a situation ([again](/posts/2023-01-10-habit-tracker-securing-things-2)) where I need to figure out what schema to expect. Fortunately, unlike last time, I could find the [authoritative schemas](https://github.com/spring-projects/spring-session/tree/06eb768721f0deb31d90acc9b5f70bd508dc0ab3/spring-session-jdbc/src/main/resources/org/springframework/session/jdbc) for various SQL dialects and can drop the [PostgreSQL one](https://github.com/spring-projects/spring-session/blob/06eb768721f0deb31d90acc9b5f70bd508dc0ab3/spring-session-jdbc/src/main/resources/org/springframework/session/jdbc/schema-postgresql.sql) into my Flyway resources.

And it worked! 

## But won't this be slow??

It might be, yeah. I guess Spring caches the sessions in memory, but still, smart people often use things like Redis for session storage.

I saw this interesting post called [Just Use Postgres For Everything](https://www.amazingcto.com/postgres-for-everything/) recently [on Hacker News](https://news.ycombinator.com/item?id=33934139). It's written by a guy who calls his web site "Amazing CTO", and his Twitter handle is "King of Coders", so it's gotta be pretty good. But it's interesting, at least to be aware of these alternatives! And there he mentions that instead of using Redis, you can use unlogged tables in PostgreSQL.  

So, maybe in the future if my habit tracker gets, like, _hundreds_ of monthly active users, and session storage starts to become a performance bottleneck, [we could probably just](https://www.compose.com/articles/faster-performance-with-unlogged-tables-in-postgresql/) do something like:

```sql
ALTER TABLE SPRING_SESSION SET UNLOGGED;
ALTER TABLE SPRING_SESSION_ATTRIBUTES SET UNLOGGED;
```

Allright everyone, check back in for tomorrow's episode of Simon writes a Habit Tracker!

_[Continue reading part fifteen.](/posts/2023-01-15-habit-tracker-add-new-habit)_