---
layout: post
title: "A tool for fetching logs from CloudWatch Insights"
date: 2026-04-26
draft: true
summary: "A small CLI tool for running CloudWatch Insights queries from the service repository, using per-service templates and storing results locally."
---

I've always enjoyed making small tools for myself to improve daily life as a software developer. Most of the time they are cli tools, since the command line is where I live my life.

With the advent of agentic coding, this tendency of mine has multiplied in several ways. Of course, I'm writing even more tools now. Agents are _really_ good at writing small, self-contained tools. I will often do it from the Claude app on the phone.

But also because agents love to use CLI tools as much as I do. So I don't just write the tools for my own direct use, I also use them indirectly through skills in Claude Code. I don't see much reason for MCP when they can rather just invoke the same tools I use myself, makes it easier also to follow what they're doing.

One recent tool I've added to my belt is to access logs from cloudwatch-insights. There are of course existing such tools, but I want one which is adapted to my workflows.

Often when I do tools like this that integrate towards some service, I let the raw integration be handled by some existing cli command, like `gh` for Github. This way my tool doesn't need to handle authentication or other such details.

For aws services however, they have such a well-developed SDK for multiple languages with a standardized auth procedure through profiles, so that's preferable.

The foundation of my cloudwatch-insights tool is to execute queries against cloudwatch and store results locally. It supports templates for various queries, with variables grabbed from context. Let me explain that.

A typical workflow might start with me getting alarms in some service. I want to investigate any error logs and see how they relate to the code. In this situation I run the tool from the service repository. The tool then picks up per-service configuration about log groups and appropriate filters and executes the right query. You can then analyze the logs with `jq` or the tool of choice.

Here is how it works now. I'll probably tweak the user experience as I go along.

I'll cd into the service repository and create a query.

```
cd ~/code/some-service
cloudwatch-insights query --new --environment prod
```

It then creates a default query from a template and opens up my default editor with this content:

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

I get:

```
Querying 1 log group(s) from 2026-04-26T08:29:49.798Z to 2026-04-26T09:29:49.798Z
log groups: /eks/prod/team-expansion
status: Scheduled
status: Complete
/Users/simon/.skagedal-tools/cloudwatch-insights/queries/aira-web-backend/results/run-2026-04-26T09-29-51Z.jsonl
Done. 200 rows written (matched=245 scanned=5717 bytes=27164644).
/Users/simon/.skagedal-tools/cloudwatch-insights/latest-run.jsonl → /Users/simon/.skagedal-tools/cloudwatch-insights/queries/aira-web-backend/results/run-2026-04-26T09-29-51Z.jsonl
```

Integration with IDE can also be just text. We don't need plugins. Let's print relevant lines in the format that VS Code picks up in shell so we can navigate to them.

* open the query in the browser console
