---
layout: post
title:  "Next on next: Gmail and configuration"
---

I [added support](https://github.com/skagedal/next/compare/415a1245f7efbe4ce40767a75137bb124976d32d...01874c2488852ada90ed9fe8d21899821de4ab89) for checking my Gmail account. If there are threads in the Inbox, it opens up Gmail so that I can clear it.

(Yes, I use Inbox Zero. Or at least I think I do. What it means to me is that I strive for, and reach with some regularity, a state where there are no e-mails in the Inbox. Adding this check in my `next` tool will of course add some extra strictness to the process, and I may very well have to iterate on it. Maybe the rule is too strict. Maybe I should actually read up on some ideas around this, what some good and not good strategies are. I googled around a bit now and [found this article](https://www.lifehack.org/articles/lifehack/ultimate-way-inbox-zero.html) that I found quite incomprehensible. I have no idea what that guy wants me to do. But I am curious. Send me an e-mail if you have any thoughts.)

This kind of required me to add some configuration to `next`, as I need the tool to know about separate accounts and what account to open up. While I absolutely regard this as a tool for myself only, and in that sense could just hardcode stuff, I do want the repo to be free from personal details. Because that feels good. 

So I [added](https://github.com/skagedal/next/compare/01874c2488852ada90ed9fe8d21899821de4ab89...3e3933a8f3a637f0a92c635efd26ab2c409f4ef8) a little YAML configuration file. Spent too much time figuring out how to properly decode polymorphic JSON types into a sealed class in Kotlin with Jackson.  Oh well.