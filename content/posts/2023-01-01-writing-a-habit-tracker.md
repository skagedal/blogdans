---
layout: post
title:  "Writing a habit tracker, part 1: Setting up some tools"
summary: "First post of the Habit Tracker series, starting with my New Year's resolution to spend at least 30 minutes outside daily, transitioning into a technical walkthrough of setting up a habit tracking app backend using PostgreSQL and Java on my Digital Ocean Ubuntu server"
---

It's a new year and, as such, the time to try to form new habits. The time to fail to maintain those habits comes later (mid-January at the latest). But let's not be cynical! Let's do it! And let's have fun and be kind to ourselves! 

So – me and my wife agreed, inspired by my friend Linda, to set the goal of spending at least 30 minutes outside every day. This sounds, to me, like a very good habit to form. Fresh air and sunlight is really nice itself, but it could also be a way to sneak in some much-needed exercise. Staying physically active is something I absolutely know for sure makes me happier as a person, yet I struggle to maintain the habit. So let's try with this instead. 

Then the question inevitably arises: which app should I use on my phone to track this habit? If you're not tracking your wellness efforts digitally, sharing your progress with your social network, are you even doing anything?

Honestly, I am a bit ambivalent when it comes to this "quantified self" style self-tracking. There's a part in me that enjoys the idea of seeing measurable results. Then there's a part that really just wants to scale down on all reliance on digital tools. Throw away my smart phone and get a Nokia 3310. 

But then there's the side of me who really enjoys programming, and starting up small projects every now and then. And this kind of small "productivity" tools are perfect as an excuse to toy around with some technology, and get the feeling that you're "doing something". 

So, here we go. I want to do start this off by writing a backend service in Java with Spring Boot using PostgreSQL, because that's some stuff I want to toy around with more. And I'm going to sort of start backwards[^4] – with the deployment.   

I'm gonna set things up on my Digital Ocean Ubuntu machine that also serves this blog. Let's begin with installing PostgreSQL.

## Installing PostgreSQL

The way to complete a task like "installing PostgreSQL on my Ubuntu machine" is to google for "PostgreSQL ubuntu" and finding a nice Digital Ocean guide [like this one](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart). I'll basically just be repeating the steps from that guide here, sorry if it's a bit boring, but it also serves as a bit of documentation / record-keeping for myself, if for some reason I'll have to redo this. (And no, I'm not going to automate this. Not now.) 

So, here we go:

```shell
$ sudo apt update
$ sudo apt install postgresql postgresql-contrib
```

And then I make sure the service is started using:

```shell
$ sudo systemctl start postgresql.service
```

I also use the method described in that guide to become the default `postgres` user and start a shell:

```shell
$ sudo -i -u postgres
$ psql
psql (12.12 (Ubuntu 12.12-0ubuntu0.20.04.1))
Type "help" for help.

postgres=#
```

Apparently, Postgres' default user management system is coupled to the user authentication system on the system. This seems nice enough for our purposes – I plan to just run everything on this machine, not deal with any Docker stuff. 

So I want to set up a user that I will also run the Java app with, and a database with the name. I thus need to select a name for my project. Let's go with... habit... habitual... tracky... habit souds like hobbit... bit is a computer thing... *hahabit* is silly enough! It's `haha-bit`, but also `ha-habit`. Yeah let's do that. 

```shell
$ sudo -u postgres createuser --interactive
[sudo] password for simon:
Enter name of role to add: hahabit
Shall the new role be a superuser? (y/n) y
```
I'm... not really sure what Postgres means with a superuser. It sounds like something we probably don't want to run our app as, in the end. But let's use that to get started.

And then create our OS user:
```shell
$ sudo adduser hahabit
Adding user `hahabit' ...
Adding new group `hahabit' (1002) ...
Adding new user `hahabit' (1002) with group `hahabit' ...
Creating home directory `/home/hahabit' ...
Copying files from `/etc/skel' ...
New password:
Retype new password:
passwd: password updated successfully
Changing the user information for hahabit
Enter the new value, or press ENTER for the default
	Full Name []: Haha Bit
	Room Number []:
	Work Phone []:
	Home Phone []:
	Other []:
