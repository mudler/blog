# mudler.pm site refresh — design spec

Date: 2026-07-22
Status: approved direction — "D with E's post pages" (man page identity, technical-memo prose)

## Goal

Full visual and content refresh of mudler.pm (Hugo, GitHub Pages). The site should
represent who Ettore is *now*: creator of LocalAI, local-first AI infrastructure,
CNCF Kairos, and the C++/ggml port line — not the 2014-era link dump it is today.
All 37 existing posts and their URLs are preserved.

## Identity

The site plays it straight as a man page. The landing page is `MUDLER(1)`; lists and
chrome are man-page mono; long-form posts switch to a Bell Labs / LaTeX technical-memo
treatment (serif on paper) because 2,000 words of monospace is tiring. The site also
*behaves* like `less(1)` — keyboard-driven, see Interactivity.

Tagline decision: NAME line reads
`mudler — Ettore Di Giacinto; builds AI that runs on hardware you own`
with "Local AI is the way." appearing in DESCRIPTION as the opening sentence.

## Architecture

- Drop the `goodroot/hugo-classic` module: remove `[module]` + `theme` from
  `hugo.toml`, delete `go.mod`/`go.sum`. All layouts become local.
- Drop the `AMP` output format. Keep HTML, RSS, JSON (search index).
- Keep permalinks (`/posts/:year/:month/:day/:slug/`), taxonomies, RSS URLs — zero
  broken links.
- Plain CSS via Hugo Pipes (minify + fingerprint). No SCSS (CI pins non-extended
  Hugo 0.139.4).
- CI/Makefile/deploy untouched.

```
layouts/
  _default/baseof.html single.html list.html terms.html search.html index.json
  index.html          # MUDLER(1) landing
  projects.html       # projects(7)
  404.html            # "No manual entry for ..."
  partials/head.html header.html footer.html post-item.html keybindings.html
  shortcodes/tweet.html   # kept, used by 1 post
assets/
  css/main.css
  js/anime.esm.min.js     # vendored anime.js v4, no CDN
  js/site.js              # pager keys, theme toggle, animations
  fonts/                  # JetBrains Mono woff2 (latin), Charter fallback stack is system
data/projects.yaml        # single source of truth for projects
```

## Design system

Two themes, both designed in-world; `data-theme` on `<html>`, persisted in
localStorage, inline script before paint (no flash). Default follows the man-page
world: **paper light** is the default; dark is "man page in a dark pager".

| token   | light (paper)     | dark (pager)   |
|---------|-------------------|----------------|
| bg      | `#fdfdf8`         | `#111312`      |
| paper2 (memo bg) | `#faf7ef` | `#16181a`      |
| text    | `#191919`         | `#d6d8d4`      |
| muted   | `#666`            | `#8a8f8a`      |
| rule    | `#ddd`            | `#2a2d2b`      |
| accent (links/hover invert) | `#191919` inverted | `#d6d8d4` inverted |
| red (memo rules, sparing)   | `#8a2f1d`  | `#c96f57` |

Type:
- **JetBrains Mono** (self-hosted woff2, latin subset, ~60KB total): all man-page
  surfaces — landing, lists, nav, dates, code.
- **Charter/Georgia system serif stack**: post body prose (memo treatment). No
  webfont needed.
- Hover on links = pager selection: background/foreground inversion, instant (CSS).

## Pages

### Landing — `MUDLER(1)`
Header line `MUDLER(1) — General Commands Manual — MUDLER(1)`. Sections:
- **NAME** — tagline (above).
- **SYNOPSIS** — `mudler [--local] [--no-cloud] [--since 2008] model ...`
- **DESCRIPTION** — 2 short paragraphs: LocalAI creator, local-first AI infra,
  immutable Linux, C++/ggml ports; history line (Gentoo dev, Sabayon lead,
  SUSE/openQA/Elemental, Rancher; maintains LocalAI ecosystem + CNCF Kairos).
- **PROJECTS** — ~7 featured entries (options-table layout), from
  `data/projects.yaml` where `featured: true`; last row links to `projects(7)`.
- **POSTS** — 5 most recent, `YYYY-MM-DD  title`; link to all posts.
- **SEE ALSO** — `github(1), x(1), huggingface(1), linkedin(1), sponsor(8), rss(5)`.
- Footer line `Linux — <current month year> — MUDLER(1)` + blinking block cursor.

