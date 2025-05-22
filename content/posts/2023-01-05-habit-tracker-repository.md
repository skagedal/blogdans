---
layout: post
title:  "Writing a habit tracker, part 5: A repository"
---

Continuing on the habit tracker. [Yesterday](/posts/2023-01-04-habit-tracker-functionality-and-first-migration) we set up a schema for users, and we asked ChatGPT on how to create that schema. That was fun. Let's continue on that path.

So, in the same conversation as where I asked it to create the schema for me, I asked:

> Nice! What if I want to read that as a Spring Data JDBC repository?

ChatGPT answered:

> To use a Spring Data JDBC repository to read data from a users table in a PostgreSQL database, you will need to create a few different components:
>
> A model class to represent the data in each row of the users table. This class should have fields for each column in the table, and should also have appropriate getters and setters for these fields.
>
> A Spring Data JDBC repository interface to define the database queries you want to use. You can use this interface to define methods like findAll(), findById(), and save() to read and write data from the users table.
>
> A configuration class to enable the Spring Data JDBC repository. This class should use the @EnableJdbcRepositories annotation and specify the package containing your repository interface.
>
> Here's an example of what these components might look like:
>

```java
// Model class for a user
public class User {
  private Long id;
  private String username;
  private String password;
  private String email;
  private LocalDateTime createdOn;
  private LocalDateTime lastLogin;

  // Getters and setters go here
}

// Repository interface
public interface UserRepository extends CrudRepository<User, Long> {
  // Additional query methods go here
}

// Configuration class
@Configuration
@EnableJdbcRepositories(basePackages = "com.example.repository")
public class RepositoryConfig {
  // Additional configuration goes here
}
```

> Once you have these components in place, you can use the UserRepository interface in your application code to read and write data from the users table.

Again, thank you ChatGPT! Do I really need that extra bit of configuration though? I'm gonna try just adding the repository.

I'd really like the `User` class to be a `record` – the new thing from Java 14, an immutable data type with accessors and default implementation of things like `hashCode` and `equals`. But I doubt Spring Data supports that[^1]. Let's try it later perhaps. For now, I'll go with a simple `User` class, that with the modifications I did to the GPT-suggested schema looks like this:

```java
public class User {
    public Long id;
    public String email;
    public String password;
    public LocalDateTime createdAt;

    public User(String email, String password, LocalDateTime createdAt) {
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
    }
}
```

I add a `UserRepository` interface just like the one ChatGPT suggested. Then let's test it! I'm adding a little test:

```java
class HahabitApplicationTests {
    @Autowired
    UserRepository repository;

    // <cut the stuff we added previously to set up Testcontainers and so on> 

    @Test
    void createUser() {
        final var simon = new User("skagedal@gmail.com", "bestpassword", LocalDateTime.now());
        repository.save(simon);
    }
}
```

(Ugh, I sort of already regret decision to go with email-as-username. It feels ugly somehow. But not gonna change it right now.)

It fails with an error:

```
org.springframework.data.relational.core.conversion.DbActionExecutionException: Failed to execute InsertRoot{entity=tech.skagedal.hahabit.model.User@394331a8, idValueSource=NONE}
<cut lots of stacktrace>

Caused by: org.springframework.jdbc.BadSqlGrammarException: PreparedStatementCallback; bad SQL grammar [INSERT INTO "user" ("created_at", "email", "id", "password") VALUES (?, ?, ?, ?)]
<cut lots of stacktrace>

Caused by: org.postgresql.util.PSQLException: ERROR: relation "user" does not exist
<cut lots of stacktrace>
```

Aha. Spring Data doesn't know that we want our `User` class should read from the `users` table. Either Spring Data or ChatGPT wasn't smart enough to figure that out. Another small win for the humans.

I need to add this annotation to the `User` class:

```java
import org.springframework.data.relational.core.mapping.Table;

@Table(name = "users")
public class User {
    // ...
}
```

Now we get a different error:

