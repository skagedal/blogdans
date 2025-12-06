---
layout: post
title: "Run script permissions in pnpm"
summary: 'In which I investigate "ignored build scripts" warnings in pnpm, and suggest strategies for dealing with them.'
draft: true
---

If you are using the `pnpm` package manager for Node.js projects, chances are that you have seen a warning about "ignored build scripts" when you run `pnpm install`, or other commands that installs packages, such as `pnpm add`. What do these warnings mean? And how are you supposed to act on them? 

Dealing with these can require digging down in implementation details of things you wish would just work. In this post, I'll do some digging and present some strategies. 

## The problem

Let's say I want to sell fruit on the Internet. I have implemented a web store as a full-stack Node.js service, using React for the UI parts. On the server side, I'm storing my fruit catalog, my customers and their orders in a PostgreSQL database. 

I would like to write some nice automated tests that reassure me that this server-side functionality is working correctly, so people get the fruits they have ordered. I will add my favorite testing framework, `vitest`, and `testcontainers`, the library that lets you easliy run dependencies such as PostgreSQL for tests:

```shell
❯ pnpm add vitest testcontainers @testcontainers/postgresql
Packages: +197
++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved 243, reused 188, downloaded 9, added 197, done

dependencies:
+ @testcontainers/postgresql 11.8.1
+ testcontainers 11.8.1
+ vitest 4.0.14

╭ Warning ───────────────────────────────────────────────────────────────────────────────────╮
│                                                                                            │
│   Ignored build scripts: cpu-features, esbuild, protobufjs, ssh2.                          │
│   Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.   │
│                                                                                            │
╰────────────────────────────────────────────────────────────────────────────────────────────╯

Done in 1.7s using pnpm v10.23.0
```

What's this warnign about? What are these things? cpu-features? esbuild? protobufj? ssh2? I just want to write some tests for my fruit store! 

Running the command mentioned in the message (`pnpm approve-builds`) does indeed give you the opportunity to interactively select which of these dependencies should be allowed to run scripts, and which should not.

But it doesn't give me much guidance as to what choice to make here, what trade-offs are involved. Why would I want to build these packages? Why would I _not_ want to build them?

If you were using good old' `npm` instead, you wouldn't get this warning. Instead, these "run scripts" would just be run, without question. So what are these run scripts, and why does `pnpm` by default ignore them? 

## Lifecycle scripts in npm packages

You might have used package.json run scripts before. They're the scripts that you can put in a `scripts` section in your `package.json`. For example, let's add this maintenance action to our `package.json`:

```json
{ 
  "scripts": {
    "fruit-inventory": "say yes, we have no bananas"
  }
}
```

We can then run `pnpm run fruit-inventory` and hear loud and clear (provided that our machine has a `say` command, such as is the case on macOS machines) that we have no bananas.

