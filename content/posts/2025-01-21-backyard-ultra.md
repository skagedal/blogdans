---
layout: post
title: "The backyard ultra timer"
summary: "Implementation notes and reflections."
---

There is a kind of ultramarathon race called a [backyard ultra](https://en.wikipedia.org/wiki/Backyard_ultra). Here's how it works. Every hour a new lap starts. You need to finish the lap within the hour. The person who runs the most laps wins[^1]. Each lap is 6.7 km, or 4.1 miles – it is set to this distance so that if you complete 24 laps, i.e stay in the race for 24 hours, you have run 100 miles. 

I was in the mood for a random little web project, when my brother-in-law mentioned something that he thought should exist in the world: a timer for such a race. This would be something that the race organizer has on display somewhere near the starting line. It should show the time left until the race starts, and then for each lap it should show the time of that lap. It should give sound signals at specific points every hour: three whistle blows at three minutes before each lap, two whistle blows at two minutes, and one whistle blow at one minute, before each lap. Finally, a bell should ring when the lap starts. 

You can find the results of my little project at [backyard.skagedal.tech](https://backyard.skagedal.tech/) and the source [at Github](https://github.com/skagedal/backyard-timer).  

Here are some rather unstructured implementation notes and random things going through my mind while implementing this. 

## UI controls

I wanted to use some component library that gave me some nice controls for the time settings and whatever other chrome I would need around the core functionality of the timer. I have come across [shadcn/ui](https://ui.shadcn.com/) a few times before, finding it rather aesthetically pleasing, and decided to try it. It has an interesting approach&nbsp;– it is not a library that you put as a dependency in your `package.json`, you are supposed to copy the code and modify it to your needs. So, it's more of a starting point for your own component library than a component library itself. 

In practice, the shadcn components often uses components from other component libraries, wrapping them up in a coherent style; mostly [Radix](https://www.radix-ui.com/) it seems. The date picker uses the [react-day-picker](https://www.npmjs.com/package/react-day-picker) package.  

This mirrors a discussion I recently had at work with a colleague – is it always the right thing to try to have your own "component library" layer for your application code to use, wrapping other components, or is it better to just use some existing component library – using whatever customization capabilities (like theming) provided by the library? 

Obviously, not a question that can be answered generally, it depends on your use case, but there seem to be different schools of thought around this. In the "utility classes" world – which is what [Tailwind CSS](https://tailwindcss.com/) is all about – it seems popular with so-called "headless" UI libraries, consisting of components that have no style, only functionality and taking care of things like accessibility. A new one in that camp is [base-ui.com](https://base-ui.com/).   

As for the styling, I knew I wanted to play around with Tailwind, the aforementioned "utility classes" library. We have been discussing it a bit at work, so I wanted to try it out for a personal project. I think the first impression many people, including me, get from Tailwind is that... it's very ugly. All these weird cluttery lists of incomprehensible class names on each tag. Indeed, here's what they write in their own [documentation](https://tailwindcss.com/docs/utility-first):

> Now I know what you’re thinking, “this is an atrocity, what a horrible mess!” and you’re right, it’s kind of ugly. In fact it’s just about impossible to think this is a good idea the first time you see it — you have to actually try it.

I love how they write that. Developers should probably more often avoid to judge API:s after just their initial knee-jerk aesthetic reaction. 

Unfortunately, after this small couple-of-hours project of mine, I can't say that I really got over that initial reaction. Also I can't say that it made anything simpler or easier for a non-CSS-expert like me, rather the opposite – when trying to figure out how to do a certain thing with CSS, I then _also_ had to figure out how to make Tailwind do that thing. So there's the overhead of just another layer. 

This, of course, is a scale issue – I'm certain that if you do web development with Tailwind all day, you could get a lot of value from it. And I do buy the argument that the classic [separation of concerns](https://adamwathan.me/css-utility-classes-and-separation-of-concerns/) between HTML and CSS is not serving its purpose for many modern web applications. I think I'd mostly be happier with CSS-in-JS approaches, though.  

## Clock layout

This is probably what I spent most time on – getting that simple little clock laid out the way I want it. Sounds so simple, right? It should just be as big as it can be, adapting to the screen size. I found several ways of doing it that involved JavaScript to fit text into a container, but I felt that it would be cleaner to do it with CSS. I found that there is this thing called viewport units, where you specify the size of an element in relation to the viewport; basically, the browser window. Either you use the height (the `vh` units) or the width (the `vw` units). 

Since I imagine the main mode of usage for this application would be on a screen in landscape mode, I found a certain magic font size value that worked well: `20vh`. Now it fit snugly into the landscape screen even as I changed height. But what if I did want to use it in portrait? Certainly that should look good too. Changing to width-relative coordinates – `10vw` worked well – made it work well for portrait, but instead broke landscape. 

The solution to this is probably obvious to any seasoned web developer, but to me it came while I was out running later that day – actually taking my new Backyard Timer for a test run (I only ran two laps and they were only 5 km, sorry) – you can just use the CSS `min` function. So that's what I ended up with: `min(20vh, 10vw)`. 

And that, by the way, was one of the places where Tailwind was just in the way – I couldn't figure out how to do that with Tailwind, so ended up just using a `style` attribute. No harm in mixing approaches like that, I guess.  

Another thing with the layout was that you want a clock to stay put on the screen, not jump around because a 1 is not as wide as a 9. I had learned a neat thing from my colleague Adam (👋) just a week or two before – there is this CSS property called `font-variant-numeric` that you can set to `tabular-nums` to make all numbers the same width. Useful in table formatting and clocks. Obviously I could have also gone with a full monospaced font, but I wanted the font of the clock to fit well with the rest of the design. 

I struggled for a while with getting this to work, first finding out that it only works with fonts that have support for this particular OpenType feature, then finding out that the font I thought I used did indeed have that support, then being confused, then finding out that the font I used wasn't the font I thought I used. As things go.  

## Time source

My clock should consistently tick with each second. As many clocks do. I had recently read Dan Abramov's post [here](https://overreacted.io/making-setinterval-declarative-with-react-hooks/) about using `setInterval` in React by wrapping it in a custom hook, so I thought I'd used that – but as I thought about it, this approach would have some issues. I wrote about this separately [here](/posts/2025-01-06-seconds-aligned-time-source-in-react).   

## Time handling library

I had some simple needs for doing time calculations (duration left until time X and so on) and formatting. I didn't think I'd bring in any external dependency for this, but the standard DOM API:s for this just turned out too limited and annoying, or I was just not looking hard enough. After shopping around for a bit I ended up with [Luxon](https://moment.github.io/luxon/) which felt simple and clean. 

Runner-up: [js-joda](https://js-joda.github.io/js-joda/), as it is pretty much the (modern) Java date and time API for JavaScript, which I know and love.  I considered [date-fns](https://date-fns.org/) as it seems popular, but I found it weird. Sorry for the vagueness. 

I did find some weirdness with the Luxon library as well; it uses generics in a way that felt odd, with `DateTime<true>` meaning something like a "validated" date-time and `DateTime<false>` meaning a "not validated" date-time. Probably there's a good reason, but it felt weird. 

What's _your_ favorite time handling library for the JavaScript ecosystem, dear reader?  

## Playing sound

I also needed to play some sounds. I did this in a small component that weirdly returned no JSX – just `<></>` – so it probably should have been a hook instead. In there I created an HTML `Audio` element and put it in a `ref`, then just called `play` on it. I found a decent sound for the whistle blow on [freesound.org](https://freesound.org/people/SpliceSound/sounds/218318/) and just used that everywhere, playing it multiple times as per the countdown-to-lap schema specified before. Sounds a bit stiff, but works.      

## Deployment

I only needed a bunch of static HTML, so used the `output: "export"` option on Next.js. Then I just rsync those files onto my server and serve with nginx (as I now have this [wildcard certificate](/posts/2023-02-13-deploying-normal-score-converter)). 

## Features I want

Not planning to do much more on this project, it was just a fun little hack. There are two things that _would_ make it feel slightly more complete, though:

- There should be a way to specify the date and time via an URL like `https://backyard.skagedal.tech/race/2025-12-24/15:00` or something. This would make it possible for organizers to link to the race timer for a certain race. 
- The sounds should not suck; there should be bespoke recordings for "three whistle blows", "two whistle blows", "one whistle blow" and "bell".

---

[^1]: Actually, in order to win you need to complete one more lap than everybody else – or you will be marked as "DNF", "did not finish". 