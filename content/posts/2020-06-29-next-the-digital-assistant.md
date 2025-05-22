---
layout: post
title:  "Next: my personal digital assistant"
---

Software microproject time! Something I've meant to do for a little while is a kind of digital assistant for the command line. Something that keeps track of things I need to regularly do while on the computer. I will call it `next` because it should tell me what to next – or offer to do that thing.

One task it will do is to make sure I follow certain rules I make for myself to keep things in order. For example, temporary files should not be left laying around on the Desktop or in the home directory. They may be there for a little while, while working on a specific task, but then they should be removed or moved to a better place. 

This is the first task that `next` helps me with, like a "file system linter". For now, "a little while" means "until I run `next` " – a later iteration might be to allow these files to be there for a set time interval. For now, if it finds files that shouldn't be there, it just opens up a `zsh` in that directory. 

I'm writing `next` in Kotlin since that what I feel like doing right now. 

[Github](https://github.com/skagedal/next).

