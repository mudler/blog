---
title: 'G@H updates! (3)'
date: 2014-05-11T02:36:00.000-07:00
draft: false
url: /2014/03/gh-updates-3.html
---

  
  
_This post is an update of the current status of the Google@Home project. Google@Home tries to bring domotic control in your home using Google Services for Speech Synthesis and Text-to-Speech. It is also planned a web interface to control the embedded nodes in the current environment._  
  
During this period i focused on fixing bugs, microphone settings and some structural restyling  
  
This is a small summary of the changes ( for a complete list, check commit diffs in github page) :  

*   \[structural enhancement\] Changed design, main process moved from script/\* to the Top module(for each type)
*   \[enhancement\] master and nodes start in background, give a -f as argument to mantain in foreground and provvisory -s to stop (will change soon to a normal start/stop)
*   \[fix\] Google synth api changes [Commit](https://github.com/mudler/Google-at-Home/commit/b2bbbdf0688560327344a61aef1aa122e9b4396c), switched to v2!
*   \[enhancement\] switched to pulseaudio+SoX for recording
*   \[enhancement\] Now microphone levels are adjusted automatically (you can disable this feature commenting out from nodes.yaml the mic\_upper\_threshold and mic\_lower\_threshold)
*   starting to work with my GSoC student to help him thru the code and defying a r scheme to follow for the SQLite porting.

  
If you wish to install and try you can just still follow [the quick start on the repository page](https://github.com/mudler/Google-at-Home#quick-start).