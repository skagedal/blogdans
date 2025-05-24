---
layout: post
title:  "Adding summaries"
summary: "While exploring my current Jekyll theme, I discover the `excerpt` variable, and finally decide to instead use a custom `summary` variable as a blurb for each post."
---
So I'm [trying out Zola](/posts/2023-02-09-testing-zola) now, and slowly trying to convert the Jekyll templates for this blog to Zola ones. I could just as well start a-fresh from some nice Zola theme, but I'm thinking that I will learn more if I do it this way.

I also learn more about Jekyll! Maybe in the end I will choose to stick with that?

One thing I noticed is that in the `head.html` templatee, it was using a `page.excerpt` variable:

```html
<meta name="description" content="{% if page.excerpt %}{{ page.excerpt | strip_html | strip_newlines | truncate: 160 }}{% else %}{{ site.description }}{% endif %}">
```

Interesting! As I noted in the [introductory post](/posts/2023-02-06-improving-skagedals-oboy) on this series, I would like to have a little blurb on the main page that briefly describes each post, beyond the title of it. Maybe this points to some already existing standard support for this in Jekyll?

I'm gonna try using this on the main page, where we list all the posts:

```html
{% for post in site.posts %}
  <li>
    <span class="post-meta">{{ post.date | date: "%b %-d, %Y" }}</span>

    <h2>
      <a class="post-link" href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a>
    </h2>
    {{ post.excerpt }}
  </li>
{% endfor %}
```

Aha – so what that seems to be doing is taking the first paragraph of the post, and using that as the excerpt. Works ok for some of my posts, but not so well for others where I start with something silly, or try to connect with the previous post like "Hello! In yesterday's post we did X!" – that's not really a relevant excerpt.

I could override this by adding an `excerpt` field to the front matter of each post where I want to have it custom, and otherwise default to first paragraph. But nah, I think I'll just add a custom field and call it `summary`. 

First, I added it as just `{{ post.summary }}` in the above place, but then got sad because I tried to use some Markdown in it, and it just showed up un-rendered. I was about to just say fuck it and go with un-styled summaries – that's going to make some other things easier as well, because I have some ideas on using these summaries for automated posts on Twitter and Mastodon, and then I'll have to get rid of the Markdown. 

But then I thought, hey, this can't be hard, googled a little and found the `markdownify` filter. 

```html
{% for post in site.posts %}
  <li>
    <span class="post-meta">{{ post.date | date: "%b %-d, %Y" }}</span>

    <h2>
      <a class="post-link" href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a>
    </h2>
    {{ post.summary | markdownify }}
  </li>
{% endfor %}
```

That's a weird name for the filter though, isn't it? To "markdownify" would be more like, "convert this thing to Markdown", but this is more like "convert this Markdown to HTML". But I guess these filters should have short and catchy names. 

But anyway! Now you can go look at the [main page](/) and see that it has a nice summary for each post.