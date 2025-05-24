---
layout: post
title:  "Setting up Normal Score Converter and fixing a bug"
summary: "I finish the migration of the Normal Score Converter tool and fix the Google Chrome bug reported to me in 2016."
---
Happy Valentine's Day!

After setting up the nginx infrastructure and TLS certificate in the [previous post](/posts/2023-02-13-deploying-normal-score-converter), I now just had to make a little deploy script. I already had one from back in the day, but it just copied some files from one directory to another – I think the workflow I used to have back then is that I'd ssh in to my server and have the Git repository cloned there, pull the latest changes and run the deploy script. That's not how I want to do it any more. 

So I made a script similar to the one I have for [the habit tracker](/posts/2023-01-22-habit-tracker-deploying-the-jar) and [the blog](/posts/2023-02-08-fixing-my-blog), and after fixing a few other little things (apparently an HTTPS served HTML file can't point to a HTTP served JavaScript file, who knew?), I was able to deploy the app and get it up and running at [normalscore.skagedal.tech](https://normalscore.skagedal.tech).

Then I set out to fix the bug I've gotten reported to me twice. Once, in 2016:

> I am a neuropsychologist working in Gotland who uses your excellent normal distribution converter (http://helgo.net/simon/normalscore/) almost daily!
>
> Unfortunately, a couple of weeks ago I noticed that it stopped working in the Chrome web browser. Now I am forced to use IE for this page only.

I'm really sad that I've kept this neuropsychologist on Internet Explorer all these years. 

Then another gentleman from Czechoslovakia e-mailed me in 2017 and mentioned this and another issue. 

Well, it turned out to be not very difficult to fix. Looking in the "Inspect" tab in Chrome, there was this error logged:

> Uncaught SyntaxError: Identifier 'tick' has already been declared

I had a variable named `tick` in the code, and it was also used as a function name. I renamed the variable, and it worked. I'm not sure why it worked in Internet Explorer and Safari, but anyway, now it's fixed. 

Last thing on my to-do list for now is to add a redirect from the old URL to the new one. helgo.net uses Apache, so I could add a `.htaccess` file in my `~/public_html/normalscore` directory, containing:

```text
Redirect /simon/normalscore/ https://normalscore.skagedal.tech
```

I removed the rest of the files, except a very placeholder `index.html`, in case the redirect would somehow not work. 

I think this will be it for this project for the time being. Sorry, Johannes, no new features and no iOS app just yet! Who knows! "Watch this space", [as they say](/posts/2023-02-11-normal-score-converter).  