---
title: 'Why vllm.cpp exists'
date: 2026-08-13
draft: true
author: "Ettore Di Giacinto"
tags: ["llm", "inference", "cpp", "vllm", "llama.cpp", "sglang", "localai", "local-ai", "open-source"]
---

![header](/images/vllmcpp-manifesto.png)

I love vLLM, I really mean it. It made AI inferencing affordable and fast, but it has a cost.
A vLLM install here is also 9.1 GiB of virtualenv, a CUDA runtime, a
pinned torch, and a dependency tree somebody has to scan for CVEs every week, if you take care about security. I
did that for a while, but one of the things that broke me is trying to maintain vLLM in LocalAI. It is very painful, CI constantly breaks for either bandwidth, disk size or simply deps breaks, ABI shifts without runtime checks (but this is true for every scripting language) and I wanted to embed inference inside
other software anyway, on machines where an interpreter in the process is a
problem.

So vllm.cpp is what came out of that. It is a from-scratch C++20 port
of vLLM's serving stack, which is top-class: continuous batching, block-paged KV, automatic prefix
caching, speculative decoding, an OpenAI-compatible server. It builds to a 66 MiB
binary with CUDA in it, and a small fraction of that without. There is no Python
and no PyTorch at runtime, and the core has no ML dependencies at all, which is my idea of nirvana.

People have been asking me a lot of direction questions since I posted it, and
answering them one comment at a time is not working. So here is the whole thing
in one place.

## What started it

