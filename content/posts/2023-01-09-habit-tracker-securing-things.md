---
layout: post
title:  "Writing a habit tracker, part 9: Securing some web"
---
Now, let's add Spring Security back again, by un-commenting out the line in `build.gradle` I previously commented out.

It turns out that this default security setting – which gets applied when you have Spring Security on the class path, but have not configured it – means all of your endpoints are protected with a Basic Auth login where the user is `user` and the password is posted in the console output, like this:

```text
Using generated security password: 78fa095d-3f4c-48b1-ad50-e24c31d5cf35

This generated password is for development use only. Your security configuration must be updated before running your application in production.
```

If I open up the page `http://localhost:8080` in my Chrome browser, I get redirected to a login screen (`http://localhost:8080/login`), and there I can enter `user` and the password from my console output. But... that's not Basic Auth, is it? "Basic Auth", as I know it, is usually implemented by browsers by their own little popup, not a custom form.   

So what's happening here?

Let's explore it a little using `curl`. (My shell prompt in these posts is written as `$`.)

```shell
$ curl http://localhost:8080
$
```
Ok, that's not very helpful, `curl`. Please be more verbose:

```shell
$ curl http://localhost:8080 --verbose
*   Trying 127.0.0.1:8080...
* Connected to localhost (127.0.0.1) port 8080 (#0)
> GET / HTTP/1.1
> Host: localhost:8080
> User-Agent: curl/7.85.0
> Accept: */*
>
* Mark bundle as not supporting multiuse
< HTTP/1.1 401
< Set-Cookie: JSESSIONID=A0A8B589732A7DDE0CBDBA58A6901218; Path=/; HttpOnly
< WWW-Authenticate: Basic realm="Realm"
< X-Content-Type-Options: nosniff
< X-XSS-Protection: 0
< Cache-Control: no-cache, no-store, max-age=0, must-revalidate
< Pragma: no-cache
< Expires: 0
< X-Frame-Options: DENY
< WWW-Authenticate: Basic realm="Realm"
< Content-Length: 0
< Date: Sun, 08 Jan 2023 09:36:31 GMT
<
* Connection #0 to host localhost left intact
```

In this mode, `curl` is using `*` at the start of lines that contain general "log" messages, `>` for lines that curl is sending to the server, and `<` for lines that curl is getting back from the server. 

So, I'm a bit confused. We can see that we get a [401](https://http.cat/401) response:

```text
< HTTP/1.1 401
```

This means that we're unauthorized. And we get this header that challenges us to do a `Basic` authentication:

```text
< WWW-Authenticate: Basic realm="Realm"
```

That's all good. That's Basic Auth. But why is it then that in Chrome, when I open up this page, I get redirected to some `/login` page? There is no indication of that happening here. It's got to be that Chrome sends some other headers or something, that Spring looks at and decides to make it a redirect to a nice login page. What would that be?

I'm now looking opening up `localhost:8080` in Chrome again, but this time with the Network inspector open. 

I can indeed see that the request here receives a `302` ["Found"](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/302) status code in the response, i.e. a kind of temporary redirect. I can also find the exact Request sent by Chrome:

```text
GET / HTTP/1.1
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Accept-Encoding: gzip, deflate, br
Accept-Language: sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7
Connection: keep-alive
Cookie: JSESSIONID=C189C6ED45DA62EBF685232CDB868589
Host: localhost:8080
Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Sec-Fetch-Site: none
Sec-Fetch-User: ?1
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36
sec-ch-ua: "Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "macOS"
```

Ok, it's got to be something in there that instructs Spring to send me the redirect. Can we replicate this with `curl`? Actually, `curl` is not the right tool – what we're looking here is raw network data sent over TCP, we can use a tool like `nc` (netcat) to send it to Spring. I'm typing this: 

```shell
$ nc localhost 8080
GET / HTTP/1.1
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Accept-Encoding: gzip, deflate, br
Accept-Language: sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7
Connection: keep-alive
Cookie: JSESSIONID=C189C6ED45DA62EBF685232CDB868589
Host: localhost:8080
Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Sec-Fetch-Site: none
Sec-Fetch-User: ?1
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36
sec-ch-ua: "Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "macOS"

```

And then I get back this! 

```text
HTTP/1.1 302
Set-Cookie: JSESSIONID=04F316F0F19E7C633286DF814E74F39B; Path=/; HttpOnly
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY
Location: http://localhost:8080/login
Content-Length: 0
Date: Sun, 08 Jan 2023 09:49:30 GMT
Keep-Alive: timeout=60
Connection: keep-alive

```

Interesting – now I get that 302. So it's gotta be one of those headers we're seeing there in my request, or a combination of them, that triggers this behavior. But which one? 

I don't know, and after trying a couple of options, lazily googling and asking ChatGPT, I suddenly got bored with this tangent. I'm happy right now with understanding _approximately_ how this works[^1]. Let's instead try authenticating ourselves with `curl`.

We can use the `--user` option to set the Basic Authentication header properly.

```shell
$ curl http://localhost:8080 --verbose --user user:78fa095d-3f4c-48b1-ad50-e24c31d5cf35
*   Trying 127.0.0.1:8080...
* Connected to localhost (127.0.0.1) port 8080 (#0)
* Server auth using Basic with user 'user'
> GET / HTTP/1.1
> Host: localhost:8080
> Authorization: Basic dXNlcjphNTIyMDFkMC1lYTE4LTQxOWQtYWQzZC1lZDg5MjgwODgwNzg=
> User-Agent: curl/7.85.0
> Accept: */*
>
* Mark bundle as not supporting multiuse
< HTTP/1.1 200
< X-Content-Type-Options: nosniff
< X-XSS-Protection: 0
< Cache-Control: no-cache, no-store, max-age=0, must-revalidate
< Pragma: no-cache
< Expires: 0
< X-Frame-Options: DENY
< Content-Type: text/html;charset=UTF-8
< Content-Language: en-SE
< Transfer-Encoding: chunked
< Date: Sun, 08 Jan 2023 09:59:58 GMT
<
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <title>Spring Security Example</title>
    </head>
    <body>
        <h1>Welcome!</h1>

        <p>Click <a href="/hello">here</a> to see a greeting.</p>
    </body>
* Connection #0 to host localhost left intact
</html>%
``` 

I used the password posted in my Spring Boot console.

Interestingly, I don't get a session ID cookie back now. If you look back to the unauthenticated `curl` call I did earlier in the post, I got this header back: 

```text
Set-Cookie: JSESSIONID=A0A8B589732A7DDE0CBDBA58A6901218; Path=/; HttpOnly
```

But not now, when authenticated. I wonder why. Oh well.

_[Continue reading part ten.](/posts/2023-01-10-habit-tracker-securing-things-2)_

### Notes

[^1]: In [part thirty-six](/posts/2023-02-21-adding-apis), I figure out this mystery! 
