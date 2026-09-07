---
layout: post
title: "How to keep your MacBook alive with the lid closed"
draft: true
# bluesky:
# hackernews:
# linkedin:
summary: "Without having to type password."
---

MacBook Pro goes nicely to sleep when you close the lid. It stays alive during certain conditions: when an external display is connected and it is connected to power. Sometimes, I want it to stay alive when those conditions are not met.

There's a command line tool on macOS called `caffeinate` that you might know about. It is used to prevent the system from going to sleep for just being idle. It will not, however, help you in the case of closing the lid. 

To test things, here's a one-liner that prints the time every second:

```shell
sh -c 'while true; do date +%H:%M:%S; sleep 1; done'
```

Run that and close the lid. Open it up again after a minute. You'll see that there was a gap, starting about 15 seconds after closing the lid, where the system was asleep and there were no prints. If `caffeinate` helped, you could have done this:

```shell
caffeinate sh -c 'while true; do date +%H:%M:%S; sleep 1; done'
```

But try it, and you'll get the same results. There are a bunch of different options you can give caffeinate – check out `man caffeinate` – but none make a difference here.

There are some third-party tools that allow you to do this. There is one on the App Store deliciously named [Amphetamine](https://apps.apple.com/us/app/amphetamine/id937984704?mt=12), but according to [reports](https://www.reddit.com/r/MacOS/comments/1qk6v5q/prevent_sleep_when_macbook_lid_is_closed_no_screen/) that one no longer works – likely, App Store sandboxing prevents it from doing what it needs to do. An alternative app called [Awayke](https://github.com/daemonphantom/Awayke) is open source and works.

I, however, wanted a command line solution that works like `caffeinate`. As you'll see in the Reddit thread linked above (ok, [here](https://www.reddit.com/r/MacOS/comments/1qk6v5q/prevent_sleep_when_macbook_lid_is_closed_no_screen/) it is again), you can do this using `pmset`:

```shell
sudo pmset -a disablesleep 1
```

Now try our time-logger again and close the lid (no `caffeinate` needed). Time keeps a-printin' – no gaps. To turn the disabling off again[^1], you'll run:

```shell
sudo pmset -a disablesleep 0
```

(Of course, this is easy to forget – we could wrap things up in a tool that worked similarly to `caffeinate`, turning off the disabling when the command exits. Read to the end for a complete tool.)

That's another built-in command line tool on macOS, with which you can manage power management settings – check out `man pmset`. You will actually not find `disablesleep` there. I think it's fair to say Apple doesn't want you to do this – and likely, for good reason. As the author of Awayke notes: 1. don't put a lid-closed, awake MacBook in a bag – it'll get hot; 2. do prefer connecting your machine to AC power when yo udo this. macOS will 

- TODO: We could now wrap this up in a small tool that works like `caffeinate`.

I'd like to turn attention to the need of `sudo` here. It's a bit annoying to have to type your password every time, both when starting and (potentially) when ending the session. 

- TODO: About sudoers
- TODO: Here's install script:

```bash
#!/usr/bin/env bash

set -euo pipefail

die()  { echo "install-disablesleep-sudoers: $*" >&2; exit 1; }

SUDOERS_FILE=/etc/sudoers.d/allow-disablesleep
SUDOERS_CONTENT="$(id -un) ALL=(root) NOPASSWD: /usr/bin/pmset -a disablesleep 1, /usr/bin/pmset -a disablesleep 0"
tmp=$(mktemp) || die "could not make a temp file"
echo "$SUDOERS_CONTENT" > "$tmp"
trap "rm -f '$tmp'" EXIT
visudo -q -c -f "$tmp" || die "generated sudoers file did not validate"
echo "Installing $SUDOERS_FILE, might ask for password..."
sudo install -m 0440 -o root -g wheel "$tmp" "$SUDOERS_FILE" || die "could not install $SUDOERS_FILE"
```



[^1]: How many negations do we have here – wouldn't you say that "going to sleep" is, in a way, disabling the machine? So we're now disabling the disabling of the disabling?
