---
layout: post
title:  "docker-java and Docker Context"
---
In the [previous post](/posts/2023-01-30-test-containers-and-colima), I talked about why I want Testcontainers to know about Docker Contexts.  

Now, Testcontainers doesn't talk to Docker by itself. It uses a library called docker-java for this, which basically is a Java implementation of the Docker protocol and everything needed to talk to a Docker environment. 

So it is docker-java that needs to be made aware of Docker contexts. 

I set out in the start of december 2022 to try to add this support. 

The [first thing](https://github.com/docker-java/docker-java/pull/2036/commits/54c41f5327c3f78b17dd56e6f7aa958382f7c0ec) I did was to add support for reading the name of the current context from config.json. So, there is a file called `~/.docker/config.json` that you probably have on your system if you're using Docker. And `docker-java` already supported reading it, but did not support the property `currentContext`. I just modified the model object to support and deserialize this property, and added a small test to test the deserialization.

Then I felt a bit unsure about how to continue. I would have wanted to create an integration test where I could test the full feature as it was being built. But getting to know a new code base can be difficult, especially when you don't have a friend setting next to you to guide you, and also when you're new to various parts of the technology you're working with – for example, I have never really used Maven much, which docker-java uses. I also have never used the `docker-java` library directly, only indirectly via Testcontaikners.

So instead I decided to just [create a main method](https://github.com/docker-java/docker-java/pull/2036/commits/c303d71414d2e674510abbd5a828dddcff92a989) to test stuff in.   To just confirm how the library works, the main method connects explicitly to my Colima server and then runs some various Docker commands:

```java
class DockerBuilderClientTest {
    // ...

    public static void main(String[] args) {
        // This is what we want to just work
        DockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder()
            .withDockerHost("unix:///Users/simon/.colima/default/docker.sock")
            .build();

        DockerHttpClient httpClient = new ApacheDockerHttpClient.Builder()
            .dockerHost(config.getDockerHost())
            .sslConfig(config.getSSLConfig())
            .maxConnections(100)
            .connectionTimeout(Duration.ofSeconds(30))
            .responseTimeout(Duration.ofSeconds(45))
            .build();

        DockerClient dockerClient = DockerClientImpl.getInstance(config, httpClient);

        dockerClient.pingCmd().exec();
        System.out.println("Containers:");
        dockerClient.listContainersCmd().exec().stream().forEach(container -> {
            System.out.println(container.getCommand());
        });

        // ...
    }

    // ...
}
```

Then, as I continued to try to grok the code, I realized that we needed to change the place where we read the docker config file – it's now going to be needed to determine the context, so we need to read it earlier. That was done as the [next commit](https://github.com/docker-java/docker-java/pull/2036/commits/d4963d2ceac6affe1298e719ad78220d5bb09860).   

Now, we know what the `currentContext` is. But where do we find the data for that context? I mostly figured this out by peeking around at my own file system, and found that there's a directory called `contexts` inside the `~/.docker` directory, where various other settings live. Inside that directory, there's a directory called `meta`, and in there, there are a bunch of oddly-named directories:

```shell
$ ls ~/.docker/contexts/meta
f24fd3749c1368328e2b149bec149cb6795619f244c5b584e844961215dadd16
fe9c6bd7a66301f49ca9b6a70b217107cd1284598bfc254700c989b916da791e
```

These turned out to each contain a file called `meta.json`, which actually has the payload for each context, in JSON format:
```shell
$ cat ~/.docker/contexts/meta/f24fd3749c1368328e2b149bec149cb6795619f244c5b584e844961215dadd16/meta.json | jq
{
  "Name": "colima",
  "Metadata": {
    "Description": "colima"
  },
  "Endpoints": {
    "docker": {
      "Host": "unix:///Users/simon/.colima/default/docker.sock",
      "SkipTLSVerify": false
    }
  }
}
```

Allright, so that's what we have to parse. I did an initial take on the parsing (using Jackson, like other things in docker-java already did) in [this commit](https://github.com/docker-java/docker-java/pull/2036/commits/bab79a3377c0bdd2e396dbf40d9211b8715a0913), testing it with another little main function.

As I had no idea about what the naming schema for those `~/.docker/contextx/meta/blablablabla` files were (although they do kind of like like hashes, don't they?), I then just made it [go through all those files](https://github.com/docker-java/docker-java/pull/2036/commits/bc952ec7f9d8baab5cde056102578fe9c32d97e3) to find the one we needed.

Then, there was just [a little bit of wiring](https://github.com/docker-java/docker-java/pull/2036/commits/de12bf8998f9dd59fadaa9a7676e241cc175d55b) left to make it use this new code to determine the docker host from the docker context, if available! Cool, it even works!

At this stage, I wanted to get some feedback from the docker-java / Testcontainers people before spending any further time, as I had no idea if they even think any of this is a good idea. I filed a [pull request](https://github.com/docker-java/docker-java/pull/2036) and also reached out in the [Testcontainers Slack Team](https://slack.testcontainers.org/). 

I got a nice response in Slack and a review of my pull request from Eddú Meléndez Gonzales at [AtomicJar](https://www.atomicjar.com/), the company that builds Testcontainers, with two comments:

> current context can be obtained via DOCKER_CONTEXT env var or reading currentContext from ~/.docker/config.json.

Yep, this was on my to-do-list!

> in order to find the right `meta.json` once we got the context, a hash should be created using SHA-256. For example, context is `desktop-linux` then `Hashing.sha256().hashString(dockerContext, StandardCharsets.UTF_8).toString()` will return `fe9c6bd7a66301f49ca9b6a70b217107cd1284598bfc254700c989b916da791e`. So, the right path is `~/.docker/contexts/meta/fe9c6bd7a66301f49ca9b6a70b217107cd1284598bfc254700c989b916da791e/meta.json`

Aha, that's what this thing is! Nice.

So two weeks ago, I [implemented this](https://github.com/docker-java/docker-java/pull/2036/commits/f700d506dd401fb8853e2ed7df17aca1391bf499) more direct way of finding the `meta.json` file. 

Then I've not quite been able to find the time to finish this up. I should get that `DOCKER_CONTEXT` environment variable reading implemented and I should probably clean up the code and try to add some proper tests instead of static `main` methods.

But that's where I'm at today! I just thought I'd get started by blogging a bit about it to remember where I left off, and motivate myself a little to continue! 

_Continue reading [next post](/posts/2023-02-01-submitting-a-bug-to-testcontainers), which is randomly about reporting a different Testcontainers bug, or [the one ofter that](/posts/2023-02-02-docker-context-environment-variable) which continues the story arc of supporting Docker contexts_