The size is just a symptom rather than the complaint. When your inference server drags
an interpreter and a training framework into the process, you inherit their
deployment story, their supply chain and their release cadence. You cannot embed
it in anything without embedding all of it, you cannot audit it in an afternoon (well, maybe with AI now you can, but that's not the point),
and every one of those transitive packages is somebody's Tuesday afternoon
commit.

Attacks on package registries keep getting worse, and a transitive tree you did
not choose is an attack surface you inherit anyway. SLSA is something we should
be serious about, more than ever now that AI writes code and pulls in
dependencies, mine included.

How much it matters depends on what you are building, and it stops being an
abstraction the moment somebody has to operate the thing. Ship into a regulated
environment or onto an embedded device and "what is actually inside this" becomes
a question you are made to answer, on a schedule, in writing. Nine gigabytes of
Python dependencies is an answer that you have to justify.

I come from a Perl background, where we had CPAN and cpanfiles. Same problems.
It is genuinely a bit funny, but also frustrating to me that in 2026 we are still carrying these
concepts around. Yes, I like statically compiled languages.

Anyway, none of this applies to training and research. Python is great for research and for prototyping and
I use it constantly. But once the model is trained, inference is multiplying a
lot of numbers, and a 9 GiB runtime to multiply numbers is a strange place to
have ended up.

## The best, AI inferencing projects

You know them, but they deserve a spot in this post:

[vLLM](https://github.com/vllm-project/vllm) got the serving architecture.
Continuous batching and paged KV are why it is fast, and everything built since
sits on top of that. If you want throughput under concurrency, that is the design
that works.

[llama.cpp](https://github.com/ggml-org/llama.cpp) got portability. One binary,
no runtime, runs on your laptop, on a Pi, on a card from 2018. People love it
because it runs where they already are, which sounds like a small thing until you
have spent a week trying to get something else to.

[SGLang](https://github.com/sgl-project/sglang) got the ideas. Radix attention
and prefix-aware cache scheduling should be in every engine by now.

And no engine has all three. You pick throughput and take the venv, or
portability and give up the serving architecture, or the clever scheduling and
take the venv again. I wanted vLLM's speed with llama.cpp's deployment story and
SGLang's ideas in it, and nobody was going to build that for me, so, here we are.

## I tried llama.cpp first

I'm not crazy. I've built systems in the past. So I did not start by writing an engine. That would have been insane.

I started by trying to put block-paged KV into llama.cpp directly (everyone is trying to do it in their free time, nowadays, I guess). The branch is
still up if you want to look at it:
[mudler/llama.cpp, branch localai-paged](https://github.com/mudler/llama.cpp/tree/localai-paged).

It worked, actually. Bit-exact, and faster than stock llama.cpp. But there is a limit you can push that on, and sadly ggml isn't the right fit if you are looking up at speed in some cases. I don't want to get anyone pissed off, but at high concurrency, vllm performs better.

The GGML graph rebuilds every decode step, and paged inputs drop cache reuse to 0% in
a serving workload. Batch composition is part of the program in ggml, so the
scheduler cannot compose a batch the way a paged engine needs to. I got a
speedup, but nothing in the neighbourhood of what vLLM does, and it became clear
that the remaining gap was architectural rather than a matter of more engineering work.

That is when I accepted I was going to have to write the thing.

## Token for token, or it does not land

If you port an engine and it is 3% wrong, you have not built an engine. You have
built a very fast way to generate slightly different text, and you will spend the
next two months chasing "quality issues" that are actually a transposed index in
a rope table.

So the gate is exact token ids against a pinned vLLM on the same workload, no
tolerance at the top. And so far we have shipped 31 architectures. Upstream's own
test module gets ported in the same commit as the code.

We are in a luckier position than earlier projects like this, because there are
several mature references to port from. So the approach was to lean on agents as
hard as possible, and to make it easy for people to contribute with the hardware
they own without having to work out the architecture or the porting rules
themselves. I spent a long time up front on a way for agents to port vLLM to
vllm.cpp mechanically, so that we inherit:

- Token by token ids
- Architectures supported
- Model support
- Kernel optimizations

I also wanted everyone to jump in and help by validating what we build on the
hardware, because I do not have access to all the hardware in the world.

## Why a separate project

People asked whether I will keep up with vLLM, whether Volta and Pascal will
work, and when Vulkan is coming. Those all have the same answer, and it is why
this is a separate project rather than a pile of patches.

vLLM is under [the PyTorch Foundation](https://pytorch.org/blog/pytorch-vllm-%E2%99%A5%EF%B8%8F/). That is a completely reasonable place
for it to be, and I am not complaining about it. But a project in that position has a
direction set by more than the code, and some of what falls out of that is
perfectly sensible for them and no use to me.

Concretely. vLLM has no Vulkan backend, and it is the single most requested thing
on my issue tracker. Volta and Turing got dropped upstream, so people with V100s
are running a
[patchwork fork](https://github.com/1CatAI/1Cat-vLLM) to get their cards back.
And vLLM is not going to port SGLang's radix attention, because SGLang is the
other project, and that is just how this works when you are the incumbent.

I have no such problem. I can take the serving architecture from vLLM and the
scheduling ideas from SGLang in the same afternoon, and I do, and there is a
[whole document](https://github.com/mudler/vllm.cpp/blob/main/docs/SGLANG-COMPAT.md)
about the SGLang side of it. I can support a card because three people asked me
to, rather than because it went through a roadmap. Not being anybody in
particular turns out to help.

Whether porting somebody else's design is a legitimate thing to spend a year on
is arguable, and I am not going to argue it here. My reason is utilitarian. This
is the project I want to exist, and it did not.

To be very clear about the relationship, because I do not want this misread: I
like vLLM. This project is measured against it every single commit, it exists
because their design is good, and I have tried to be a decent citizen about it.
It is an unaffiliated community port, it is not endorsed by them, and when we
find something that looks wrong in vLLM during porting we say so.

I emailed them about the name and have not heard back. If it ends up changing,
that is probably where this was going anyway, and it would be the project growing
into itself as it is expected to be, but honestly I don't have yet a better name for it, so it is what it is for now.
What is in here already includes things vLLM never took: radix attention out of SGLang, a Vulkan backend, the cards that
got dropped upstream. It started as a port and it has not been only a port for a
while, and a thing like that tends to grow out of a borrowed name on its own.

## What does not work

Plenty, and it is all on the issue tracker.

There is no multi-GPU on real hardware. Tensor parallel is proven equal to tp=1,
but on CPU, because I have one box. It is in the roadmap and a few people have
offered me rigs to test on.

LoRA is not wired through the server. You can generate video over the API, but
handing the chat endpoint an image still only works in the CLI and the library.

Embeddings landed recently and it is one architecture at CPU speed, so treat it
as new. Reranking and classification are not there at all.

Vulkan moved a long way in a few days. It decodes a 27B about as fast as
llama.cpp's Vulkan now, which it was nowhere near before, and most of that came
from one bug: RMSNorm was dispatching a single workgroup per row at batch 1. On
small models llama.cpp is still comfortably ahead of me. At 27B we are both bound
by memory bandwidth, so the kernels matter less there than they do on something
small.

ROCm went from one registered kernel to 44 in about the same window, and the HIP
sources compile and pass their gates on four gfx architectures, none of which I
own. A couple of weeks ago I had never compiled it at all.

Flags and internals change between commits. The C ABI in `include/vllm.h` is the
exception: it is versioned, it grows by appending, and if you embed this, embed
through that header.

It is also not going to replace Python for everybody. If you want to patch your
engine at runtime to support a new model tomorrow, Python is better at that and
it is not close.

## Where it goes

The models that matter most today came first and will keep coming first. That is
the only prioritisation rule I have, it is why the architecture list looks
lopsided, and it is the one genuine advantage of having started late: I am not
carrying a decade of architectures nobody runs any more, and I am not going to
start. New cruft only, please.

Multimodal is already here, which I did not expect this early. MiniMax-H3 runs,
video and audio out of a single model, with both VAEs reimplemented from the
checkpoint's remote Python so there is no torch anywhere in the process. That is
the kind of model I want this engine to be good at, rather than the long tail of
things that were interesting in 2021.

GGUF stays a first class citizen. I like that ecosystem a lot, and I think it is
the main reason people can run anything at all on the hardware they already own:
the quants get made, shared, re-shared and argued about in public, and none of it
needed anyone's permission. We already load GGUF and measure against llama.cpp on
it.

We are building a high-performance inference stack that runs everywhere and that
you can embed in your own software. If you have hardware I do not have, that is
the single most useful thing you can bring. Half the open issues are blocked on a card rather than on code, and this
is not a hypothetical ask. Somebody turned up with a Tenstorrent Blackhole, which
I have never touched, and wrote a backend for it. It is forty-odd commits deep and running a model
token-exact. Ports of new
architectures are very welcome too, and the protocol for adding one is written
down.

## Bring your agent

A lot of this was written with agents, and people ask whether that is
vibecoding.

Vibecoding is generating something that looks right when nothing in the room can
tell you whether it is. A port is close to the opposite situation. There is a
reference implementation on the other side and a gate that demands the same token
ids from the same workload, so an agent cannot talk its way past a byte
comparison, and upstream's own tests land in the same commit as the code. The oracle
is the method here, not something bolted on at the end.

That is why the repository looks the way it does. The rules are written down in
`AGENTS.md` and a `.agents/` directory: how to port a model, how to add a
backend, what counts as a benchmark and what disqualifies one. The engine is
backend-agnostic on purpose, so adding a device is mostly new files, and the
change to the core is one enum and one switch in `include/vt/device.h`. That is
what lets somebody who was not there check the work.

So if you have hardware I do not have, you do not need my time. You need the op
table and the gate, and both are written down already. Bring your agents. The
Tenstorrent backend happened exactly like that, on silicon I have never touched.
What this engine runs on depends on how many people turn up, not on my
calendar.

Come say hi in the issues, I answer them.

The more the merrier!

Cheers!

*(I am doing a whole separate post about how working this way actually goes,
including the times it tried to cheat me. That one is going to be more fun. If
there is interest I will write up the design too, and how we use Triton AOT
kernels, which did not fit here.)*
