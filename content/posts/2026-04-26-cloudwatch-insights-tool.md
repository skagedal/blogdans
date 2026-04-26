---
layout: post
title: "Small tools, shared with agents: a CloudWatch Insights example"
date: 2026-04-26
draft: true
summary: "On building small CLI tools for myself — and now for my agents too. Walks through a recent one for querying CloudWatch Insights, and how I use Claude to analyze the logs it pulls down."
---

I've always enjoyed making small tools for myself to improve daily life as a software developer. Most of the time they are CLI tools, since the command line is where I live my life.

With the advent of agentic coding, this tendency of mine has multiplied. Of course, I'm writing more tools now — agents are _really_ good at writing small, self-contained tools, and I will often kick one off from the Claude app on the phone.

And it has multiplied because agents love to use CLI tools as much as I do. So I don't just build them for my own direct use; I also use them indirectly, through skills in Claude Code. I don't see much reason for MCP when the agent can just invoke the same tools I use myself — same artifacts, same logs, easier to follow what it's doing.

One recent addition to my belt is a tool for fetching logs from CloudWatch Insights. There are existing tools for this, but I want one that fits my workflows.

When I build these integrations, I often wrap an existing CLI to avoid reimplementing auth — `gh` for GitHub, for example. AWS is one exception: the SDK is good enough, and the profile-based auth standardized enough, that calling it directly is preferable.

The foundation of the tool is to execute queries against CloudWatch Insights and store the results locally as JSONL. Queries are templated, with variables filled in from the working directory's context. A typical workflow: I get an alarm in some service, want to investigate error logs, and want to relate them back to the code. So I `cd` into that service's repo and run the tool from there. The repo carries per-service configuration — which log groups, which app filter — and the tool picks it up automatically.

```
cd ~/code/some-service
cloudwatch-insights query --new --environment prod
```

This creates a query from the service's template and opens it in my editor:

```
---
time: 1h
environment: prod
logGroup: /eks/{env}/team-expansion
---

fields @timestamp, @message
| sort @timestamp desc
| filter app = 'aira-web-backend'
| filter level in ['WARN', 'ERROR']
| limit 200
```

The frontmatter declares variables that can reference each other — `{env}` expands to `prod` here. The body is a regular CloudWatch Insights query. I tweak as needed, save, and the run begins:

```
Querying 1 log group(s) from 2026-04-26T08:29:49.798Z to 2026-04-26T09:29:49.798Z
log groups: /eks/prod/team-expansion
status: Scheduled
status: Complete
/Users/simon/.skagedal-tools/cloudwatch-insights/queries/aira-web-backend/results/run-2026-04-26T09-29-51Z.jsonl
Done. 200 rows written (matched=245 scanned=5717 bytes=27164644).
/Users/simon/.skagedal-tools/cloudwatch-insights/latest-run.jsonl → /Users/simon/.skagedal-tools/cloudwatch-insights/queries/aira-web-backend/results/run-2026-04-26T09-29-51Z.jsonl
```

The output is a JSONL file under `~/.skagedal-tools/`, and `latest-run.jsonl` always symlinks to the most recent run. From there I can `jq` it, grep it, or hand it to Claude.

Integration with the IDE can also be just text — no plugins needed. The tool prints relevant lines in the format VS Code picks up from a shell, so I can click straight from terminal to the source location.

<!-- TODO: section on asking Claude to analyze the downloaded logs — this is the second half of the meta-thesis: tool + agent + shared artifact -->

<!-- TODO: original draft had a trailing bullet "open the query in the browser console" — flesh out or drop -->

<!-- TODO: closing tie-back to the opening — same tool, used by me and by the agent; why this beats MCP for this kind of work -->
