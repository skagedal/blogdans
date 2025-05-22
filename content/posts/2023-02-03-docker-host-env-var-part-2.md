---
layout: post
title:  "Implementing DOCKER_CONTEXT and bisecting a bug"
---

Allright, I've got around 30 minutes – let's see if we can get this `DOCKER_HOST` environment variable that we set up a test for in the [last post](/posts/2023-02-02-docker-context-environment-variable) done! 

And all of a sudden – maybe because I was just out drinking beer and eating great food with Bobben, who you might remember from the [Habit Tracker Part Four](/posts/2023-01-04-habit-tracker-functionality-and-first-migration) blog post –  I no longer feel the urge to blog about every minor step, I'm just gonna implement that shit! [Here it is](https://github.com/skagedal/docker-java/commit/d6162d005b86fe18ce6b7596ea695fa50e0582c2)! 

It works in the sense that the test is green. Buuuut – I also just noticed that some other tests in that class (`DefaultDockerClientConfigTest`) are _not_ green when I run them in IntelliJ IDEA. 

Did I screw something up? 

First, to sanity check, I'm going to check out `master` and see if things work there. 

Ok, they do work. So I definitely screwed something up. 

Now, let's slow down. Despite the beer.

Here's one of the tests – not touched by me – that now fail:

```java
class DefaultDockerClientConfigTest {
    // ...

    @Test
    public void environmentDockerHost() throws Exception {

        // given docker host in env
        Map<String, String> env = new HashMap<>();
        env.put(DefaultDockerClientConfig.DOCKER_HOST, "tcp://baz:8768");
        // and it looks to be SSL disabled
        env.remove("DOCKER_CERT_PATH");

        // given default cert path
        Properties systemProperties = new Properties();
        systemProperties.setProperty("user.name", "someUserName");
        systemProperties.setProperty("user.home", homeDir());

        // when you build a config
        DefaultDockerClientConfig config = buildConfig(env, systemProperties);
        // 👆👆👆 THIS IS THE LINE THAT FAILS
        
        assertEquals(config.getDockerHost(), URI.create("tcp://baz:8768"));
    }

    // ...
}
```

I have marked the line that fails with three "pointing up"-emojis and the text "THIS IS THE LINE THAT FAILS". I hope you'll find it. 

The log output says:

```
java.lang.IllegalArgumentException: Input byte array has wrong 4-byte ending unit
	at java.base/java.util.Base64$Decoder.decode0(Base64.java:736)
	at java.base/java.util.Base64$Decoder.decode(Base64.java:538)
	at java.base/java.util.Base64$Decoder.decode(Base64.java:561)
```

Hmmm.

When did I even introduce this bug? To be honest, I haven't run the test suite consistently after each change.

Maybe it's time for a `git bisect`! I haven't used that in years! 

First I do a `git rebase master` to make things a bit more understandable for myself. Then I do:

```shell
$ git bisect start
status: waiting for both good and bad commits
$ git bisect bad
status: waiting for good commit(s), bad commit known
$ git bisect good master
Bisecting: 5 revisions left to test after this (roughly 3 steps)
[d0f9fc84a2e1c8427edfa38f7b023f76bfbbf581] Start of reading all docker context meta files
```

Allright, so we've started bisecting – doing a binary search for the commit that introduced the bad stuff. 

But alas, the code at the current commit does not even compile. Sloppy me. That makes it hard to tell if it's a "good" or "bad" commit, in the sense we're interested in right now. One of the difficulties with `git bisect`-ing. But I'm gonna mark it as bad, and we'll see what happens.

```shell
$ git bisect bad
Bisecting: 2 revisions left to test after this (roughly 1 step)
[2e07c5f4b47a7dbf2bbe37be454a6630530d9ef6] Add a main method to test the thing
```

I run the tests here, and it's all green! Good commit!

```shell
$ git bisect good
Bisecting: 0 revisions left to test after this (roughly 1 step)
[ca0727da2a06b16d4ea8860d099e2b1a9514c5c9] Start at reading context meta file
```

I run the tests here and I get the failures! Bad commit!

```shell
$ git bisect bad
Bisecting: 0 revisions left to test after this (roughly 0 steps)
[3359f0a06fc2c5d6b02b13e2eca6b05b8effbb1c] Read the docker config file earlier so we can use it to determine host
```

Bad commit here as well!

```shell
$ git bisect bad
3359f0a06fc2c5d6b02b13e2eca6b05b8effbb1c is the first bad commit
commit 3359f0a06fc2c5d6b02b13e2eca6b05b8effbb1c
Author: Simon Kågedal Reimer <skagedal@gmail.com>
Date:   Wed Nov 30 08:29:58 2022 +0100

    Read the docker config file earlier so we can use it to determine host

 .../dockerjava/core/DefaultDockerClientConfig.java | 39 +++++++++++++++-------
 .../github/dockerjava/core/DockerConfigFile.java   |  4 +++
 .../core/DefaultDockerClientConfigTest.java        | 13 ++++----
 .../dockerjava/core/DockerClientBuilderTest.java   |  5 ++-
 .../dockerjava/core/DockerClientImplTest.java      |  3 +-
 5 files changed, 41 insertions(+), 23 deletions(-)
```

Allright! We have pinned down the commit that introduced the bad stuff. Let's look at that tomorrow.

_[Continue reading about the invalid Base64](/posts/2023-02-04-test-data-with-invalid-base64)_