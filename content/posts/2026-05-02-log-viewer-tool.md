---
layout: post
title: "A log viewer"
draft: true
# bluesky:
# hackernews:
# linkedin:
summary: "Writing a log viewer. And why I will default to Rust for my future tools."
---

Following my post about a little CloudWwatch Insights query tools, I'd like to continue on the the theme of small tools for logging.

To follow application logs as they happen, I like to use Kubernetes. It has a built-in command for this, `kubectl logs -f`. One problem with that though is that it will only connect to the pods that are live when you start the command. If a pod restarts, or if you deploy a new version of the app, you will lose the connection to the logs.

The `stern` tool solves this beautifully. I just filter for my app, and it will keep showing me logs as the pods come and go:

```shell
stern -l app=some-service
```

And what's really satisfying is that it will color-code each pod's logs differently, so you can easily follow the flow of logs during a deployment or a restart. 

What's a bit difficult with this though is that I'll get the full JSON log lines – this is nice of course, because I get all the the structured data I might need, but it can be difficult to read. My first impulse for solving that is that I'd just pipe it through `jq` to extract the fields I care about. The first issue with that approach is that not all log lines from the pod may be JSON. It's really just the stdout (and stderr? fact check) of the pods we're looking at. Sometimes there will be logging-unaware lines of output (hello JDK) that are just text.

My first attempt at solving that problem was a little tool I called [log-jsonify](https://github.com/skagedal/skagedal-tools/tree/main/log-jsonify), a small stream processor that tries to parse each line as JSON, and if it fails, wraps it in a JSON object with a `message` field. 

Useful for simple cases, but still, it'd be nice with some interactivity. I'd like to have a nice little tool that shows (possibly streaming) JSONL logs from any source – a file dumped by my CloudWatch Insights tool, or the output of `stern` with the `-o json` flag, or any other source of JSONL logs – even just a locally running service. And then I want to be able to filter and explore those logs in an interactive way, without having to write `jq` queries.

I guess I spent _some_ small amount of time searching the web for such a tool, but quickly decided to just roll my own. Please let me know what I missed. 

One idea I had for this is that I wanted it to be both a TUI and a web app. TUI is nice for superquickly exploring some logs in the terminal. But sometimes a more scrollable and interactive app is nice. 

I built this first iteration in Typescript with Claude Code, instructing it to default to the TUI and, if given the `--browser` flag, to start a web server and open the logs in the browser. I was a bit curious about the Ink library which allows you to build TUIs in React. I thought this possibly could make sense also since I wanted the two versions of the app to be feature compatible; maybe they'd share some code, maybe even somehow components. And I kind of know React, so it seemed like a good fit.

A funny detail of the first version is that while I told Claude Code I wanted to use Ink, I didn't give it any particular instructions about the web app. So for a while I had a React app running the TUI and and tiny HTML + vanilla JS app for the browser. Lol. 

The web app turned out to be quite underperformant when given a large amount of logs. I figured it would be better off with a virtualized table, and since I knew about Tanstack Table, I asked Claude to rewrite the web app in React with Tanstack Table, which fixed _those_ performance problems. 

But I had other ones. The TUI was slow to start up. I asked Claude Code to look into it, and of course, it imported some heavy libraries on every startup. Ink itself is quite heavy. But I also imported `vite` to start off the web server, even when just running the TUI. And then the best one of them all – a silly little library that i used to copy stuff to the clipboard called `clipboardy` turned out to take like 100ms – 200ms to load. All it does in the end is to shell out to `pbcopy` on a Mac. It just did it in the heaviest way it could.

Oh well – except for Ink, those issues were easily solved by using dynamic imports (and then I also replaced the `clipboardy` thing with a ten line implementation that still supported macOS and Linux). I considered replacing Ink with something lighter (like maybe [neo-blessed](https://github.com/embarklabs/neo-blessed)). 

But I started to realize something. The reasons I had for writing this in Typescript/Node, rather than Rust, were poor. Mainly the reason is that I kind of suck at writing Rust, and I get along ok with React. I also don't _love_ Rust, the programming language. When I've attempted to write Rust, I've spent a lot of time fighting things that just aren't an issue in other languages. 