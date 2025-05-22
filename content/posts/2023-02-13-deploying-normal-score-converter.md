---
layout: post
title:  "Setting up a wildcard certificate for skagedal.tech"
summary: "Since I now have three subdomains that need certificates, it's time to set up a wildcard certificate."
---
Here at skagedal's oboy, we don't just talk about writing code, but also about the mundane details of getting it deployed. For example, with the habit tracker, I wrote about [uploading it to the server](/posts/2023-01-22-habit-tracker-deploying-the-jar) and [exposing the service](/posts/2023-01-25-habit-tracker-exposing-it) to the Internet. 

Now it's time to deploy the Normal Score converter, an old project which I managed to get building in the [previous post](/posts/2023-02-12-building-normal-score-converter). First of all, it should have its own subdomain, and it should be protected by HTTPS.  
Previously, I've set up certbot to get and renew certificates for each domain, `skagedal.tech`, `blog.skagedal.tech` and `hahabit.skagedal.tech`. Now I want to also set up `normalscore.skagedal.tech`. It gets a bit tedious – wouldn't it be sweet if I could just have one certificate for all of them, and future needs?  

[This answer](https://serverfault.com/a/566433) on Stack Exchange explains that this is indeed possible using something called a wildcard certificate. Let's Encrypt, the free Certificate Authority that I use, confirms in [their FAQ](https://letsencrypt.org/docs/faq/) that they do support such certificates, and [this guide](https://www.digitalocean.com/community/tutorials/how-to-create-let-s-encrypt-wildcard-certificates-with-certbot) from Digital Ocean tells me how to set it up. Let's give it a shot. 

The first step in the guide, "Setting up a Wildcard DNS", is something I've already taken care of, as I also discussed in [this post](/posts/2023-01-25-habit-tracker-exposing-it). Here is what my DNS setup looks like (viewing it in the DigitalOcean console):


| Type | Hostname        | Value                          | TTL (seconds) |
|------|-----------------|--------------------------------|---------------|
| A    | *.skagedal.tech | directs to 142.93.136.170      | 3600          |
| A    | skagedal.tech   | directs to 142.93.136.170      | 3600          |
| NS   | skagedal.tech   | directs to n2.digitalocean.com | 1800          |
| NS   | skagedal.tech   | directs to n1.digitalocean.com | 1800          |
| NS   | skagedal.tech   | directs to n3.digitalocean.com | 1800          |


But then apparently, I'm going to need to install a "certbot DNS plugin". Hmm. Not sure why, but let's continue. As you know, I'm on DigitalOcean, so I'll go with the `certbot-dns-digitalocean` plugin. 

```
$ sudo apt install python3-certbot-dns-digitalocean
```

And now let's check if the plugins are loaded:

```
$ certbot plugins

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
* dns-digitalocean
Description: Obtain certificates using a DNS TXT record (if you are using
DigitalOcean for DNS).
Interfaces: Authenticator, Plugin
Entry point: dns-digitalocean =
certbot_dns_digitalocean._internal.dns_digitalocean:Authenticator

* nginx
Description: Nginx Web Server plugin
Interfaces: Installer, Authenticator, Plugin
Entry point: nginx = certbot_nginx._internal.configurator:NginxConfigurator

* standalone
Description: Spin up a temporary webserver
Interfaces: Authenticator, Plugin
Entry point: standalone = certbot._internal.plugins.standalone:Authenticator

* webroot
Description: Place files in webroot directory
Interfaces: Authenticator, Plugin
Entry point: webroot = certbot._internal.plugins.webroot:Authenticator
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

Allright, yeah, that seems right.

I'm not quite sure why we are doing this, but now I'm reading that...

> Because Certbot needs to connect to your DNS provider and create DNS records on your behalf, you’ll need to give it permission to do so. 

Ugh. Why does it have to create new DNS records? My DNS is fine? I just want a certificate? No?

I read through the guide again, slowly, and now I see the relevant paragraph:

> Before issuing certificates, Let’s Encrypt performs a challenge to verify that you control the hosts you’re requesting certificates for. In the case of a wildcard certificate, we need to prove that we control the entire domain. We do this by responding to a DNS-based challenge, where **Certbot answers the challenge by creating a special DNS record in the target domain**. Let’s Encrypt’s servers then verify this record before issuing the certificate.

(My emphasis.) Allright, that makes sense I guess. 

Well, I guess I'll just have to try it, after taking some relevant backup copies. Ok. I generate a DigitalOcean API token, and put it in the `certbot-creds.ini` file according to the guide, and then I take a deep breath and run this:

```shell
$ sudo certbot certonly \
    --dns-digitalocean 
    --dns-digitalocean-credentials ~/certbot-creds.ini \
     -d '*.skagedal.tech'
```

It responds with:

```
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Requesting a certificate for *.skagedal.tech
Waiting 10 seconds for DNS changes to propagate

Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/skagedal.tech-0001/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/skagedal.tech-0001/privkey.pem
This certificate expires on 2023-05-12.
These files will be updated when the certificate renews.
Certbot has set up a scheduled task to automatically renew this certificate in the background.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
If you like Certbot, please consider supporting our work by:
 * Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
 * Donating to EFF:                    https://eff.org/donate-le
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

Cool, that went well I guess!

I love how well this thing works, my other certificates from Let's Encrypt have been all been successfully updated in the background without me ever having to worry.

But now I worry about something: when it renews this certificate this time, will it again need to do the DNS dance? If so, that DigitalOcean API token needs to be updated as well. And now I took one that expires after 90 days. 

Or is that just something it does the first time? I'll take a look at how this renewal thing is configured. Finding some very relevant stuff in the `/etc/letsencrypt/renewal` folder – here's the configuration for the certificate it just created, which I guess is called `skagedal.tech-0001` since there was already one called `skagedal.tech`:

```
# renew_before_expiry = 30 days
version = 1.21.0
archive_dir = /etc/letsencrypt/archive/skagedal.tech-0001
cert = /etc/letsencrypt/live/skagedal.tech-0001/cert.pem
privkey = /etc/letsencrypt/live/skagedal.tech-0001/privkey.pem
chain = /etc/letsencrypt/live/skagedal.tech-0001/chain.pem
fullchain = /etc/letsencrypt/live/skagedal.tech-0001/fullchain.pem

# Options used in the renewal process
[renewalparams]
account = 0a5acb3c10c1509717e114f5cd0297b6
authenticator = dns-digitalocean
dns_digitalocean_credentials = /home/simon/certbot-creds.ini
server = https://acme-v02.api.letsencrypt.org/directory
```

So yeah, it seems to have recorded the place where I stored those credentials. Pretty sure it'll use those again. Pretty sure I'll have to make sure that API token is updated. How am I going to remember that?!

Hopefully, DigitalOcean will send me an e-mail or something when the API token is about to expire. I'll just have to make sure to read my e-mails. I mean I could have also chosen an API token that never expires, but people say that's bad. 

Anyway, let's forget about tomorrow.

Now, can we set up my `normalscore.skagedal.tech` site to use this certificate?

Making my `normalscore.nginx` file to be this:

```
server {
    server_name normalscore.skagedal.tech;

    listen [::]:443 ssl;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/skagedal.tech-0001/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/skagedal.tech-0001/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /home/simon/normalscore;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}

server {
    server_name normalscore.skagedal.tech;

    listen 80;
    listen [::]:80;

    if ($host = normalscore.skagedal.tech) {
        return 301 https://$host$request_uri;
    }

    return 404;
}
```

Putting some nonsense in `~/normalscore/index.html`, and navigating to https://normalscore.skagedal.tech in my browser, and yeah! I can see the nonsense I put in `~/normalscore/index.html` there, and I can view the certificate and confirm that it's this shiny new one I created. Nice. I also replace the certificates of blog.skagedal.tech with this one, and it works fine. I realize I can't use this for the top-level skagedal.tech though, since that doesn't match the wildcard. Apparently, what I'd need to do to make that work with the same certificate is to put it as a Sugject Alternative Name in the certificate. Maybe later.

Another thing I need to do is to make sure that nginx gets restarted properly when the certificate is renewed. This happens automatically when you use the "nginx" plugin for certbot, but we can't have that for wildcard certificates. [This site](https://blog.arnonerba.com/2019/01/lets-encrypt-how-to-automatically-restart-nginx-with-certbot) describes one approach.

But anyway, as I said, let's forget about tomorrow. I am now ready to put the real Normal Score Converter content in the new site! Tomorrow! Which I just said I would forget about! 

_[Continue reading the final installment of this short series](/posts/2023-02-14-deploying-and-fixing-chrome-bug)_