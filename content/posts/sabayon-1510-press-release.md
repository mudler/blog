---
title: 'Sabayon 15.10 press release'
date: 2015-09-28T11:07:00.000-07:00
draft: false
url: /2015/09/sabayon-1510-press-release.html
tags: 
- sabayon
- docker
- updates
- plasma5
- calamares
- entropy
- press release
- kde
---

[![](http://3.bp.blogspot.com/-AbWz1Wk7__U/Vgl_vSomVNI/AAAAAAAAL4I/rdcLxP0vxOE/s400/mars-sabayon.jpg)](http://3.bp.blogspot.com/-AbWz1Wk7__U/Vgl_vSomVNI/AAAAAAAAL4I/rdcLxP0vxOE/s1600/mars-sabayon.jpg)

_Image: an ancient hen-foot print found on Mars (Mars Photo credit to NASA)_

  

Sabayon **15.10** is a modern and easy to use Linux distribution based on Gentoo, following an extreme, yet reliable, rolling release model.

This is a monthly release generated, tested and published to mirrors by our build servers containing the latest and greatest collection of software available in the Entropy repositories.

The ChangeLog files related to this release are available [on our mirrors.](http://dl.sabayon.org/iso/ChangeLogs/)

The list of packages included in each Sabayon flavor is available inside\*.pkglist" files. Our team is always busy packaging the latest and greatest stuff. If you want to have a look at what's inside our repositories, just go to our [packages website.](https://packages.sabayon.org/)

Please read on to know where to find the images and their torrent files on our mirrors.

  
  

Long life to new and shiny Calamares!
-------------------------------------

As already pre-announced we switched the default installer. Anaconda served us well, but we decided to embrace the community-baked Calamares, the Distribution-independent installer! If you don't know it, checkout their [website](http://calamares.io/). Also if it is young and some features are missing, it is lighter and bug-less wrt our old installer.  
  

Plasma 5
--------

[![](http://3.bp.blogspot.com/-jRJmCVvyYJ4/Vebu_7a86OI/AAAAAAAALnE/d8DCNFt13_w/s320/plasma_sab.png)](http://3.bp.blogspot.com/-jRJmCVvyYJ4/Vebu_7a86OI/AAAAAAAALnE/d8DCNFt13_w/s1600/plasma_sab.png)

  

  

KDE releases now ships by default the new Plasma 5. Yes, you heard it well! 

  

[![](http://4.bp.blogspot.com/-uUgqmkSUMKI/Vgl7IC832fI/AAAAAAAAL4A/MRewReUozJM/s400/saba15.10.png)](http://4.bp.blogspot.com/-uUgqmkSUMKI/Vgl7IC832fI/AAAAAAAAL4A/MRewReUozJM/s1600/saba15.10.png)

Sabayon 15.10 KDE spin

Steam Big Picture and MCE mode gone ( for now )
-----------------------------------------------

Since we had to put much effort in making a working release with Calamares and along with other new packages, we had to ditch Steam Big Picture mode and Media Center installation options. Yeah, we are sorry about that: but this is just a sad story that we hope to fix soon.  
  

Docker
------

We now offer official docker releases as well. You can find them in our [official docker profile.](https://hub.docker.com/r/sabayon)

There also is a [Docker image](https://hub.docker.com/r/sabayon/builder-amd64/) available to build Sabayon packages as well, without the need to have all the tools required in your existing machine.  
  

Future plans
------------

You know that our habits are a bit evil-ish. We have a lot of stuff in the pipeline, just to spoiler a bit: you soon again should see a Sabayon Server Edition and hopefully also an ARM release.  
  

Available releases
------------------

As for now we offer 64bit images only.

But you are free to choose between the wonderful minimalism of GNOME, the eyecandy of KDE or the old fart called Xfce. If you are the kind of person who just needs Fluxbox/Openbox/whatever else, just get the Minimal image and you won't be hit by the "OMG candies" bloat that is in the other images.

  

Binary vs Source Package Manager
--------------------------------

It's up to you whether turn a newly Sabayon installation into a geeky Gentoo ~arch system or just camp on the lazy side and enjoy the power of our binary, dumbed down Applications Manager (a.k.a. Rigo). With Sabayon you are really in control of your system the way you really want. [Read the wiki page if you plan mixing the two package managers.](https://wiki.sabayon.org/index.php?title=HOWTO:_Safely_mix_Entropy_and_Portage)

  

Native NVIDIA and AMD GPU drivers support
-----------------------------------------

All our releases natively support the latest and greatest GPU hardware from NVIDIA and AMD through their proprietary drivers. Whether you want to enjoy your Linux rig for gaming or video playback, you can. For AMD hardware though, we default to the Open Source implementation for the supported cards. Make sure to pass "nomodeset" to the boot command line to force the proprietary drivers to be used instead: [head over the wiki for more details.](https://wiki.sabayon.org/index.php?title=HOWTO:_Get_AMD/ATI_or_Nvidia_Video_Cards_working_in_Sabayon#AMD_-_Open_Source_to_FGLRX)

  

LTSI Linux Kernels, 3.10, 3.12 offered
--------------------------------------

We are now tracking the 3.10, 3.12, 3.14 Long Term Stable Linux kernels, offering (almost) same-day updates to them. If you are using Sabayon in a server environment, you surely welcome this. However, if you're using Sabayon on your laptop, desktop workstation, switching between kernels or just moving to a new version has become a no-brainer operation through Rigo: just go to the preferences menu, select the kernel menu (LTS and regular kernels are listed in separate menus), pick a kernel and click "Install". Rigo will take care of updating external modules in a reliable and safe way on your behalf.

  

**Links**
---------

*   [Sabayon Mirrors Page](http://www.sabayon.org/download)
*   [Sabayon on Docker Hub](https://hub.docker.com/r/sabayon)
*   [Sabayon Monthly Images Download Page](http://dl.sabayon.org/iso/monthly/main.html)
*   [Sabayon BitTorrent Tracker](http://torrents.sabayon.org/)
*   [Join us on Facebook](https://www.facebook.com/groups/36125411841)
*   [Join us on Google+](https://plus.google.com/+sabayon)
*   [Donate to Sabayon!](http://www.sabayon.org/donate)