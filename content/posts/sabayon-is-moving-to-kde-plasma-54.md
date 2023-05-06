---
title: 'Sabayon is moving to KDE Plasma 5.4'
date: 2015-09-12T10:36:00.002-07:00
draft: false
url: /2015/09/sabayon-is-moving-to-kde-plasma-54.html
tags: 
- sabayon
- updates
- equo
- gentoo
- plasma5
- plasma
- portage
- entropy
- kde
---

[![](http://3.bp.blogspot.com/-jRJmCVvyYJ4/Vebu_7a86OI/AAAAAAAALnE/d8DCNFt13_w/s320/plasma_sab.png)](http://3.bp.blogspot.com/-jRJmCVvyYJ4/Vebu_7a86OI/AAAAAAAALnE/d8DCNFt13_w/s1600/plasma_sab.png)

Sabayon is officially moving to Plasma 5, **please read if you are a KDE Sabayon user.**

**KDM is going to be removed! migrate to SDDM now!**

  
Yes, finally we are moving on.  
  
While KDE 4 was a pretty stable DM, Plasma 5 brings awesomeness and, if you didn't noticed, it's the future.  
  

From KDM to SDDM
----------------

We tried to do our best to make the transition as smooth as possible and automatic, but if your system just got broken here is why: the KDE team announced SDDM as the default KDE display manager.

  

However to prevent annoyance we advice people that currently use KDM to replace that with SDDM (Simple Desktop Display Manager).  
  
**KDM is going to be removed!**  
  
Changing from KDM to SDDM is very straight forward.  

1.  Open a root shell
2.  equo install x11-misc/sddm x11-themes/sabayon-artwork-sddm-default
3.  systemctl disable kdm; systemctl enable sddm﻿

  
Oh yes, and the future KDE spins (Sabayon 15.10) will be automatically shipped with Plasma5!

>