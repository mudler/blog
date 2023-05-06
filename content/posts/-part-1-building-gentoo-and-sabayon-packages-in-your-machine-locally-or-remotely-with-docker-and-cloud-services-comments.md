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

#### With spawning a compilation, the second line (with...
[fusion809](https://www.blogger.com/profile/14316408440182908236 "noreply@blogger.com") - <time datetime="2015-11-18T22:15:18.006-08:00">Nov 4, 2015</time>

With spawning a compilation, the second line (with the package you wish to merge) is it possible to point to a specific version of a package. For example, atm I'd like to merge app-editors/atom-1.2.0 from the Sabayon overlay, do I have to enter it as \`app-editors/atom-1.2.0 --overlay sabayon\` or \`=app-editors/atom-1.2.0 --overlay sabayon\`?
<hr />
#### In section 3 I think you gave incorrect syntax, al...
[fusion809](https://www.blogger.com/profile/14316408440182908236 "noreply@blogger.com") - <time datetime="2015-11-18T23:11:19.327-08:00">Nov 4, 2015</time>

In section 3 I think you gave incorrect syntax, although it may be because of formatting limitations imposed by blogger. I think the two lines:  
  
sudo docker run -ti --rm -v "$PWD"/artifacts:/usr/portage/packages sabayon/builder-amd64  
app-text/tree  
  
should instead be provided over a single line, like:  
  
sudo docker run -ti --rm -v "$PWD"/artifacts:/usr/portage/packages sabayon/builder-amd64 app-text/tree  
  
I say so because whenever I run it as two lines I get the error message:  
  
\-> You should feed me with something  
  
Examples:  
  
/builder app-text/tree  
/builder plasma-meta --layman kde  
  
\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*  
  
You can supply multiple overlays as well: /builder plasma-meta --layman kde plab  
  
Died at /builder line 18.
<hr />
#### Yes, i'm sorry blogger returns the line anyway
[Ettore](https://www.blogger.com/profile/03411449232588367668 "noreply@blogger.com") - <time datetime="2015-11-19T00:49:16.345-08:00">Nov 4, 2015</time>

Yes, i'm sorry blogger returns the line anyway
<hr />
#### like while using emerge, you have to use the equal...
[Ettore](https://www.blogger.com/profile/03411449232588367668 "noreply@blogger.com") - <time datetime="2015-11-19T00:49:39.308-08:00">Nov 4, 2015</time>

like while using emerge, you have to use the equal sign to specify an exact version
<hr />
#### Have ya considered using the code-formatting HTML ...
[fusion809](https://www.blogger.com/profile/14316408440182908236 "noreply@blogger.com") - <time datetime="2015-11-19T02:40:57.744-08:00">Nov 4, 2015</time>

Have ya considered using the code-formatting HTML code provided by codeformatter.blogspot.com? In the case of your first command mentioned in the "3) Spawning..." section the HTML code would be: http://paste2.org/NJ9st0ke (using a pastebin as inserting the code here directly gave a "HTML cannot be accepted" error).
<hr />
