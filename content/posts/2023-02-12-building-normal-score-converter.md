---
layout: post
title:  "Making Normal Score Converter build again"
summary: "Code necromancing the Normal Score Converter build system, updating some Python code to Python 3 and installing a JavaScript minifier."
---
I was [asking on Mastodon](https://mastodon.social/@skagedal/109850568196541644) for a catchy term for the act of bringing old code up to date. So far crickets, as I don't have a lot of followers, but so far I think my favorite is just "code necromancy". I also considered "repomancy", as in code repository. Anyway, that's what I'm dealing with today – bringing build code for  the Normal Score Converter that I discussed in the [previous post](/posts/2023-02-11-normal-score-converter) back to life.

So, as I mentioned, instead of a modern JavaScript build tool like Yarn, I have a Python script, [build.py](https://github.com/skagedal/normalscore/blob/5b512f2302083479ed25c80bd8ff6b93cef7b839/build.py) to put all the stuff together. Let's try running it.

```shell
$ python3 build.py
Traceback (most recent call last):
  File "/Users/simon/code/normalscore/build.py", line 7, in <module>
    from fabricate import *
  File "/Users/simon/code/normalscore/fabricate.py", line 183
    except OSError, e:
           ^^^^^^^^^^
SyntaxError: multiple exception types must be parenthesized
```

Oh wow, I guess this is Python 2. Python 3, I happen to know, was released the day I turned 30 – 3 december 2008 – and it's taken forever for people to upgrade. Let's see if we can get this thing to run with Python 3.

So, i used this build tool called [fabricate.py](https://github.com/brushtechnology/fabricate). It's pretty cool, you just tell it "run this thing to build this other thing" and it figures out the dependencies so that the next time you run it, it ony builds the things that have changed – without having to mention the dependencies explicitly, and without any other knowledge of what exactly it is your building. 

It was shipped backed then as a single Python file you can include in your project, and seems it still is. So I'm gonna try just upgrading it. 

```shell
$ curl https://raw.githubusercontent.com/brushtechnology/fabricate/master/fabricate.py -o fabricate.py
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 67534  100 67534    0     0  46461      0  0:00:01  0:00:01 --:--:-- 46736
```

And then, let's try the build again.

```shell
$ python3 build.py
Traceback (most recent call last):
  File "/Users/simon/code/normalscore/build.py", line 29, in <module>
    file.setdefault("concat", not file.has_key("CDN"))
AttributeError: 'dict' object has no attribute 'has_key'```
```

Ah, seems that one was [deprecated](https://portingguide.readthedocs.io/en/latest/dicts.html#:~:text=has_key()%20method%2C%20long%20deprecated,longer%20available%20in%20Python%203.) with Python 3, and you should now use the `in` operator instead. There's also a `python-modernize` tool that can do this for you – I love such tools, remember the nice sass-migrator [from the other day](/posts/2023-02-08-fixing-my-blog)? – but I think I'll just do this change myself. Now, next thing:

```shell
$ python3 build.py
yui-compressor js/jquery.flot.js -o js/jquery.flot.mintmp.js
Traceback (most recent call last):
<cut boring stack trace>
  File "/opt/homebrew/Cellar/python@3.10/3.10.10/Frameworks/Python.framework/Versions/3.10/lib/python3.10/subprocess.py", line 1847, in _execute_child
    raise child_exception_type(errno_num, err_msg, err_filename)
FileNotFoundError: [Errno 2] No such file or directory: 'yui-compressor' 
```

Hm, ok, so this is some Javascript minifier tool I used... [here's](https://yui.github.io/yuicompressor/) its homepage. How do I install that, does it have a Homebrew package? [Yes it does!](https://formulae.brew.sh/formula/yuicompressor#default)

I'm installing that with `brew install yuicompressor`. Then it seems the executable is called `yuicompressor`, not `yui-compressor`. So I'll just change that in the build script. And then, let's try again.

```shell
$ python3 build.py
yuicompressor js/jquery.flot.js -o js/jquery.flot.mintmp.js
yuicompressor js/jquery.flot.canvas.js -o js/jquery.flot.canvas.mintmp.js
yuicompressor js/jquery.flot.crosshair.js -o js/jquery.flot.crosshair.mintmp.js
yuicompressor js/jquery.flot.axislabels.js -o js/jquery.flot.axislabels.mintmp.js
yuicompressor js/sprintf-0.7-beta1.js -o js/sprintf-0.7-beta1.mintmp.js
yuicompressor js/jquery.handsontable.full.js -o js/jquery.handsontable.full.mintmp.js
yuicompressor js/normalscore.js -o js/normalscore.mintmp.js
Concatenating...
Building prod.index.html...
$
```

Oh cool, are we done? 

```shell
$ open -a Safari prod.index.html
```

Yeah! This opens up my single-page app, if we want to call it that, in Safari – and it works. I can enter a score, and it gets converted.

[Here's](https://github.com/skagedal/normalscore/commit/0b1a9ce804eb5305c1f4f7fa522b1439da967f4b) what my first commit in ten years (minus eleven days!) looks like. 

Next thing will be to get this thing deployed here on skagedal.tech!  

_[Continue to the next part](/posts/2023-02-13-deploying-normal-score-converter)_