---
title: 'Tech Preview: Sabayon on RaspberryPi2 '
date: 2016-01-11T05:02:00.002-08:00
draft: false
url: /2016/01/tech-preview-sabayon-on-raspberrypi2.html
tags: 
- ARM
- sabayon
- linux
- Pi2
- Raspberry Pi2
- RaspberryPi2
- tech preview
---

As anticipated on Sabayon Linux site releases notes, that day was going to be close.  
**ARM** meet **Sabayon**, **Sabayon** meet **ARM**.  
  

[![](https://www.raspberrypi.org/wp-content/uploads/2015/01/Pi2ModB1GB_-comp.jpeg)](https://www.raspberrypi.org/wp-content/uploads/2015/01/Pi2ModB1GB_-comp.jpeg)

  
  
  
The approach to the ARM(hfp) support will be different from the previous attempt, we are not going to support  kernels for each different board we intend to build images, instead we will release cutted images with vendor-kernel to avoid incompatibilities and unexpected features. This is what almost every distribution does for tons of reasons, among them i want just to underline that in those years we have seen a lot of new ARM boards out of there and we can't just support all of them, mantain a kernel branch for each one would results low QA (since our dev-team is small) and probably in hard decision to be made when support will be dropped from vendors (think also on how short is a board lifespan, and how projects dies quickly). In that way, we can still provide support also for legacy devices as well.  
  
If someone intends to support the various kernels it's free to do it by forking the project or just creating a separate overlay with kernel ebuilds, there is no limitations at all, the Sabayon kernel eclass is ready to handle most of the task if you intend to dig in that deep ocean. If you want to help us to support other boards, head over [the GitHub repository](https://github.com/Sabayon/docker-armhfp) that contains the Docker bits to assemble the final images.  
  
To sum up: we will release board specific images, and generic images that will suit for most every board. The generic image won't always work out of the box, some of them need custom specific vendor bits (U-boot) to be in the right place, but we will document each board we can manage to put our hands on.  
  
Upgrading the kernel or playing with it will be entirely all up to you, we will provide of course a bunch of scripts to help that process.  
  
**Sabayon will support the ARM packages, built from Gentoo's portage, providing you a stable, rolling release rootfs with tons of tools you can install with Entropy. **  
Enough chitchat for now, let's get to the business, let me present you our Tech Preview of RaspberryPi2. (I consider this a Tech Preview because it is really barebone, doesn't include any helpers and because it is still in a early stage of development)  
  
The images will be soon available in all Sabayon mirrors, for now you can download it from the official TOP-IX italian mirror:  
  
[http://mirror.it.sabayon.org/testing/Sabayon\_Linux\_16\_armv7l\_Raspberry\_Pi2\_Base\_8GB.img.xz](http://mirror.it.sabayon.org/testing/Sabayon_Linux_16_armv7l_Raspberry_Pi2_Base_8GB.img.xz)  
[http://mirror.it.sabayon.org/testing/Sabayon\_Linux\_16\_armv7l\_Raspberry\_Pi2\_Base\_8GB.img.xz.md5](http://mirror.it.sabayon.org/testing/Sabayon_Linux_16_armv7l_Raspberry_Pi2_Base_8GB.img.xz.md5)  
  
you can however browse [our mirror list](https://www.sabayon.org/download), the image is in the _testing/_ folder.  
  
To write the image to the sdcard, you can do:  
  

> xzcat [Sabayon\_Linux\_16\_armv7l\_Raspberry\_Pi2\_Base\_8GB.img.xz](http://mirror.it.sabayon.org/testing/Sabayon_Linux_16_armv7l_Raspberry_Pi2_Base_8GB.img.xz) > /dev/mmcblk0

  
Where mmcblk0 can differ.  
The root password is: root. There is a default user "sabayon" with password "sabayon" that can use sudo out-of-the-box.  
The OS is set to automatically boot and start eth0 and sshd (so you can connect to it via ssh).  
I strongly reccomend also to do a _"equo up && equo u"_ after boot to get the latest packages.  
  
The System is already configured to allow serial login, and if you want put your hands on kodi (yeah, so you can do your HTPC for almost 30$ without pain) install it with equo:  
  

> equo up

> equo i kodi-raspberrypi

  
and then start it from the terminal(without X):  
  

> startkodi

  
We have already ~2000 packages in the ARMhfp repository, including Docker already cutted for ARM boards (yay!), XFCE, LXDE and bunch of packages you might find interesting. For package requests, head over [our bugzilla](https://bugs.sabayon.org/).  
  
There is also the handy _rpi-update_ script that helps you thru the kernel upgrade process, downloading automatically the latest _raspberrypi_ kernel from the Raspberrypi official repositories (the one that you can use in Raspbian as well).  
  
Please, report any issue you find.  
  
If you appreciate our efforts towards the ARM architecture, please consider to donate us either hardware or [MONEY](https://www.sabayon.org/donate) to buy it!  
  
Have fun!