---
layout: post
title:  "Writing a habit tracker, part 22: Uploading that JAR"
---
In the [previous post](/posts/2023-01-21-habit-tracker-building-a-jar), we built a JAR file! It was big! Now we want to upload it to the server. 

It would be really cool if our app was continuously deployed on each push to Github. But,
 – patience you must have, young padawan. First, how to deploy manually, you must learn. Later, automate it you can. (Is that what Yoda would say? Or would it be like "First, learn how to deploy manually, you must"?)

I'd like to upload this to the Unix account[^1] that we created for this purpose in [part one](/posts/2023-01-01-writing-a-habit-tracker), the one that force me to decide on a name for this project, and then I chose the name `hahabit`. Good times. 

By the way – I mentioned in that part about how silly it is that you have to go through a bunch of questions like "room number" to create a Unix account. I just found in my `skagedal.tech` setup notes that there is, of course, a better way:

```shell
$ sudo adduser mynewuser --gecos "New User"
```

Because that's the [Gecos field](https://en.wikipedia.org/wiki/Gecos_field), named after the [General Comprehensive Operating System](https://en.wikipedia.org/wiki/General_Comprehensive_Operating_System) from the sixties. The more you know.  

Anyway.

I use `ssh` authentication exclusively to log in to this server, because that's what security people say is the thing to do. So I need to generate a key pair and upload the public key to my account, and keep the private key somewhere super safe. I do this with `ssh-keygen` and then upload it to my server with `scp`:

```shell
$ ssh-keygen -f hahabit-key
Generating public/private rsa key pair.
<other stuff from ssh-keygen>
$ scp hahabit-key.pub simon@skagedal.tech:
hahabit-key.pub                                                                  100%  586    16.3KB/s   00:00 
```

And then I log in to my server as `simon`, change user to `hahabit` with the `su` command and the password I gave it, and copy the `hahabit-key.pub` to `~/.ssh/authorized_keys`. 

Now I can log in to my hahabit account using `ssh hahabit@skagedal.tech -i hahabit-key`! This means I can upload files to it as well. So, let's put it all together so far with a little deploy script:

```shell
#!/usr/bin/env bash

# Exit on errors
set -e

echo 👋 Building JAR with Java 19...
export JAVA_HOME=$(/usr/libexec/java_home -v 19)
./gradlew clean bootJar

echo
echo 👋 Uploading JAR to skagedal.tech...
scp -i ~/.ssh/hahabit-key build/libs/hahabit-0.0.1-SNAPSHOT.jar hahabit@skagedal.tech:
```

Very good! Bits are flying through the wires! 

_[Continue reading part twenty-three.](/posts/2023-01-23-habit-tracker-running-it-on-the-server)_


### Notes

[^1]: Yes, my server is running Linux – or if you're so inclined, GNU/Linux – which is not exactly "Unix", but I figure that if I write "Unix account", people will most directly understand what I mean. "Account" means so many things. Does that maek sense? 