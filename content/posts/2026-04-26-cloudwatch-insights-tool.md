---
layout: post
title: "Small tools, shared with agents: a CloudWatch Insights example"
date: 2026-04-26
draft: true
summary: "On building small CLI tools for myself – and now for my agents too. Walks through a recent one for querying CloudWatch Insights, and how I use Claude to analyze the logs it pulls down."
---

I've always enjoyed making small tools for myself to improve daily life as a software developer. Most of the time they are CLI tools, since the command line is where I live my life.

With the advent of agentic coding, this tendency of mine has multiplied. Of course, I'm writing more tools now. Agents are _really_ good at writing small, self-contained tools, and you can kick one off from the Claude app on the phone as you sit on the loo. That's nice.

But it has also multiplied in another way, because agents love to use CLI tools as much as I do. So I don't just build them for my own direct use; I also use them indirectly, through Claude Code (mostly). Some people would advocate the use of MCP for that type of integration. I don't see much reason for that[^mcp] when the agent can just invoke the same tools I use myself. Same artifacts, same interface, easier to follow what it's doing.

## The cloudwatch-insights tool

One recent addition to my belt is a tool for fetching logs from CloudWatch Insights. There are probably existing tools for this[^existing], but I want one that fits my workflows.

When I build these integrations, I often wrap an existing CLI to avoid reimplementing auth – `gh` for GitHub, for example. AWS is one exception: the SDK is good enough, and the profile-based auth standardized enough, that calling it directly is preferable.

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

After you have tweaked as needed, you save and exit the editor, and the tool runs the query. The tool will say something like this on stderr:

```shell
AWS region:  eu-north-1
Log groups:  /logs/prod/services
Time range:  1h
Status:      Complete (scanned 5.7k records, 26.5 KiB, 200 rows)

Use cloudwatch-insights show to view results. (Open in AWS)
```

The `Status:` line is rewritten in place as the query runs, and `Open in AWS` is a clickable hyperlink to the same query in the CloudWatch console (in terminals that support [OSC 8](https://gist.github.com/egmontkob/eb114294efbcd5adb1944c9f3cb5feda)). The results themselves are written as a JSONL file under `~/.skagedal-tools/`, and `latest-run.jsonl` always symlinks to the most recent run. From there I can just hand things to `claude` – I'm already in the right codebase.

> Run `cloudwatch-insights show` and fix the errors.

Of course, I can also do any other usual JSON processing on the results (`jq` and `fx` and friends <!-- TODO: link to previous post on fx -->). It's not just modern LLM-based tooling that work well with plain text. 

Even classic IDE:s integrate well with text! In the inline terminal of VS Code or IntelliJ, I can run something like this to show the failing locations from stack traces:

```shell
jq -r 'select(.level == "ERROR") | .message' ~/.skagedal-tools/cloudwatch-insights/latest-run.jsonl | grep -Eo '(/[^:]+):([0-9]+)' | sed 's/:/ /' | while read file line; do echo -e "\e]8;;file://$file\e\\$file:$line\e]8;;\e\\"; done
```

No plugins, no MCP, just text. Like I like it. 

You may have noticed the `Open in AWS` link in the output above: every query also produces a shareable AWS Console URL pointing at the same query. Beyond clicking the link in your terminal, there's a `cloudwatch-insights copy-link` subcommand that copies the URL to the system pasteboard – handy for sharing in Slack, or for using the console's features for further tweaking and exploration. There's also an inverse `paste-link` that takes a console URL (from the pasteboard, or as an argument) and decodes it back into a `current.insights` file, so you can replay or tweak someone else's query locally.


<!-- Footnotes -->
[^existing]: A few worth mentionging: [`saw`](https://github.com/TylerBrock/saw) and [`cw`](https://github.com/lucagrulla/cw), both Go CLIs focused on tailing and searching log groups, and [`awslogs`](https://github.com/jorgebastida/awslogs), a long-standing Python tool in the same space. These are more oriented toward log streaming than Insights queries, but they cover overlapping ground.
[^mcp]: This isn't just my take about MCP (Model Context Protocol), see for example [this blog post](https://mariozechner.at/posts/2025-11-02-what-if-you-dont-need-mcp/). The [pi.dev](https://pi.dev/) tool also seems to be going in the direction.

