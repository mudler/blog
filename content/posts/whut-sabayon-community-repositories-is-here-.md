---
title: 'Whut?! Sabayon Community Repositories is here!'
date: 2016-04-18T06:02:00.001-07:00
draft: false
url: /2016/04/whut-sabayon-community-repositories-is.html
tags: 
- Community Repositories
- sabayon
- updates
- linux
- gentoo
- entropy
- SCR
---

  
Hello users,  
  
  
Time passed when i first wrote the article "[\[Part 1\] Building Gentoo and Sabayon packages in your machine locally or remotely with Docker and Cloud Services](https://blog.mudler.pm/2015/11/part-1-building-gentoo-and-sabayon.html)" that was going to be divided into parts. But things changed amazingly fast and there is better news, I wrote up a suite of tools that makes the whole operation much easier, thanks also to [+Ben Roberts](https://plus.google.com/104283756158326784792) (optiz0r) who contributed in the development and he is also kindly sponsoring the buildserver.  
  
Some of you probably already heard about Sabayon Community Repositories (SCR) that we announced  in the developers mailing list some weeks ago, if not, keep reading. The SCR Build System is an improvement of the methodology explicated [before](https://blog.mudler.pm/2015/11/part-1-building-gentoo-and-sabayon.html), but with a lot of extras and automated features. This is how SCR is born.  
  
**TL;DR**  
Information and how-to use: [Wiki page](https://wiki.sabayon.org/index.php?title=En:Sabayon_Community_Repositories) (under construction)  
Search available packages: [SCR website](https://sabayon.github.io/community-website/)  
Packages requests: [Bugzilla section](https://bugs.sabayon.org/enter_bug.cgi?product=Community%20Repositories)  
Contributing/setup a local development environment: [How-to contribute](https://wiki.sabayon.org/index.php?title=HOWTO:_Contributing_to_SCR)  
Guidelines and Bylaws (for SCR Devs): [scr-docs Github repository](https://github.com/Sabayon/scr-docs)  
  
  
  

Sabayon Community Repositories
------------------------------

SCR is a collection of repositories available to Sabayon users, that could be enabled/removed from the system by using **enman** -- our layman equivalent -- this ensures not only that a user can easily revert his mistakes ( SCR content **is not** as stable as main repos, and we put a lot of warnings in the website for this reason) but also that it's easier and faster than ever now having bleeding edge packages that are not in the official channels.  
Users can search packages in the [SCR website](https://sabayon.github.io/community-website/), that will display information on how to install them.  

  

More information on how to use SCR is available in the [wiki page](https://wiki.sabayon.org/index.php?title=En:Sabayon_Community_Repositories) (under construction). Meanwhile we are currently working on the project documentation: [Guidelines](https://github.com/Sabayon/scr-docs/blob/master/scr-guidelines.md) and [Bylaws](https://github.com/Sabayon/scr-docs/blob/master/scr-bylaws.md) can be found on the [scr-docs Github repository](https://github.com/Sabayon/scr-docs).  
  

Usage
-----

Open a terminal and run the following as root!

  

**1)** Disable weekly repositories and enable current:

  

```
sudo mv /etc/entropy/repositories.conf.d/entropy\_sabayonlinux.org{.example,}
``````
equo repo disable sabayon-weekly
``````
equo repo enable sabayonlinux.org
```

  

**2)** Update/upgrade your machine

  

```
 equo up && sudo equo u
```

  

**3)** Install **enman**:

  

```
 equo i enman 
```

  

We are now ready to use SCR!  
  
  
  
**4)** Enable the community repository:  

  
```
 enman add community 
```  
Update just the community repository database:  
```
 equo up community
```  
Now we can search as usual packages with "equo search" or, you can list the repository content with "equo query":  
```
 equo q list available community 
```  

Special Purpose Repositories
----------------------------

These repositories contain packages to satisfy a particular purpose and that are not suitable for inclusion in the "community" repository. These should be enabled with care, and only if you need the specific functionality they provide.  
  
Example special purpose repositories:  

*   "**devel**": Contains live versions of core Sabayon packages, and can be used to develop future Sabayon improvements against upstream projects, such as the Calamares installer, or the Linux Kernel.
*   "**gaming-live**": Contains bleeding edge graphics drivers which may add new features or hardware support but may contain bugs or cause crashes.
*   "**kde-unstable**": Contains the very latest KDE packages, which haven't gone through the same level of QA as you would find for KDE versions made available via Entropy. 
*   "**pentesting**": Contains various pentesting packages 

Development and Contributing
----------------------------

From a developer point of view, - feel free to skip that if you don't need to build your packages - the approach is more easier:  [we are using building specifications files that describes what the repository should contain](https://github.com/Sabayon/community-repositories) (and how to make that possible). The awesome side of this is that the entire infrastructure and the repository as well are replicable everytime. [In our wiki there is a page regarding on how to setup the infrastructure](https://wiki.sabayon.org/index.php?title=HOWTO:_Contributing_to_SCR) (the same we use on the Build Server) in your local machine, enabling you to locally-build repositories without having to care about setting up a chroot! just put in a configuration file the relevants bits and you are done!  
  

Package requests
----------------

If you don't mind on how all of this works, but you want a package to be added in the SCR repositories, feel free to open a bug request [in the specific section of our Bugzilla](https://bugs.sabayon.org/enter_bug.cgi?product=Community%20Repositories): be sure to specify if the ebuild is available in layman if you want it to get done faster.

  

Donations
---------

As you can see we are always busy to give you the Sabayon experience, but we really need your help now!  [Consider donating](https://www.sabayon.org/donate)!

[![](https://s-media-cache-ak0.pinimg.com/736x/72/e7/ff/72e7ff6ac7754f87122535431284090a.jpg)](https://s-media-cache-ak0.pinimg.com/736x/72/e7/ff/72e7ff6ac7754f87122535431284090a.jpg)

We don't use funds to buy alcohol, also if we'd love to (remember Windows ME?). We need YOU to keep our systems operative and running!

Cheers!