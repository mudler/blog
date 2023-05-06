---
title: 'love for pushbullet'
date: 2014-05-22T02:49:00.000-07:00
draft: false
url: /2014/05/love-for-pushbullet.html
---

  
Well, if you don't know what pushbullet is, it's a free-less-complicated version of what pusher.com does, unifying push's across all the devices. In this article i'll show how to implement pushbullet api in perl, in few lines of code.  
  
Pushbullet enables to notify instantly to all your devices a message, a link, a file, an address or even a list of todo's (and probably more) : that can be quite handy if you don't want to setup an entire notification system, want to avoid the hassle of email alerts (that's not a critique, but i hate having my mailbox full of short report status messages ) or if you want that all your clients are notified immediately. I personally needed it to notify myself from simple status report by automatic programs.  
  
However that service is free, you just need to install an extension to your browser and an handy app for your Android/iPhone device (or what the hell do you have, but i bet everyone at these days have at least one mobile device) to receive push messages.  
  
Having a quick look at the [Pushbullet's api page](https://docs.pushbullet.com/) we can see that all is about a single curl request:

  

```
curl https://api.pushbullet.com/v2/pushes \
      -u <your_api_key_here>: \
      -d device_iden="<your_device_iden_here>" \
      -d type="note" \
      -d title="Note title" \
      -d body="note body" \
      -X POST
```  
  
where the most important parts are the api key, the type, the title and the body everything else it's just optional (have a look at the api if you wanna know more).  
  
There is an handy module avaible on cpan it's [WWW::PushBullet](https://metacpan.org/pod/WWW::PushBullet), but if you want a independent solution, using only LWP and HTTP::Request::Common, read on.  
  
Curl it's awesome but Perl it's handy, it's our swiss-army for that kinda of stuff, was easy to convert, so i'll keep the example as clean as possible.

  

```
use feature 'say';
use LWP::UserAgent;
use HTTP::Request::Common qw(POST);
my $ua      = LWP::UserAgent->new;
my $req = POST 'https://api.pushbullet.com/v2/pushes',
            [
            type  => 'note',
            title => 'Hello from perl',
            body   => 'with <3'
            ];
        $req->authorization_basic('<API KEY>');
        say $ua->request($req)->as_string;
```  
And that's it! Perl saves the day once more, with no hassle at all. We are now lovely notified about Perl love across all our devices.  
  
Cheers!