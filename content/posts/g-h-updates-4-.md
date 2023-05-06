---
title: 'G@H updates! (4)'
date: 2014-06-04T02:52:00.000-07:00
draft: false
url: /2014/06/gh-updates-4.html
---

This post is an update of the current status of the Google@Home project. Google@Home tries to bring domotic control in your home using Google Services for Speech Synthesis and Text-to-Speech. It is also planned a web interface to control the embedded nodes in the current environment. In this post i'll report also the work by the GSoC student so far  
  
  
  
During this period i haven't much time to code, due to my knee surgery, but that's the current status of the project:  
  
The GSoC student :  

*   ER scheme to port the current Mongo scheme into SQLite, with few modifications all was good so far
*   Created the modules using DBIxClass to reflect the SQLite schema
*   Looking ahead from the schedule, he started to code the RPC Server skeleton to avoid issues in the future (nice job, i'm very glad about that)

  
This is what i have done:  

*   Fixed the Google Synth api module to reflect the new api (well, that took a while..)
*   Created the [Relay plugin](https://github.com/IntelliHome/IntelliHome-Plugin-Relay), need some tests (this was a draft, that may eventually need some rework)
*   Added the driver attribute to the GPIOs schema
*   Started to develop the [Android application](https://github.com/IntelliHome/Google-at-Home-Remote-Controller) to issue voice command from the mobile device, needs the RPC integration when the parsing services (that interfaces the RPC to the Parser) will be ready
*   Fixed and cleaned up some code

  
If you wish to install and try you can just still follow [the quick start on the repository page](https://github.com/mudler/Google-at-Home#quick-start).