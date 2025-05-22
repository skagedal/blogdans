---
layout: post
title:  "Writing a habit tracker, part 25: Exposing it to the Internet!"
---

Now the service is [running](/posts/2023-01-24-habit-tracker-always-running-it) on the machine. But we can't yet connect to it from other machines.. 

I'd like to set it up so that it **listens to requests** on `hahabit.skagedal.tech`. And I would very much like the traffic to be **protected by TLS**. 

I always forget how these things work. With DNS and so on. Do I have to do anything with DNS? Let's what happens if we do a DNS lookup for `skagedal.tech`:

```shell
$ nslookup skagedal.tech
Server:		10.101.12.1
Address:	10.101.12.1#53

Non-authoritative answer:
Name:	skagedal.tech
Address: 142.93.136.170
```

I'm not really sure why it says that the DNS server is 10.101.12.1, that looks like it's an address in the private network...? And what does #53 mean? Anyway, the interesting thing is what it resolves `skagedal.tech` to – so 142.93.136.170 is the IP of my machine. My own little virtual machine on the Internet. Nice. 

I also have `blog.skagedal.tech` set up. I did this a few years ago and I don't remember much. So that should reach the same machine, I only have one. 

```shell
$ nslookup blog.skagedal.tech
Server:		10.101.12.1
Address:	10.101.12.1#53

Non-authoritative answer:
Name:	skagedal.tech
Address: 142.93.136.170
```

Nice, so I guess I set that up also somehow. Or is it more like, anything.skagedal.tech resolves to this? 

```shell
$nslookup littlefluffyclouds.skagedal.tech
Server:		10.101.12.1
Address:	10.101.12.1#53

Non-authoritative answer:
Name:	skagedal.tech
Address: 142.93.136.170
```

I definitely did not specifically set that up. So I guess we're good, DNS-wise – every subdomain to skagedal.tech leads to that same machine. I just gotta **set up `nginx`** – which is what receives calls on the machine – and make it forward requests to `hahabit` if that's the host, specified in the `Host` header. 

