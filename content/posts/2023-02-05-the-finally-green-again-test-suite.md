---
layout: post
title:  "The finally green again test suite"
---
Continuing on my docker-java changes. As I mentioned in the [previous post](/posts/2023-02-04-test-data-with-invalid-base64), there were still some failing tests in the `DefaultDockerClientConfigTest` class. These also originate in the changes from the commit we [found earlier with git bisect](/posts/2023-02-03-docker-host-env-var-part-2), where I was moving around the code that loaded the `config.json`.

The [fixes](https://github.com/skagedal/docker-java/commit/49149419ca58c5235a38573322b3964e160788c7) aren't all that interesting, or pretty. Earlier, when I added the already loaded `DockerConfigFile` object as a parameter to the constructor of `DefaultDockerClientConfig`, I just lazily made things compile by adding a `new DockerConfig()` to those places in the test suite where it was calling that constructor. Adding some manual loading of the docker config file to some of those places that required it made things work. 

I also now confirmed that the whole test suite, except the integration tests, **is green** now now by doing what the docker-java [CONTRIBUTING.md](https://github.com/docker-java/docker-java/blob/master/CONTRIBUTING.md) file says:

```shell
$ ./mvnw clean install -DskipITs
```

I tried running also the integration tests before, but didn't get it to work (from the `master` branch, that is, without my changes). 

Some of the things here in this commit could probably be cleaned up, but I think it's time to request some **feedback** from the docker-java maintainers again and see if they think things are moving in the right direction. I'll do that and then report back. 

_[Continue reading this series](/posts/2023-02-07-docker-java-pr-merged)_