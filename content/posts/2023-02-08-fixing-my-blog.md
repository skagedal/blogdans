---
layout: post
title:  "Fixing annoying warnings in my blog"
---

Continuing the project of [improving this blog](/posts/2023-02-06-improving-skagedals-oboy). So, I deploy the blog by running a script, `./deploy.sh`, on my developer machine, just like I [do with my habit tracker software](/posts/2023-01-22-habit-tracker-deploying-the-jar). But currently, when I do so, a flood of annoying text fills my screen. Several screenfulls of it. If there was any actually relevant information in there, for example about my blog not getting generated correctly, I'd miss it. So, I'd like to fix this. 

The first thing my deploy script does is this:

```shell
bundle install || exit 1
```

That is, simply installing the dependencies needed by Jekyll, as specified in `Gemfile`. What happens when I run this?

```shell
$ bundle install
/Users/simon/.rbenv/versions/3.1.2/lib/ruby/gems/3.1.0/gems/bundler-2.0.1/lib/bundler/shared_helpers.rb:29: warning: Pathname#untaint is deprecated and will be removed in Ruby 3.2.
/Users/simon/.rbenv/versions/3.1.2/lib/ruby/gems/3.1.0/gems/bundler-2.0.1/lib/bundler/shared_helpers.rb:118: warning: Pathname#untaint is deprecated and will be removed in Ruby 3.2.
/Users/simon/.rbenv/versions/3.1.2/lib/ruby/gems/3.1.0/gems/bundler-2.0.1/lib/bundler/shared_helpers.rb:118: warning: Pathname#untaint is deprecated and will be removed in Ruby 3.2.
/Users/simon/.rbenv/versions/3.1.2/lib/ruby/gems/3.1.0/gems/bundler-2.0.1/lib/bundler/shared_helpers.rb:35: warning: Pathname#untaint is deprecated and will be removed in Ruby 3.2.
/Users/simon/.rbenv/versions/3.1.2/lib/ruby/gems/3.1.0/gems/bundler-2.0.1/lib/bundler/shared_helpers.rb:35: warning: Pathname#untaint is deprecated and will be removed in Ruby 3.2.
/Users/simon/.rbenv/versions/3.1.2/lib/ruby/gems/3.1.0/gems/bundler-2.0.1/lib/bundler/shared_helpers.rb:35: warning: Pathname#untaint is deprecated and will be removed in Ruby 3.2.
/Users/simon/.rbenv/versions/3.1.2/lib/ruby/gems/3.1.0/gems/bundler-2.0.1/lib/bundler/shared_helpers.rb:44: warning: Pathname#untaint is deprecated and will be removed in Ruby 3.2.
/Users/simon/.rbenv/versions/3.1.2/lib/ruby/gems/3.1.0/gems/bundler-2.0.1/lib/bundler/shared_helpers.rb:118: warning: Pathname#untaint is deprecated and will be removed in Ruby 3.2.
/Users/simon/.rbenv/versions/3.1.2/lib/ruby/gems/3.1.0/gems/bundler-2.0.1/lib/bundler/shared_helpers.rb:118: warning: Pathname#untaint is deprecated and will be removed in Ruby 3.2.
/Users/simon/.rbenv/versions/3.1.2/lib/ruby/gems/3.1.0/gems/bundler-2.0.1/lib/bundler/shared_helpers.rb:118: warning: Pathname#untaint is deprecated and will be removed in Ruby 3.2.
/Users/simon/.rbenv/versions/3.1.2/lib/ruby/gems/3.1.0/gems/bundler-2.0.1/lib/bundler/shared_helpers.rb:35: warning: Pathname#untaint is deprecated and will be removed in Ruby 3.2.
/Users/simon/.rbenv/versions/3.1.2/lib/ruby/gems/3.1.0/gems/bundler-2.0.1/lib/bundler/shared_helpers.rb:44: warning: Pathname#untaint is deprecated and will be removed in Ruby 3.2.
Using rake 13.0.6
Using public_suffix 5.0.1
Using addressable 2.8.1
Using bundler 2.0.1
Using colorator 1.1.0
Using concurrent-ruby 1.2.0
Using eventmachine 1.2.7
Using http_parser.rb 0.8.0
Using em-websocket 0.5.3
Using ffi 1.15.5
Using forwardable-extended 2.6.0
Using google-protobuf 3.21.12
Using i18n 1.12.0
Using sass-embedded 1.58.0 (arm64-darwin)
Using jekyll-sass-converter 3.0.0
Using rb-fsevent 0.11.2
Using rb-inotify 0.10.1
Using listen 3.8.0
Using jekyll-watch 2.2.1
Using rexml 3.2.5
Using kramdown 2.4.0
Using kramdown-parser-gfm 1.1.0
Using liquid 4.0.4
Using mercenary 0.4.0
Using pathutil 0.16.2
Using rouge 4.0.1
Using safe_yaml 1.0.5
Using unicode-display_width 2.4.2
Using terminal-table 3.0.2
Using webrick 1.8.1
Using jekyll 4.3.2
/Users/simon/.rbenv/versions/3.1.2/lib/ruby/gems/3.1.0/gems/bundler-2.0.1/lib/bundler/shared_helpers.rb:35: warning: Pathname#untaint is deprecated and will be removed in Ruby 3.2.
/Users/simon/.rbenv/versions/3.1.2/lib/ruby/gems/3.1.0/gems/bundler-2.0.1/lib/bundler/shared_helpers.rb:44: warning: Pathname#untaint is deprecated and will be removed in Ruby 3.2.
Bundle complete! 1 Gemfile dependency, 31 gems now installed.
Use `bundle info [gemname]` to see where a bundled gem is installed.
```