One thing I like with Digital Ocean is that they have really nice guides for everything. Like this one: [How To Configure Nginx as a Reverse Proxy on Ubuntu 22.04](https://www.digitalocean.com/community/tutorials/how-to-configure-nginx-as-a-reverse-proxy-on-ubuntu-22-04). I'm literally just following that and putting this is as my `/etc/nginx/sites-available/hahabit.skagedal.tech`:

```
server {
    listen 80;
    listen [::]:80;

    server_name hahabit.skagedal.tech;

    location / {
        proxy_pass http://127.0.0.1:8080;
        include proxy_params;
    }
}
```

One thing I didn't quite understand here is what the second line of these two is actually doing:

```
    listen 80;
    listen [::]:80;
```

I asked ChatGPT, "can you explain this configuration to me?", and dumped the snippet of configuration in there, and it explained it said:

> This is an example of a server block for the Nginx web server. The block begins with the "server" directive and specifies the following configuration:
>
> * The server will listen for incoming connections on both IPv4 and IPv6 address on port 80.
> * The "server_name" directive specifies that this block will only be applied to requests made to the host "hahabit.skagedal.tech".
> * The "location" directive specifies a URL pattern that this block will handle. In this case, it is the root path "/", meaning any request made to the server will be handled by this block.
> * The "proxy_pass" directive tells Nginx to forward all requests made to this location to the specified address (http://127.0.0.1:8080)
> * The "include" directive is used to include the configuration file named "proxy_params", this is a common practice to separate out repetitive configurations for readability and maintainability.
> 
> This configuration tells Nginx to listen on port 80 for incoming connections and forward requests to the host "hahabit.skagedal.tech" to the specified backend (http://127.0.0.1:8080) using the proxy_params include file.

Very cool, I get it. The first line is IPv4 and the second one is IPv6. (Does my machine have an IPv6 address? Looks like I have not enabled it in the Digital Ocean console. Oh well.)

So anyway, that was just specifying an "available" site – I need to also enable it. That's done with a symlink:

```shell
$ sudo ln -s /etc/nginx/sites-available/hahabit.skagedal.tech /etc/nginx/sites-enabled/
```

And then I restart nginx:

```shell
$ sudo systemctl restart nginx
```

And boom! My little habit tracker app is available on the Internet! Trying this from my MacBook:

```shell
$ curl -v hahabit.skagedal.tech
*   Trying 142.93.136.170:80...
* Connected to hahabit.skagedal.tech (142.93.136.170) port 80 (#0)
> GET / HTTP/1.1
> Host: hahabit.skagedal.tech
> User-Agent: curl/7.85.0
> Accept: */*
>
* Mark bundle as not supporting multiuse
< HTTP/1.1 401
< Server: nginx/1.18.0 (Ubuntu)
< Date: Fri, 20 Jan 2023 21:30:49 GMT
< Content-Length: 0
< Connection: keep-alive
< WWW-Authenticate: Basic realm="Realm"
< X-Content-Type-Options: nosniff
< X-XSS-Protection: 0
< Cache-Control: no-cache, no-store, max-age=0, must-revalidate
< Pragma: no-cache
< Expires: 0
< X-Frame-Options: DENY
< Set-Cookie: SESSION=ZDZjMTA0NGItYTkzMS00OTliLTg5YmQtY2NkMzkzY2Q5OTUx; Path=/; HttpOnly; SameSite=Lax
< WWW-Authenticate: Basic realm="Realm"
<
* Connection #0 to host hahabit.skagedal.tech left intact
```

That's my machine, talking to Spring Boot via nginx, and a hell of a lot of other little wires in between.

Final step is make sure the **traffic is encrypted**. It's cool that we can get that for free these days using Let's Encrypt. And Digital Ocean has a guide for this as well, [How To Secure Nginx with Let's Encrypt on Ubuntu 22.04](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-22-04).

I followed this guide when I set up `skagedal.tech`. Then when I set up `blog.skagedal.tech`, I remember I was unsure whether I should just set it up using the same steps again, getting a new certificate, or if I could somehow reuse the same one. Then I was lazy and got a new one, because that was easier. It would have been nice if I had not been lazy so that I could just reuse the same setup once more. So, what do we do now? Are we nice to now-Simon or nice to future-Simon?

I think that for now, I'm gonna just be lazy again. 

```shell
$ sudo certbot --nginx -d hahabit.skagedal.tech
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Requesting a certificate for hahabit.skagedal.tech

Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/hahabit.skagedal.tech/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/hahabit.skagedal.tech/privkey.pem
This certificate expires on 2023-04-20.
These files will be updated when the certificate renews.
Certbot has set up a scheduled task to automatically renew this certificate in the background.

Deploying certificate
Successfully deployed certificate for hahabit.skagedal.tech to /etc/nginx/sites-enabled/hahabit.skagedal.tech
Congratulations! You have successfully enabled HTTPS on https://hahabit.skagedal.tech

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
If you like Certbot, please consider supporting our work by:
 * Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
 * Donating to EFF:                    https://eff.org/donate-le
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

Now I get a different response when I call hahabit.skagedal.tech with plain HTTP:

```shell
$ curl -v hahabit.skagedal.tech
*   Trying 142.93.136.170:80...
* Connected to hahabit.skagedal.tech (142.93.136.170) port 80 (#0)
> GET / HTTP/1.1
> Host: hahabit.skagedal.tech
> User-Agent: curl/7.85.0
> Accept: */*
>
* Mark bundle as not supporting multiuse
< HTTP/1.1 301 Moved Permanently
< Server: nginx/1.18.0 (Ubuntu)
< Date: Fri, 20 Jan 2023 22:08:13 GMT
< Content-Type: text/html
< Content-Length: 178
< Connection: keep-alive
< Location: https://hahabit.skagedal.tech/
<
<html>
<head><title>301 Moved Permanently</title></head>
<body>
<center><h1>301 Moved Permanently</h1></center>
<hr><center>nginx/1.18.0 (Ubuntu)</center>
</body>
</html>
* Connection #0 to host hahabit.skagedal.tech left intact
```

(Curl defaults to HTTP.)

And I need to use https to actually access my site:

```shell
$ curl -v https://hahabit.skagedal.tech
*   Trying 142.93.136.170:443...
* Connected to hahabit.skagedal.tech (142.93.136.170) port 443 (#0)
* ALPN: offers h2
* ALPN: offers http/1.1
*  CAfile: /etc/ssl/cert.pem
*  CApath: none
* (304) (OUT), TLS handshake, Client hello (1):
* (304) (IN), TLS handshake, Server hello (2):
* (304) (IN), TLS handshake, Unknown (8):
* (304) (IN), TLS handshake, Certificate (11):
* (304) (IN), TLS handshake, CERT verify (15):
* (304) (IN), TLS handshake, Finished (20):
* (304) (OUT), TLS handshake, Finished (20):
* SSL connection using TLSv1.3 / AEAD-CHACHA20-POLY1305-SHA256
* ALPN: server accepted http/1.1
* Server certificate:
*  subject: CN=hahabit.skagedal.tech
*  start date: Jan 20 21:06:58 2023 GMT
*  expire date: Apr 20 21:06:57 2023 GMT
*  subjectAltName: host "hahabit.skagedal.tech" matched cert's "hahabit.skagedal.tech"
*  issuer: C=US; O=Let's Encrypt; CN=R3
*  SSL certificate verify ok.
> GET / HTTP/1.1
> Host: hahabit.skagedal.tech
> User-Agent: curl/7.85.0
> Accept: */*
>
* Mark bundle as not supporting multiuse
< HTTP/1.1 401
< Server: nginx/1.18.0 (Ubuntu)
< Date: Fri, 20 Jan 2023 22:09:19 GMT
< Content-Length: 0
< Connection: keep-alive
< WWW-Authenticate: Basic realm="Realm"
< X-Content-Type-Options: nosniff
< X-XSS-Protection: 0
< Cache-Control: no-cache, no-store, max-age=0, must-revalidate
< Pragma: no-cache
< Expires: 0
< X-Frame-Options: DENY
< Set-Cookie: SESSION=NWU0ZWVkZWMtYTFhMS00MmY5LTllNzQtMzFlNjYzZjUzMWY4; Path=/; HttpOnly; SameSite=Lax
< WWW-Authenticate: Basic realm="Realm"
<
* Connection #0 to host hahabit.skagedal.tech left intact
```

Nice! I can see that there's a certificate that expires in 90 days or so. `certbot` will automatically renew it. 

What happened now when I ran certbot with the nginx pluging is that it actually went and changed my nginx config file, the one I put in sites-available. I think I'll want to clean that up a little later. Maybe. Later.

_[Continue reading part twenty-six.](/posts/2023-01-26-habit-tracker-usability)_
