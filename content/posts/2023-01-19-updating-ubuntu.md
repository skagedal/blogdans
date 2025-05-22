---
layout: post
title:  Upgrading to Ubuntu 22.04
---

(Warning: this blog post is pretty boring.)

As I log in to my Ubuntu machine at `skagedal.tech` – where I host this blog and this little habit tracker I'm writing about – it tells me this:

```
New release '22.04.1 LTS' available.
Run 'do-release-upgrade' to upgrade to it.
```

I like upgrading things. Let's try that.

```
$ do-release-upgrade
Checking for a new Ubuntu release
Get:1 Upgrade tool signature [819 B]
Get:2 Upgrade tool [1,267 kB]
Fetched 1,267 kB in 0s (0 B/s)
authenticate 'jammy.tar.gz' against 'jammy.tar.gz.gpg'
extracting 'jammy.tar.gz'
[sudo] password for simon:
```

Jammy! Jammy Jellyfish! Gotta love the Ubuntu release names. Sure, you can have my password, Jammy Jellyfish. 

But then it says:

```
Reading cache

Checking package manager

Continue running under SSH?

This session appears to be running under ssh. It is not recommended
to perform a upgrade over ssh currently because in case of failure it
is harder to recover.

If you continue, an additional ssh daemon will be started at port
'1022'.
Do you want to continue?

Continue [yN]
```

Hmm. This gives me pause. I'd hate to screw up my system and not be able to access it to fix things. I find some advice on [this Ask Ubuntu page](https://askubuntu.com/questions/8884/whats-the-risk-of-upgrading-over-ssh), but I'm still kind of scared. I mean, there is no data... I think... on skagedal.tech that only lives there, so to speak – everything has, in some sense, a source in one of my Git repositories. But it would be a lot of work to set it up again, if things should go wrong. I do have some hacky scripts and documentation for some stuff, but not everything. It's definitely a [pet, not cattle](https://devops.stackexchange.com/questions/653/what-is-the-definition-of-cattle-not-pets). So far. I'd love to change that. 

What advice do Digital Ocean give themselves? I'm finding [this guide](https://www.digitalocean.com/community/tutorials/how-to-upgrade-to-ubuntu-22-04-jammy-jellyfish). They recommend as a best approach to set up a new installation from scratch. But for the same reason, this doesn't quite seem like an option.  But they also mention how to take a full snapshot of the droplet (as they call their virtual machines)! That seems like the thing to do. 

