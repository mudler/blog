---
title: 'A call to open source maintainers, stop babysitting AI: How I Built a 100% Local Autonomous Dev Team to Maintain LocalAI, and why you should too'
date: 2026-02-28
draft: false
author: "Ettore Di Giacinto"
---

![header](/images/agents_header.png)

If you're building software today, you've probably felt the new kind of developer burnout. 

Things changed drammatically in the last two months. 

Even Karpathy sensei could not write it better:

{{< tweet user="karpathy" id="2026731645169185220" >}}

The real pain isn't writing the code anymore, it's the brutal cognitive load of context switching between managing agent sessions. You try to scale your output with AI, and suddenly you're managing a dozen different agents across a sea of split terminal windows, or clicking endlessly through bloated, dedicated UIs just to figure out what broke.

This is not how humans have ever managed engineering output. We don't lead dev teams by staring at their raw bash history.

As the creator of [LocalAI](https://github.com/mudler/LocalAI), I felt this pain intimately. The project blew up, the issue tracker was overflowing with maintenance tickets, and I desperately needed a team to help clear the brush so I could focus on building. 


![Minimax Bench](/images/minimax_bench.png)
> Minimax changed everything. You now can run a coding model which is on par with closed models locally.

Open-source doesn't come with a hiring budget, so naturally, I turned to autonomous coding agents as now **Minimax** changed the game for the local model open source scene.

## The Babysitting Trap

If you are building with AI right now, you know the cycle. You spin up an agent, give it a prompt, files appear, and for about ten minutes, you think you're going to retire by Friday.

Then the babysitting begins. Sure, an agent might get stuck in an infinite loop or hallucinate an API endpoint, but that's not the real bottleneck. The real pain is the iterative hand-holding. You have to go back and forth with the agent, endlessly refining prompts to get exactly what you need. And the worst part? You have to repeat this exhaustive cycle for every single new agent you spin up. It fundamentally doesn't scale.

This is likely my next bet for the future months. The emerging pattern looks really clear.

Everyone is racing to have multiple agents coding in parallel. I get that. You can really boost and do many things in parallel now. But here is the reality check that anyone need: without proper observability and a strict harness, running parallel agents or a constant track is just a great way to DDoS yourself and exhaust your context switch capabilities.

## Encoding Human Workflows

The breakthrough didn't come from tweaking a system prompt or adding more context. It came from realizing that the key to scaling AI is taking the proven ways we work as humans and strictly encoding them into the agent system which can be orchestrated. How do we solve writing software at scale? We are rushing into changing the way we work with assistants, but what if we take our way of working to AI agents instead?

My AI didn't need a better coding benchmark. And no, OpenClaw can't fix this. I didn't need a personal AI assistant; I needed a dev team to take over the low-hanging fruit so I could focus on what matters most. **What my AI really needed was a scrum master.**

Using [LocalAGI](https://github.com/mudler/LocalAGI) (my framework for building autonomous agents, I love dogfooding) and [LocalAI](https://github.com/mudler/LocalAI) (again, dogfooding) I took a local Minimax model, entirely revoked its ability to write code, and gave it a new job: **Agent Scrum Master.**

## The Scrum master Does Not Code

The biggest mistake we make with multi-agent orchestration is giving wide scope to agents.

> Gotta go sleep now.. can you make sure that this gets delivered?
![Take over](/images/take-over.png)
(And it did! [PR link](https://github.com/mudler/LocalAI/pull/8664))

My AI Scrum Master is strictly jailed. It cannot run git. It cannot read main.py. Its sole purpose is to listen to my high-level requests in Slack, break them down into Epics and Stories, manage dependencies, and aggressively maintain a Backlog.

It doesn't code. It delegates. It watches, it reports.

### Behavior

Instead of fighting with terminal windows, I just treat the AI like a normal remote dev team. I drop a request into our Slack channel: "Hey, we need to build a new authentication flow," or "Hey, add this (Github URL) to the backlog."

The Scrum Master wakes up, analyzes the request, and replies with a Plan. It splits if needed from Epic into logical, sequential tickets, assigns priority levels, and queues them up on a board.

Then, it checks the observability harness. It finds an idle worker agent in the background, hands it the highest-priority ticket, and goes back to sleep.

If a worker agent crashes mid-task because of an API timeout? The Scrum Master doesn't panic. It just holds the ticket in the backlog until the agent recovers. Zero dropped tasks. Zero overlapping git branches. Complete parallel execution, entirely managed by the system.

## The AI Manages Me Now

The craziest part of this architecture is the human-in-the-loop dynamic. Because the system is built around standard Agile states (Backlog, In Progress, In Review), the Scrum Master actively manages my time, too.


> Where do you need my input?
![Sprint status](/images/sprint-status.png)

I can literally go to sleep, and when I wake up in the morning, I'm greeted by a perfectly structured dev team. The worker agents run entirely headlessly in the background overnight. When an agent finishes a feature, it opens a PR on GitHub and tells the Scrum Master it's done.

The Scrum Master filters out all the chaotic terminal noise and only reports what I really need to look at. It updates the board, drops a clean summary in Slack, and flags the PRs for my review. I can step away from the keyboard, live my life, and just review their work asynchronously whenever I have time.

If a worker agent gets stuck on a failing CI check and can't figure it out after a few tries, the Scrum Master marks the ticket as BLOCKED and escalates it to me for human intervention.

## Tackling the Low-Hanging Fruit

I'm not going to pretend this is AGI. We are running heavily quantized local models, and they have bad days. If you ask a quantized Minimax model to re-architect your entire graphics pipeline from scratch, it will fail miserably.

But that is exactly why the Manager harness is so powerful.

> Can you monitor this repository for low-hanging fruit issues?
![Monitor Github issue](/images/monitor.png)


I specifically instructed my Scrum Master to scour my GitHub issues and triage them. Its job is to only pull down the "low-hanging fruit": boilerplate updates, simple regex fixes, missing test coverages, and trailing bugs that sit in a backlog for months.

For these tasks, it is incredibly effective.


It acts like the ultimate Junior Developer. It clears the brush so I can focus on the deep, architectural work.

## Running 100% Local

This entire system runs on local open-weight models. No API keys. No rate limits. No proprietary code leaking to third-party cloud servers. My coding squad and their Scrum Master live completely offline, orchestrated via [LocalAI](https://localai.io) and LocalAGI.

![LocalAGI](/images/instance.png)

For the hardware nerds wondering what it takes to run this: I am running this entire setup on a DGX Spark. Both the Scrum Master and the worker agents are powered by the Minimax model using the UD-Q2_K_XL quantization. 

Yes, it's heavily quantized, but that's the beauty of this architecture: even at Q2, the strict managerial harness keeps the agents focused and on track. 

Of course... if you have beefier hardware available, you can absolutely load up higher-precision quants for even better coding performance.

Watching local models autonomously break down epics, delegate tasks, open PRs, and nag me on Slack to review their code is amazing to see in action.

> Complex task? split it up
![Epics break down](/images/epics.png)

## A call to other Open Source maintainers

Building this autonomous dev team to help maintain LocalAI changed the game for me for three reasons:

1. **The Minimax Model is a Powerhouse:** Even running highly quantized locally, it serves as a tireless Junior SWE. It unlocks massive value by flawlessly chewing through the backlog of low-level maintenance tickets that otherwise would sit there or drain my time.

2. **The Agent Factory:** With the right tooling and harness in place, we aren't just running a script. We are building an Agent Factory that is perfectly aligned with the specific needs of OSS maintainers. It effectively clones your time of you design it well.

3. **Scaling to Multiple Teams:** This design proves that agent orchestration at scale is viable right now. Because the Scrum Master interacts with worker agents entirely asynchronously, there is no limit to how wide this can go. It allows me to scale up and control parallel teams (frontend bots, backend bots, QA testers) all humming along weekends in the background.

For the first time since LocalAI blew up, looking at the issue tracker doesn't give me anxiety. It actually feels like I have real allies in the codebase.

## Reports!

We stopped treating AI like magic autocomplete and started treating it like a distributed engineering team. It's working so well that starting from now, the agents will autonomously curate, compile, and publish their own Weekly Sprint Reports detailing what they built and where they need human help over at [reports.localai.io](https://reports.localai.io). 

They will also summarize what has been happening in LocalAI, so it offers also a great service for these that want to follow along what's going on in the project.

## A Call to the Community: Embrace Local AI

I want to encourage the open-source community to fully embrace this.

If you are maintaining a project, drowning in tickets, and burning out, spinning up an autonomous dev team is no longer sci-fi. It is here, and it works 100% locally. Minimax really changed the game.

If you want to get your own "small junior team" running locally to help maintain your codebase, and you don't know where to start, please feel free to reach out to me. I would be incredibly happy to help you set this up. Let's equip every maintainer with a fleet of tireless AI allies.

## Share Your Agents: LocalAGI AgentHub

I'm building an **AgentHub** for LocalAGI, a place to collect and share agent configurations with the community. If you've built a Scrum Master, a coder agent, or any other harness that works well, consider contributing your config so others can reuse and remix it. Drop a PR or reach out; the goal is to make it trivial to go from "I want an autonomous team" to "here's a ready-to-run setup." Watch the [LocalAGI repo](https://github.com/mudler/LocalAGI) for the AgentHub landing; I'll share the details there as it lands.

## Ripping Open the Hood

This high-level architecture is just the beginning. The real magic is in how these agents communicate without corrupting each other's memory.

In part two of this series, I'm going to share exactly how the sauce is made. I will show you how we use simple mechanisms for the Kanban board and walk you through the logic that makes this 100% crash-proof.

If you're tired of babysitting your AI and want to build a real autonomous factory, wait for the next part. Part two is going to get extremely technical.

Let me know in the comments if you've been struggling with parallel agent orchestration. I'd love to hear how you're solving it!

*(Now, if you'll excuse me, my Scrum Master is pinging me on Slack again. I have four PRs to review.)*
