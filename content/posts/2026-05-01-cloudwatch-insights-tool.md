---
layout: post
title: "Small tools, shared with agents: a CloudWatch Insights example"
date: 2026-05-01
summary: "On building small CLI tools for myself – and now for my agents too. Walks through a recent one for querying CloudWatch Insights, and how I use Claude to analyze the logs it pulls down."
---

I've always enjoyed making small tools for myself to improve daily life as a software developer. Most of the time they are CLI tools, since the command line is where I live most of my life.

With the advent of agentic coding, this tendency of mine has multiplied. I'm writing more tools now. Agents are _really_ good at writing small, self-contained tools, and you can kick one off from the Claude app on the phone as you sit on the loo. That's nice.

But it has also multiplied in another way, because agents love to use CLI tools as much as I do. So I don't just build them for my own direct use; I also use them indirectly, through Claude Code (mostly). Some people would advocate the use of MCP for that type of integration. I don't see much reason for that[^mcp] when the agent can just invoke the same tools I use myself. Same artifacts, same interface, easier to follow what it's doing.

## The cloudwatch-insights tool

One recent addition to my belt is a tool for fetching logs from CloudWatch Insights. There are existing tools for this[^existing], but I want one that fits my workflows.

The foundation of the tool is to execute queries against CloudWatch Insights and store the results locally as JSONL. Queries are templated, with variables filled in from the working directory's context. A typical workflow: I get an alarm in some service, want to investigate error logs, and want to relate them back to the code. So I `cd` into that service's repo and run the tool from there. The repo carries per-service configuration – which log groups, which app filter – and the tool picks it up automatically.

```shell
cd ~/code/some-service
cloudwatch-insights query --new --env prod
```

This creates a query file from a template, fills it in with values from the command line and from repo-level settings, and opens it in my `$EDITOR`. It can look like this:

```text
time = "1h"
env = "prod"
app = "some-service-app"
log-group = "/logs/{{ env }}/services"
---
fields @timestamp, @message
| sort @timestamp desc
| filter app = '{{ app }}'
| filter level in ['ERROR']
| limit 200
```

If you have used Cloudwatch Insights before, you might recognize the second part here as a query in what they call the [Logs Insights QL](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html) language. The section before that – the "front-matter" – contains various settings on how the query is run, and certain variables that will be replaced in the query. 

- `time` is the time range to run the query against, in a human-friendly format. 
- `env` and `app` are two pre-defined variables that can be used in the query, or in other variables (as we see here with `log-group`).
- `log-group` is the log group – or, if you pass a TOML array, several log groups – to run the query against.

After you have tweaked as needed, you save and exit the editor, and the tool runs the query. The tool will say something like this:

```shell
AWS region:  eu-north-1
Log groups:  /logs/prod/services
Time range:  1h
Status:      Complete (scanned 5.7k records, 26.5 KiB, 200 rows)

Use cloudwatch-insights show to view results. (Open in AWS)
```

The results are written as a JSONL file under `~/.skagedal-tools/`. All query results are saved, with a `latest-run.jsonl` that always symlinks to the most recent run (that's the one that shows with the `cloudwatch-insights show` command). From there I can just hand things to `claude` – I'm already in the right codebase:

```shell
$ claude -p 'Run "cloudwatch-insights show" and fix the errors.'
```

Of course, I can also do any other usual JSON processing on the results (`jq` and `fx`[^fx] and friends). 

Obviously, this is nowhere near replacing the full Cloudwatch Insights console. I do intend for it to replace some of the use cases, but not all. Going back and forth from this tool to the console is therefore something I want to support as a first-class use case, and for that I have the `copy-link` and `paste-link` subcommands: `copy-link` it transforms the current query into one of those gnarly Cloudwatch Insight URLs (if you know you know) and puts it on the pasteboard[^orraw]. And then `paste-link` is the reverse – copy a Cloudwatch Insights URL and put it into the current query file. 

You may have noticed the `(Open in AWS)` output from `cloudwatch-insights query` above, which is a shortcut to the `copy-link --open` functionality. That's a hyperlink, directly clickable in the terminal using the [OSC 8](https://gist.github.com/egmontkob/eb114294efbcd5adb1944c9f3cb5feda) protocol. I didn't know this existed until I saw Claude Code and friends use it. 

## Implementation notes and future plans

- When I build these integrations, I often wrap an existing CLI to avoid reimplementing auth – `gh` for GitHub, for example. AWS is one exception: the SDK is good enough, and the profile-based auth standardized enough, that calling it directly is preferable. I first wrote this thing in Typescript, even though many of my similar CLI tools are written in Rust, because I forgot that there's also an AWS SDK for Rust now. Then as I got annoyed with the startup time and various other Node ecosystem stuff and asked Claude to rewrite it in Rust. Much happier.
- The tool has this statefulness idea around a "current query", although it also supports running arbitrary query files. I do want to better support having multiple ongoing queries. And also a flexible way of having a library of templates. 
- There are various UX warts that I want to smoothen out.
- The tool will not be a log viewer. That's not its purpose. I am working on a separate log viewing tool that's independent of Cloudwatch Insights. 

The `cloudwatch-insights` tool is available [here](https://github.com/skagedal/skagedal-tools/tree/main/cloudwatch-insights), along my [other tools](https://github.com/skagedal/skagedal-tools/). All are developed under the assumption that I'm the only user, so anything might break at any time – let me know if anything looks interesting to you.

<!-- Footnotes -->
[^existing]: Most obviously, the [aws cli](https://aws.amazon.com/cli/) itself. A few others worth mentioning: [`saw`](https://github.com/TylerBrock/saw) and [`cw`](https://github.com/lucagrulla/cw), both Go CLIs focused on tailing and searching log groups, and [`awslogs`](https://github.com/jorgebastida/awslogs), a long-standing Python tool in the same space. I think all of these are more oriented toward log streaming than Insights queries, though. For log streaming, I tend to use Kubernetes. 
[^mcp]: This isn't just my take about MCP (Model Context Protocol), see for example [this blog post](https://mariozechner.at/posts/2025-11-02-what-if-you-dont-need-mcp/). The [pi.dev](https://pi.dev/) tool also seems to be going in the direction.
[^fx]: If you're not friends with `fx`, I mentioned it in [this blog post](http://skagedal.tech/posts/2024-12-29-creating-example-git-log-data-with-jc).
[^orraw]: Or use `--raw` if you just want it output to the terminal, or use `--open` to open it in default browser. 