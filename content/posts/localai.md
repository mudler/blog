---
title: 'LocalAI updates'
date: 2023-05-11
draft: false
---

![](https://user-images.githubusercontent.com/2420543/233147843-88697415-6dbf-4368-a862-ab217f9f7342.jpeg)

LocalAI has been a massive hit! Thanks to everyone who has shown support by following us. Your contribution is helping to democratize AI!


If you're not familiar with LocalAI, it's a self-hostable, free, and open-source alternative to the OpenAI API. It simplifies the AI development process and makes it accessible to everyone. You can check it out on Github: https://github.com/go-skynet/LocalAI.

## News

We have exciting news to share in the latest release (1.9.0). 
The GPT4All binding family models have been updated, as we are upstreaming our implementations (https://github.com/nomic-ai/gpt4all/pull/534), and now all models in https://gpt4all.io/index.html should work, including token stream back to the client, for additional glamourous effects :) . Additionally, that means added support for MosaicML MPT models (https://huggingface.co/mosaicml/mpt-7b) and I've been looking at adding experimental support for bloomz models with [bloomz.cpp](https://github.com/NouamaneTazi/bloomz.cpp).

In the previous release (1.8.x), LocalAI gained support for audio transcription with [whisper.cpp](https://github.com/ggerganov/whisper.cpp) and support for embeddings with [bert.cpp](https://github.com/skeskinen/bert.cpp). bert.cpp embedding extends support for any model, allowing you to implement question answering on large datasets with any model that doesn't support embedding by its own backend.

## Thank you 

I owe our success to our amazing community. I would like to thank llama.cpp, gpt4all, rwkv.cpp, ggml, whisper.cpp, and bert.cpp for providing us with excellent community software pieces.

## Next

There are constantly new models out there. Some hot topics on our roadmap:

- Model gallery
- RedPajama/Starcoder models
- GPTNeoX
- Dolly

## Call for maintainers

LocalAI, and my mission is to make AI accessible for everyone - if you want to have fun with Golang and C++, or contribute to an open source project, feel free to reach out and become a maintainer!

## Community links

- Github: https://github.com/go-skynet/LocalAI
- Follow us on Twitter: https://twitter.com/LocalAI_API
- Upvote on Hacker news: https://news.ycombinator.com/item?id=35726934
- Join our Discord: https://discord.gg/uJAeKSAGDy

Join us in making LocalAI the go-to open-source, self-hostable AI API replacement for local inference with CPU. With your support, we can democratize AI and make it accessible to everyone!
