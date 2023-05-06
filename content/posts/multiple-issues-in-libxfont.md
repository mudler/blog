---
title: 'Multiple issues in libXfont'
date: 2014-05-15T02:49:00.000-07:00
draft: false
url: /2014/05/multiple-issues-in-libxfont.html
---

_  
These months are full of bugs to put hands on, there are multiple vulnerabilities (3) found in libXfont that trusts the font server protocol data, and not verifying that the values will not overflow or cause other damage._  
  
From the Alan Coopersmith announce:  
  
Ilja van Sprundel, a security researcher with IOActive, has discovered several issues in the way the libXfont library handles the responses it receives from xfs servers, and has worked with X.Org's security team to analyze, confirm, and fix these issues.  
  
Most of these issues stem from libXfont trusting the font server to send valid protocol data, and not verifying that the values will not overflow or cause other damage. This code is commonly called from the X server when an X Font Server is active in the font path, so may be running in a setuid-root process depending on the X server in use. Exploits of this path could be used by a local, authenticated user to attempt to raise privileges; or by a remote attacker who can control the font server to attempt to execute code with the privileges of the X server. (CVE-2014-0209 is the exception, as it does not involve communication with a font server)  
  
Read more [here](http://lists.freedesktop.org/archives/xorg/2014-May/056616.html)  
  
The three bugs actually doesn't have a real exploit in the wild.. so we can feel secure for now... but will be a matter of time! The remote attack needs the control of the font server, so shouldn't affect a lot of servers, but for the local priviledges escalation it's a cake :)