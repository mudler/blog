---
title: 'Sabayon: testers, testers, testers'
date: 2015-10-07T14:28:00.000-07:00
draft: false
url: /2015/10/sabayon-testers-testers-testers.html
tags: 
- sabayon
- torvalds
- updates
- linux
- server
- developers
- testers
- entropy
- ballmer
---

  
Sabayon, official call for testers (and well, developers are welcome too)  
  

[![](http://4.bp.blogspot.com/-aKxCHaqb3X4/VhTf8i951mI/AAAAAAAAMB0/1HrGxtWUY2Q/s320/keep-calm-and-test-develop.png)](http://4.bp.blogspot.com/-aKxCHaqb3X4/VhTf8i951mI/AAAAAAAAMB0/1HrGxtWUY2Q/s1600/keep-calm-and-test-develop.png)

  

  
  

Testers, come to us
-------------------

  

Probably most of you already have seen Ballmer in _show-mode_

  

  

  

  

Also if controversial, it was a quite funny commercial / raindance move, balls included. But i can say that he is wrong, **testers are as important as developers.**  
Consider helping Sabayon in a _different_ way: testing it.  
  
I am here, begging YOU for some help. The more the merrier! What we need are brave folks proud to be bleeding edge, ready to install all the latest updates, capable observers that carries on using their machine normally BUT taking notes on functionality, installation problems, and any other weirdness or lack thereof.  
Grab a freshly built image or enable our testing repositories, but more importantly:_ report back_ to our [bugzilla](https://bugs.sabayon.org/) or dropping by on our IRC channel (#sabayon on chat.freenode.net).  
  
_Please, when reporting, try to provide as much information as possible, for example, try to answering to those questions:_  
  
  

*   _What steps will reproduce the problem?_
*   _What is the expected output? What do you see instead?_
*   _What version of the product are you using? On what operating system?_

  

_And of course, any additional info that comes up to you._

  

  
we @[Sabayon](https://plus.google.com/115862676514799968405) are putting a lot of efforts to build the most awesome sexy lady among the other Linux Distributions.  
  
No more chatting, let's see what's the news for the upcoming release.  

Sabayon Server Edition
----------------------

[![](http://2.bp.blogspot.com/-03zD33U3QR8/VhTVE42n8SI/AAAAAAAAMBA/XLMXUKbYows/s320/sabayon-server.png)](http://2.bp.blogspot.com/-03zD33U3QR8/VhTVE42n8SI/AAAAAAAAMBA/XLMXUKbYows/s1600/sabayon-server.png)

Next release will ship back the Server edition, which is just perfect **also** for those who wants a not-X baked Sabayon version. The installer is still Calamares (just GUI install as for now), but running on a _adhoc_ instance of X, that bloats the ISO size, but after install, all the additional components requested by Calamares are removed.  
  
If you wants to put your hands on it before it's release date (28th of the current month), you can download it in our daily directory in one of our [mirrors](http://na.mirror.garr.it/mirrors/sabayonlinux/iso/daily/) , or directly following [that](http://na.mirror.garr.it/mirrors/sabayonlinux/iso/daily/Sabayon_Linux_DAILY_amd64_Server.iso) link. (be careful to download the image dated after 8th October)  
  
_Just a note:_ if you wonder how you have to set network configuration after install, we ship NetworkManager that provides _nmtui_ (the console frontend)  
  

Important packages coming up, and now in testing
------------------------------------------------

  

On the testing repositories now are available the following "critical" packages in testing:

*   Latest **4.2.3** kernel
*   AtiDrivers _**15.9**_(expanding supported cards)
*   Nvidia Drivers _**355.11**_
*   systemd _**226**_
*   VirtualBox _**5.0.6**_
*   Calamares _**1.1.4.1**_
*   Libreoffice **5.0.1.2**

If you encounter in any issue, please file a [bug here.](https://bugs.sabayon.org/) 

### Help us also enabling the testing repository

  

If you are wondering how to put your hands on the shiny new testing packages here it is a small how-to:

  

  

> equo repo disable sabayon-weekly

> equo repo enable sabayonlinux.org 

> equo repo enable sabayon-limbo

  

taken from the [wiki.](https://wiki.sabayon.org/index.php?title=En:Repositories#Adding_Repositories)  
  

_And as we work, meanwhile in the world..._
-------------------------------------------

  

[Meanwhile our "Sith Lord" Linus Torvalds is screaming among Kernel devs](https://lkml.org/lkml/2015/9/3/428), a fancy meme appeared on my G+, i couldn't resist to share it to you  
  

[![](http://4.bp.blogspot.com/-3Dwn6Qnb0-Y/VhTSmDHHUOI/AAAAAAAAMAw/ZVa0PI-MHxw/s320/CPnK1CQWoAEru50.jpg-large.jpeg)](http://4.bp.blogspot.com/-3Dwn6Qnb0-Y/VhTSmDHHUOI/AAAAAAAAMAw/ZVa0PI-MHxw/s1600/CPnK1CQWoAEru50.jpg-large.jpeg)

  
_by the way, I agree with his philosophy on that, people if wants REALLY learn things, most of the times needs to be beaten up a little bit, like your mom used to, and to be frank, it should be considered a honor to be yelled by Linus_  
Cheers