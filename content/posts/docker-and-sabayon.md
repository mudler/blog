---
title: 'Docker and Sabayon'
date: 2015-11-15T06:06:00.000-08:00
draft: true
url: 
---

[![](http://4.bp.blogspot.com/-_jvpJC_-Iv8/Vci8VG57fKI/AAAAAAAALNw/wrdd8ueVlkk/s320/dockersabayon.png)](http://4.bp.blogspot.com/-_jvpJC_-Iv8/Vci8VG57fKI/AAAAAAAALNw/wrdd8ueVlkk/s1600/dockersabayon.png)

  

  
As previously anticipated in the previous blog post, here i explain what's going on with Sabayon Docker images, and how can the Official Sabayon [images](https://hub.docker.com/u/sabayon/) help you in developing/deploying your application. In this article, i'll show how to setup an entropy repo with a Docker image, and how to build /mantain Sabayon packages using Docker  
  
[](https://www.blogger.com/blogger.g?blogID=3772896984528130186)For those who are unfamiliar with Docker..What is Docker? From their site:  

> Docker allows you to package an application with all of its dependencies into a standardized unit for software development.  
> Docker containers wrap up a piece of software in a complete filesystem that contains everything it needs to run: code, runtime, system tools, system libraries – anything you can install on a server. **This guarantees that it will always run the same, regardless of the environment it is running in.**

We can look at Docker like a box which can be filled to be used like an entire OS, but at the same time share the kernel with the host (sorry to be much semplicistic, we are not discussing about the Docker technlogy here).  
  
The Sabayon images then provides the software stack present on the Entropy repositories, thus allowing easily to use emerge (Gentoo package manager), equo (Sabayon package manager) and Eit (Sabayon repository manager) in an every linux distribution (So, also aliens can use it).  
  

#### Volumes in Docker

Docker allows to share directories with the host system, gracefully mounting them on   start up. We can specify to Docker in it's definition file that we want some volumes to not be shipped with the image itself, but instead being mounted on the host system everAs previously anticipated in the previous blog post, here i explain what's going on with Sabayon Docker images, and how can the Official Sabayon images help you in developing/deploying your application. In this article, i'll show how to setup an entropy repo with a Docker image, and how to build /mantain Sabayon packages using Dockerytime we run it. As for example, we can tell to Docker to use the directory foo as our _/usr/portage_ directory, allowing us to cache Portage files, including distfiles and packages.  
  

> docker run -t -i sabayon/base-amd64 -v "$PWD"/foo:/usr/portage /bin/bash

  
  

*   **\-t** tells to docker to allocate a pseudo-tty for us, allowing to run an interactive shell 
*   **\-i** keep the STDIN attached also if not active
*   **\-v** sets the volume, so "$PWD"/foo will contain the /usr/portage content of the container and vice-versa (its mounted)
*   **/bin/bash** the last argument is the command that we want to launch inside the container, we could of course launch other commands here, this is just an example

  
If you don't have already pulled the docker image (**docker pull sabayon/base-amd64**) this will be done automatically, leaving you to use just one command.  
  

### Sabayon Docker images

We offer on the Docker hub (the public Docker registry) different Sabayon variants, each for a specific use-case:

  

*   **sabayon/base-amd64** : this image is a pure Gentoo stage3 converted to Sabayon, leaving up to you the customization that fits your needs (useful for example for software deployment or to handle a Entropy repository)
*   **sabayon/spinbase-amd64** : this is the image that Sabayon actually use to generate the Spinbase flavor
*   **sabayon/builder-amd64** : this image contains the tools needed to compile packages
*   _**sabayon/\*-amd64-squashed **:_ we use this templating name just to put the squashed images, there is no actual difference between the software shipped by the other ones, they are just "_squashed_" in one layer

Docker is organized in "layers", every "run" that you actually execute, it's a completely new container, based off the one you specified. You are not changing the image itself, but just putting layer to layer that Docker will resolve for you trasparently. 

  

Probably now you are wondering where all your future changes to the system goes, the neat thing of all this is that actually until you save them they will be lost. 

  

Docker, inspired by Git, brings the concepts of _tagging and committing a container_. This means that we can tag the sabayon/base-amd64, for example as "foo/bar", and then allowing us to commit all the changes that we do step-by-step. 

  

#### Docker commit by example

  
Appunti:  
  

Quick Start
-----------

*   Create the `$OVPN_DATA` volume container, i.e. `OVPN_DATA="ovpn-data"`
    
    ```
     docker run --name $OVPN_DATA -v /etc/openvpn busybox 
    ```
*   Initialize the `$OVPN_DATA` container that will hold the configuration files and certificates
    
    ```
     docker run --volumes-from $OVPN_DATA --rm kylemanna/openvpn ovpn_genconfig -u udp://VPN.SERVERNAME.COM
      docker run --volumes-from $OVPN_DATA --rm -it kylemanna/openvpn ovpn_initpki 
    ```
*   Start OpenVPN server process
    
    *   On Docker and newer
        
        ```
         docker run --volumes-from $OVPN_DATA -d -p 1194:1194/udp --cap-add=NET_ADMIN kylemanna/openvpn 
        ```
    *   On Docker older than version 1.2
        
        ```
         docker run --volumes-from $OVPN_DATA -d -p 1194:1194/udp --privileged kylemanna/openvpn 
        ```
*   Generate a client certificate without a passphrase
    
    ```
     docker run --volumes-from $OVPN_DATA --rm -it kylemanna/openvpn easyrsa build-client-full CLIENTNAME nopass 
    ```
*   Retrieve the client configuration with embedded certificates
    
    ```
     docker run --volumes-from $OVPN_DATA --rm kylemanna/openvpn ovpn_getclient CLIENTNAME > CLIENTNAME.ovpn 
    ```
*   Create an environment variable with the name DEBUG and value of 1 to enable debug output (using "docker -e").
    
    ```
     for example - docker run --volumes-from $OVPN_DATA -d -p 1194:1194/udp --privileged -e DEBUG=1 kylemanna/openvpn 
    ```
*