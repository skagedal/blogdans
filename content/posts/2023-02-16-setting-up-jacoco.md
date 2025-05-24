---
layout: post
title:  "Adding JaCoCo to Hahabit"
summary: "As I want to discuss testing of my Spring Boot habit tracker app, I add the JaCoCo code coverage tool to the project and make an `awk` script to extract a relevant number."
---
It's time to improve on the testing situation in Hahabit. I believe the coverage is low. 

How low? Let's add JaCoCo – the Java Code Coverage tool – to the project. I don't think one should focus too hard on metrics like these, but they are fun to have. And if it's really low, things are probably bad. 

So we add the Gradle plugin:

```groovy
plugins {
    // ...
    id "jacoco"
    // ...
}
```

And then you need to add some dependency settings manually:

```groovy
 test {
    finalizedBy jacocoTestReport
}

jacocoTestReport {
    dependsOn test
}
```

Then I get a report in HTML whenever I run the tests. It looks like this:

![JaCoCo report](/images/habit-tracker/jacoco-report.png)

I'm gonna track that 36% number, which is the number of instructions that are covered by tests, divided by the total number of instructions. 

I'd like to get that number directly in the terminal, not having to open up an HTML file.  JaCoCo has some different report options, XML and CSV. Unfortunately no JSON. I'm gonna do what I saw someone do at work, get the CSV report and parse it with `awk`. 

So, I make my `jacocoTestReport` section in `build.gradle` look like this:

```groovy
jacocoTestReport {
    dependsOn test
    reports {
        csv.required = true
    }
}
```

We can then run the tests and get the coverage number:

```shell
$ ./gradlew test jacocoTestReport

BUILD SUCCESSFUL in 883ms
6 actionable tasks: 2 executed, 4 up-to-date
```

It then puts a CSV file in `build/reports/jacoco/test/jacocoTestReport.csv`:

```shell
$ cat build/reports/jacoco/test/jacocoTestReport.csv
GROUP,PACKAGE,CLASS,INSTRUCTION_MISSED,INSTRUCTION_COVERED,BRANCH_MISSED,BRANCH_COVERED,LINE_MISSED,LINE_COVERED,COMPLEXITY_MISSED,COMPLEXITY_COVERED,METHOD_MISSED,METHOD_COVERED
hahabit,tech.skagedal.hahabit,HahabitApplication,5,3,0,0,2,1,1,1,1,1
hahabit,tech.skagedal.hahabit,WebSecurityConfig,0,33,0,0,0,8,0,4,0,4
hahabit,tech.skagedal.hahabit.mvc,HabitsController,28,6,0,0,7,3,3,1,3,1
hahabit,tech.skagedal.hahabit.mvc,HomeController,73,9,2,0,14,4,6,1,5,1
hahabit,tech.skagedal.hahabit.mvc,HomeController.AchieveForm,15,0,0,0,1,0,3,0,3,0
hahabit,tech.skagedal.hahabit.model,Achievement,9,19,0,0,1,2,3,2,3,2
hahabit,tech.skagedal.hahabit.model,HabitForDate,34,0,2,0,2,0,7,0,6,0
hahabit,tech.skagedal.hahabit.model,Habit,6,29,0,0,0,3,2,4,2,4
```

We want to sum up the `INSTRUCTION_COVERED` and `INSTRUCTION_MISSED` columns. 

This is the kind of problem where the teacher asks "allright, who can do this?" and `awk` is like "me!! meee!! I can do this!!". And Python rolls their eyes and goes like "yeah, wow? You can add up some numbers? I can add up numbers. You want it as a one-liner? I'll give you a one-liner" and the others are like "oh, come on Python, let `awk` have this moment". Perl is just sitting in a corner looking smug. 

So yeah, let's let `awk` do it. I'm putting this in a `test.sh` script. 

```bash
#!/usr/bin/env bash
./gradlew jacocoTestReport
echo
awk -F, \
    '{ total += $4 + $5; covered += $5 } END { print "Coverage: " 100*covered/total "%" }' \
     build/reports/jacoco/test/jacocoTestReport.csv
```

And then just:

```shell
$ ./test.sh

BUILD SUCCESSFUL in 437ms
6 actionable tasks: 6 up-to-date

Coverage: 36.803%
```

Nice. If I were a better Gradle hacker, I'd make this run as some kind of hook in the Gradle file itself. But I'm happy with this for now. 

_[Continue reading part thirty-two.](/posts/2023-02-17-spring-boot-test-with-random-port)_
