---
layout: post
title:  "Writing a habit tracker, part 23: Running it on the server"
---
We [built a JAR](/posts/2023-01-21-habit-tracker-building-a-jar) and we [uploaded it](/posts/2023-01-22-habit-tracker-deploying-the-jar) to the server! Great, can we run it?

```shell
$ ssh hahabit@skagedal.tech
<welcome to ubuntu etc>
$ java -jar hahabit-0.0.1-SNAPSHOT.jar
2023-01-15T16:38:27.770Z  INFO 873558 --- [           main] t.skagedal.hahabit.HahabitApplication    : Starting HahabitApplication using Java 19.0.1 with PID 873558 (/home/simon/hahabit/hahabit-0.0.1-SNAPSHOT.jar started by simon in /home/simon/hahabit)
<lots of logs>
2023-01-15T16:38:35.518Z ERROR 873558 --- [           main] com.zaxxer.hikari.pool.HikariPool        : HikariPool-1 - Exception during pool initialization.

org.postgresql.util.PSQLException: FATAL: password authentication failed for user "postgres"
```

Ah, right - it's configured to run things like on my local machine, trying to get into PostgreSQL with a simple password. Back in the [first blog post](/posts/2023-01-01-writing-a-habit-tracker) of the series, where I set up PostgreSQL, I noted that:

> Apparently, Postgres’ default user management system is coupled to the user authentication system on the system. This seems nice enough for our purposes – I plan to just run everything on this machine, not deal with any Docker stuff.

However, my great colleague Christopher Gunning noted in a Slack thread:

> One thing came to mind that you might run into in the future. You set up postgres using local authentication. I think this only works when connecting through a Unix-domain socket which is what you’re doing with the psql command when omitting the host option.
>> If you omit the host name, psql will connect via a Unix-domain socket to a server on the local host, or via TCP/IP to localhost on machines that don’t have Unix-domain sockets.
> 
> As such I don’t think that authentication strategy will work when connecting using TCP. It’s possible that you can from Java configure it to connect using the Unix-domain socket but I don’t know how that would work.

I think Gunning is right. It does seem that it should almost be possible, I found for example [this post](https://www.morling.dev/blog/talking-to-postgres-through-java-16-unix-domain-socket-channels/) from Gunnar Morling where he discusses this topic and attempts to connect via the native support for Unix sockets that Java gained in Java 16, but not quite succeeding. Could be a thing to play around with, but not really worth it – I don't really need the extra performance or security benefits, so just going with the common option will be best.   

So let's set a password for `hahabit`, the Postgres user. I enter Postgres with `sudo -u postgres psql` and there I enter `\password hahabit`. It asks me for a new password. I, in turn, ask my password manager to generate a nice, safe password for me. It complies with my request. I give the new password to Postgres.

Cool, now we just need to configure the Spring data source! Previously, I did so by editing the `application.properties` file. Those settings, used for my local development setup, are now bundled into the JAR that I have deployed here on my server. 

I could try to somehow make those properties match the configuration here on my production server. There are those profiles things I could use. But I'd rather keep the configuration external to the JAR. For one thing, the password and any such secrets definitely should be. [Turns out](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#features.external-config) there's an order on what overrides what, and you can just set some environment variables to override the application.properties. So now I do just this, as `hahabit` on `skagedal.tech`:

```shell
$ export SPRING_DATASOURCE_USERNAME=hahabit
$ export SPRING_DATASOURCE_PASSWORD=$(cat postgres-password)
$ java -jar hahabit-0.0.1-SNAPSHOT.jar
```

**And it runs!** It connects to the database and runs some migrations! And then serves requests – I can open up a separate `ssh` session to my machine and test it with `curl -v localhost:8080`. It challenges me with some Basic Auth,  so I give it a `-u admin:admin` and get my home page HTML!

This reminds me that I have to change the admin password that I set up with a migration in [part ten](/posts/2023-01-10-habit-tracker-securing-things-2). Better do that before I forget, and suddenly make this thing available from the outside. And then blog about it. 

To generate a new password, I again use my password manager. Then it needs to be encrypted in the format that Spring likes it. I can use the `spring` command line tool for this, which I have installed on my Mac:

```shell
$ spring encodepassword myverysafepassword
```

A common piece of security advice here is that you shouldn't type passwords into your command line prompt like that, since they will get saved in clear text in your command line history. We could easily remove it from the shell history afterwards, but it would have been nice if `spring encodepassword` also had a mode that asked for the password interactively, rather than as a command line argument. We can create one, though, like this:

```shell
$ spring encodepassword "$(</dev/stdin)"
myverysecretpassword
{bcrypt}$2a$10$d0RejpvVQRFerqm6X7oPj.zzM2CX8fL/nRs8naHSj9uy/ggtW9j7.
```

(That's me typing `myverysecretpassword`, then pressing exactly the return key and then Ctrl-D to terminate the standard input stream. The Spring tool outputs the bcrypted password.)

Then I update the password by going into the `psql` console, again as the `hahabit` Postgres user, and execute:
```sql
UPDATE users SET password = '{bcrypt}SOMEENCRYPTEDSTUFF' WHERE username = 'admin';
```

I then confirm that I can no longer authenticate with the test password. All good.

_[Continue reading part twenty-four.](/posts/2023-01-24-habit-tracker-always-running-it)_
