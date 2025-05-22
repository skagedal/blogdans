---
layout: post
title:  "My docker-java pull request got merged"
---
Great news for those of you following the Testcontainers series here on skagedal's oboy!

After the [last post](/posts/2023-02-05-the-finally-green-again-test-suite), I pinged the Testcontainers people and got some nice new review comments. (Obviously, I meant to remove those [main methods](/posts/2023-01-31-test-containers-and-docker-context) when I added some more proper test code, but forgot to.)  Anyway, I fixed the issues, and today I got a notice that that the thing [got merged](https://github.com/docker-java/docker-java/pull/2036#issuecomment-1420907180) to the main branch! Just needs a release, and then the dependency in Testcontainers needs to be updated, and then we're good to go!

So much fun to contribute to (other people's) open source projects. I can't remember what the last one was, feels like it's been a while. Something during my iOS days?

(By the way. Complete side-note here, but... so, I'm writing these blog posts in IntelliJ IDEA. That might seem weird, but I feel that when you start using some editor all day long, that just sort of becomes the place you feel most familiar with. I totally used to be an Emacs-head. Anyway, so what I was going to come to is that today I started using the Github Copilot plugin, as we just got it approved by our legal department. And... now the AI has suggestions when I write blog posts?! It's really weird.)

And while I'm at it, some small updates on the other Testcontainers issue [I wrote about](/posts/2023-02-01-submitting-a-bug-to-testcontainers). So, I'm totally with Mr. Andre Hofmeister [here](https://github.com/testcontainers/testcontainers-java/issues/6450#issuecomment-1412785633) – those warnings about Ryuk are not really "a problem", they are just confusing. And therefore should be fixed. But it's got to also be telling of something else, since when I use the setup where I get those warnings, it also correlates with having... other problems. 

Those "other problems" have been more difficult to reproduce, but it's been things like the test suite not being able to connect to the database that Testcontainers should have set up. 

Then the other day, a comment from a coworker made me facepalm a bit to myself. Something about Testcontainers that I have seen but sort of ignored is that... obviously, Testcontainers needs to have a way of knowing that the database is up and running before it starts running tests. So, it needs to do some kind of health check. And when you use something like the `MySQLContainer` or `PostgreSQLContainer` classes, it does automatically that by running a `SELECT 1` query. 

But in the case of the service I was working on, we actually just used `GenericContainer`. Then you need to do that stuff yourself. (We should totally change it to `MySQLContainer`, in our case.)

So the mystery is not so much why it was not working in some situations (Testcontainers without the network address setup), but rather why it was working in other situations (Docker Desktop or Testcontainers with the network address setup). Maybe something just makes it fast enough in those situations so that waiting for the health check is not needed? Or? Is that what's going on?

I will need to explore this more. But not now. 

(Now you have no idea which of the above sentences were written by me, and which ones were written by the AI. I'm not sure I do either.)

