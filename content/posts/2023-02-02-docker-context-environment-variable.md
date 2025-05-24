---
layout: post
title:  "The DOCKER_CONTEXT environment variable and testing"
---
Allright, so let's continue on the pull request for supporting docker context that I discussed in [this post](/posts/2023-01-31-test-containers-and-docker-context). 

I wanted to support the `DOCKER_CONTEXT` environment variable. I also wanted to improve testing. 

How do we go about doing something like this in a code base we don't have in our brain? One approach is to search for something similar. We know that docker-java supports the `DOCKER_HOST` environment variable, so we can search for that to get a starting point.

Let's see how other environment variables are tested, like `DOCKER_HOST`. This looks interesting, in the `DefaultDockerClientConfigTest` class:

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

        assertEquals(config.getDockerHost(), URI.create("tcp://baz:8768"));
    }
    // ...
}
```

Nice! We want to do something similar. We also want to set an environment variable, and in the end observe an effect on the resolved host.

If you know your TDD, you've probably heard of the pattern of starting with a failing test. You write the test that checks that the functionality has been implemented. Then make sure that the test fails. Then you implement the functionality, and make the test green. Then you refactor. 

I am a fan of working this way whenever I can. 

Sometimes I'll start with a test that isn't even that. I.e., it's a failing test and, written like that, it will always be a failing test. Just a starting ground to explore the code and figure out the next step.

So, today, I am starting with this: 

```java
class DefaultDockerClientConfigTest {
    // ...
    
    @Test
    public void environmentDockerContext() throws Exception {
        // given docker context
        Map<String, String> env = new HashMap<>();
        env.put(DefaultDockerClientConfig.DOCKER_CONTEXT, "testcontext");

        // when you build a config
        DefaultDockerClientConfig config = buildConfig(env, new Properties());

        // then you get the host specified by the context
        assertEquals(URI.create("unix:///testcontext.sock"), config.getDockerHost());
    }

    // ...
}
```

When running the test, I get this:

```text
Expected :unix:///testcontext.sock
Actual   :unix:///var/run/docker.sock
```

Awesome, just as I expected. We haven't implemented the functionality to specify the docker context with an environment variable, and even if we had, we have nothing in our test setup that would make it load a context called `testcontext` and find that URL.   

In our real world usage, we'll want both the docker config file and the context meta files to be read from the `.docker` directory in the user's home directory. Clearly, we do not want it to read from there in the test suite – we want to be able to set up the data to be used for each test scenario.

How does that work in the case of the docker config file case? 

Hm. Oh. Hey, look at that line in that other test I quoted earlier:

```java
        systemProperties.setProperty("user.home", homeDir());
```

Aha! We have a way of faking what the user's home directory is, and then we can set up all the files we want! Hooray! 

Okay, here's what I'm gonna do: I'm gonna set up a fake home directory with a `.docker` directory. It'll have a config.json in it that will contain a set docker context. And then there will be two docker contexts metas: one that describes the context set in the config.json – let's call it `configcontext` – and one that describes a context that we will later set by environment variable – let's call it `envvarcontext`. 

So here's what the `.docker/config.json` will look like:

```json
{
	"auths": {},
	"currentContext": "configcontext"
}
```

And then there will be two directories in `.docker/context/meta`. They should be named after the SHA-256 of the context name. We can generate those in our shell:

```shell
$ echo -n configcontext | sha256sum
d090e08f0c9167acd72adef6d9fa07ec2de3a873cdd545dd8cb7fc7a10a1331a  -
$ echo -n envvarcontext | sha256sum
51699a7c75211315f1dbf6ecc40dfb0ffdd4ee11ecb2ce7853c9751aea1f9444  -
```

We pass the `-n` flag to `echo`, otherwise it'll include a newline in there which we don't want. The output of the `sha256sum` program is the SHA-256 hash itself, then a space, then the file name, which it outputs as "-" when the file is the standard input. 

For fun, and to show off my ad-hoc shell scripting skills, I'm generating the two directories like this:

```shell
$ for i in configcontext envvarcontext ; do mkdir $(echo -n $i | sha256sum | cut -wf 1) ; done
```

I copy a `meta.json` file from my own local `~/.docker/contexts/meta/.../` into the two directories and edit it so it contains great stuff.  They will look like this:


```json
{
    "Name": "configcontext",
    "Metadata": {
        "Description": "configcontext"
    },
    "Endpoints": {
        "docker": {
            "Host": "unix:///configcontext.sock",
            "SkipTLSVerify": false
        }
    }
}
```

Now, let's make a test that we actually expect to be green already, because of the functionality we implemented [earlier](/posts/2023-01-31-test-containers-and-docker-context): 

```java
class DefaultDockerClientConfigTest {
    // ...

    @Test
    public void dockerContextFromConfig() throws Exception {
        // given home directory with docker contexts configured
        Properties systemProperties = new Properties();
        systemProperties.setProperty("user.home", "target/test-classes/dockerContextHomeDir");

        // and an empty environment
        Map<String, String> env = new HashMap<>();

        // when you build a config
        DefaultDockerClientConfig config = buildConfig(env, systemProperties);

        assertEquals(URI.create("unix:///configcontext.sock"), config.getDockerHost());
    }

    // ...
}
```

And yes, it's green! We now have a proper test that can replace the `main` function we used earlier to test tshi. And then let's just also create the proper failing test for what we meant to do today:

```java
class DefaultDockerClientConfigTest {
    // ...

    @Test
    public void dockerContextFromEnvironmentVariable() throws Exception {
        // given home directory with docker contexts
        Properties systemProperties = new Properties();
        systemProperties.setProperty("user.home", "target/test-classes/dockerContextHomeDir");

        // and an environment variable that overrides docker context
        Map<String, String> env = new HashMap<>();
        env.put(DefaultDockerClientConfig.DOCKER_CONTEXT, "envvarcontext");

        // when you build a config
        DefaultDockerClientConfig config = buildConfig(env, systemProperties);

        assertEquals(URI.create("unix:///envvarcontext.sock"), config.getDockerHost());
    }

    // ...
}
```

And it properly fails! Good! Let's go to bed!

_Continue reading about [implementing DOCKER_CONTEXT and bisecting a bug](/posts/2023-02-03-docker-host-env-var-part-2)_