### Projects — `projects(7)`
Man-page layout, sections in order: CREATED (LocalAI, LocalAGI, LocalRecall,
EdgeVPN, Kairos, luet, yip, poco, golauncher, docker-companion, MCPs...), LOCALAI
ECOSYSTEM (localai-org: apex-quant, privacy-filter.cpp, LocalVQE, vibevoice.cpp,
ced.cpp, moss-transcribe.cpp, free-splatter.cpp...), GGML/C++ PORTS
(depth-anything.cpp, parakeet.cpp, locate-anything.cpp, voxtral-tts.c, vllm.cpp),
LIBRARIES & TOOLS (cogito, nib, skillserver, go-pluggable, go-llama.cpp, herd,
Mojo::IOLoop::ReadWriteProcess, Algorithm::SAT/QLearning), CONTRIBUTED TO (Gentoo,
Sabayon, openSUSE/openQA, Cloud Foundry, llama.cpp, gpt4all), MODELS (HF
fine-tunes: LocalAI-functioncall family, Minerva Italian LLMs), TALKS & PAPERS.
All driven by `data/projects.yaml` (name, url, desc, lang, stars, group, featured).
Star counts hand-maintained, rounded ("47k").

### About
~400 words, man-page voice but prose-first. Present first: LocalAI creator,
local-first AI, CNCF Kairos maintainer, @mocaccinoOS. History compressed to one
paragraph (Gentoo → Sabayon lead → SUSE openQA/Cloud Foundry/Elemental → Rancher).
Consulting: independent OSS consultant — mention Spectro Cloud once, lightly
("currently working with Spectro Cloud"); NOT in landing/chrome.
Contact + sponsor links. Photo kept. The old link dump moves to /projects.

### Post pages — technical memo
Serif prose on `paper2`, double rule at top, `MUDLER.PM — TECHNICAL MEMORANDUM — N. <n>`
tag line, title + italic byline (author · date · reading time), then body at 65ch.
`N. <n>` is the post's chronological index (Hugo can count pages). Code blocks and
inline code return to JetBrains Mono with a thin rule box. Anchored headings.
Tags as small-caps list at end; prev/next as `SEE ALSO`. Tag archive pages
(`/tags/<tag>/`) rendered in man-page list style.

### Search + 404
Search keeps the JSON index + JS, restyled as pager search (`/pattern`).
404 = `No manual entry for <path>`.

## Animation (anime.js v4, vendored)

Progressive enhancement — content fully visible without JS; JS adds `js` class
before animating; everything gated on `prefers-reduced-motion: no-preference`.

- Landing load: man-page sections stagger in (opacity + 8px translateY, ~450ms
  total, 60ms stagger). NAME line gets a one-time typewriter reveal (~600ms).
- Blinking block cursor (CSS steps animation).
- List pages: rows stagger-fade on load (fast, 30ms stagger, capped).
- Post pages: double rule draws in (scaleX), title/byline fade up.
- Pager selection moves (j/k): smooth background sweep via anime on the highlight.
- Hover inversion stays CSS-instant (no JS latency on links).

## Interactivity — the site behaves like less(1)

One small vanilla-JS file (`site.js`, ESM, imports vendored anime.js):

- `j` / `k` — move selection through the page's list items (posts, projects);
  selected row rendered as inverted pager line. `Enter` opens.
- `g` / `G` — scroll top / bottom.
- `/` — jump to search (focus inline search on search-capable pages, else navigate
  to /search/).
- `?` — toggle KEY BINDINGS overlay, itself styled as a man-page section.
- `q` — go home (no-op on home).
- `t` — toggle theme (plus a visible `☀/☾` control in the nav for mouse users).
- Status line fixed at bottom on man-page surfaces:
  `Manual page mudler(1) line N (press ? for help)` — line number tracks scroll.
- Keys disabled while any input/textarea focused. No key hijacking beyond these.

## Content updates

- `content/_index.md` — replaced by landing layout data (headless).
- `content/about.md` — rewritten per above.
- `content/projects.md` — new page fronting `projects.html` layout.
- `data/projects.yaml` — populated from GitHub research (2026-07-22 numbers).
- `hugo.toml` — menus: blog, projects, about, search; footer links unchanged;
  remove module import; remove AMP.

## Verification

- `hugo --gc --minify` builds clean with no module fetch.
- Spot-render representative posts (oldest Sabayon-era, tweet-shortcode post,
  newest) — no layout breakage.
- Both themes readable; toggle persists; no flash-of-wrong-theme.
- Built HTML has zero external requests (fonts, JS all local).
- All pre-existing URLs unchanged (posts, RSS, search).
- Keyboard map works; site fully usable with JS disabled.

## Out of scope

Phase 2 (separate spec): writing-style skill mined from the 37 posts, to live in
`~/_git/skills/`.
