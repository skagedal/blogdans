---
layout: post
title:  "Writing a habit tracker, part 6: Records and other repository improvements"
---

In the [previous post](/posts/2023-01-05-habit-tracker-repository) in my habit tracker series, I wrote:

> I'd really like the `User` class to be a `record` – the new thing from Java 14, an immutable data type with accessors and default implementation of things like `hashCode` and `equals`. But I doubt Spring Data supports that. Let's try it later perhaps. 

You know what – I was wrong! It works great! My `User` is now a record:

```java
@Table(name = "users")
public record User(
    @Id
    Long id,
    String email,
    String password,
    LocalDateTime createdAt
) { }
```
I'm very happy! 

I'm pretty sure that Hibernate/JPA entities do not support this ([this blog post](https://thorben-janssen.com/java-records-hibernate-jpa/) confirms this, and explains why). Spring Data JDBC [explicitly does](https://docs.spring.io/spring-data/jdbc/docs/current/reference/html/#mapping.object-creation), though.

I picked "Spring Data JDBC" a little bit on instinct, but now I [read up](https://docs.spring.io/spring-data/jdbc/docs/current/reference/html/#jdbc.why) a bit more on what it is – and excuse me while I quote a lengthy passage here:

> The main persistence API for relational databases in the Java world is certainly JPA, which has its own Spring Data module. Why is there another one?
>
> JPA does a lot of things in order to help the developer. Among other things, it tracks changes to entities. It does lazy loading for you. It lets you map a wide array of object constructs to an equally wide array of database designs.
>
> This is great and makes a lot of things really easy. Just take a look at a basic JPA tutorial. But it often gets really confusing as to why JPA does a certain thing. Also, things that are really simple conceptually get rather difficult with JPA.
>
> Spring Data JDBC aims to be much simpler conceptually, by embracing the following design decisions:
>
> If you load an entity, SQL statements get run. Once this is done, you have a completely loaded entity. No lazy loading or caching is done.
>
> If you save an entity, it gets saved. If you do not, it does not. There is no dirty tracking and no session.
>
> There is a simple model of how to map entities to tables. It probably only works for rather simple cases. If you do not like that, you should code your own strategy. Spring Data JDBC offers only very limited support for customizing the strategy with annotations.

I think that's perfect for this project! This looks like something to watch out for, however:

> Saving an aggregate can be performed with the CrudRepository.save(…) method. If the aggregate is new, this results in an insert for the aggregate root, followed by insert statements for all directly or indirectly referenced entities.
> 
> If the aggregate root is not new, all referenced entities get deleted, the aggregate root gets updated, and all referenced entities get inserted again. Note that whether an instance is new is part of the instance’s state.

Now I feel like I want to just finish off this repository layer, with the two other tables, `habits` and `completions`. But actually, I think there's a few things we can improve from the way ChatGPT structured our schema. One thing is that it picked the `TIMESTAMP` type for our `created_at` column. But there are actually some [variants](https://www.postgresql.org/docs/current/datatype-datetime.html) of that – there is "timestamp without timezone" (a.k.a `TIMESTAMP`) and `timestamp with timezone" (a.k.a `TIMESTAMPTZ`). Which one do we want? 

This is a bit confusing. (Maybe just in my mind. But there, it's confusing.) To me, a "timestamp" is simply an instant in time, no matter where on earth you or anyone else happened to be when that instant occured. So... is that "with" or "without" timezone? 

It turns out that "timestamp with timezone" really means that it is stored in UTC, while "timestamp without timezone" means that it is stored in whatever happened to be the timezone that the database configuration is set to. [This blog post](https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-timestamp/) explains well, but the bottom line, to me, is that `TIMESTAMPTZ` is the type we typically want for timestamps. And – no, ChatGPT, we don't want `LocalDateTime` as the Java-mapped type. `Instant` is better.

Also, regarding timestamp. Instead of setting it to the current time in Java code, we can make PostgreSQL enforce it to be set to the current instant by using `DEFAULT NOW()`. To me, that's... I don't know, cooler? Cleaner? Better? One of those. 

So, with this, this is now how my `habits` table is going to look like:

```sql
CREATE TABLE habits
(
    id          SERIAL PRIMARY KEY,
    description TEXT,
    owned_by    INTEGER,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT owned_by_fk FOREIGN KEY (owned_by) REFERENCES users (id)
);
```

We use a serial integer (1, 2, 3...) for id, just like with `users`, as the AI suggested. (Let's discuss that choice at some later point.) And we have a foreign key constraint toward the `users` table. 

Our corresponding record looks like this:

```java
@Table(name = "habits")
public record Habit(
    @Id Long id,
    Long ownedBy,
    String description,
    @ReadOnlyProperty Instant createdAt
) {
    public static Habit create(Long ownedBy, String description) {
        return new Habit(null, ownedBy, description, null);
    }
}
```

The `@ReadOnlyProperty` annotation means that, just like with `@Id`, we don't want to ever try to INSERT or UPDATE the value of this column, it should just be whatever the database set it to be. 

We also add a static factory method `create`, to be able to cleanly create a Habit only by specifying the properties we should be able to specify from code.  

Then we have a `HabitRepository`, just like the `UserRepository`:

```java
public interface HabitRepository extends CrudRepository<Habit, Long> {
}
```

I also changed my `users` schema similarly. Normally, this would of course have to be done by adding a new migration that somehow changes the schema, but we haven't deployed anything yet so can just mess around freely.  

Let's continue tomorrow with the `completions` table, and I think we will call it `achievements` instead.

_[Continue reading part seven.](/posts/2023-01-07-habit-tracker-achievements)_
