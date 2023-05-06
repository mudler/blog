---
title: 'Updates: Rpi2 joins to testing boards, Mate testing repository, Sabayon devkit'
date: 2016-02-07T10:22:00.003-08:00
draft: false
url: /2016/02/updates-rpi2-joins-to-testing-boards.html
tags: 
- ARM
- sabayon
- testers
- Raspberry
---

Updates, TMiD (This Month in the Dev world)  
  

[![](http://the9gag.com/images/pictuers/thumb/eat_sleep_code_repeat.jpg)](http://the9gag.com/images/pictuers/thumb/eat_sleep_code_repeat.jpg)

  
  
Something landed here! Thanks to [+Ben Roberts](https://plus.google.com/104283756158326784792) for the donation!  
  
  
  
  

 ARM
----

[![](https://4.bp.blogspot.com/-2-6OxD55XIw/VreGFqrZAGI/AAAAAAAAOTg/QsV25IFm1dA/s320/photo_2016-02-07_18-59-21.jpg)](https://4.bp.blogspot.com/-2-6OxD55XIw/VreGFqrZAGI/AAAAAAAAOTg/QsV25IFm1dA/s1600/photo_2016-02-07_18-59-21.jpg)  
  
Marsala, the board that [+Ben Roberts](https://plus.google.com/104283756158326784792) was so kind to donate has just landed here, and i'm very happy about it, because that means that i can test against the board again myself.  
  
I'm glad also to announce that the ROS framework and some other goodies(among of them firefox and libreoffice) have been pushed into our ARM repo.  
  

Devkit
------

Meanwhile in parallel i'm also working on the Sabayon Devkit. It will contain tools that will be helpful to repository creation, management and so on, it will also hold together the common pieces that i use and see in the infra scripts.  
  
I'll blog about it later, but as for now i wrote a [small howto-readme in the github repository.](https://github.com/Sabayon/devkit)  
  
With the devkit i realized a small repository for testing Mate 1.10.2, if you want to help enable it and give us how much feedback as you can, because soon the upgrade will just happen:  
  

Mate in testing
---------------

in **/etc/entropy/repositories.conf.d** createthe file **entropy\_mate** with the following content:  
  

> \[mate\]  
> desc = Mate testing Sabayon repository  
> repo=http://mirror1.mirror.garr.it/mirrors/spike/mate/#bz2  
> enabled = true  
> pkg = http://mirror1.mirror.garr.it/mirrors/spike/mate/

  

Website
-------

New website is in development, stay tuned for updates  
  
  
  
Cheers and thank you for your support!