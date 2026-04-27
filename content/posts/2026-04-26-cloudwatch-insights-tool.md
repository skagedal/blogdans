---
layout: post
title: "Small tools, shared with agents: a CloudWatch Insights example"
date: 2026-04-26
draft: true
summary: "On building small CLI tools for myself — and now for my agents too. Walks through a recent one for querying CloudWatch Insights, and how I use Claude to analyze the logs it pulls down."
---

I've always enjoyed making small tools for myself to improve daily life as a software developer. Most of the time they are CLI tools, since the command line is where I live my life.

With the advent of agentic coding, this tendency of mine has multiplied. Of course, I'm writing more tools now — agents are _really_ good at writing small, self-contained tools; I will often kick one off from the Claude app on the phone as I sit on the loo.

And it has multiplied because agents love to use CLI tools as much as I do. So I don't just build them for my own direct use; I also use them indirectly, through Claude Code. Some people would advocate the use of MCP for that type of integration. I don't see much reason for that when the agent can just invoke the same tools I use myself — same artifacts, same logs, easier to follow what it's doing.

## The cloudwatch-insights tool

One recent addition to my belt is a tool for fetching logs from CloudWatch Insights. There are existing tools for this, but I want one that fits my workflows.

When I build these integrations, I often wrap an existing CLI to avoid reimplementing auth — `gh` for GitHub, for example. AWS is one exception: the SDK is good enough, and the profile-based auth standardized enough, that calling it directly is preferable.

The foundation of the tool is to execute queries against CloudWatch Insights and store the results locally as JSONL. Queries are templated, with variables filled in from the working directory's context. A typical workflow: I get an alarm in some service, want to investigate error logs, and want to relate them back to the code. So I `cd` into that service's repo and run the tool from there. The repo carries per-service configuration — which log groups, which app filter — and the tool picks it up automatically.

```shell
cd ~/code/some-service
cloudwatch-insights query --new --env prod
```

This creates a query file from a template, fills it in with values from the command line and from repo-level settings, and opens it in my `$EDITOR`. It can look like this:

```text
log-group = "/logs/{{ env }}/services"
time = "1h"
env = "prod"
app = "some-service-app"
---
fields @timestamp, @message
| sort @timestamp desc
| filter app = '{{ app }}'
| filter level in ['WARN', 'ERROR']
| limit 200
```

If you have used Cloudwatch Insights before, you might recognize the second part here as a query in what they call the [Logs Insights QL](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html) language. The section before that – the "front-matter" – contains various settings on how the query is run, and certain variables that will be replaced in the query. 

- `log-group` is the log group[^singlegroup] to run the query against.
- `time` is the time range to run the query against, in a human-friendly format. 
- `env` and `app` are two pre-defined variables that can be used in the query, or in other variables (as we see here with `log-group`).

After you have tweaked as needed, you save and exit the editor, and the tool runs the query. The output looks something like this:

```shell
Querying 1 log group(s) from 2026-04-26T08:29:49.798Z to 2026-04-26T09:29:49.798Z
log groups: /logs/prod/services
status: Scheduled
status: Complete
/Users/simon/.skagedal-tools/cloudwatch-insights/queries/some-service/results/run-2026-04-26T09-29-51Z.jsonl
Done. 200 rows written (matched=245 scanned=5717 bytes=27164644).
/Users/simon/.skagedal-tools/cloudwatch-insights/latest-run.jsonl → /Users/simon/.skagedal-tools/cloudwatch-insights/queries/some-service/results/run-2026-04-26T09-29-51Z.jsonl
```


The output is a JSONL file under `~/.skagedal-tools/`, and `latest-run.jsonl` always symlinks to the most recent run. From there I can `jq` it, grep it, or hand it to Claude.

Integration with the IDE can also be just text — no plugins needed. The tool prints relevant lines in the format VS Code picks up from a shell, so I can click straight from terminal to the source location.

<!-- TODO: section on asking Claude to analyze the downloaded logs — this is the second half of the meta-thesis: tool + agent + shared artifact -->

<!-- TODO: original draft had a trailing bullet "open the query in the browser console" — flesh out or drop -->

<!-- TODO: closing tie-back to the opening — same tool, used by me and by the agent; why this beats MCP for this kind of work -->

<!-- Footnotes -->
[^singlegroup]: We should allow this to be an array of log groups, but for now it's just one.