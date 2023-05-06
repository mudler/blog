---
title: 'Google at Home updates'
date: 2014-03-29T02:15:00.000-07:00
draft: false
url: /2014/03/google-at-home-updates.html
tags: 
- domotic
- perl
- google
- embedded
---

  
_  
This post is an update of the current status of the Google@Home project. Google@Home tries to bring domotic control in your home using Google Services for Speech Synthesis and Text-to-Speech. It is also planned a web interface to control the embedded nodes in the current environment.  
_  
  
  
For now it's still required to manually set-up the YAML file to configure which nodes belongs to the network, but if you set up some RaspberryPi on the network and a master node that has installed MongoDB the dispatchment of the commands and of the voice (so you can command everything by issuing commands on one node) works for now.  
  
  
During this week there weren't a lot of enhancements, i just focused on core structure, this is because i haven't so much time to work on it (some of my time was dedicated to the Nemesis project, a post will follow)  
  
  
This is a small summary of the current state of the project:

*   The MongoDB backend is ready for use 
*   Plugins now can be triggered by the MongoDB Parser to answer to an user command 
*   The Plugin system is divided so plugins can be developed as external repos 
*   Started the developement of the Wikipedia plugin, few adjustments are still necessary 
*   The Google TTS service had a limit of 100 chars, this was bypassed splitting the message output and joining the resulting mp3 (all done in a trasparent way) 
*   Created the Hailo plugin (just for fun) :) 

  
  
If you wish to install and try you can just still follow [the quick start on the repository page](https://github.com/mudler/Google-at-Home#quick-start).  
  
  
Note: If you want to install the master node on the RaspberryPi, for now only mongo is supported so refeer to that [tutorial](http://c-mobberley.com/wordpress/2013/10/14/raspberry-pi-mongodb-installation-the-working-guide/).