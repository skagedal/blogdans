---
layout: post
title: "Connecting to local PostgreSQL from Docker"
summary: ""
draft: true
---


So far, I've been hosting various software on this Ubuntu Virtual Private Server (VPS) by running them directly on the host machine. 
But I've recently started to use Docker instead. The software that now runs this blog, a Next.js application that I've meant to write
a few words about, is running this way. 

I [ran into problems](https://github.com/skagedal/blogdans/issues/6) when I tried to connect to the PostgreSQL database, which runs as a normal Ubuntu service, from within a Docker container. I found out that I both needed to configure PostgreSQL differently, to listen to a different interface, and also that I needed to open up the firewall a bit. Here are my notes on the troubleshooting process.

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
host $ docker run --rm -it --add-host myhost:host-gateway jonlabelle/network-tools
[network-tools]$ ping myhost
PING myhost (172.17.0.1) 56(84) bytes of data.
64 bytes from myhost (172.17.0.1): icmp_seq=1 ttl=64 time=0.112 ms
64 bytes from myhost (172.17.0.1): icmp_seq=2 ttl=64 time=0.078 ms
^C
--- myhost ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1046ms
rtt min/avg/max/mdev = 0.078/0.095/0.112/0.017 ms
```

Allright, so at least I can reach the host using ping. This uses the ICMP protocol, which isn't using built on TCP (or UDP) – there is no port that a "ping" server is listening to on the host. What's a minimal TCP service I can run on the host to test if I can reach it from inside the container? [Netcat](https://en.wikipedia.org/wiki/Netcat) (or `nc`) is a good choice. I can start up a "server" on the host like this:

```shell
host $ nc -l 6666
```

In another shell, I can confirm that it is listening:

```shell
host $ sudo netstat -ntlp | grep nc
tcp        0      0 0.0.0.0:6666            0.0.0.0:*               LISTEN      38294/nc
```

And I can also connect to it:
```
host $ nc 127.0.0.1 6666
hello
```

This starts up a "chat"-like connection to the server, so the "hello" turns up on the server side. Nice. But what if I try to connect from inside the container? 

```shell
host $ docker run --rm -it --add-host myhost:host-gateway jonlabelle/network-tools
[network-tools]$ nc myhost 6666
```

This just hangs forever. A small session with ChatGPT gave me the right clue, however:

> If you run into issues, check:
> 
> * Host firewall rules (e.g., `ufw`) and that Docker’s iptables integration isn’t blocking.
> * That nc variant/syntax matches your distro (`nc -l -p 6666` vs `nc -l 6666`).

Firewall! I do have a firewall. This hadn't entered my mind, probably because my mental model for Docker and networking has been a bit incomplete; I've been basically thinking about it as still running "on the same machine". Which is of course true, hardware-wise, but not the right way to think of it from a networking perspective. My host is really getting a connection from a Different Machine, networking-wise, and the firewall is doing its job, blocking it. 



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