---
layout: post
title:  "Testcontainers and Colima"
---

At work, we use Docker containers quite a bit. For deploying stuff on ECS and Kubernetes, of course, but also for supporting the local development environment in various ways. All developers have Macs, so this has meant we use Docker Desktop for Mac. But recently, the cost for this has increased quite a bit, so the developer experience team investigated alternatives. And found [Colima](https://github.com/abiosoft/colima). It is based on a project called [Lima](https://github.com/lima-vm/lima), which means "Linux on Mac", and then Colima adds the "Co", standing for Containers.

It works great for the most part, but there have been some annoyances about running [Testcontainers for Java](https://www.testcontainers.org/). Individual experiences seem to vary a little, but at least for several of us, the following needs to be true in order to successfully run Testcontainers tests:

* `colima` needs to be started with the `--network-address` flag
* `DOCKER_HOST` needs to be set to `unix://${HOME}/.colima/docker.sock`
* `TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE` needs to be set to /var/run/docker.sock
* `TESTCONTAINERS_HOST_OVERRIDE` needs to be set to the IP address which you get from `colima ls -j | jq -r '.address'`, given that you have started `colima` with `--network-address`.

That's a lot of annoying stuff. Running regular docker commands in the shell Just Works – this should too. And with Docker Desktop for Mac, Testcontainers used to also just work. I'd like to unpack what's going on with all of this, or at least some of it, and see what we can do to fix it.

## Using Docker Contexts 

The environment variable `DOCKER_HOST` simply tells Docker clients where to find the Docker server. Not that strange. But like I said, other Docker clients seem to just work, even without having set this. How come?

Turns out there's this fairly recent feature of Docker called [Docker Context](https://docs.docker.com/engine/context/working-with-contexts/). A "docker context" contains all of the endpoint and security information required to manage a Docker cluster or node, and you can manage them using the `docker context` subcommands in the CLI. 

If I run `docker context ls`, without having any Docker specific environment variables set, this is what I get:

```shell
$ docker context ls
NAME            DESCRIPTION                               DOCKER ENDPOINT                                   KUBERNETES ENDPOINT   ORCHESTRATOR
colima *        colima                                    unix:///Users/simon/.colima/default/docker.sock
default         Current DOCKER_HOST based configuration   unix:///var/run/docker.sock                                             swarm
desktop-linux                                             unix:///Users/simon/.docker/run/docker.sock
```


So there is a `colima` context – which was created when I set up `colima` – and there's a `desktop-linux` context, which I think is still there since when I had Docker Desktop for Mac installed, and the `colima` context is the currently selected one. Then there's the `default` context, which I guess is a word for the context when there is no _explicit_ context – i.e., when you're just in classic mode, using the default value compiled in to the `docker` client binary that you can override with an environment variable. 

So with this context set to `colima`, I can do all sorts of normal Docker stuff with the CLI – start and stop containers, and so on. But what happens when I run a test that uses Testcontainers? 

We can use [this little example repo](https://github.com/skagedal/testcontainers-hello/tree/main) that I set up before. It has a single, simple little test case that creates a Testcontainer and asserts that it works:

```java
class AppTest {
    @Test
    void testcontainers_mysql() {
        // Start a container
        try (final var container = new MySQLContainer<>(DockerImageName.parse("mysql:8.0.31"))) {
            container.start();

            String query = "SELECT version()";

            final var connection = DriverManager.getConnection(
                container.getJdbcUrl(), container.getUsername(), container.getPassword());
            final var statement = connection.createStatement();
            final var resultSet = statement.executeQuery(query);

            assertTrue(resultSet.next());
            final var version = resultSet.getString(1);
            assertEquals("8.0.31", version);
        } catch (Exception exception) {
            fail(exception);
        }
    }
}
```

When I run this little test with `./gradlew test` and my Docker context as described above, I get this error:

```text
[Test worker] ERROR org.testcontainers.dockerclient.DockerClientProviderStrategy - Could not find a valid Docker environment. Please check configuration. Attempted configurations were:
    UnixSocketClientProviderStrategy: failed with exception InvalidConfigurationException (Could not find unix domain socket). Root cause NoSuchFileException (/var/run/docker.sock)As no valid configuration was found, execution cannot continue.
See https://www.testcontainers.org/on_failure.html for more details.
We failed:
Could not find a valid Docker environment. Please see logs and check configuration
```

Apparently, it's trying to use the default socket at `/var/run/docker.sock`, rather than our chosen current docker context.

The problem here is that Testcontainers for Java does not know about Docker Contexts at all. 

Let's try to fix that! 

_[Continue reading about supporting Docker contexts in docker-java](/posts/2023-01-31-test-containers-and-docker-context)_