So first of all there is a whole bunch of deprecation warnings for the `bundle` tool itself. So this version of this very central piece of Ruby tooling is not updated to be fully compatible with the version of Ruby I'm running. That seems weird. 

My Ruby version is controlled by `rbenv`, and it will be set to `3.1.2` because that's what I have in a file called `.ruby-version`. The bundler tool itself lives inside this rbenv-controlled environment. I'll try just updating it.  Apparently, that's done with `gem install bundler`.

```shell
$ gem install bundler
Fetching bundler-2.4.6.gem
Successfully installed bundler-2.4.6
Parsing documentation for bundler-2.4.6
Installing ri documentation for bundler-2.4.6
Done installing documentation for bundler after 0 seconds
1 gem installed
```

Allright, cool! Did, that help? It did not help. It seems that the version of `bundler` that is used is also somehow controlled by the `Gemfile.lock`. Indeed, taking a look in `Gemfile.lock`, there are these lines at the end:

```
BUNDLED WITH
   2.0.1
```

How do I update that? Should I just edit it? Aha, reading [this page](https://bundler.io/guides/bundler_2_upgrade.html#upgrading-applications-from-bundler-1-to-bundler-2) closer, it says that I should do this:

```shell
$ bundle update --bundler
```

Great, now it's changed that "bundle with" line to say 2.4.6. 

And if I run `bundle install` now, all those annoying deprecation warnings are gone! Good stuff. 

It's still a bit noisy with all that "Using foo" output. Can it be quieter? Yes, according to the `bundle install --help` page, there's a `--quiet` flag. Trying it.

```shell
$ bundle install --quiet
$ 
```

Perfect. I'll change my deploy script to include that instead, trusting it would still tell me if there was something very relevant going on.

Now, the next step in the `deploy.sh` script is to actually build the HTML pages from Markdown and some other things. That's done with `bundle exec jekyll build`. This invocation also spits out lots of annoying stuff:

```
$ bundle exec jekyll build
Configuration file: /Users/simon/code/blog.skagedal.tech/_config.yml
            Source: /Users/simon/code/blog.skagedal.tech
       Destination: /Users/simon/code/blog.skagedal.tech/_site
 Incremental build: disabled. Enable with --incremental
      Generating...
Deprecation Warning: Using / for division outside of calc() is deprecated and will be removed in Dart Sass 2.0.0.

Recommendation: math.div($spacing-unit, 2) or calc($spacing-unit / 2)

More info and automated migrator: https://sass-lang.com/d/slash-div

   ╷
37 │     margin-bottom: $spacing-unit / 2;
   │                    ^^^^^^^^^^^^^^^^^
   ╵
    _base.scss 37:20                                         @import
    /Users/simon/code/blog.skagedal.tech/css/main.scss 47:9  root stylesheet

[LOTS OF REPETITIONS OF THE SAME WARNING]

 Auto-regeneration: disabled. Use --watch to enable.
```

Ok, so Jekyll uses this thing called [Dart Sass](https://sass-lang.com/dart-sass) to aide with writing CSS, and here some things have gotten deprecated as well.  Actually, this here above is an absolutely _awesome_ diagnostic. It's clearly pointing out what line that needs to be fixed, a recommendation on how to fix it, and a link to a [very nice page](https://sass-lang.com/documentation/breaking-changes/slash-div) that describes exactly what this is all about, and even includes an automatic migrator! 

Even though the recommended change seems simple enough, there's no way I'm not gonna try the automatic migrator. 

```shell
$ npm install -g sass-migrator

added 1 package in 3s
```

Nice, we could install it. 

```shell
$ sass-migrator division **/*.scss
Error: expected "{".
  ╷
4 │ @charset "utf-8";
  │                 ^
  ╵
  css/main.scss 4:17  root stylesheet
Migration failed!
```

Oh no. Hmm, let's try them one by one instead.

```shell
$ echo **/*.scss
_sass/_base.scss _sass/_layout.scss _sass/_syntax-highlighting.scss css/main.scss
$ sass-migrator division _sass/_base.scss
$ sass-migrator division _sass/_layout.scss
$ sass-migrator division _sass/_syntax-highlighting.scss
Nothing to migrate!
$ sass-migrator division css/main.scss
Error: expected "{".
  ╷
4 │ @charset "utf-8";
  │                 ^
  ╵
  css/main.scss 4:17  root stylesheet
Migration failed!
```

Allright, so it happily converts two of the files, has nothing to do for one of the files, and reports an error for one file, `main.scss`. Looking at that file, I have a theory of what's going on there – it starts with some kind of "front matter" that only Jekyll knows about. Probably that's what making it confused?

I comment those lines out, and run the tool again:

```shell
$ sass-migrator division css/main.scss
Nothing to migrate!
```

Allright then! Putting those things back and running Jekyll:

```shell
$ bundle exec jekyll build
Configuration file: /Users/simon/code/blog.skagedal.tech/_config.yml
            Source: /Users/simon/code/blog.skagedal.tech
       Destination: /Users/simon/code/blog.skagedal.tech/_site
 Incremental build: disabled. Enable with --incremental
      Generating...
                    done in 0.104 seconds.
 Auto-regeneration: disabled. Use --watch to enable.
 $
```

Yay, victory! And site still looks fine. Kudos to these people for having a migrator tool and for telling me about it at the exact right place. 

So, the final step in my script is `rsync` which is uploading the generated site to `blog.skagedal.tech`, and I think that's a bit too noisy as well. Can we make it less verbose? How are we calling it now?

```shell
rsync \
    --archive \
    --compress \
    --progress \
    --delete \
    --verbose \
    _site/ \
    simon@skagedal.tech:blog
```

Oh... with the `--verbose` flag. I guess Past Simon wanted some verbosity. I mean it's always back and forth with these things, at one time you want details and at another you just want the overview. Right now I'm into the whole brevity thing, but maybe I should do Future Simon a favor and add a flag to the `deploy` script? That would be cute.

Here's what I ended up with for now:

```shell
#!/bin/bash

if [[ "$1" == "--verbose" ]]; then
    BUNDLE_INSTALL_ARG=""
    RSYNC_ARG="--verbose"
else
    BUNDLE_INSTALL_ARG="--quiet"
    RSYNC_ARG=""
fi

echo "💁 Installing Jekyll dependencies..."
bundle install $BUNDLE_INSTALL_ARG || exit 1

echo "💁 Generating site with Jekyll..."
bundle exec jekyll build || exit 1

echo "💁 Uploading..."
rsync \
    --archive \
    --compress \
    --delete \
    --info=progress2 \
    $RSYNC_ARG \
    _site/ \
    simon@skagedal.tech:blog

echo "💁 Done!"
```

The little emojis aren't just pretty, they help me separate the output that comes from me and the output that comes from other tools. 

_[Continue reading the next post](/posts/2023-02-09-testing-zola)_
