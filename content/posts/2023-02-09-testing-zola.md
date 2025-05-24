---
layout: post
title:  "Testing Zola"
---

It does feel nice to have a clean deploy script again, after [yesterday's fixes](/posts/2023-02-08-fixing-my-blog)!

One thing that I wanted to do before in this blog is to have little custom blocks of content. So, for example, in [this post](/posts/2023-01-04-habit-tracker-functionality-and-first-migration) I had a little conversation with ChatGPT. I was thinking that it would be really neat if I could wrap that whole ChatGPT response in a little div, and then style it with some CSS to make it look kind of like it does in the ChatGPT user interface.

So, I thought maybe I could mix in a little bit of HTML in my Markdown, like:

````markdown
This is me speaking!

<div class="chatgpt">
Here's a response from ChatGPT!

```java
Here is some Java code!
```

And then maybe some other content from ChatGPT!
</div>

And so on.
````

But my attempts to do that in Jekyll failed. It passes the `<div>` tags through, but fails to parse code blocks within it. I did google around, and don't quote me on this (rather, correct me if I'm wrong), but it seemed like it wasn't possible. It seemed, however, that it might be possible with some other static site generators. And then I was also mildly annoyed with some other things regarding Jekyll and I was just in the mood for maybe testing out something else. 

So I wrote down an extensive list of my requirements, and then did a thorough evaluation of the available options. 

Haha. No, of course I didn't; I just kept googling around, and then I found something that just kind of seemed to _speak_ to me – [Zola](https://www.getzola.org/)! I should probably try to somehow explain what thoughts went through my mind, but I decided to just go with my gut feeling and try it out. I liked what I saw in the documentation!  

So, I'm following the [Getting Started](https://www.getzola.org/documentation/getting-started/overview/) guide. I'm running Zola 0.16.1, installed with Homebrew. I moved all of my existing Jekyll site into a `jekyll` subdirectory, and ran:

```shell
$ zola init zola
Welcome to Zola!
Please answer a few questions to get started quickly.
Any choices made can be changed by modifying the `config.toml` file later.
> What is the URL of your site? (https://example.com): https://blog.skagedal.tech
> Do you want to enable Sass compilation? [Y/n]: y
> Do you want to enable syntax highlighting? [y/N]: y
> Do you want to build a search index of the content? [y/N]: n

Done! Your site was created in /Users/simon/code/blog.skagedal.tech/zola

Get started by moving into the directory and using the built-in server: `zola serve`
Visit https://www.getzola.org for the full documentation.
```

Sass compilation seems great, since I could then move over the CSS I have for my current site, which is written in Sass. (Although I don't love it and it's just the default Jekyll theme from 2017, but still. Nice to just change one bit at a time.) I do want syntax highlighting and, while building a search index sounds fun, I'll save that for later.

The `zola init` really sets up an empty site for me. I'm following the guide and adding some HTML templates and the basics for a blog. Then I tested the same thing with the `<div>` block with various stuff in it. And it worked beautifully! 

So now I feel encouraged to continue the experiment. Obviously, I'll have to find a way to move over all of my existing content and not break incoming links. But I'm feeling optimistic!

_[Continue reading about exceprts](/posts/2023-02-10-adding-summaries)_