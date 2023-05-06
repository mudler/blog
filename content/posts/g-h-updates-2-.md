---
title: 'G@H updates! (2)'
date: 2014-04-04T02:30:00.000-07:00
draft: false
url: /2014/04/this-post-is-update-of-current-status.html
---

  
  
This post is an update of the current status of the Google@Home project. Google@Home tries to bring domotic control in your home using Google Services for Speech Synthesis and Text-to-Speech. It is also planned a web interface to control the embedded nodes in the current environment.  
  
  
During this week i focused on fixing bug and few structural enhancements  
  
This is a small summary of the changes:  

*   \[fix\] Plugin can be removed safetly
*   master now can load node configurations by their backends (e.g. Mongo)
*   a dump of an example of mongo db
*   added the model for the node
*   fixed [#1](https://github.com/mudler/Google-at-Home/issues/1)
*   tuned up SoX
*   started the prototyping of the listening agent that directly commands GPIO

  
If you wish to install and try you can just still follow [the quick start on the repository page](https://github.com/mudler/Google-at-Home#quick-start).