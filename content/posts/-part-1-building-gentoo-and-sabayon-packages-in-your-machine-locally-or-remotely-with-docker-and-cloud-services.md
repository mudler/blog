---
title: '[Part 1] Building Gentoo and Sabayon packages in your machine locally or remotely with Docker and Cloud Services'
date: 2015-11-15T07:09:00.004-08:00
draft: false
url: /2015/11/part-1-building-gentoo-and-sabayon.html
tags: 
- sabayon
- docker
- equo
- gentoo
---

[![](http://1.bp.blogspot.com/-s-2KEJ0FoF8/VkiGi_oCjBI/AAAAAAAAMfg/JkAeUmowseI/s640/cloud-47581_1280.png)](http://1.bp.blogspot.com/-s-2KEJ0FoF8/VkiGi_oCjBI/AAAAAAAAMfg/JkAeUmowseI/s1600/cloud-47581_1280.png)

  
  
  
As previously anticipated in the previous blog post, here i explain what's going on with Sabayon Docker images, and how can the Official Sabayon images help you in developing/deploying your application. In this article, i'll show how to build Sabayon/Gentoo packages using Docker.  
  
  
I'll cover five cases and will be divided in differents articles:  

1.  You want to build packages locally
2.  You want to remotely build packages
3.  You want to host an overlay or a Sabayon repository and want your packages to get built on each push to the git repository
4.  You want to track remote repository changes and test (useful if you can't setup a webhook)
5.  Setup an Entropy repo with a Docker image, and how to mantain packages

In future, i'll write also a post also on how to track the packages remotely with CircleCi.

  

Introduction
------------

  

It has been a while that i'm putting my head on how i could leverage Cloud provider's free services to build packages and improve the QA of the building process at all. Continous Integration applied to Linux Distribution Developing process can lead to quite awesome perspectives. \[I will digress on this on a future article\]

  
For those who are unfamiliar with Docker..**What the heck is Docker?** From their site:  

> _Docker allows you to package an application with all of its dependencies into a standardized unit for software development.Docker containers wrap up a piece of software in a complete filesystem that contains everything it needs to run: code, runtime, system tools, system libraries – anything you can install on a server. This guarantees that it will always run the same, regardless of the environment it is running in._

We can look at Docker like a box which can be filled to be used like an entire OS, but at the same time share the kernel with the host (sorry to be much semplicistic, we are not discussing about the Docker technlogy here).  
  
  

Differents images, differents purposes
--------------------------------------

#### The Sabayon images provides the software stack present on the Entropy repositories, thus allowing easily to use emerge (Gentoo package manager), equo (Sabayon package manager) and Eit (Sabayon repository manager) in an every linux distribution (So, also aliens can use it).

  

At Sabayon, we currently are providing various flavors of Docker images, the most useful for developers/users/hobbist are: 

*   **[sabayon/base-amd64](https://hub.docker.com/r/sabayon/base-amd64/)**: A light image that ships the minimum Sabayon package set
*   **[sabayon/spinbase-amd64](https://hub.docker.com/r/sabayon/spinbase-amd64/)**: It is based on base-amd64, and includes kernel, software that is required to create the SpinBase.iso images that finally hits our mirrors
*   **[sabayon/builder-amd64](https://hub.docker.com/r/sabayon/builder-amd64/)**: This image have all the packages required to compile packages with emerge, includes an helper script to do most common tasks automatically
*   **[sabayon/molecules-amd64](https://hub.docker.com/r/sabayon/molecules-amd64/)**: This image features the Sabayon Molecule tool with the molecules git repository inside, it is just an aim to easily let people burn their custom spins.

The other images that you can see in our public profile are used to convert a Gentoo image to Sabayon, everything translated in Docker steps.  
  

While the **sabayon/base-amd64** image can be used to deploy your services, and be the base of your applications container, the **sabayon/builder-amd64** is a ready-to-use image to build package, it's all already setup for you.

  

As already said, i'm going to cover four cases here, then you are free to pick up the solution that suits you well.  
  
In this part i'm going to talk on how to build packages locally, without having to setup your environment.

  

Building the packages locally with Docker
-----------------------------------------

  
I'll start from the easier task. _Building packages with your machine._

  

Let's say that there is an ebuild available in an overlay, which you are interested in and is not available in Entropy. Consider of course, that not all ebuilds will compile, some are not mantained and not work as expected.  
  
We are going to use the sabayon/builder-amd64 image to build portage packages.

  

1) Setup
--------

  

Here we need docker to be installed in your machine, i'm assuming that you are running Sabayon here, but this is merely optional,  docker can be used also on Debian, Gentoo, Fedora or whatever you want.

  

> > _sudo equo i docker _

> > _sudo systemctl start docker_

  

There we go, this is the unique software that we actually want.  
If you want the Docker service to be launched on boot:  
  

> _        sudo systemctl enable docker_

  

---

2) Pull(download) the image
---------------------------

  

Now let's download the **sabayon/builder-amd64** image:

  

> > _sudo docker pull sabayon/builder-amd64_

  
_Note: If you don't want to use sudo on each docker command, put your user into the "docker" group._  
  

_3) Spawn a compilation_
------------------------

  
Let's say that now we want to compile app-text/tree.   
Now we can launch a new container from the sabayon/builder-amd64 image, giving it as argument the package we want to compile:  
  
  

> > _sudo docker run -ti --rm -v "$PWD"/artifacts:/usr/portage/packages sabayon/builder-amd64 app-text/tree_

  
Now the builder machine will try to compile your package downloading first all the (available) dependencies it can find from Entropy and setting your container to face the compilation phase properly.  
  
When docker run will exit, you will find then your package under the "artifacts" directory under the directory where you launched the command.   
  
If your package was in another overlay, the builder machine supports to fetch automatically overlays, you just have to tell what are the overlays you need:  
  

> > _sudo docker run -ti --rm -v "$PWD"/artifacts:/usr/portage/packages sabayon/builder-amd64 app-text/tree --overlay **NAME**_

where:  
  

*   **\--rm **tells docker to destroy the container as soon as it exits
*   **\-v** determines the mount of a directory between the host and the container. On the left side of the doublepoints ":" there is the host directory, on the right the container one. The host folder will be mounted on the directory specified on the container so we can share data.
*   **\--overlay NAME:** you can specify an overlay where your package is available, for example, we might want to compile the new gnome available in the gnome overlay. This command can be chained to list more than one overlay to fetch _(--__overlay1 --overlay2, ecc.. )_

You might also want to save your changes to the image, meaning to mantain your building machine state. This can be accomplished with docker, [using "docker commit".](https://docs.docker.com/v1.8/articles/basics/#committing-saving-a-container-state) How to use this image is up to your imagination.  
  
  

  

4) MOAR Options (Here be dragons)
---------------------------------

  

Docker allows to share directories with the host system, gracefully mounting them on   start up. We can specify to Docker in it's definition file that we want some volumes to not be shipped with the image itself, but instead being mounted on the host system everytime we run it. As for example, we can tell to Docker to use the directory foo as our /usr/portage directory, allowing us to cache Portage files, including distfiles and packages.  
  
  

> _docker run -t -i sabayon/base-amd64 -v "$PWD"/foo:/usr/portage <PACKAGE>_

  
  

*   **\-t** tells to docker to allocate a pseudo-tty for us, allowing to run an interactive shell 
*   **\-i** keep the STDIN attached also if not active
*   **\-v** sets the volume, so "$PWD"/foo will contain the /usr/portage content of the container and vice-versa (its mounted)
*   **<PACKAGE> **the last argument is the command that we want to launch inside the container, we could of course launch other commands here, this is just an example

  
If you don't have already pulled the docker image (docker pull sabayon/base-amd64) this will be done automatically, leaving you to use just one command.  
  
  

Example - Advanced
------------------

  
**The -v flag can furthermore exploited and chained to obtain more fine-grained tweaks**

  

_Going to cover a minor example regarding sabayon/builder-amd64 image here. _  
_You can of course customize it further, and replace all the configuration that's already been setup on the Docker Image._  
_Let's create 5 files in a directory, corresponding to the customization you might need from your building process._  
  
  

*   _custom.unmask: will contain your unmasks_
*   _custom.mask: will contain your masks_
*   _custom.use: will contain your use flags_
*   _custom.env: will contain your env specifications_
*   _custom.keywords: will contain your keywords_

  
Exporting those files to your container is a matter of adding an argument to your docker run command.  

####   

  

#### Example. Exporting your custom.unmask:

  

> _\-v /my/path/custom.unmask:/opt/sabayon-build/conf/intel/portage/package.unmask/custom.unmask_

  
  

#### Example. Exporting your custom.mask:

  

> _\-v /my/path/custom.mask:/opt/sabayon-build/conf/intel/portage/package.mask/custom.mask _

  
  

#### Example. Exporting your custom.use:

  
  

> _\-v /my/path/custom.use:/opt/sabayon-build/conf/intel/portage/package.use/custom.use _

  
  

#### Example. Exporting your custom.env:

  
  

> _\-v /my/path/custom.env:/opt/sabayon-build/conf/intel/portage/package.env/custom.env_

  
  

#### Example. Exporting your custom.keywords:

  
  

> _\-v /my/path/custom.keywords:/opt/sabayon-build/conf/intel/portage/package.keywords/custom.keywords_

  
  
In this way you tell to docker to mount your custom.\* file inside /opt/sabayon-build/conf/intel/portage/package.\*/custom.\* inside the container.   
  
Keep in mind that the container have the portage directory located at /opt/sabayon-build/conf/intel/portage/ ; the /etc/portage folder is then symlinked to it.  
  
Attention! Remember also to use absolute paths or docker will fail to mount your files in the container.

  
The image then will call a script that provides to do most of the things automatically for you, but there are some environment variables that you can use to tweak it's default behavior:  
  
  
  
  
  
  
*   **BUILDER\_PROFILE**: Sets the profile for compilation, you can select it using the number or the name
*   **BUILDER\_JOBS**: How much jobs emerge will have assigned (-j option)
*   **USE\_EQUO**: 1/0 Enable/Disable equo for installing the package dependencies (if you plan to use a pure gentoo repository, set it to 0, but the compilation process would be much longer)
*   **PRESERVED\_REBUILD**: 1/0 to Enable/Disable preserved rebuild compilation
*   **EMERGE\_DEFAULTS\_ARGS**: a list of commands that you might want to specify 
*   **FEATURES**: you can override default FEATURES (like in Portage's **make.conf**)
  
To pass an environment variable to the docker container we set them like this:  

> \-e "**OPTION1**\=_VALUE1_" -e "**OPTION2**\=_VALUE2_"

That's it for now!