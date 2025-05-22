---
layout: post
title: "The second overflow bug: Implementing a clock in React"
summary: "I demonstrate some unwanted behavior, and propose solutions, in using `setInterval` to implement a clock."

---

I recently built a small race timer tool for the browser using [React](https://react.dev/). I think I will write a separate blog post about that[^1], but first I wanted to discuss a specific issue. I will demonstrate it by building a simple clock widget. The post assumes some previous experience of using modern React with hooks.

First, let's just have a component that shows the time: 

{% raw %}
```tsx
function WatchFace({ date }: { date: Date }) {
  return <div style={{ textAlign: "center" }}>
    {date.toLocaleTimeString()}
  </div>;
}
```
{% endraw %}

And then put that it our app:

```tsx
export default function App() {
  const date = new Date();
  return <WatchFace date={date} />;
}
```

We're successfully showing time! You can try it out [here](https://codesandbox.io/p/sandbox/1-dead-clock-dr4s7q) – you just simply need to refresh the page to update the clock.  

But all right, ok. We want it to automatically update as time goes on. We need something that will trigger a rerender of our component when some time has passed. 

## Using Window.setInterval()

There's a standard DOM API on the Window interface called [`setInterval`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval) that seems relevant here. It's a function that takes a callback function and a time interval in milliseconds. It will call the function you provided every time the interval has passed.  

Using an API like this in a React component is a by-the-book example of where you should use `useEffect`, as this is about "[synchronizing with an external system](https://react.dev/learn/synchronizing-with-effects)" – that is, something that operates outside of the reactive data flow. We should set up our interval in a `useEffect` and also make sure to clean up afterwards. 

With our `WatchFace` component as before, we can rewrite our `App` component like this:

```tsx
export default function App() {
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return <WatchFace date={date} />;
}
```

This works! [Here's a CodeSandbox](https://codesandbox.io/p/sandbox/simple-setinterval-r7j4hv?file=%2Fsrc%2FApp.tsx%3A17%2C1) where you can try it out.

If you're a React developer, chances are that we you have had some confusing experiences with `useEffect` and its dependency array before. Here we are passing an empty dependency array to `useEffect` – this is fine by the rules; we're not using anything except the `setDate` function, which has a stable identity. If we excluded the dependency array argument completely, it would run the effect on every render, thus clearing and setting a new interval every second, which is not what we intended here. 

Another side remark: while our example `App` right now is just the clock, in a larger app it would probably contain a lot more components. If we just put those as sibling components to our `WatchFace` here, they would all be re-rendered every second, which is not what we want. We would want to push the state and the `useEffect` down into a `Clock` component, and use that in the app.  I will do that in upcoming CodeSanboxes for good measure.

## The second overflow bug

But what if I told you that if I had a thousand readers of this blog post, on average, one of these would get a suboptimally working clock? One that doesn't neatly tick at every second, instead jumping two seconds every now and then? This is, in fact, the case. 

To illustrate what I am talking about, let's also show the current milliseconds in our watchface:

{% raw %}
```tsx
function WatchFace({ date }: { date: Date }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p>{date.toLocaleTimeString()}</p>
      <p>{date.getMilliseconds()}</p>
    </div>
  );
}
```
{% endraw %}

[Here](https://codesandbox.io/p/sandbox/simple-setinterval-and-showing-milliseconds-5x5pcs?file=%2Fsrc%2FApp.tsx%3A11%2C2) it is on CodeSandbox.

You'll find that on each update, the millisecond value will be about the same. For me, right now, it goes back and forth between 678 and 679. This is of course dependent on all kinds of timing and performance details of your machine. If you reload the preview widget, you will see that it aligns around a different millisecond – it will stay at whatever it was when you started the `setInterval`, and then there will be a variable amount of time from the low-level timer interrupt until your JavaScript code actually gets to the `new Date()`.        

But what if it starts at the 999:th millisecond? Then every other second it will fall over to the second after! So, we may go from 06:45:03:999 to 06:45:04:999 to 06:45:06:000 – thus never displaying 06:45:05! I will call this the *second overflow bug*. 

You could replicate this by reloading the CodeSandbox, but you'll have to do it on average a thousand times to trigger the bug. Not fun. For our testing purposes, we could force it to trigger by adding an appropriate delay before the interval starts. Somethine like this:

```tsx
function Clock() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const wait = 998 - new Date().getMilliseconds();
    let interval: number | undefined = undefined;
    const timeout = setTimeout(() => {
      interval = setInterval(() => setDate(new Date()), 1000);
    }, wait);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return <WatchFace date={date} />;
}
```

To follow along at home, you can fork the CodeSandbox and put that in as the `Clock` component. You may have to adjust that number 998 until you get the desired effect. Can you replicate it? Now you're in the 0.1%! 

## Solutions

So, how can we fix this? The easiest way I can think of is to just make more frequent updates. Just decide on how big of a lag can be accepted and set your timer interval at that, instead of a full second. 

But isn't it just a little bit sad that we have to do all these unnecessary renders? Even if it's probably fine, performance-wise? We should at least explore other solutions.  

One possible solution would be to do what I did just above to trigger the bug – but instead of aligning to the 999:th millisecond, we align to the 0th.

But this assumes that we can really trust that the interval, once started, will robustly stay on the same millisecond alignment. This does not seem to be the case. Keep the clock that we have now in a browser tab. Put your machine to sleep and go have some coffee. On my machine, when I do that and open up the browser tab again, we are now on a different millisecond phase when it comes back. So then we may still get that same overshoot bug.

I did go down a rabbit hole of making my `setInterval` reset and adjust itself when it noticed that it was a bit off. But it became really messy, and I realized there was a simpler solution.

We can just use `setTimeout` instead, and schedule a new timeout at the next point in time every time it triggers. 

I'm going to abstract this functionality into a custom hook that I will call `useEverySecond`:

```tsx
function useEverySecond(callback: () => void) {
  useEffect(() => {
    const current = new Date().getMilliseconds();
    const wait = 1000 - current;

    const timeout = setTimeout(callback, wait);
    return () => clearTimeout(timeout);
  });
}
```

Using it in my `Clock` component is then:

```tsx
export default function Clock() {
  const [date, setDate] = useState(new Date());
  useEverySecond(() => setDate(new Date()));

  return <WatchFace date={date} />;
}
```

And that's it! 

I haven't tested this extensively, but it seems to work nicely. Try it out [here](https://codesandbox.io/p/sandbox/final-settimeout-solution-d2km5h?file=%2Fsrc%2FApp.tsx%3A36%2C93), my final CodeSandbox.

Maybe this solution is what you might have come up with to begin with, if you weren't – like I was – already on the path of using `setInterval`. Briefly browsing the Internet, I could at least find [some other people](https://www.npmjs.com/package/react-clock) who uses `setInterval` like this and will have the second overflow bug. 

Then there are of course other, completely different situations where `setInterval` is the right choice. In those situations, you might find value in [this blog post by Dan Abramov](https://overreacted.io/making-setinterval-declarative-with-react-hooks/), which discusses some other pit falls you may encounter, and develops a custom `useInterval` hook that could use in those cases.

If you have any experience on this topic, or anything else you'd like to comment on regarding this post, please feel free to reach out! 

---

[^1]: I have now – see [The backyard ultra timer](/posts/2025-01-21-backyard-ultra)