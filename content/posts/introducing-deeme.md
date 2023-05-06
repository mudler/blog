---
title: 'Introducing Deeme'
date: 2014-06-21T02:57:00.000-07:00
draft: false
url: /2014/06/introducing-deeme.html
---

  
_Introducing Deeme a database-agnostic driven event emitter base-class._  
  
Deeme is a database-agnostic driven event emitter base-class. Deeme allows you to define binding subs on different points in multiple applications, and execute them later, in another worker with a switchable backend database. It is handy if you have to attach subs to events that are delayed in time and must be fixed. It is strongly inspired by (and a rework of) Mojo::EventEmitter.  
  
Deeme was developed for handling the events notification on plugins of Google-at-Home, allowing to store the subroutines of the plugins needed to be executed later when receiving informations of the nodes.

  
```
package Cat;
use Mojo::Base 'Deeme';
use Deeme::Backend::Meerkat;

# app1.pl
package main;
# Subscribe to events in an application (thread, fork, whatever)
my $tiger = Cat->new(backend=> Deeme::Backend::Meerkat->new(...) ); #or you can just do Deeme->new
$tiger->on(roar => sub {
  my ($tiger, $times) = @_;
  say 'RAWR!' for 1 .. $times;
});

 ...

#then, later in another application
# app2.pl
my $tiger = Cat->new(backend=> Deeme::Backend::Meerkat->new(...));
$tiger->emit(roar => 3); 
```

  

You can follow the development [here](https://github.com/mudler/p5-Deeme), for now there is [the Meerkat backend](https://github.com/mudler/p5-Deeme-Backend-Meerkat)that supports MongoDB, later i'll write a backend for Mango too. There are examples: [local memory example](https://github.com/mudler/p5-Deeme/blob/master/ex/roar.pl), [MongoDB using Meerkat](https://github.com/mudler/p5-Deeme-Backend-Meerkat/blob/master/ex/roar.pl).