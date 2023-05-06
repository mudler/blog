---
title: 'Part 2: Building Gentoo and Sabayon packages in your machine locally or remotely with Docker'
date: 2015-11-15T05:04:00.003-08:00
draft: true
url: 
---

  

---

This article is part of a set of articles about building packages with Sabayon Docker images.

  

We are going to see how we can build packages leveraging Cloud services

  
Building packages remotely
-----------------------------

Now that we have seen how to build packages locally, you can think big and move this to a further step: why don't let a cloud service pull the builder image and build packages for you?

  

We can accomplish in a number of ways, but i'll show you with two services:

  

  

1.  Github
2.  CircleCI

  

Also if CircleCI applies some restriction to the VM and makes the process sometime fail due to permissions, it's still the fastest service that i found for this tasks (TravisCI should work as well, with a couple of adjustments)

### 1) Set up a GitHub Repository

GitHub will host our repository that contains the files needed to setup CircleCI with the building process, and to actually trigger the build.

  

While GitHub is a well-known service, and i assume that since are you still reading, you probably already use it, so i won't tell you how to create a repository and push content to it.

  
  
First, fork my repository (or copy the content) since probably you won't edit it (and will be easier to sync with mine if i apport changes): [https://github.com/mudler/sabayon-circleci-builder](https://github.com/mudler/sabayon-circleci-builder).  
  

### 2) Register to CircleCI and create a Project that point to your repository

CircleCI is a Continuous Integration service free for open source repository (meaning public)

>   
>   
> CircleCI provides development teams the confidence to build, test, and deploy—quickly and consistently—across numerous platforms. Built to address the demanding needs of today's application development environments, CircleCI supports every component of a modern application, including mobile apps (iOS and Android),conventional web applications (built with platforms like Rails and Django), browser-based apps (built with frameworks like AngularJS and Ember), and containerized apps (built with tools like Docker).  
> CircleCI makes continuous integration and continuous deployment simple and easy for thousands of companies like Shopify, Cisco, Sony and Trunk Club, so they can shipbetter code, faster.

CircleCI spawns a Virtual Machine for each event that will happen in our repository, but can be triggered easily using their API, but we are going to see that in a moment.  
  
Then, register up to CircleCI, and setup it to point to your just forked repository.  
  
On CircleCI, generate an API token from the Project settings, grab the token and then you are already setup to start your first build!  
  
Create a bashscript, that you will use as you was using emerge (almost):  
  
\[XXX: INSERIRE SCRIPT BASH\]  
  
Call it like that: ./my-script.sh app-text/tree  
./my-script.sh gnome-base/gnome-shell::gnome --layman gnome  
  
 ./my-script.sh gnome-base/gnome-shell::gnome --layman gnome  
  
If you need to apport changes to your use flag set, you have to edit the files under "conf/" of the repository, their namings are explicit for those who know how to work with portage. \[XXX: Piccola parentesi qui? essere + specifici? \]  
  
You can also use the deploy function, but you will require a server where to scp files in. CircleCI allows you to specify a private key which can you then use in your deploy process.  
  
Then, you can set two environment variables from the CircleCI Project settings page to push your artifacts to your server, namely :  
  

*   DEPLOY\_SERVER:  is where we want to store our file ouruser@ourbox.com:/var/www/binhost
*   DEPLOY\_PORT:  is the port