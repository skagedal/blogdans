---
layout: post
title:  "Writing a habit tracker, part 10: Continued Spring Security"
---
Welcome to part ten of the habit tracker series!

In [part eight](/posts/2023-01-08-habit-tracker-serving-some-web), I started following a tutorial, [Securing a Web Application](https://spring.io/guides/gs/securing-web/), and then I explored some details on Basic Auth in [part nine](/posts/2023-01-09-habit-tracker-securing-things). I now [completed](https://github.com/skagedal/hahabit/commit/c968ce4d2c5e839444a9b77a8435a963e01eceab) that tutorial. (After all, it's supposed to take 15 minutes. But it takes a bit more when you keep trying to blog about it, and pause to investigate stuff with `curl` and stuff.) 

Now there's a form-based login system in place, on every page except the `home` and `login` pages.  In this system, we give our credentials in a HTML form, and then our session – identified with the `JSESSIONID` cookie – gets tied to this authenticated identity.

We can read more about form-based login system [here](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/form.html). And this also tells me how to use the default Spring Security login page rather than the ugly one I've now replaced it with, by using 

```java
.formLogin(Customizer.withDefaults())
```

I'm doing that instead. 

But what I need to figure out now is how to make this use our actual user repository we set up earlier – you know, the one that ChatGPT helped out with in [part five](/posts/2023-01-05-habit-tracker-repository).

Now, as it turns out, Spring Security [has a way](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/jdbc.html) of handling all that by itself, if you just make your data source comply to a specific schema. Of course it has. 

We could choose different levels of spring-does-everything-for-us here. We could:

1. change the schema and go with the fully pre-packaged solution.
2. stick with our schema and just slightly modify the [JdbcUserDetailsManager](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/provisioning/JdbcUserDetailsManager.html) – as described in [its parent class](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/core/userdetails/jdbc/JdbcDaoImpl.html),  you can "set the queries usersByUsernameQuery and authoritiesByUsernameQuery to match your database setup", which seems like it would probably work for the authentication parts although you couldn't use the other repository things that the JdbcUserDetailsManager provides (like creating users etc), as you only provide `SELECT` queries.
3. skip the JdbcUserDetailsManager and implement our own [UserDetailsService](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/core/userdetails/UserDetailsService.html).

All three approaches sound like fun. It feels to me like any application of any relevant size would want to have control over its own user model, thus going for option three (or unlisted option four). But I'm leaning towards option #1, because, among many other things, I find it interesting to learn how we can get as much functionality as possible with as little code as possible. 

So what does that schema look like? The reference guide gives us this:

```sql
create table users(
	username varchar_ignorecase(50) not null primary key,
	password varchar_ignorecase(500) not null,
	enabled boolean not null
);

create table authorities (
	username varchar_ignorecase(50) not null,
	authority varchar_ignorecase(50) not null,
	constraint fk_authorities_users foreign key(username) references users(username)
);
create unique index ix_auth_username on authorities (username,authority);
```

Hmm. `varchar_ignorecase`? I don't recognize that type. And neither does PostgreSQL – or MySQL, according to my googlings. According to [someone on Stack Overflow](https://stackoverflow.com/questions/24174884/spring-security-jdbc-authentication-default-schema-error-when-using-postgresql#comment67340998_24199925), this schema is written in the [HSQLDB](https://hsqldb.org/) dialect. I ain't even heard of that. Then, the reference manual also lists an alternative – for Oracle. Come on, Spring. What about the little people?!

Also, why should it ignore case? I get why that would perhaps make sense for `username`, but `password`? I guess if you are storing clear-text passwords and then someone has the password "hello123" and then they can't log in from their [IBM 3277](https://en.wikipedia.org/wiki/IBM_3270#3277) terminal, which only supports upper-case input. I'm gonna draw a line in the sand here and say that these people can't track their habits with my system. Also, we're going to encrypt the passwords using something like bcrypt, right, like normal people – why should that be ignorecase...?      

Anyway, I'm gonna do what [some other people on Stack Overflow](https://stackoverflow.com/a/67769694/1132101) do and just use VARCHAR. 

I kind of want to keep my `created_at` field also. 

And ALSO, doesn't it suck to just have the username as primary key? So now, in my `habits` table, I'll need to reference the user by full username instead of just some simple id.  (There are different opinions about whether to use a serial ID:s, like what I did, or something like UUID:s. See for example [this post](https://www.cybertec-postgresql.com/en/uuid-serial-or-identity-columns-for-postgresql-auto-generated-primary-keys/))

But despite all this, I think I'll go with the schema suggested by Spring Security, as modified by people on Stack Overflow. I'll probably change my mind later, maybe we'll do OAuth at some point, but for now [here](https://github.com/skagedal/hahabit/commit/4cf93f322a560b7cea88ebe37929108e6011fb29) is the commit that finishes off the Spring Security integration for now! I also added a migration to add a default `admin`, and it will be up to Future Me to change that password in production ones it goes out!

Tomorrow, I think we'll look more at Spring MVC and Thymeleaf.

_[Continue reading part eleven.](/posts/2023-01-11-habit-tracker-the-habits-page)_