I do what they say [here](https://docs.digitalocean.com/products/images/snapshots/how-to/snapshot-droplets/) and shut down the system from command line. I can confirm from the Digital Ocean console that my droplet is powered down. Then I go to the Snapshot menu and start creating a snapshot that I call `skagedal.tech-before-upgrade-to-jammy`. 

Cool, now, apparently I have to wait for up to an hour. Ok, no. It's done, after like ten minutes. I don't have a lot of stuff. I boot it up again. I wait for it to be online again with `watch curl https://skagedal.tech`. Allright, we're online.

Now I log in again and run the `do-release-upgrade`. Now I just yolo and press continue. It tells me:

```
Starting additional sshd

To make recovery in case of failure easier, an additional sshd will
be started on port '1022'. If anything goes wrong with the running
ssh you can still connect to the additional one.
If you run a firewall, you may need to temporarily open this port. As
this is potentially dangerous it's not done automatically. You can
open the port with e.g.:
'iptables -I INPUT -p tcp --dport 1022 -j ACCEPT'

To continue please press [ENTER]
```

Hmm, I do have a firewall... I think... but whatever. Continuing yolo now that I have a snapshot. Ok, what's it saying now?

```
Third party sources disabled

Some third party entries in your sources.list were disabled. You can
re-enable them after the upgrade with the 'software-properties' tool
or your package manager.

To continue please press [ENTER]
```

Help me remember to do that. Probably the Temurin one, for one (if you remember, from hahabit tracker part one).

Ok, now it's fetching lots of stuff. Now it's doing lots of other stuff. Now it paused in a weird state:

```
5 packages are going to be removed. 115 new packages are going to be
installed. 743 packages are going to be upgraded.

You have to download a total of 760 M. This download will take about
2 minutes with your connection.

Installing the upgrade can take several hours. Once the download has
finished, the process cannot be canceled.

 Continue [yN]  Details [d]
Restoring original system state

Aborting
Reading package lists... Done
Building dependency tree
Reading state information... Done
=== Command terminated with exit status 1 (Thu Jan 19 19:49:39 2023) ===
```

I'm in some weird `screen` mode. I don't understand it. I can choose to either kill (`x`) or resurrect (`r`) the window. I choose resurrect. The upgrade starts again. Ok. Ok. What happens now. Now it got a bit further:

```
Do you want to start the upgrade?


5 packages are going to be removed. 115 new packages are going to be
installed. 743 packages are going to be upgraded.

You have to download a total of 760 M. This download will take about
2 minutes with a 40Mbit connection and about 20 minutes with a 5Mbit
connection.

Fetching and installing the upgrade can take several hours. Once the
download has finished, the process cannot be canceled.

 Continue [yN]  Details [d]
```

Yeah yeah yeah, just start the upgrade. Or, ok, let's see the details. Gotcha, you're gonna remove some things and add some things and upgrade some things. Cool cool. Cool.

Now it's fetching more lots of stuff. Now I get another question.

```
Configuring libc6

Running services and programs that are using NSS need to be restarted, otherwise they might not be able to do lookup or authentication any more. The
installation process is able to restart some services (such as ssh or telnetd), but other programs cannot be restarted automatically. One such 
program that needs manual stopping and restart after the glibc upgrade by yourself is xdm - because automatic restart might disconnect your active 
X11 sessions.                                                                                                                            
 
This script detected the following installed services which must be stopped before the upgrade: postgresql                               
 
If you want to interrupt the upgrade now and continue later, please answer No to the question below.                                    
Do you want to upgrade glibc now?
```

Sure, yes. X11, why is that even on my system...

Now it's saying that it failed to restart `mysql`. I don't care. I forgot I installed that. I don't use it. 

Now it's installing lots of stuff.

Suddenly I realize: maybe _at least_ I shouldn't be doing this over Wi-Fi. I'll be just sitting here perfectly still, Sweden's Master Chef again on the TV.

God, I should just do containers. Get an AWS account and do containers. 

Now it's asking me about the nginx configuration:

```
Configuration file '/etc/nginx/nginx.conf'
 ==> Modified (by you or by a script) since installation.
 ==> Package distributor has shipped an updated version.
   What would you like to do about it ?  Your options are:
    Y or I  : install the package maintainer's version
    N or O  : keep your currently-installed version
      D     : show the differences between the versions
      Z     : start a shell to examine the situation
 The default action is to keep your current version.
*** nginx.conf (Y/I/N/O/D/Z) [default=N] ?
```

I would like to keep my current version please. Pressing enter for default.

Now it's setting up lots of stuff.

Now it's asking me - this time in full-screen mode - what I want to do about `/etc/ssh/sshd_config`. Hmm, apparently I have changed some stuff, and then also the package maintainer has changed some stuff. I can view diff in various forms. I would muchly want to keep my version, but keep the diff somewhere for later reviewing. Can I do that somehow? I get the option to start a shell. Ok, after some reviewing, I'm keeping a copy of both my version and the proposed new version, and then after all I choose to take the new version from the package maintainer.  The last thing I want is for `ssh` to stop working. I'm not sure which option is less risky. This is exciting. I'm going with the package maintainer version.

Ok, what's happening now? Now this is interesting:

```
 Obsolete major version 12                                                                                                               
 
 The PostgreSQL version 12 is obsolete, but the server or client packages are still installed. Please install the latest packages (postgresql-14 and postgresql-client-14) and upgrade the existing  clusters with pg_upgradecluster (see manpage).                       
  
 Please be aware that the installation of postgresql-14 will automatically create a default cluster 14/main. If you want to upgrade the 12/main cluster, you need to remove the already existing 14 cluster (pg_dropcluster --stop 14 main, see manpage for details).          
  
The old server and client packages are no longer supported. After the existing clusters are upgraded, the postgresql-12 and postgresql-client-12  packages should be removed.                                                                                      

Please see /usr/share/doc/postgresql-common/README.Debian.gz for details.
```

Ok... I think that was just information. I will remember to do that. 

Now it's setting up more stuff.

Now it seems to have paused here:

```
/etc/kernel/postinst.d/zz-update-grub:
Sourcing file `/etc/default/grub'
Sourcing file `/etc/default/grub.d/50-cloudimg-settings.cfg'
Sourcing file `/etc/default/grub.d/init-select.cfg'
Generating grub configuration file ...
Found linux image: /boot/vmlinuz-5.15.0-58-generic
Found initrd image: /boot/initrd.img-5.15.0-58-generic
Found linux image: /boot/vmlinuz-5.4.0-137-generic
Found initrd image: /boot/initrd.img-5.4.0-137-generic
Found linux image: /boot/vmlinuz-5.4.0-126-generic
Found initrd image: /boot/initrd.img-5.4.0-126-generic
Warning: os-prober will not be executed to detect other bootable partitions.
Systems on them will not be added to the GRUB boot configuration.
Check GRUB_DISABLE_OS_PROBER documentation entry.
done
```

What's it doing?? Nothing has happened for... minutes... ssh session still seems to be alive, though? I need another snus. 

Should I press Ctrl-C?

I wish I was running this in a real `screen`. I should have followed the advice from that Ask Ubuntu thread. 

Come ooooon. Should I press Ctrl-C?

Can I open up a separate ssh session? No, I can not. Oh, yes I could! It says:

```
Welcome to Ubuntu 22.04.1 LTS (GNU/Linux 5.4.0-137-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

 System information disabled due to load higher than 1.0

  Get cloud support with Ubuntu Advantage Cloud Guest:
    http://www.ubuntu.com/business/services/cloud

510 updates can be applied immediately.
To see these additional updates run: apt list --upgradable


*** System restart required ***
Last login: Thu Jan 19 19:44:14 2023 from 82.196.111.135
```

Maybe it's really all done and just stuck? I will try Ctrl-C in the upgrade session.

That did nothing.

Oh, now it acted on the interrupt and said things like:

```
Traceback (most recent call last):
  File "/tmp/ubuntu-release-upgrader-aps9158x/DistUpgrade/DistUpgradeView.py", line 220, in run
    res = pm.do_install(self.writefd)
apt_pkg.Error: E:Problem executing scripts DPkg::Post-Invoke 'if [ -d /var/lib/update-notifier ]; then touch /var/lib/update-notifier/dpkg-run-stamp; fi; /usr/lib/update-notifier/update-motd-updates-available 2>/dev/null || true', E:Sub-process returned an error code

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/tmp/ubuntu-release-upgrader-aps9158x/jammy", line 8, in <module>
    sys.exit(main())
  File "/tmp/ubuntu-release-upgrader-aps9158x/DistUpgrade/DistUpgradeMain.py", line 241, in main
    if app.run():
  File "/tmp/ubuntu-release-upgrader-aps9158x/DistUpgrade/DistUpgradeController.py", line 2042, in run
    return self.fullUpgrade()
  File "/tmp/ubuntu-release-upgrader-aps9158x/DistUpgrade/DistUpgradeController.py", line 2006, in fullUpgrade
    if not self.doDistUpgrade():
  File "/tmp/ubuntu-release-upgrader-aps9158x/DistUpgrade/DistUpgradeController.py", line 1308, in doDistUpgrade
    res = self.cache.commit(fprogress,iprogress)
  File "/tmp/ubuntu-release-upgrader-aps9158x/DistUpgrade/DistUpgradeCache.py", line 309, in commit
    apt.Cache.commit(self, fprogress, iprogress)
  File "/usr/lib/python3/dist-packages/apt/cache.py", line 682, in commit
    self._depcache.init()
  File "/usr/lib/python3/dist-packages/apt/cache.py", line 628, in install_archives

  File "/tmp/ubuntu-release-upgrader-aps9158x/DistUpgrade/DistUpgradeView.py", line 220, in run
    res = pm.do_install(self.writefd)
KeyboardInterrupt
No pending crash reports. Try --help for more information.
No pending crash reports. Try --help for more information.
=== Command terminated with exit status 1 (Thu Jan 19 20:31:06 2023) ===
```

So we're in that weird `screen` state again where we can recover. Doing that. Now it's kind of running through the thing again. 

Remember the days when people would brag about their server uptime? Pets, not cattle. 

Yeah, now it just got stuck again after this:

```

Reading cache

Checking package manager
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
Hit http://archive.ubuntu.com/ubuntu jammy InRelease
Get:1 http://archive.ubuntu.com/ubuntu jammy-updates InRelease [114 kB]
Get:2 http://archive.ubuntu.com/ubuntu jammy-backports InRelease [99.8 kB]
Get:3 http://archive.ubuntu.com/ubuntu jammy-security InRelease [110 kB]
Get:4 http://archive.ubuntu.com/ubuntu jammy-updates/main amd64 Packages [831 kB]
Get:5 http://archive.ubuntu.com/ubuntu jammy-updates/universe amd64 Packages [786 kB]
Fetched 1,941 kB in 0s (0 B/s)
```

My other ssh session is still live. Should I just restart? Am I too impatient?

Yeah, nothing is happening here. Trying the resurrect thing once more. Oh, this time it came a bit further. It's saying:

```


No valid sources.list entry found

While scanning your repository information no entry about impish
could be found.

An upgrade might not succeed.

Do you want to continue anyway?

Continue [yN]
```

No, let's not. What is even impish.

So, aborted that, and now let's restart. `sudo reboot`. Will my server come alive again? `watch curl https://skagedal.tech`. Yay, there it is!

Allright, it's rebooted, and now when logging in it's just:

```
Welcome to Ubuntu 22.04.1 LTS (GNU/Linux 5.15.0-58-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Thu Jan 19 20:37:31 UTC 2023

  System load:  0.4833984375       Processes:             147
  Usage of /:   57.1% of 24.05GB   Users logged in:       1
  Memory usage: 79%                IPv4 address for ens3: 142.93.136.170
  Swap usage:   0%                 IPv4 address for ens3: 10.18.0.5

  Get cloud support with Ubuntu Advantage Cloud Guest:
    http://www.ubuntu.com/business/services/cloud

0 updates can be applied immediately.


Last login: Thu Jan 19 20:37:32 2023 from 82.196.111.135
```

So... I have successfully upgraded to 22.04, then? Yay! 

Maybe I should just immediately go ahead and upgrade to 22.10, which is also already released. The more frequently you upgrade, the less problems you have. Continuous integration. That's what I believe in. 

But now, I need to go to bed. 
