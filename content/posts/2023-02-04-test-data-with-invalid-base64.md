---
layout: post
title:  "The test data with invalid Base64"
---
Good morning! Let's continue on the work from [yesterday](/posts/2023-02-03-docker-host-env-var-part-2)! I'm curious about what I did in that commit that caused other tests to fail. 

It's [this commit](https://github.com/skagedal/docker-java/commit/d4963d2ceac6affe1298e719ad78220d5bb09860), where I change where in the sequence the Docker `config.json` file is read. 

It used to be that the `DefaultDockerClientConfig` class lazy-loaded the `config.json` file when first needed, like this:

```java
class DefaultDockerClientConfig {
    // ...
     @Nonnull
     public DockerConfigFile getDockerConfig() {
-        if (dockerConfig == null) {
-            try {
-                dockerConfig = DockerConfigFile.loadConfig(getObjectMapper(), getDockerConfigPath());
-            } catch (IOException e) {
-                throw new DockerClientException("Failed to parse docker configuration file", e);
-            }
-        }
         return dockerConfig;
     }
    // ...
}
```

Those lines which are marked with a `-` were then removed with my commit, and instead the `dockerConfig` was injected to the `DefaultDockerClientConfig` class at construction time. I did this because I needed to use properties from the config.json file (namely the context) earlier in the proces. 

Stepping around with the debugger, starting from that same test that failed that I quoted in the previous post, I am starting to build a hypothesis of what's going on. So, it looks like it's trying to read a config.json file from the test resources that looks like this:

```json
{
    "auths":{
        "https://index.docker.io/v1/":{
            "auth":"XXXX=",
            "email":"foo.bar@test.com"
        }
    }
}
```

That `auth` property there is supposed to be a Base64-encoded auth string, username and password separated with a colon like in Basic authentication. 

But that's not a proper [Base64](https://en.wikipedia.org/wiki/Base64)-encoded string. 

In Base64, four bytes of Base64 is decoded back to three bytes of original data. So `XXXX` is a valid Base64 string, representing the bytes 93, 117 and 215. We could write it as `]u�` where that last character means that this is not a byte that in itself represents a character in the UTF-8 character set. The following `=` makes no sense here – sometimes trailing `=` signs are used in Base64 to pad the end of the output when your original data is not of a length divisible by three. 

Like, look at [these examples](https://en.wikipedia.org/wiki/Base64#Output_padding) from Wikipedia:

| Encoded         | Padding | Length | Decoded    |
|-----------------|---------|--------|------------|
| `bGlnaHQgdw==`  | `==`    | 1      | light w    |
| `bGlnaHQgd28=`  | `=`     | 2      | light wo   |
| `bGlnaHQgd29y`  | None    | 3      | light wor  |

&nbsp;

So a trailing `=` should (or could, padding is not always used) be used when the last chunk of data is 2 bytes of length; here is is three bytes (or empty, depending on how we look at it). 

I got curious – how do different Base64 decoders deal with a situation like this? 

On my Mac I have a standard CLI tool called `base64`, I'm pretty sure it's installed by the OS. It happily decodes the string `XXXX`, but what does it do with `XXXX=`?

```shell
$ echo 'XXXX' | base64 -D
]u�%
$ # (That percentage you see at the end is my shell saying it didn't end with a newline) 
$ echo 'XXXX=' | base64 -D
$
```

It just... silently ignores the whole thing. Not even an error code. Wow. 

What does Python do?

```shell
$ python3
Python 3.10.9 (main, Dec 15 2022, 10:44:50) [Clang 14.0.0 (clang-1400.0.29.202)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
>>> import base64
>>> base64.b64decode("XXXX")
b']u\xd7'
>>> base64.b64decode("XXXX=")
b']u\xd7'
>>>
```

It decodes the stuff it sees, and then silently ignores the weird padding.  

And then Java:

```shell
$ jshell
|  Welcome to JShell -- Version 19.0.2
|  For an introduction type: /help intro

jshell> var decoder = java.util.Base64.getDecoder()
decoder ==> java.util.Base64$Decoder@c038203

jshell> decoder.decode("XXXX")
$2 ==> byte[3] { 93, 117, -41 }

jshell> decoder.decode("XXXX=")
|  Exception java.lang.IllegalArgumentException: Input byte array has wrong 4-byte ending unit
|        at Base64$Decoder.decode0 (Base64.java:838)
|        at Base64$Decoder.decode (Base64.java:566)
|        at Base64$Decoder.decode (Base64.java:589)
|        at (#3:1)
```

Exactly that error we saw in the failing tests.

(Maybe you haven't run `jshell` recently? I was happy to discover that it now has some pretty awesome syntax highlighting and tab completion! That was not there in Java 17!)  

These three different behaviors from Shell, Python and Java seem pretty characteristic of the three philosophies at play here. I bet someone has made a more complete alignment chart like this:

|             | **Lawful** | **Neutral** | **Chaotic** |
|-------------|------------|-------------|-------------|
| **Good**    | Java       |             | Python      |
| **Neutral** |            |             |             |
| **Evil**    |            |             | Shell       |

&nbsp;

But anyway. Where were we. Right. Docker Java and some failing test. 

Yeah, so the thing is, we have this `config.json` in the test suite that does not parse correctly. As far as I can tell/guess, it never would have. But the tests would not fail, because this config would never have been loaded, as it was only lazy loaded upon request. With my changes, it's always loaded.

So what happens if we just change that value to be a valid Base64-encoded auth string? Let's use `jshell` again, that was fun, and encode the string `username:password`:

```shell
❯ jshell
|  Welcome to JShell -- Version 19.0.2
|  For an introduction type: /help intro

jshell> var encoder = java.util.Base64.getEncoder()
encoder ==> java.util.Base64$Encoder@29ee9faa

jshell> new String(encoder.encode("username:password".getBytes()))
$2 ==> "dXNlcm5hbWU6cGFzc3dvcmQ="

jshell>
```

Putting that guy into that `config.json`, and now the test is green! 

That, of course, does not in itself mean that we have done the right thing. There are lots of wrong things you can do that makes a failing test green. Maybe this test case was constructed exactly like that for a reason. Maybe to assert the behavior that the config file is not read when it shouldn't be. That seems like a bit of an opaque way of asserting that. But I should check with the docker-java maintainers.

For now, I'm happy with this though. However, we still have some other failures in some other tests in the test class. I'll look at them tomorrow.

_[Continue reading about the green again test suite](/posts/2023-02-05-the-finally-green-again-test-suite)_
