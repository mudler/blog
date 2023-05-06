---
title: 'G@H updates! (5)'
date: 2014-06-16T02:55:00.000-07:00
draft: false
url: /2015/08/gh-updates-5.html
---

  
  
This post is an update of the current status of the Google@Home project. Google@Home tries to bring domotic control in your home using Google Services for Speech Synthesis and Text-to-Speech. Finally a sketchup of the Android App!  
  
  
  
That's the current status of the project:  
  
The GSoC student :  

*   RPC server integration, fully pluggable with Mojolicious (better than the one was in the proposal, less dependencies since that framework will be used also for the UI)
*   RPC Parser service, that forward request to the Parser that handles the actions to be made (by voice)
*   Finished SQLite Schema with DBIx::Class, working on the SQLite Backend, Parser and deployer (using DBIx::Class::DeploymentHandler) facing some bugs encountered in his way

  
This is what i have done so far:  

*   Adjustments on the core, using some features of Mojolicious, requiring less deps now.
*   Renamed namespaces of the Drivers, now all lays onIntelliHome::Drivers, a base class for all drivers was created and also a draft of the GPIO dual (like shutters, they are controlled by two GPIO ports)
*   Now the GPIO can have many pins associated with (needed for dual, but can be extended to other possible uses)
*   Trigger search now are tied by language
*   Plugins doesn't require to have a remove callback, it's handled by default, they just need to define install()
*   Searching on GPIO grep all results, this allow to create "groups" of controls having the same tag (i.e. open kitchen shutters, will open all the kitchen shutters)
*   Proceeded with the development of the Android application, since the student made the RPC service, now the app calls the RPC server and forward voice requests (acts like node for now)
*   Obviously, fixed and cleaned up some code along the way

  
Here a screenshot of the Android app (thanks again to Lispeak mobile that made the recognize intent workout less bloody then expected):  
  
  
![](http://www.mudler.pm/img/google_at_home_remote.png)  
Well, the graphic is not really hot i know, but designers contributors are really welcome. In the future the android app would not only be a push-to-talk , but also integrates all the domotic controls (replicating/integrating the future webapp).  
  
Next steps will be to develop a database deployer and configurator (for CLI right now), have a look at the issues on github if you wanna see what's going on.  
  
If you wish to install and try you can just still follow [the quick start on the repository page](https://github.com/mudler/Google-at-Home#quick-start).