But all such scripts are not created equal. Some of them, so called [life cycle scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts#life-cycle-operation-order), have special meaning. When packages are installed as dependencies by `npm`, their life cycle scripts are run at certain points during the installation.

To test how this works, let's create our own little dependency. Let's say it's a separate package that manages our inventory. We don't have to publish it anywhere, we can just create a directory `/tmp/fruit-inventory` and put a `package.json` looking like this in there:

```json
{
  "name": "fruit-inventory",
  "scripts": {
    "install": "say we have-a no bananas today"
  }
}
```

Back in our fruit store, let's add this dependency:

```shell
❯ pnpm add file://tmp/fruit-inventory
Packages: +1
+
Progress: resolved 244, reused 198, downloaded 0, added 1, done

dependencies:
+ fruit-inventory file:../../../../../tmp/fruit-inventory

╭ Warning ───────────────────────────────────────────────────────────────────────────────────╮
│                                                                                            │
│   Ignored build scripts: fruit-inventory.                                                  │
│   Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.   │
│                                                                                            │
╰────────────────────────────────────────────────────────────────────────────────────────────╯

Done in 496ms using pnpm v10.23.0
```

So there's that warning. Now we can run `pnpm approve-builds`, and as we approve the `fruit-inventory` to be built (the terminology here is a bit all over the place), it immediately does so and we get to hear that friendly macOS voice quoting [a Greek fruit stand owner from the 1920s](https://en.wikipedia.org/wiki/Yes!_We_Have_No_Bananas). 

So, what is the purpose of these scripts? Some packages aren't ready for use after the package manager having just fetched their contents from the NPM registry. Something needs to happen on the build machine as well – typically, I think, to build some natively executable code. 

## Supply chain security

Well, that sounds useful! Why would pnpm stop that from happening?

They do this to [mitigate supply chain attacks](https://pnpm.io/supply-chain-security). Sometimes[^shai] the credentials of `npm` package authors get compromised by bad people, who will then be able to execute arbitrary code on machines that install these packages. There have apparently been several examples of attackers using the `postinstall` lifecycle hook for this. 

Of course, even without this life cycle scripting stuff, we could be in trouble after installing some compromised dependencies. Let's say, for example, that this `cpu-features` package that my fruit store ends up installing, is compromised. The moment we actually _use_ that functionality, calling into the API exposed by that library, we could be in trouble. 

Chances are, however, that a lot of these little npm packages that get transitively installed in your typical Node.js project, never end up actually being called upon, or only do so in some very specific situations. Putting the evil code inside these life cycle script that run on every machine that just happens to _install_ the package thus increases the blast radius considerably. 

So I think `pnpm` is doing the right thing here. Still, it leaves the developer in a tricky situation. Getting back to the fruit store development team, what should they do? How will they know whether we actually need to fully build these particular dependencies? Will we be able to test our fruit store functionality?

## Let's try it

I mean, yeah, let's just try it. That's probably the best answer. Let's see if we can write a minimal test with `vitest` and `testcontainers`. Let's just put this in `fruit-store.test.mjs` to begin with:

```javascript
import { test, expect } from "vitest";

test("true is true", () => {
  expect(true).toBe(true);
});
```

We can run it with `pnpm exec vitest run`, and indeed, it works fine. Let's add some testcontainers stuff. We'll add a client library:

```shell
pnpm add pg
```

And then let's just write a simple test that confirms we can execute SQL queries in a PostgreSQL container:

```javascript
import { test, expect } from "vitest";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Client } from "pg";

test("we can run some postgres", async () => {
  const container = await new PostgreSqlContainer("postgres:16-alpine").start();
  const client = new Client(container.getConnectionUri());

  await client.connect();
  const result = await client.query("SELECT version() AS result");
  await client.end();

  expect(result.rows[0].result).toContain("PostgreSQL 16");
}, 30000);
```

Worked fine! 

So, at this point, I think it would probably be pretty decent pragmatic advice to just go like "ok, apparently these things – `cpu-features` and whatnot – aren't needed for the functionality that we want out of `vitest` and `testcontainers`" and add them to the `ignoredBuiltDependencies`. 

You can do this by running `pnpm approve-builds` after getting that warning, selecting nothing and pressing enter – it will set up your `pnpm-workspace.yaml` to look like this:

```yaml
ignoredBuiltDependencies:
  - cpu-features
  - esbuild
  - protobufjs
  - ssh2
```

Then will never be bothered by the run scripts of these libraries again!

## Digging deeper

Or _will_ we? I'm not 100% happy! I'm very bad at being pragmatic about these things. There's a gnawing feeling that tells me that some day, we'll try to make use of some feature of testcontainers or vitest and it will just fail. "Why doesn't this thing just wooork", we will complain, "we're doing just like it says in the manual!" But unbeknownst to that future us, current us is to blame for just going in and removing a thing we didn't fully understand – school book example of [Chesterton's Fence](https://thoughtbot.com/blog/chestertons-fence), no?

It wouldn't suck to do at least a little investigation. Let's take a look at `cpu-features`.

Using `pnpm view cpu-features` we can get an overview of what the library does – it is "a simple binding to Google's cpu_features library for obtaining information about installed CPU(s)"; Github [here](https://github.com/mscdex/cpu-features#readme). But what's it doing in my node_modules?

The `pnpm why` command is useful for finding that out. With `pnpm why cpu-features`, we get a tree that looks like this (slightly simplified):

```text
testcontainers 11.8.1
├─┬ dockerode 4.0.9
│ └─┬ docker-modem 5.0.6
│   └─┬ ssh2 1.17.0
│     └── cpu-features 0.0.10
└─┬ ssh-remote-port-forward 1.0.4
  └─┬ ssh2 1.17.0
    └── cpu-features 0.0.10
```

So `cpu-features` is there because `ssh2` might need it, and `ssh2` is there because testcontainers, through two other dependencies, wants it somehow. But what _is_ it, and what are  the build scripts that it wants to execute?

That's something I wish `pnpm` would help me out with a bit more. But with a little digging, I can find the `package.json` of `cpu-features` installed at `node_modules/.pnpm/cpu-features@0.0.10/node_modules/cpu-features/package.json`.

Indeed, this module needs to build some native code (using [node-gyp](https://github.com/nodejs/node-gyp/blob/main/README.md) and also [buildcheck](https://www.npmjs.com/package/buildcheck) to find out a few things about the build environment) – Google's cpu_features library. 

And [ssh2](https://www.npmjs.com/package/ssh2) wants this as an "optional package dependency" – it "will be automatically built and used if possible", and this addon "is currently used to help generate an optimal default cipher list". I think we can sleep happily with `cpu-features` being disabled; worst case, a suboptimal cipher suite will be used when testcontainers is for some reason or another opening up some ssh connections. But why and when is it doing that?

Sometimes when you start digging, it's hard to stop. But I have other things to do. What it looks to me, though, is that this stuff would be required if you were connecting to the Docker server through TCP with TLS; also known as a ssh connection. In my case, both on my local development machine (using OrbStack) and on the CI, it just connects to the Docker server using a Unix socket. So this will not be a problem.

So what about `protobufjs` and `esbuild`? At this point in my investigation I turned to Claude. In both of these cases, it seems that neither of them _need_ to perform their build step. In the case of `esbuild` – which is a dependency of `vitest`[^bundlers] – it will download prebuilt binaries for your platform if possible. In the case of `protobufjs`, it seems to fall back to a pure JavaScript implementation if the native code build fails. And as a dependency of `testcontainers` it seems it is only used for some optional functionality around gRPC communication with Testcontainers' own Testcontainers Cloud service, which I'm not using.

I'm guessing that it is somewhat common for run scripts like these to not be strictly needed, like in these two cases, even if the functionality of those packages are in the end needed to build or test your fruit store. I was curious to know if it was indeed the case for all of these four packages. I did a brief little test for `cpu-features`. I created an empty directory and typed:

```shell
pnpm add cpu-features
```

This creates a `package.json` with the latest version of `cpu-features` as a dependency, installs it, and prints the warning about not running the build scripts. This module has a very simple API - it just exports a default function which returns an object with CPU feature information. So this one-liner should do:

```shell
node -p "require('cpu-features')()"
```

But it fails:

```text
node:internal/modules/cjs/loader:1423
  throw err;
  ^

Error: Cannot find module '../build/Release/cpufeatures.node'
Require stack:
- /Users/simon/tmp/cpu-features/node_modules/.pnpm/cpu-features@0.0.10/node_modules/cpu-features/lib/index.js
- /Users/simon/tmp/cpu-features/[eval]
    at Module._resolveFilename (node:internal/modules/cjs/loader:1420:15)
    at defaultResolveImpl (node:internal/modules/cjs/loader:1058:19)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1063:22)
    at Module._load (node:internal/modules/cjs/loader:1226:37)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:245:24)
    at Module.require (node:internal/modules/cjs/loader:1503:12)
    at require (node:internal/modules/helpers:152:16)
    at Object.<anonymous> (/Users/simon/tmp/cpu-features/node_modules/.pnpm/cpu-features@0.0.10/node_modules/cpu-features/lib/index.js:3:17)
    at Module._compile (node:internal/modules/cjs/loader:1760:14) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    '/Users/simon/tmp/cpu-features/node_modules/.pnpm/cpu-features@0.0.10/node_modules/cpu-features/lib/index.js',
    '/Users/simon/tmp/cpu-features/[eval]'
  ]
}

Node.js v25.2.1
```

"Cannot find module '../build/Release/cpufeatures.node'" – sounds exactly like what we would expect if the build step hadn't been run. Let's approve the build step:

```shell
❯ pnpm approve-builds
✔ Choose which packages to build (Press <space> to select, <a> to toggle all, <i> to invert selection) · cpu-features

✔ The next packages will now be built: cpu-features.
Do you approve? (y/N) · true
node_modules/.pnpm/cpu-features@0.0.10/node_modules/cpu-features: Running install script, done in 3s
```

That was me selecting `cpu-features` and then typing 'y' to approve. And now, let's try again:

```shell
❯ node -p "require('cpu-features')()"
{
  arch: 'aarch64',
  implementer: 16777228,
  variant: 2,
  part: -634136515,
  revision: 4,
  flags: {
    fp: true,
    aes: true,
    pmull: true,
    sha1: true,
    crc32: true,
    atomics: true,
    fphp: true,
    jscvt: true,
    fcma: true,
    lrcpc: true,
    sha3: true,
    sha512: true,
    asimdfhm: true,
    ssbs: true,
    sb: true,
    i8mm: true,
    bf16: true,
    bti: true,
    ecv: true
  }
}
```

See, now it works, and returns some interesting CPU information. This little exercise was here just to confirm that, yeah, sometimes these scripts do necessary things. You're welcome.

## Strategies to take

Okay, enough exploration. 

What should you, the developer of the fruit store, do when you see these warnings about ignored build scripts? Here are some possible strategies:

### 1. Turn the damn thing off.

Make `pnpm` behave like `npm` and `yarn`, and just run all build scripts without question. All your dependencies will work the way the authors intended them to. But you might be opening up yourself and others to supply chain attacks.

(TODO: how to turn off. discuss alternatives.)

### 2. Approve after cursory investigation.

If you're generally leaning towards option 1 (screw supply chain security, just make sure things work), it may be a better option to explicitly allow the dependencies to run their build scripts, after a brief investigation. You don't have to as deep as I did here, it can be just like "allright, `cpu-features` is a package that hasn't been updated recently, looks legit, it probably needs to build towards native code, let's approve it". 

The benefit of that over option 1 is that if one day the `leftpad` package somewhere deep down in your dependency tree gets compromised and tries to run some evil code during installation, you will not be affected, and you might smell something fishy when `pnpm` warns you. 

### 3. Default to deny

Just deny all the things unless you find out that you actually need them. 

This may affect your build performance negatively. Maybe some part of your build is using the `protobufjs` thing above, and instead of the fast native code path, it falls back to a slower JavaScript implementation. Maybe some cipher suites are not optimal because `cpu-features` wasn't built. 

Or maybe it will affect your build performance postively! If `cpu-features` isn't used at all, you save the time it would take to build it.

### 4. Do nothing

Just let `pnpm` keep ignoring these build scripts, and let it keep printing warnings about ignoring them. Not such a bad strategy – if some day a developer on the team gets stuck with an error because something something cpu-features, that developer may go like "aha! that thing that keeps being warned about must be the problem, let's approve it".

But warnings in builds tend to build up over time, masking more important warnings that you should be paying attention to. 

## Conclusion

I'd probably do something between strategy 2 and 3. You do you. 

## Footnotes

`npm` has some oddities. Let's say you have a run script called `pretty`, maybe to format your source code files, and a script called `tty`, maybe to start a shell to somewhere, or whatever. Run `npm run tty`. It will run the "pre"-tty script as well. Pretty unexpected. `pnpm` has wisely not inherited this behavior (only for specified lifecycle scripts)

[^shai]: In november 2025, the worm "Sha1-Hulud: The Second Coming" was discovered by Gitlab. I find this stuff rather fascinating, read more about it in [this blog post](https://about.gitlab.com/blog/gitlab-discovers-widespread-npm-supply-chain-attack/).

[^bundlers]: The number of bundlers and build tools in the JavaScript ecosystem is a bit overwhelming. In the software that runs this blog, I am running Next.js for the service and vitest for tests. Next.js uses `turbopack` and, I think, `webpack` in some situations.  `vitest` is built on `vite` which uses `rollup` and, apparently, also `esbuild` for some things. Then there's `parcel` and `rspack` and I don't even know. 