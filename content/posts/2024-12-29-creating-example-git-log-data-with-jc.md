---
layout: post
title: "Creating example git log data with jc"
summary: "I explore some use cases of command line JSON processing tools like jc, jq and fx."
---
The other day, I was playing around with some React code. I have some ideas of a simple deploy tool, and basically just wanted to try out some UI ideas. One part of this would be to build a  component that would show a git log.

I wasn't going to write any real git integration right at the moment, as that wasn't the purpose of my current exploration, but I still wanted to have some real data to use in my UI experiment. Having some relevant example data makes UI design and development easier and more fun. 

My Typescript data model looked a little like this:

```typescript
type GitCommit = {
    sha: string;
    date: Date;
    author: string;
    message: string;
};
```

I began thinking about how I could do a `git log` in one of my repositories and get it into something JSON-y to use as my data. 

I started with the timestamps, as it seemed simple. JavaScript's `Date` constructor prefers to get them in a [specific simplified form](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date-time-string-format) of ISO-8601 that looks like `YYYY-MM-DDTHH:mm:ss.sssZ`. This is unfortunately not what you get with git's `git log --date=iso8601` command; it rather gives you something like `2023-11-13 21:53:28 +0200`. This doesn't look like it's actually valid ISO-8601 [combined date and time respresentation](https://en.wikipedia.org/wiki/ISO_8601#Combined_date_and_time_representations) at all? But anyway, with just a little googling I got this:

```shell
$ git log  --date=format:'%Y-%m-%dT%H:%M:%S.000Z'
```

Which gave me output like this:

```text
commit fecbcf68e012948831910264a6a180923a8deda3
Author: Simon Kågedal Reimer <skagedal@gmail.com>
Date:   2024-06-08T07:21:02.000Z

    fix tests
    
commit 78210d9912db07f91132b827eeb8a8e09c8415cb
Author: Simon Kågedal Reimer <skagedal@gmail.com>
Date:   2024-06-08T07:20:57.000Z

    update dependencies
```

(I'm going to pretend for the rest of this post that only these two commits existed in my example repository.)

So that's nice. But how do I get all that other stuff into JSON? I started to envision some kind of unholy combination of `awk`, `sed`, `cut`, `grep` and friends, or digging deep into git's own log formatting capabilities.

Then it struck me that I might actually have a perfect tool for the job in my toolkit already!

For some background, there is a great blog post [here](https://blog.kellybrazil.com/2019/11/26/bringing-the-unix-philosophy-to-the-21st-century/) by Kelly Brazil about how JSON should be the interchange format of CLI tools to bring the Unix philosophy into the 21st century. It's a great post and I agree with it. Putting together ad hoc parsing with the aforementioned tools is tiring, and you will often end up with something that isn't very robust – suddenly your data contains a quotation mark or a tab character that you expected to be a delimiter and now everything breaks.

Some modern tools are following this paradigm and allow to format their output in JSON format. Various Kubernetes tools like `kubectl` and `helm` come to mind. But lots of tools don't.

But Kelly didn't stop at writing a blog post, he also wrote this tool called [jc](https://kellyjonbrazil.github.io/jc/docs/), short for JSON Convert. This tool has as its job to convert the output of various command line tools into structured JSON. 

I found this tool to be an awesome idea when I read about it, and added it to my standard set Brew-installed tools, but I honestly haven't used it very often. Possibly because I forget about it in situations where I could have used it. But this time, I decided to try to simply put a `jc` in front of my previous command:

```console
$ jc git log  --date=format:'%Y-%m-%dT%H:%M:%S.000Z'
```

And lo and behold, it gives me the git log in JSON! To get more readable output, I'm adding the `--pretty` flag like this:

```console
$ jc --pretty git log  --date=format:'%Y-%m-%dT%H:%M:%S.000Z'
```
Getting this:
```json
[
  {
    "commit": "fecbcf68e012948831910264a6a180923a8deda3",
    "author": "Simon Kågedal Reimer",
    "author_email": "skagedal@gmail.com",
    "date": "2024-06-08T07:21:02.000Z",
    "message": "fix tests",
    "epoch": 1717824062,
    "epoch_utc": 1717831262
  },
  {
    "commit": "78210d9912db07f91132b827eeb8a8e09c8415cb",
    "author": "Simon Kågedal Reimer",
    "author_email": "skagedal@gmail.com",
    "date": "2024-06-08T07:20:57.000Z",
    "message": "update dependencies",
    "epoch": 1717824057,
    "epoch_utc": 1717831257
  }
]
```

Now, I just need some cleaning up to make it fit my data model. I don't need the `epoch` and `epoch_utc` fields, for example. I can get rid of this with [jq](https://jqlang.github.io/jq/), which is my usual command-line JSON processing tool:  

```console
$ jc git log  --date=format:'%Y-%m-%dT%H:%M:%S.000Z' | jq '. | del(.[].epoch) | del(.[].epoch_utc)'
```
So that gives me:
```json
[
  {
    "commit": "fecbcf68e012948831910264a6a180923a8deda3",
    "author": "Simon Kågedal Reimer",
    "author_email": "skagedal@gmail.com",
    "date": "2024-06-08T07:21:02.000Z",
    "message": "fix tests"
  },
  {
    "commit": "78210d9912db07f91132b827eeb8a8e09c8415cb",
    "author": "Simon Kågedal Reimer",
    "author_email": "skagedal@gmail.com",
    "date": "2024-06-08T07:20:57.000Z",
    "message": "update dependencies"
  }
]
```
I am actually a bit surprised that I knew the jq syntax for this off the top of my head.

There are also some fields I would like to rename – and honestly the easiest way to do that is just to use the "Replace" functionality in your favorite editor. But if we were to stay in the CLI processing world? 

I'm pretty sure jq can do this as well; this I do not however know off the top of my head. Here's another fun alternative though! 

If you have decent knowledge of JavaScript, and you don't feel like learning jq syntax or looking it up or asking ChatGPT every time, there's a nice alternative in the [fx](https://fx.wtf/) tool. (Yes, there is a law that every CLI tool that deals with JSON processing needs to have a two-letter name.) It allows you to use JavaScript syntax. The one thing you need to know is that to refer to the "current" object – the one being passed in standard input – you use the empty string, so you just start it off with a dot (`.`). So then you can go like:

```console
$ jc git log | fx '.map(x => ({sha: x.commit, author: x.author, message: x.message, date: new Date(x.epoch * 1000).toJSON()}))'
```
Giving us:
```json
[
  {
    "sha": "fecbcf68e012948831910264a6a180923a8deda3",
    "author": "Simon Kågedal Reimer",
    "message": "fix tests",
    "date": "2024-06-08T05:21:02.000Z"
  },
  {
    "sha": "78210d9912db07f91132b827eeb8a8e09c8415cb",
    "author": "Simon Kågedal Reimer",
    "message": "update dependencies",
    "date": "2024-06-08T05:20:57.000Z"
  }
]
```

The only thing we can't do to get us our example data model is to convert the date string to a `Date` object. It needs to be called with a `new Date()` constructor around that string. But this you can do in the editor... naaaah what the hell, we got this far, let's just do it with sed:

```console
$ jc git log | fx '.map(x => ({sha: x.commit, author: x.author, message: x.message, date: new Date(x.epoch * 1000).toJSON()}))' | sed 's/"date": "\(.*\)"/"date": new Date("\1")/'
```
Presto! 
```javscript
[
  {
    "sha": "fecbcf68e012948831910264a6a180923a8deda3",
    "author": "Simon Kågedal Reimer",
    "message": "fix tests",
    "date": new Date("2024-06-08T05:21:02.000Z")
  },
  {
    "sha": "78210d9912db07f91132b827eeb8a8e09c8415cb",
    "author": "Simon Kågedal Reimer",
    "message": "update dependencies",
    "date": new Date("2024-06-08T05:20:57.000Z")
  }
]
```

And there you have it!