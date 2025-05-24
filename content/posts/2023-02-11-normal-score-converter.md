---
layout: post
title:  "Presenting Normal Score Converter"
summary: "Discussing Normal Score Converter, a tool I wrote in 2013 to convert values on common psychometric scales, and how I could bring it up to date."
---

Back in 2013, I was working as a psychologist. That sentence probably needs to be expanded upon, and I hope to write a blog post about that in the future, but it's not what this post is about. 

One of the things I did as a psychologist was to administer various psychometric tests. These tests use various scales to report the results, and I wrote a tool to convert between them – the [Normal Score Converter](http://helgo.net/simon/normalscore/). Quoting myself from the About page of said tool:

> Many properties of real-world world phenomena can be modelled with a normal distribution. In clinical psychology, many different scales are commonly used to describe values of normally distributed variables. This is a tool to help convert between these scales, and to discover their relationships. You can also define your own scales.
> 
> Each scale has one of three different types:
>
> * ***Normal***: A scale of the "Normal" type is defined with a mean value (M) and a standard deviation (SD). It is a continuous variable, that in theory can take on any value from the set of real numbers.
> * ***Discrete***: A scale of the "Discrete" type is also defined with a mean value and a standard deviation. It however only includes values from a finite set of integer values.
> * ***Percentile***: A value on a scale of the "Percentile" type tells you how many percent of the total distribution lies "to the left of" – is smaller than or equal to – the current value. It is also called the cumulative distribution function of the normal distribution.
>
> There are more things to explain, so watch this space, but at the moment just play around!

I love that, "watch this space" – and then nothing happens for ten years. All those ambitions. All those dreams. 

> This tool is free, open source, software. You may freely use, copy, modify and re-publish the source according to the terms of the MIT license. The code is managed at Github. Please feel free to contact me if you have anything to say about the Normal Score Converter!

Not many people have contacted me over the years, but there was one person who reported that it didn't work in Google Chrome, which still seems to be the case. There is however one person, my wonderful friend Johannes Zackari, who has kept using it and recommending it to people! 

Today, he pointed out that when you search for "normalscore" on Duck Duck Go, the tool is actually the second hit after the [Wikipedia page](https://en.wikipedia.org/wiki/Normal_score), which is pretty cool.

So, for those of you who might be on Google Chrome, for example, this is what the tool looks like running in Safari:

![Screenshot of Normal Score Converter.]( /images/normal-score-converter/normal-score-converter.png )

Here, I have clicked at two places on the graph, and the tool has calculated the corresponding values on the other scales. You can also enter values manual in the top-right input field. And if you're not happy with the standard scales that are included, you can add your own! Open it up by pressing Scale Settings:

![Screenshot of Scale Settings.]( /images/normal-score-converter/scale-settings.png )

Johannes favorite thing is to add a 3d6 (the [dice notation](https://en.wikipedia.org/wiki/Dice_notation) for rolling three six-sided dice), which has M=10.5 and SD=2.96.   

I already have a couple of ongoing projects in this blog, but I'd like to do something with this. I'd like to fix the Google Chrome bug, because if I remember correctly I did investigate it at some point and it was something rather simple. And I would love to set it up to run on this server, as I'm trying to move content away from my old site https://helgo.net/simon/.

First mission will be to see if I can clone it and get it running locally again. Seems that I have a Python script, [build.py](https://github.com/skagedal/normalscore/blob/5b512f2302083479ed25c80bd8ff6b93cef7b839/build.py) to put all the Javascript together. The modern approach would be to use something like [Yarn](https://yarnpkg.com/), but let's see first if I can get the old stuff to build. Next episode, hopefully!

_[Continue reading about bringing it back to life](/posts/2023-02-12-building-normal-score-converter)_

