---
layout: post
title: "Failing at configuring CORS"
summary: "I want to test my API from Swagger UI, but failing at CORS. Finally I find a way to disable it altogether in Chrome." 
---

So we [now](/posts/2023-02-26-adding-openapi) have an OpenAPI spec, and we have a way to preview it by spinning up a Swagger UI Docker image. 

I'm annoyed though, because I can't get the functionality where you can test the spec and run API calls directly in the Swagger UI browser interface to work. 

So... I spin up my application in IntelliJ. It's listening on localhost's port 8080. I run my `show-docs.sh` script, and the Swagger UI opens up. Cool. I press authorize and enter `admin` / `admin`, which are the local credentials I have set up. I press "Try out it out" and "Execute".

But no – it just says this:

> Failed to fetch.<br/>
> Possible Reasons:
>
> * CORS
> * Network Failure
> * URL scheme must be "http" or "https" for CORS request.

It also gives me a `curl` command line I can try:

```shell
$ curl -X 'GET' \
  'http://localhost:8080/api/habits' \
  -H 'accept: application/json' \
  -H 'Authorization: Basic YWRtaW46YWRtaW4='
```

And yup, that works like a charm. So it's not that.  So is it CORS? That's the only one that makes some kind of sense out of the three "possible reasons" given. 

And indeed, if I check the network inspector in Chrome, it says that there is a CORS error.

But no matter how I try to configure the Spring Boot application to allow CORS requests from any host, I can't get it to work. I've tried like a dozen different things off the Internet, and getting more and more confused why Spring Security has so many ways of configuring itself. 

Finally, I decide on trying a different approach. Can I disable the CORS check in Chrome itself?

I'm finding [this post](https://alfilatov.com/posts/run-chrome-without-cors/) which claims I can open up Chrome with a `--disable-web-security` flag. On macOS:

```shell
$ open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security
```

To my surprise, it works. I can now run the Swagger UI and execute API calls from it. I get some sense of fulfilment. 

Ok. So it really was CORS then, and I just completely suck at understanding how to configure Spring Security. Or understanding CORS. 

I'll have to read more. Like [this](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-cors) more closely, 
