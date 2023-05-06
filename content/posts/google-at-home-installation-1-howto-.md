---
title: 'Google at Home installation [#1 Howto]'
date: 2014-10-15T03:04:00.000-07:00
draft: false
url: /2014/10/google-at-home-installation-1-howto.html
---

The first post of a series that will guide you to install and configure your domotic environment with Google@Home (following updates)

Introduction
------------

I'm starting in the blog a new series of posts illustrating the features of [G@H](https://github.com/IntelliHome/Google-at-Home) as they are being developed, and how you can start to play with it.  
  
This time we are going to see how to install it correctly, how to handle the basic configuration needed to start and we will install the Wikipedia plugin to allow to query wikipedia with our voice (you can lookup stuff on wikipedia just saying "wikipedia house").  

Plugin system
-------------

There are other plugins available as well [here](https://github.com/IntelliHome) and there is also an [Android application](https://github.com/IntelliHome/Google-at-Home-Remote-Controller) but it is out of scope for this article to guide you through them.  
  
Plugins helps to scale the system even further and add new functionalities to your boards placed in different spots in your home (or whatever environment you plan to use it).  
  
In this tutorial we are installing the master node and the client in the same machine. Basically we distinguish here 2 kind of nodes:  
masters (that represent the most capable hardware machine)  
agents or basics nodes. A basic node can either be an agent or a master.  
  
The master takes the requests of agent's nodes, process them in a unique interface and send a reply back, so you will talk to the same Entity but you can ask things in parallel in different places on the house/infrastructure.  
  
The Agents can be a PC or an embedded device and we plan to give also a display interface.  

### 1) Prerequisites

*   Git - [Installation how-to](http://git-scm.com/book/en/Getting-Started-Installing-Git)
*   SQLite - [Installation how-to](http://www.tutorialspoint.com/sqlite/sqlite_installation.htm)
*   SoX - [Installation ubuntu](http://linuxg.net/how-to-install-and-use-sox-on-ubuntu-13-10-13-04-12-10-12-04-and-linux-mint-15-14-13/)

You can check if sqlite it's already installed issuing the following command: sqlite3

  
Same applies to git and sox.  

### 2) Preparation

  
Let's fire up our terminal, and prepare a directory that will contain all the configuration files:

> mkdir ~/google\_at\_home cd ~/google\_at\_home

### 3) Installing App::cpanminus

Let's be sure that we have installed also [App::cpanminus](https://metacpan.org/pod/App::cpanminus)  

#### a) debian

  
in debian we can just do:  
  

> apt-get install cpanminus

#### b) general install

  
otherwise, if your vendor doesn't ship it and you have cpan (you have it, trust me):  
  

> cpan App::cpanminus

#### c) script install

You can also install cpanminus by issuing that command in your terminal:  
  

> curl -L http://cpanmin.us/ | perl - --sudo App::cpanminus

### 4) Installing IntelliHome libraries

Now let's install the libraries in the system (you can install it on the same user, if you intend to run google-at-home from there)  
  

> cpanm git@github.com:IntelliHome/Google-at-Home.git

### 5) Clone the repository

  
Now we need to clone the repo as well locally to grab the configuration files

> git clone git@github.com:IntelliHome/Google-at-Home.git cd Google-at-Home

### 6) Basic configuration (optional)

By default, the database would be installed on /var/tmp/intellihome.db, to change it you just need to edit the config/database.yml. Here you can also set your language (e.g. for english language: 'en').  

### 7) Plugin installation

  
Now let's procede to install the Wikipedia plugin (that allows querying with voice wikipedia) and the Relay plugin (that enables to commands remote relay attached to your RaspberryPis)

> cpanm git@github.com:IntelliHome/IntelliHome-Plugin-Wikipedia.git  
> cpanm git@github.com:IntelliHome/IntelliHome-Plugin-Relay.git

  
In this article, we are just showing how to install them, since the relay plugin should be configured to work (such as registering the relays on the boards).

  

### 8) Database deploy

  
The database will keep record of the nodes on your network and the plugin installed on your system.  
  
Now let's prepare the SQLite backend:  
  

> perl intellihome-deployer -b SQLite -c prepare

  
And deploy it:  
  

> perl intellihome-deployer -b SQLite -c install

### 9) Enable your plugins

  
Now the master node is ready, we just need to register the plugins that we intend to use:

> perl intellihome-master -i Wikipedia  
> perl intellihome-master -i Relay

(to remove them use -r)  

### 10) Start the software

#### a) Start the server

Let's start the master process now:  
  

> perl intellihome-master

  
This will spawn also the web interface, avaible now on [http://localhost:8080](http://localhost:8080/). It's under development, so you can just add/delete the nodes/gpio and tagging them for further use.

  

#### b) Start the local node

  
Since this tutorial aim is just to work on the local machine, now you can spawn the node process  
  

> perl intellihome-node

  
You are now ready to go, try to speak at your microphone and say "wikipedia house" to have your answer.  
  
If you encounter issues or bugs, please fill a bug request [here](https://github.com/IntelliHome/Google-at-Home/issues)  
  
A big thank you to Vytas and dgikiller for the help and the contributions to the project.