Is the information correct? [Y/n]
```

That's such a funny old unix thing, that you have to even get the question about "Work Phone" to set up a user.[^1]

Oh, and we also needed to create a database for this user.

```shell
$  sudo -u postgres createdb hahabit
```

And now we can connect to our new database by just doing `sudo -u hahabit psql`. Very nice. And then we could set up our database schemas and stuff. But I don't want to do it that way, I want to set up the schemas with Flyway migrations. Which I want to run from within the Java app. So let's set up Java.

## Installing Java

I'd like to use the cutting edge Java here, which at the time of writing is Java 19. There are a bunch of different distributions of OpenJDK, but one general recommendation (see [whichjdk](https://whichjdk.com/)), and that I've used before and found to work well, is Temurin[^2]. So let's follow [these instructions](https://adoptium.net/blog/2021/12/eclipse-temurin-linux-installers-available/)[^3]:  

```shell
$ apt-get install -y wget apt-transport-https gnupg
<unintersting apt-get output snipped>
$ wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | sudo apt-key add -
--2023-01-01 14:55:30--  https://packages.adoptium.net/artifactory/api/gpg/key/public
Resolving packages.adoptium.net (packages.adoptium.net)... 52.89.28.166, 54.148.186.122, 52.33.103.162
Connecting to packages.adoptium.net (packages.adoptium.net)|52.89.28.166|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: unspecified [text/plain]
Saving to: ‘STDOUT’

-                                          [ <=>                                                                         ]   1.75K  --.-KB/s    in 0s

2023-01-01 14:55:31 (39.5 MB/s) - written to stdout [1793]

OK
$ echo "deb https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | sudo tee /etc/apt/sources.list.d/adoptium.list
deb https://packages.adoptium.net/artifactory/deb focal main
$ sudo apt-get update && sudo apt-get install temurin-19-jdk
<unintersting apt-get output snipped>
```

Allright! Is it working?

```shell
$ java -version
openjdk version "19.0.1" 2022-10-18
OpenJDK Runtime Environment Temurin-19.0.1+10 (build 19.0.1+10)
OpenJDK 64-Bit Server VM Temurin-19.0.1+10 (build 19.0.1+10, mixed mode, sharing)
```

Yes, it is working! Now, it's time to create a little Java app using Spring Boot. But that's for tomorrow.

Oh, and yes, I did spend more than 30 minutes outside today, snowboarding the wonderful slopes of Hamra, Tänndalen. And I wrote a blog post! 

_[Continue reading part two.](/posts/2023-01-02-habit-tracker-part-two-spring-boot)_

### Notes

[^1]: But see [part twenty-two](/posts/2023-01-22-habit-tracker-deploying-the-jar) for a better way!
[^2]: The release process of JDK 21 in the fall of 2023 made me feel a bit less confident in this choice. It took much longer for Temurin to get this milestone release out than other distributions, apparently having to do with Oracle holding back on the TCK. Don't know what the politics are here exactly. I've switched to using Zulu for my local machine. 
[^3]: As I follow this process to update to JDK 21, I'm noticing this warning while doing `sudo apt-get update`:
    
    ```text
    W: https://packages.adoptium.net/artifactory/deb/dists/jammy/InRelease: Key is stored in legacy trusted.gpg keyring (/etc/apt/trusted.gpg), see the DEPRECATION section in apt-key(8) for details.
    ```
    
    Apparently this has to do with security recommendations. The manual provides one simple way way of replacing the above, and then one even more recommended way of doing it; I'm going with the slightly simpler one:

    ```text
    wget -qO- https://packages.adoptium.net/artifactory/api/gpg/key/public | sudo tee /etc/apt/trusted.gpg.d/adoptium.asc
    ```

    Indeed, I can now see that there were [better instructions](https://adoptium.net/installation/linux/) for how to install Temurin on Debian, following the recommended way from the apt man pages. Oh well.
[^4]: Comment from early 2025: I was listening to [this episode](https://www.youtube.com/watch?v=2AIrLBG_Eb0) of podcast Two's Complement, Matt Godbolt and Ben Rady discuss the concept "Deploy First Development". I like it. 