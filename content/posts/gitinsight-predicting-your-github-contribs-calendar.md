---
title: 'GitInsight, predicting your github contribs calendar'
date: 2014-08-09T02:59:00.000-07:00
draft: false
url: /2014/08/gitinsight-predicting-your-github.html
---

Predicting github contrib calendar with Perl and PDL

  
  
Premise : this is my first time using **PDL**  
  
Lately i had the chance to put my hands on PDL, i was glad to discover that it's awesome!  
  
I come from a matlab/octave and Mathematica background, at first was a bit difficult to dig thru the PDL equivalents functions and i have to admit that PyMC has some fancy stuff that require a lot of code to implement in PDL and i wanted to borrow in that case.  
  
But after all, i begun to love the syntax, and the perl integration with sci-libs is a great stuff: allows to pack up your result also in a web interface and it's damn fast.  
  
The idea was to predict the future github contribution calendar of a user, since it's representation in the profile page is a CA where each box can be in 1 of 5 available states represented by the quartiles of the normal distribution over the range \[0, max(c)\] , where max(c) stands for the maximum commits ever done in a day (within the range of maximum a year).  
  
A transition probability matrix is filled up, using Bayes inference for calculating the probabilities of jumping in each of the possible states and then the Markov chain is computed to give you the result of the prediction for the next week.  
  
I was very glad to see how can be neat (thanks so much to PDL devs) to wrap a probability density function used for the inference in few lines of code:

  

```
sub prob {
    my $x = zeroes(100)->xlinvals( 0, 1 );
    return $x->index(maximum_ind(pdf_beta( $x, ( 1 + $_[1] ),( 1 + $_[0] - $_[1] ) ) ));
}
```  
Instead of calculating the markov chain for the next states powering the matrix of the transition probabilities, by default the commits are split up by day and with a dedicated transition matrix for each one, since in my opinion developers habits are more likely to show up on the same days (but i added an option to calculate the probabilities also by powering and using just one transition matrix if you wish to compare the results).  
  
Perl comes handy in every situation, and that said was pretty fast to set up a web interface for the algorithm using Mojolicious: [link](http://gitinsight.mudler.pm/).  
  
More predictions that you folks are going to make, more you will help me to improve the algorithm to do better predictions. Suggestions, comments, issues, pull requests are welcome.  
  
All the code is available on github: [the GitInsight module](https://github.com/mudler/GitInsight/) and [the web interface](https://github.com/mudler/WebApp-GitInsight).  
  
The future improvements would interests more fine grained quartile calculations( this implementation is just a beta, and probably not suitable for devs that have >200/300 commits), and better prediction trying to detect when a user changes behaviour, highlighting that particular period of time. Oh and of course an option for specifying the starting day of the week.