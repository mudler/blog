---
title: 'Part 3: Building Gentoo and Sabayon packages in your machine locally or remotely with Docker and Cloud Services'
date: 2015-11-15T05:04:00.005-08:00
draft: true
url: 
---

You have an overlay? Gentoo or Sabayon? it doesn't matter!
----------------------------------------------------------

This system can be of implemented also in an already existing overlay.

If you are an overlay mantainer, and want something to test your packages you can set your entire system to compile packages as you commit changes on the overlay. 

  

### Introducing Boson

[Boson](https://github.com/mudler/boson) is a little piece of software that we can use it in different modes, in such case we use it to manage the entire compilation process in CircleCI. 

With a small yaml file (boson file from now on) which describes the operations to accomplish against the repository we can use it to build automatically the ebuilds that you edited on each commit, like as was software. Yes. this is so cool.

  

  

\---

repository: https://github.com/Sabayon/sabayon-distro.git

docker\_image: sabayon/builder-amd64-squashed

preprocessor: gentoo.Gentoo

separate\_artifacts: false

tmpdir: /tmp/boson

artifacts\_dir: /artifacts\_dir/spike-overlay

log\_dir: /log\_dir/spike-overlay