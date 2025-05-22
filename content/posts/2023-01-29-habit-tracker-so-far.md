---
layout: post
title:  "Writing a habit tracker, part 29: Summary so far"
---

I have now written twenty-eight little posts in the series called Writing a Habit Tracker! I'm pretty happy about that! 

It's not like we have implemented a whole lot of functionality. But we have discussed a whole bunch of stuff. I like to think of it as a kind of slow-cooking approach to programming, where we take the time to nerd out on details.

Here's a summary of the posts so far: 

* In [part one](/posts/2023-01-01-writing-a-habit-tracker), I introduced the project, a habit tracker which I named `hahabit`, and proceeded to set up some software on my Digital Ocean Ubuntu machine: PostgreSQL and Java 19. 
* In [part two](/posts/2023-01-02-habit-tracker-part-two-spring-boot), I created a Spring Boot app using Spring Initializr, and discussed what components to use. 
* In [part three](/posts/2023-01-03-habit-tracker-part-three-making-it-run), I set up Testcontainers so that we could run the test suite. 
* In [part four](/posts/2023-01-04-habit-tracker-functionality-and-first-migration), I wrote some kind of functionality spec for `hahabit` and create an initial PostgreSQL schema for users with the help of ChatGPT. 
* In [part five](/posts/2023-01-05-habit-tracker-repository), I created a Spring Data JDBC repository for users, again using ChatGPT. 
* In [part six](/posts/2023-01-06-habit-tracker-records-and-other-improvements), I discussed some details about Spring Data JDBC and records, improved on the user model and added a table and repository for habits. 
* In [part seven](/posts/2023-01-07-habit-tracker-achievements), I added the table that tracks what I call the achievements, i.e. when you mark a habit as having been "done" for a specific day. 
* In [part eight](/posts/2023-01-08-habit-tracker-serving-some-web), I started configuring Spring MVC, decided I would serve web pages directly from Spring using Thymeleaf and set up a docker-compose file to run the service locally. 
* In [part nine](/posts/2023-01-09-habit-tracker-securing-things), I explored how the basic Spring Security setup works using `curl`, when it redirects to a form login and when it just challenges with Basic auth.   
* In [part ten](/posts/2023-01-10-habit-tracker-securing-things-2), I discussed how various options for how to make our user repository back Spring Security, and decided to go for the default Spring Security user schema instead for now, even though it's weird.  
* In [part eleven](/posts/2023-01-11-habit-tracker-the-habits-page), I started on a little Thymeleaf HTML template for managing habits.
* In [part twelve](/posts/2023-01-12-habit-tracker-making-habits-page-work), I discussed the difference between Spring's `@RestController` and `@Controller`, complained about some weird API and wrote a simple controller for the habits page (with static data).  
* In [part thirteen](/posts/2023-01-13-habit-tracker-reading-from-repository), I started reading the habits from the actual database repository, discussed Spring's various types of dependency injection and figured out how to get the logged in user. 
* In [part fourteen](/posts/2023-01-14-habit-tracker-spring-session-jdbc), I set up Spring Session JDBC so that sessions are stored in PostgreSQL and discussed how to make it more performant in the future without using Redis. 
* In [part fifteen](/posts/2023-01-15-habit-tracker-add-new-habit), I implemented form submission for adding new habits and made them show up on the page, explored various options for the handler, got very excited about simple functionality and briefly discussed replica lag. 
* In [part sixteen](/posts/2023-01-16-habit-tracker-listing-your-achievements), I explored how to use Thymeleaf conditionals, making it show whether a habit has been achieved or not for a certain day, and discussed the merits of using little domain languages compared to using the host language. 
* In [part seventeen](/posts/2023-01-17-habit-tracker-reading-habits-for-date), I made it read the achievements for a specific date and looked at how to do that reasonably effectively and use a custom query in Spring Data JDBC.
* In [part eighteen](/posts/2023-01-18-habit-tracker-getting-the-users-date), I figured out how to get the user's time zone so that we can present the right date. 
* In [part nineteen](/posts/2023-01-19-habit-tracker-achieving-some-habits), I added a button with which we will soon be able to actually mark a habit as done, discussed the Post/Redirect/Get and what is and isn't a nice way to do redirects in Spring MVC.
* In [part twenty](/posts/2023-01-20-habit-tracker-storing-the-achievement), I made the button actually save to the repository and made sure we could only achieve our own habits – i.e., implementing access control, thus completing the functionality of the MVP habit tracker! 
* In [part twenty-one](/posts/2023-01-21-habit-tracker-building-a-jar), I explored how to build a JAR of our program that we will upload to our server, and fixed a couple of annoyances that surfaced during this process. 
* In [part twenty-two](/posts/2023-01-22-habit-tracker-deploying-the-jar), I set up my `hahabit` account on the server so I could upload things and made a script to build and upload the JAR. 
* In [part twenty-three](/posts/2023-01-23-habit-tracker-running-it-on-the-server), I made the program run on the server and dealt a bit with various passwords, in PostgreSQL and the hahabit service itself. 
* In [part twenty-four](/posts/2023-01-24-habit-tracker-always-running-it), I set up the program to continuously run on the server using systemd, and made my deploy script restart the service. 
* In [part twenty-five](/posts/2023-01-25-habit-tracker-exposing-it), I finally exposed my application to the Internet by setting up my nginx server, and then making sure the traffic is protected by TLS using a Let's Encrypt certificate. 
* In [part twenty-six](/posts/2023-01-26-habit-tracker-usability), I made the thing look a little less terrible by exploring various CSS frameworks.

I think part twenty-six marks for a good ending of Season One of "Writing a Habit Tracker", and then there are a final two more "extra material" kind of posts:  

* In part [twenty-seven](/posts/2023-01-27-habit-tracker-updating-dependencies), I get a Dependabot pull request, I update the third party dependencies and see if I can get rid of some bug workarounds and ask myself what the Spring Dependency Management plugin does for me. 
* In part [twenty-eight](/posts/2023-01-28-habit-tracker-spring-dependency-management-plugin), I get rid of the Spring Dependecy Management plugin. 

I'm now planning to take a little break from this series, but hoping to continue writing a blog post every day. I have some other little things I'd like to focus on for a bit: a PR for Testcontainers and some improvements for this blog.

But after that, I hope to get back to the Habit Tracker. I might blog about improving the test suite, writing an API, writing a CLI client, visualizing the progress, writing an iOS client and enabling registration for other people. Who knows. Stay tuned! 

_Continue reading about my [next little project](/posts/2023-01-30-test-containers-and-colima), or [jump straight ahead to part thirty](/posts/2023-02-15-hahabit-tracking-deploys) of the habit tracker series._