```
org.springframework.data.relational.core.conversion.DbActionExecutionException: Failed to execute InsertRoot{entity=tech.skagedal.hahabit.model.User@642f8b7f, idValueSource=NONE}
<cut>

Caused by: org.springframework.dao.DataIntegrityViolationException: PreparedStatementCallback; SQL [INSERT INTO "users" ("created_at", "email", "id", "password") VALUES (?, ?, ?, ?)]; ERROR: null value in column "id" violates not-null constraint
<cut>

Caused by: org.postgresql.util.PSQLException: ERROR: null value in column "id" violates not-null constraint
  Detail: Failing row contains (null, skagedal@gmail.com, bestpassword, 2023-01-03 21:14:57.267099).
<cut>
```

Aha. Hmm. So, we want the id's to be autogenerated by PostgreSQL. That's what the `SERIAL` type does. But Spring Data doesn't know this, so it tries to insert a `NULL` as an id. 

Continuing my conversation with ChatGPT, I ask this:

> Since the `id` field is autogenerated by PostgreSQL, I need to make Spring Data not try to insert a null there. How do I do that? 

----
In a Spring Data JDBC repository, you can use the @Id annotation to mark a field as the ID field of an entity. This will tell Spring Data JDBC to use the value of this field as the ID of the entity when saving it to the database.

To use the `@Id` annotation with a field that is generated by the database (such as a serial ID field in PostgreSQL), you will need to set the insert attribute of the @Id annotation to false. This will tell Spring Data JDBC not to include the ID field in the INSERT statement when saving the entity.

Here's an example of how you might update the User model class to use the @Id annotation with a generated ID field:

```java
public class User {
  @Id(insert = false)
  private Long id;
  private String username;
  // ... 
}
```
----

I tried this, but there was no such `insert` argument available for this `@Id` annotation. 

However, by just adding a plain `@Id` annotation to the field, it worked greatly! Green test! 

Let's just add a little to the test so that it also reads from the database and asserts that it fetches what was written:

```java
class HahabitApplicationTests {
    // ...
    @Test
    void createUser() {
        final var simon = new User("skagedal@gmail.com", "bestpassword", LocalDateTime.now());
        final var savedSimon = repository.save(simon);

        final var fetchedSimon = repository.findById(savedSimon.id).orElseThrow();

        Assertions.assertEquals(
            simon.email,
            fetchedSimon.email
        );
    }
}
```

Cool, I press run, and... what now? There was an exception thrown on the insertion!

```
org.springframework.data.relational.core.conversion.DbActionExecutionException: Failed to execute InsertRoot{entity=tech.skagedal.hahabit.model.User@278150a1, idValueSource=GENERATED}
<cut>

Caused by: org.springframework.dao.DuplicateKeyException: PreparedStatementCallback; SQL [INSERT INTO "users" ("created_at", "email", "password") VALUES (?, ?, ?)]; ERROR: duplicate key value violates unique constraint "users_email_key"
  Detail: Key (email)=(skagedal@gmail.com) already exists.
```

Oh... right. Right. The tests are running a reused database container, so the row from my previous run still exists. At work, where we're not (yet) using Spring Boot, we deal with this by emptying all tables at the start of each test. Which works well. Spring Data, however, has a pretty feature up its sleeve (do you have features up your sleeve? or just tricks?). By marking the test method with the annotation `@Transactional`, it will roll back the database to the state before the test after it has run. Like this:

```java
class HahabitApplicationTests {
    // ...
    @Test
    @Transactional
    void createUser() {
        // ...
    }
    // ...
}
```

Now, we can just need to kill the running container to quickly reset the database state. Going to our trusty shell:

```shell
> docker ps | grep postgres
6b9c23a760c5   postgres:12.12                 "docker-entrypoint.s…"   2 days ago   Up 2 days               0.0.0.0:49171->5432/tcp, :::49171->5432/tcp                            recursing_engelbart
> docker kill 6b9c23a760c5
6b9c23a760c5
```

Now I can run the test! And again! And again!

_[Continue reading part six.](/posts/2023-01-06-habit-tracker-records-and-other-improvements)_

### Notes

[^1]: I was wrong, it does! See [next post](/posts/2023-01-06-habit-tracker-records-and-other-improvements). 