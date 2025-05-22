---
layout: post
title:  "Writing a habit tracker, part 4: Functionality and schema"
---

[Part 3](/posts/2023-01-03-habit-tracker-part-three-making-it-run) of my habit tracker series ended with successfully getting these log messages from running the service in the test suite:

```
INFO o.f.c.i.database.base.BaseDatabaseType   : Database: jdbc:postgresql://localhost:49171/hahabit (PostgreSQL 12.12)
INFO o.f.core.internal.command.DbValidate     : Successfully validated 0 migrations (execution time 00:00.016s)
WARN o.f.core.internal.command.DbValidate     : No migrations found. Are your locations set up correctly?
```

The default log output format of Spring Boot crops the fully-qualified class name, which is nice for vertical alignment, but reduces clarity somewhat. Anyway, those are logs from Flyway. [Flyway](https://en.wikipedia.org/wiki/Flyway_(software)) is an open-source database-migration tool. You give it a bunch of migration files that contain SQL statements, and it executes them in order. Then it tracks the state of the latest applied migration, and when there are new migrations to apply, it applies them. This makes it nice and easy to keep several instances of your database schema up to date. For example, the schema of the Testcontainers database that we set up in the previous blog post. 

There are several ways to apply Flyway migrations. You can use the Flyway software separately to apply them. Or you can do it right from your Java service, to be applied when the service starts up. Some smart database people I know (hello, Bobben!) argue that it is conceptually dirty to couple the deployment of your code with the migration of your database schema this way, and instead run it as a separate deployment. This makes things like rollbacks easier to manage. However, for our purposes, it is perfect. And Spring Boot is kind enough to just automatically run Flyway only because it happens to find it on the classpath.       

So, let's add some basic schema! Of... what, exactly? Now might be a good time to discuss what functionality we really want for this thing to support.

## Brief functionality spec

So, here's what I want in this first iteration of `hahabit`. 

As a user, I should be able to:
* Create a daily habit. We only support daily habits. Each habit has a description, and each habit gets an identifier.
* Probably edit and delete those habits as well, the whole CRUD deal.
* Mark a habit as having been completed for a certain day.
* List some stats of when the habit was completed.

That's pretty much it for now.

## Our tables

We should probably have at least three tables: 

* `users`, that keeps track of our users. (Although for foreseeable future, it'll just be me.)
* `habits` that keeps track of our habits.
* Then the table that keeps track of the completion of our habits... uh, does anyone have a good suggestion for what to call that? Let's call it `completions` for now. 

I'm really making this up as I go. I've mostly used MySQL in the past couple of years, last time I used PostgreSQL was many years ago, when I wrote a little blogging software. (Many blogs ago.) So I'm a bit unsure about what the best types to use in PostgreSQL is, and what I should use as the primary key and so on. I should probably sit down and read [the manual](https://www.postgresql.org/docs/), but not right now. Let's ask [ChatGPT](https://chat.openai.com/chat) instead, that's more fun.

My prompt:
> help me write a postgresql statement that creates a table for users.

ChatGPT's response:

> To create a table in PostgreSQL, you can use the `CREATE TABLE` statement. Here is an example of how you might create a users table:
> 
> ```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR (50) NOT NULL,
    password VARCHAR (50) NOT NULL,
    email VARCHAR (355) UNIQUE NOT NULL,
    created_on TIMESTAMP NOT NULL,
    last_login TIMESTAMP
);
```
>
> This will create a table with the following columns:
> 
> * `id`: This column is of type serial and is the primary key of the table. It will automatically increment for each new row that is inserted into the table.
> * `username`: This column is of type VARCHAR and can store a string with a maximum length of 50 characters. The NOT NULL constraint means that this column must have a value in every row of the table.
> * `password`: This column is also of type VARCHAR and has a maximum length of 50 characters. It also has a NOT NULL constraint.
> * `email`: This column is of type VARCHAR with a maximum length of 355 characters. It also has a UNIQUE constraint, which means that no two rows in the table can have the same value for this column. It also has a NOT NULL constraint.
> * `created_on`: This column is of type TIMESTAMP and stores a date and time. It has a NOT NULL constraint.
> * `last_login`: This column is also of type TIMESTAMP and stores a date and time. It does not have a NOT NULL constraint, so it is possible to have a NULL value in this column.
> 
> I hope this helps! Let me know if you have any questions or need further clarification.

Thank you, ChatGPT! That looks great. I think I'm going to simplify it perhaps a little bit and let `email` and `username` be the same field. And `created_on` should be called `created_at`, and I don't think we need `last_login`. 

(It's a bit funny that the `email` has an UNIQUE constraint but not the `username`.)  

So let's put that in a Flyway file. 

The file name of the SQL script should follow a specific convention to ensure that Flyway can properly identify it as a migration file, and the general format for the file name is `V<version>__<description>.sql`, where <version> is the version number of the migration and <description> is a short, human-readable description of the changes made in the migration. The version number should be in a numeric format, with up to four digits (e.g. 1, 2, 3, etc.), and should be separated from the description by two underscores (__). (Oh, btw, this paragraph was also generated by ChatGPT.) 

I put my modified SQL in a file called `src/resources/db/migrations/V1__create_users_table.sql` and ran the tests again. And voila, we see this in the logs:

```postgresql
INFO o.f.c.i.database.base.BaseDatabaseType   : Database: jdbc:postgresql://localhost:49171/hahabit (PostgreSQL 12.12)
INFO o.f.core.internal.command.DbValidate     : Successfully validated 1 migration (execution time 00:00.014s)
INFO o.f.core.internal.command.DbMigrate      : Current version of schema "public": << Empty Schema >>
INFO o.f.core.internal.command.DbMigrate      : Migrating schema "public" to version "1 - create users table"
INFO o.f.core.internal.command.DbMigrate      : Successfully applied 1 migration to schema "public", now at version v1 (execution time 00:00.045s)
```

Cool! Let's try to write a Spring Data repository next.  

_[Continue reading part five.](/posts/2023-01-05-habit-tracker-repository)_
