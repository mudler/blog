---
title: 'on Calamares, Docker and Sabayon'
date: 2015-08-10T04:29:00.000-07:00
draft: false
url: /2015/08/on-calamares-docker-and-sabayon.html
tags: 
- sabayon
- docker
- calamares
- installer
---

Since i became Sabayon developer, i started to work on customizing it and giving some love to the entropy packages.  
A lot as been done in those months, and you can see that picking up [a "-dev" image from our mirrors](http://na.mirror.garr.it/mirrors/sabayonlinux/iso/daily/).  
After giving to the entropy packages a fullfill of love (systemd was bumped, ati-drivers and nvidia-drivers as well to be in line with upstream, implemented iptables saving rules for systemd, ... ) then we decided that the time of Anaconda installer was finished.  
Anaconda was buggy and most of the users couldn't even install Sabayon also if, for now, we loose a lot of  nice features like **LUKS** support and **LVM **we chose to swap it with the new and shiny [Calamares](http://calamares.io/) .  
  

[![](http://2.bp.blogspot.com/-60fwITk4MNI/VciKWh9bpNI/AAAAAAAALNc/qJrU0t2cHRo/s320/sabayonandcalamares.png)](http://calamares.io/)

  
  
  
  
No, if you are like me you don't have to worry, **LUKS** and **LVM** support in Calamares are on their schedule, you just have to _wait_.  
  
Unfortunately, this means that we also had to ditch the text installer, wich was included in Anaconda, but if someone will miss it's presence, probably will be replaced by an _adhoc_ handmade bash script.  
  
As for now, Sabayon is available only on amd64 platforms, suited for a Desktop out-of-the-box environment, but we are moving towards to ship server and **_arm_** images: after a week of work we finally have Docker images (yay!) available on the [Sabayon public profile](https://hub.docker.com/r/sabayon/), but i'll spend few words on it on a later post - [if you don't know what Docker is check out this article](https://www.docker.com/whatisdocker).  
Docker images finally gives to Sabayon the server flavor that was missing there, now it's easier to ship your application on the clouds using Sabayon! [You can find the Github repository of the Docker images on my profile](https://github.com/mudler/docker-sabayon-base)