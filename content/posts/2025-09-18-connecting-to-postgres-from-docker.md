---
layout: post
title: "Connecting to local PostgreSQL from Docker"
summary: ""
draft: true
---


So far, I've been hosting various software on this Ubuntu Virtual Private Server (VPS) by running them directly on the host machine. 
But I've recently started to use Docker instead. The software that now runs this blog, a Next.js application that I've meant to write
a few words about, is running this way. 

I ran into problems when I tried to connect to the PostgreSQL database, which runs as a normal Ubuntu service, from within a Docker container. I found out that I both needed to configure PostgreSQL differently, to listen to a different interface, and also that I needed to open up the firewall a bit. Here are my notes on the troubleshooting process.

So, the application just failed to connect, getting a timeout error. To simplify things, I tried instead to connect using the `psql` tool. Directly from the host, I can make connections to it using both Unix sockets and IP. Below, the prompt `host $` means I'm running directly on the host machine, while `docker $` means I'm inside a Docker container.

```shell
host $ psql -U myuser
# This works, connects via Unix socket
host $ psql -h 127.0.0.1 -U myuser
# This also works, asks for password, connects via TCP
```

To try this from inside a Docker, we can use the [postgres](https://hub.docker.com/_/postgres) image, starting up a throwaway `psql` container:

```shell
host $ docker run -it --rm postgres psql -U myuser
psql: error: connection to server on socket "/var/run/postgresql/.s.PGSQL.5432" failed: No such file or directory
        Is the server running locally and accepting connections on that socket?
```

This tries to connect (via Unix socket) to a PostgreSQL server running inside the container, which of course doesn't exist. We want to connect to host's PostgreSQL server. But what host name or IP address should we use? Using `localhost` or `127.0.0.1` won't work, because those addresses refer to the container's own loopback interface.

On Mac and Windows, Docker provides a special DNS name `host.docker.internal` that resolves to the host machine. This doesn't exist on Linux. You can add a host entry to the container with `--add-host` and use the special `host-gateway` value to get the host's gateway address. So let's try that, naming our host entry `myhost`:

```shell
host $ docker run -it --rm --add-host myhost:host-gateway postgres psql -h myhost -U myuser
```

It tells me that it tries to connect to the IP 172.17.0.1. But it just times out after a few minutes of trying to connect.

I googled around for hints. 

- [This StackOverflow answer](https://stackoverflow.com/a/38466547/1132101)
- [This Gist](https://gist.github.com/MauricioMoraes/87d76577babd4e084cba70f63c04b07d)

But it still didn't work. I turned on some [logging](https://www.postgresql.org/docs/current/runtime-config-logging.html) in PostgreSQL (`log_connections` and `log_disconnections`), but it didn't show any attempts to connect. So it seems that the connection attempt isn't even reaching PostgreSQL.

It seems like there was something I was missing on a core networking level, nothing to do with PostgreSQL. I decided to simplify the problem a bit further. I found a docker image, [https://github.com/jonlabelle/docker-network-tools](docker-network-tools) by Jon Labelle, that would allow me to have a shell in a Docker container with some basic networking tools.

```shell
docker run --rm -it jonlabelle/network-tools
```


Look:

```bash
psql -h localhost -U postgres

psql -h /var/run/postgresql -U postgres

psql -h 127.0.0.1 -p 5432 -U blogdans
```

But when I try to connect from a Docker container, it fails:

```bash
docker run -it --add-host skagedal-tech-internal:host-gateway --rm postgres psql -h skagedal-tech-internal -U blogdans
```




### Back to basics

Let's forget about PostgreSQL for a moment. 

Can I ping my host from inside the container?

```bash
docker run -it --add-host internal:host-gateway --rm ubuntu bash
```

```
docker run --rm -it jonlabelle/network-tools
```




Other useful links:
- [Bridge network driver](https://docs.docker.com/engine/network/drivers/bridge/)
- [Seeing what's listening on a port](https://askubuntu.com/a/328293)