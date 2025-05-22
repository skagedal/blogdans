---
layout: post
title:  "More HTML unit"
summary: "I continue covering the functionality of the Habit Tracker with tests using the HtmlUnit framework, deal with missing support of the ECMAScript Internationalization API and get my test coverage up to 90%."
---
We now have a nice testing setup for our HTML-serving Spring Boot App, using [HtmlUnit](/posts/2023-02-18-html-unit-testing) and using a [randomly created user](/posts/2023-02-19-creating-random-test-users). 

Now I'm going to try to just flesh out the whole flow so far as tests. Every here and there, I need to add little things to the production code and HTML templates to make the tests easier to write, such as adding id:s to elements. That's fine. More than fine, I think.

So, now I have this to test the flow where we're adding a habit:

```java
public class WebTests {
    // ...
    @Test
    void can_login_and_add_a_habit() throws IOException {
        final var username = testDataManager.createRandomUser();

        final HtmlPage start = webClient.getPage(url("/"));

        // Log in
        final HtmlForm signInForm = start.getForms().get(0);
        final HtmlTextInput usernameField = signInForm.getInputByName("username");
        final HtmlPasswordInput passwordField = signInForm.getInputByName("password");
        final HtmlButton button = signInForm.getFirstByXPath("//button[@type='submit']");

        usernameField.type(username);
        passwordField.type(TestDataManager.PASSWORD);
        final HtmlPage loggedInPage = button.click();

        assertThat(loggedInPage.asNormalizedText()).contains("Manage my habits");

        // Go to "Manage my habits"
        final HtmlAnchor manageHabitsLink = loggedInPage.getFirstByXPath("//a[@id='manage-habits']");

        final HtmlPage manageHabits = manageHabitsLink.click();

        // Add a new habit
        final HtmlForm addHabitForm = manageHabits.getForms().get(0);
        final HtmlTextInput habitDescriptionField = addHabitForm.getInputByName("description");
        final HtmlButton addHabitButton = addHabitForm.getFirstByXPath("//button[@type='submit']");

        habitDescriptionField.type("Go for a walk");
        final HtmlPage manageHabitsPageAfterAddingHabit = addHabitButton.click();

        assertThat(manageHabitsPageAfterAddingHabit.asNormalizedText()).contains("Go for a walk");
    }
    // ...
}
```

Tthose lines that says `field.type(text)` looked weird to me at first; that should be read as the verb "type", as in that you're typing that into the field.

New test coverage: 57.6208%. (Yeah, I'm sticking with that ridiculously precise number formatting, now that I've started with it.) 

But then, we want to go back to the start page, where we can track that habit! I add the following:

```java
public class WebTests {
    // ...
    @Test
    void can_login_and_add_a_habit() throws IOException {
        // ...

        // Go back to home
        final HtmlAnchor homeLink = manageHabitsPageAfterAddingHabit.getAnchorByHref("/");
        final HtmlPage home = homeLink.click();
    }
    // ...
}
```

But now, the test fails. HtmlUnit says that it's getting a [500](https://http.cat/500) error:

```
com.gargoylesoftware.htmlunit.FailingHttpStatusCodeException: 500  for http://127.0.0.1:64387/
```

Scrolling up the logs, I see this output from the service:

```
java.time.zone.ZoneRulesException: Unknown time-zone ID: undefined
	at java.base/java.time.zone.ZoneRulesProvider.getProvider(ZoneRulesProvider.java:281) ~[na:na]
	at java.base/java.time.zone.ZoneRulesProvider.getRules(ZoneRulesProvider.java:236) ~[na:na]
	at java.base/java.time.ZoneRegion.ofId(ZoneRegion.java:121) ~[na:na]
       <lots and lots of stack trace>
```

That rings a bell. Frequent readers of the "Writing a Habit Tracker" series will remember that in [part eighteen: Getting the user's date](/posts/2023-01-18-habit-tracker-getting-the-users-date), we found that the best way to get the user's time zone was through JavaScript. I put a little snippet like this in the `home.html` file:

```javascript
document.cookie = 'zoneId=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
```

This `Intl` object API, however, is a "recent" addition to JavaScript. Well, it's [from 2012](https://402.ecma-international.org/1.0/), supported by [major browsers since the mid-10's](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl). But apparently, it's not supported by HtmlUnit's JavaScript engine. 

So in a way, we have uncovered a bug in our code here, if we consider lacking support for decade-old browsers a bug. 

I did research this briefly back when I wrote that code, and I found there were some workarounds for older browsers, buuuut.... I was too lazy now, and I'm too lazy now. Or, "lazy" is not really the word; it simply is not what I feel like spending my time on. 

So, I'm just going to do this:

```javascript
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
if (timeZone !== undefined) {
    document.cookie = 'zoneId=' + timeZone;
}
```

Meaning I'll only set the cookie if a defined value is available. This means these users will get the default behavior of timezone "Europe/Stockholm" and that my tests pass. I'm happy. 

Now, let's just do the final part of the story, the one where we track the habit. 

It goes like this (this is the same test as above, I just renamed it):

```java
public class WebTests {
    // ...
    @Test
    void can_login_add_a_habit_and_achieve_it() throws IOException {
        // ...

        // Achieve the habit
        final HtmlForm addAchievementForm = home.getForms().get(0);
        final HtmlSubmitInput achieveHabit = addAchievementForm.getFirstByXPath("//input[@type='submit']");
        assertThat(achieveHabit.isDisabled()).isFalse();

        final HtmlPage pageAfterAchievedHabit = achieveHabit.click();

        final HtmlForm addAchievementFormAfterAchieved = pageAfterAchievedHabit.getForms().get(0);
        final HtmlSubmitInput achieveHabitAfterAchieved = addAchievementFormAfterAchieved.getFirstByXPath("//input[@type='submit']");
        assertThat(achieveHabitAfterAchieved.isDisabled()).isTrue();
    }
    // ...
}
```

There! Probably not the prettiest way to do things, but it works. If you remember (of course you don't), the way we show that a habit has been achieved is by disabling the button, so that's what we assert.

Ok, now that pretty much all of the functionality of the app is under test, where are we at with the test coverage?

```
Coverage: 90.7063%
```

That's pretty good!  

_[Continue reading part thirty-six.](/posts/2023-02-21-adding-apis)_