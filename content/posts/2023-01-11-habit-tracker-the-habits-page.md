---
layout: post
title:  "Writing a habit tracker, part 11: The habits page"
---
Allright! Here's part eleven! Of the habit tracker series! Which started [here](/posts/2023-01-01-writing-a-habit-tracker), for those of you just joining! 

We've set up a little Spring Web MVC service, serving web through Thymeleaf templates, and now I thought we'd start building the real pages a little bit.

First, we'll need a page to manage my daily habits. You should see your list of habits, and be able to add new ones. 

Here's a bit of simple HTML5 for that:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Habits</title>
</head>
<body>
    <h2>Your habits</h2>
    <ul>
        <li>Some habit</li>
    </ul>
    <label>Add new habit: <input></label>
    <button>Add</button>
</body>
</html>
```

Obviously, it validates with the [Nu Html Checker](https://validator.w3.org/nu/). We put it in `habits.html` in the `resources/templates` folder. Then we can add a little view controller to route the `/habits` URL to this page and add a link from our home page, [like this](https://github.com/skagedal/hahabit/commit/79aad4b216df6e9cf91ae9512201e67535aaf83e).   

But now, we want this to not just list a static list of habits. It should reflect our model. This is where we start to add some Thymeleaf specific tags:

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="https://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Habits</title>
</head>
<body>
    <h2>Your habits</h2>
    <ul>
        <li th:each="habit: ${habits}" th:text="${habit.description}">Some habit</li>
    </ul>
    <label>Add new habit: <input></label>
    <button>Add</button>
</body>
</html>
```

Now, we quickly left valid-HTML5 land. Those `th:` tags are totally not valid HTML5, and adding that fake XML namespace doesn't help. However, browsers don't care and we can still preview our page in a browser, or inline in an IDE like IntelliJ IDEA. Which is neat. That namespace-ish also helps the IDE to become aware that this is in fact a Thymeleaf-powered HTML page, and be more helpful with things like formatting and various IDE smartness.

I _like_ the idea of validating HTML, and Thymeleaf does provide us with an alternative syntax, by using tags that look like `data-th-each` instead. Those are allowed by HTML5. But in this mode, we get less help from the IDE. I'll let pragmatism win today. Here's a screenshot of the IDE being helpful:

<figure>
<img src="/images/habit-tracker/editing-some-thymeleaf-html.png" alt="Screenshot of IntelliJ IDEA, editing and previewing habits.html." />
</figure>


But anyway. The page still looks the same when we run the app. We haven't yet hooked up our actual model with the template. 

But I will let that wait for tomorrow. This is too much to take in for one day. HTML stands for Hypertext Markup Language and was created by Tim Berners–Lee in 1989, and then all kinds of crazy things happened. Ok, bye.  

_[Continue reading part twelve.](/posts/2023-01-12-habit-tracker-making-habits-page-work)_
