# mudler.pm Site Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild mudler.pm as a man-page-styled site (`MUDLER(1)` landing, `less(1)` keyboard behavior, technical-memo post pages) with local layouts, no theme module, and updated About/Projects content.

**Architecture:** Hugo static site on GitHub Pages. The `goodroot/hugo-classic` module is removed and replaced by local layouts. All third-party assets (JetBrains Mono, anime.js v4, fuse.js, mark.js) are vendored — the built site makes zero external requests. Content/URLs of all 37 posts are unchanged.

**Tech Stack:** Hugo 0.139.4 extended (auto-downloaded to `./bin/hugo` by `make build`), plain CSS via Hugo Pipes, vanilla ES modules bundled with `js.Build` (esbuild), anime.js v4.

**Spec:** `docs/superpowers/specs/2026-07-22-site-refresh-design.md`

## Global Constraints

- Zero external requests in built HTML: no CDN scripts, no webfont URLs, no analytics.
- All existing URLs preserved: permalinks `/posts/:year/:month/:day/:slug/`, `/about/`, `/search/`, `/index.xml`, `/index.json`, taxonomies (`blog`, `tags`, `series`).
- Site fully usable with JS disabled; all animation gated on `prefers-reduced-motion: no-preference`.
- Default theme is paper (light); dark = "man page in a dark pager"; toggle persisted in `localStorage` key `theme`; no flash of wrong theme.
- Build command: `make build` (uses `./bin/hugo`; downloads it on first run). Never edit `Makefile`, `scripts/`, or `.github/`.
- Spectro Cloud is mentioned exactly once, in About, as "currently working with [Spectro Cloud](https://www.spectrocloud.com/)" — never in landing or chrome.
- Commit after every task with the trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Vendor third-party assets

**Files:**
- Create: `static/fonts/jetbrains-mono-latin-400.woff2`, `static/fonts/jetbrains-mono-latin-700.woff2`
- Create: `assets/js/vendor/anime.esm.min.js`
- Create: `static/js/vendor/fuse.min.js`, `static/js/vendor/mark.min.js`

**Interfaces:**
- Produces: font files referenced by `@font-face` in Task 2's CSS as `/fonts/jetbrains-mono-latin-{400,700}.woff2`; anime.js imported by Task 8's `assets/js/site.js` via `import { animate, stagger } from './vendor/anime.esm.min.js'`; fuse/mark referenced by Task 2's `search.html` as `/js/vendor/fuse.min.js` and `/js/vendor/mark.min.js`.

- [ ] **Step 1: Download the assets**

```bash
cd /home/mudler/_git/blog
mkdir -p static/fonts assets/js/vendor static/js/vendor
curl -fsSL -o static/fonts/jetbrains-mono-latin-400.woff2 \
  "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.woff2"
curl -fsSL -o static/fonts/jetbrains-mono-latin-700.woff2 \
  "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-700-normal.woff2"
curl -fsSL -o assets/js/vendor/anime.esm.min.js \
  "https://cdn.jsdelivr.net/npm/animejs@4/lib/anime.esm.min.js"
curl -fsSL -o static/js/vendor/fuse.min.js \
  "https://cdnjs.cloudflare.com/ajax/libs/fuse.js/3.4.5/fuse.min.js"
curl -fsSL -o static/js/vendor/mark.min.js \
  "https://cdnjs.cloudflare.com/ajax/libs/mark.js/8.11.1/mark.min.js"
```

If the anime.js URL 404s, fall back to the jsdelivr ESM bundle and strip its sourcemap pointer:

```bash
curl -fsSL -o assets/js/vendor/anime.esm.min.js "https://cdn.jsdelivr.net/npm/animejs@4/+esm"
sed -i '/^\/\/# sourceMappingURL=/d' assets/js/vendor/anime.esm.min.js
```

- [ ] **Step 2: Verify the downloads**

```bash
file static/fonts/*.woff2                      # both: "Web Open Font Format (Version 2)"
grep -c "export" assets/js/vendor/anime.esm.min.js   # >= 1
grep -q "animate" assets/js/vendor/anime.esm.min.js && echo anime-ok
head -c 100 static/js/vendor/fuse.min.js       # starts with a JS comment/banner
head -c 100 static/js/vendor/mark.min.js
```

Expected: woff2 magic present, `anime-ok`, both JS files non-empty. If `animate` is not an export name, inspect `grep -o 'export{[^}]*}' assets/js/vendor/anime.esm.min.js` and note the actual exported name for `animate`/`stagger` — Task 8 imports must match.

- [ ] **Step 3: Commit**

```bash
git add static/fonts static/js/vendor assets/js/vendor
git commit -m "Vendor JetBrains Mono, anime.js v4, fuse.js, mark.js

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Replace the theme with local layouts (man-page core)

This is the atomic theme swap: after this task the site builds with local layouts only and looks like a man page (landing gets its full layout in Task 4; posts get the memo treatment in Task 6 — in this task they render through a plain fallback).

**Files:**
- Modify: `hugo.toml` (full rewrite below)
- Delete: `go.mod`, `go.sum`, `layouts/partials/menu.html`, `content/search/_index.md`
- Create: `layouts/_default/baseof.html`, `layouts/_default/single.html`, `layouts/_default/list.html`, `layouts/404.html`
- Create: `layouts/partials/head.html`, `layouts/partials/header.html`, `layouts/partials/footer.html`, `layouts/partials/post-item.html`
- Modify: `layouts/_default/search.html` (full rewrite below)
- Create: `assets/css/main.css`
- Keep untouched: `layouts/_default/index.json`, `layouts/shortcodes/tweet.html`, `assets/js/search.js`

**Interfaces:**
- Produces: CSS classes used by all later tasks — `.man-page`, `.manhead`, `.man-sec`, `h2.sec`, `.ind`, `.opt`, `.post-rows`/`.post-row` + `data-pager` attr, `.dt`, `.cursor`, `.site-nav`, `.theme-toggle` (id `theme-toggle`), `.status-line` (id `status-line`), `.site-footer`. Base tokens: `--bg --bg2 --text --muted --rule --red --sel-bg --sel-fg --mono --serif` with `data-theme` overrides.
- Produces: `baseof.html` with `{{ block "main" . }}`; every later layout defines `main` only.

- [ ] **Step 1: Rewrite `hugo.toml`** (complete file — replaces the old one):

```toml
baseurl      = "https://mudler.pm"
title        = "mudler.pm"
languageCode = "en-us"
enableEmoji  = true
ignoreFiles  = ["\\.Rmd$", "_files$", "_cache$"]

[pagination]
pagerSize = 100

[outputs]
home = ["HTML", "RSS", "JSON"]
page = ["HTML"]

[markup.goldmark.renderer]
unsafe = true

[markup.highlight]
codeFences  = true
guessSyntax = false
lineNos     = false
noClasses   = false

[permalinks]
posts = "/posts/:year/:month/:day/:slug/"

[taxonomies]
category = "blog"
tag      = "tags"
series   = "series"

[[menu.main]]
identifier = "blog"
name       = "blog"
url        = "/posts/"
weight     = 1

[[menu.main]]
identifier = "projects"
name       = "projects"
url        = "/projects/"
weight     = 2

[[menu.main]]
identifier = "about"
name       = "about"
url        = "/about/"
weight     = 3

[[menu.main]]
identifier = "search"
name       = "search"
url        = "/search/"
weight     = 4

[languages.en]
title     = "mudler.pm"
copyright = '<a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener">CC BY-NC 4.0</a>'

[params]
description = "Ettore Di Giacinto (mudler) — creator of LocalAI. Local AI is the way."
```

Note: `noClasses = false` switches syntax highlighting to CSS classes so both themes can restyle code (palette lives in `main.css`). AMP output and the theme module are gone.

- [ ] **Step 2: Delete module files and stale files**

```bash
git rm -q go.mod go.sum layouts/partials/menu.html content/search/_index.md
```

(`content/search.md` remains — it is the page that renders `/search/`; the `_index.md` duplicate shadowed it.)

- [ ] **Step 3: Create `layouts/_default/baseof.html`**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
{{ partial "head.html" . }}
</head>
<body>
{{ partial "header.html" . }}
<main id="main">
{{ block "main" . }}{{ end }}
</main>
{{ partial "footer.html" . }}
<div class="status-line" id="status-line" aria-hidden="true">Manual page mudler(1) (press ? for help)</div>
</body>
</html>
```

- [ ] **Step 4: Create `layouts/partials/head.html`**:

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{ if .IsHome }}{{ site.Title }} — General Commands Manual{{ else }}{{ .Title }} — {{ site.Title }}{{ end }}</title>
<meta name="description" content="{{ with .Description }}{{ . }}{{ else }}{{ site.Params.description }}{{ end }}">
<link rel="alternate" type="application/rss+xml" title="{{ site.Title }}" href="{{ "index.xml" | absURL }}">
<script>(function(){try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})();</script>
{{ $css := resources.Get "css/main.css" | minify | fingerprint }}
<link rel="stylesheet" href="{{ $css.RelPermalink }}">
```

(No JS include yet — `site.js` arrives in Task 8 and this partial gains two lines then.)

- [ ] **Step 5: Create `layouts/partials/header.html`**:

```html
<nav class="site-nav" aria-label="Site">
  <a class="brand" href="/">mudler.pm</a>
  <span class="nav-links">{{ range site.Menus.main }}<a href="{{ .URL }}">{{ .Name }}</a>{{ end }}<button id="theme-toggle" class="theme-toggle" aria-label="Toggle color scheme" title="Toggle theme [t]">☾</button></span>
</nav>
```

- [ ] **Step 6: Create `layouts/partials/footer.html`**:

```html
<footer class="site-footer">
  <div class="man-footline"><span>Linux</span><span>{{ now.Format "January 2006" }}</span><span>MUDLER(1)<span class="cursor" aria-hidden="true">▊</span></span></div>
  <div class="footlinks">
    <a href="https://github.com/mudler">github</a> ·
    <a href="https://twitter.com/mudler_it">x</a> ·
    <a href="https://huggingface.co/mudler">huggingface</a> ·
    <a href="https://www.linkedin.com/in/ettore-di-giacinto-211a4166/">linkedin</a> ·
    <a href="https://github.com/sponsors/mudler">sponsor</a> ·
    <a href="/index.xml">rss</a> ·
    {{ site.Copyright | safeHTML }}
  </div>
</footer>
```

- [ ] **Step 7: Create `layouts/partials/post-item.html`**:

```html
<li class="post-row"><span class="dt">{{ .Date.Format "2006-01-02" }}</span><a href="{{ .RelPermalink }}">{{ .Title }}</a></li>
```

- [ ] **Step 8: Create `layouts/_default/list.html`** (sections, taxonomy term pages, and — until Task 4 — the temporary home fallback is NOT needed since home has its own template then; Hugo uses embedded home fallback meanwhile, which is fine for one interim build):

```html
{{ define "main" }}
<div class="man-page">
  <div class="manhead"><span>{{ upper .Title }}(7)</span><span>{{ site.Title }} Manual</span><span>{{ upper .Title }}(7)</span></div>
  <ul class="post-rows" data-pager>
    {{ range .Pages.ByDate.Reverse }}{{ partial "post-item.html" . }}{{ end }}
  </ul>
</div>
{{ end }}
```

- [ ] **Step 9: Create `layouts/_default/single.html`** (plain man-page prose; posts get the memo override in Task 6):

```html
{{ define "main" }}
<article class="man-page prose">
  {{ if not .Params.hideTitle }}<h1>{{ .Title }}</h1>{{ end }}
  {{ .Content }}
</article>
{{ end }}
```

- [ ] **Step 10: Create `layouts/404.html`**:

```html
{{ define "main" }}
<div class="man-page">
  <p class="man-404">No manual entry for <span id="miss-path">this page</span></p>
  <p><a href="/">See mudler(1)</a></p>
  <script>var m=document.getElementById("miss-path");if(m)m.textContent=location.pathname;</script>
</div>
{{ end }}
```

- [ ] **Step 11: Rewrite `layouts/_default/search.html`** (complete file — now uses baseof and vendored JS; the result template and element ids are unchanged so `assets/js/search.js` keeps working):

```html
{{ define "main" }}
<div class="man-page search-page">
  <div class="manhead"><span>SEARCH(1)</span><span>{{ site.Title }} Manual</span><span>SEARCH(1)</span></div>
  <p class="search-intro">Search the manual, as if at the <code>less</code> prompt.</p>
  <form action="{{ .Permalink }}" method="GET" class="search-form" role="search">
    <label for="search-query" class="search-prompt" aria-hidden="true">/</label>
    <label for="search-query" class="visually-hidden">Search</label>
    <input type="search" name="q" id="search-query" placeholder="pattern" class="search-input" autofocus>
    <button type="submit" class="search-button">search</button>
  </form>
  <div id="search-results"></div>
  <div class="search-loading" style="display:none;">Loading…</div>
  <script id="search-result-template" type="text/x-js-template">
  <div id="summary-${key}" class="search-result-item">
      <h3><a href="${link}">${title}</a></h3>
      <p class="search-snippet">${snippet}</p>
      <p class="search-meta"><small>${ isset tags }Tags: ${tags}${ end }</small></p>
  </div>
  </script>
  <script src="/js/vendor/fuse.min.js"></script>
  <script src="/js/vendor/mark.min.js"></script>
  {{ $script := resources.Get "js/search.js" | minify | fingerprint }}
  <script src="{{ $script.RelPermalink }}"></script>
</div>
{{ end }}
```

- [ ] **Step 12: Create `assets/css/main.css`** (complete file):

```css
/* ============================================================
   mudler.pm — MUDLER(1)
   Man-page identity; technical-memo prose; less(1) behavior.
   ============================================================ */

/* ---------- tokens ---------- */
:root {
  --bg: #fdfdf8;        /* paper */
  --bg2: #faf7ef;       /* memo paper */
  --text: #191919;
  --muted: #666660;
  --rule: #ddd9cc;
  --red: #8a2f1d;
  --sel-bg: #191919;    /* pager selection = inversion */
  --sel-fg: #fdfdf8;
  --code-bg: #f3f1e8;
  --code-comment: #8a8a7a;
  --code-kw: #8a2f1d;
  --code-str: #3a6a4a;
  --code-num: #7a5a1a;
  --code-fn: #1a4a7a;
  --mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --serif: Charter, "Bitstream Charter", Georgia, "Times New Roman", serif;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #111312; --bg2: #16181a; --text: #d6d8d4; --muted: #8a8f8a;
    --rule: #2a2d2b; --red: #c96f57; --sel-bg: #d6d8d4; --sel-fg: #111312;
    --code-bg: #1b1e1c; --code-comment: #757d75; --code-kw: #c96f57;
    --code-str: #8fb996; --code-num: #c9a86a; --code-fn: #7ea6c9;
  }
}
:root[data-theme="dark"] {
  --bg: #111312; --bg2: #16181a; --text: #d6d8d4; --muted: #8a8f8a;
  --rule: #2a2d2b; --red: #c96f57; --sel-bg: #d6d8d4; --sel-fg: #111312;
  --code-bg: #1b1e1c; --code-comment: #757d75; --code-kw: #c96f57;
  --code-str: #8fb996; --code-num: #c9a86a; --code-fn: #7ea6c9;
}
:root[data-theme="light"] {
  --bg: #fdfdf8; --bg2: #faf7ef; --text: #191919; --muted: #666660;
  --rule: #ddd9cc; --red: #8a2f1d; --sel-bg: #191919; --sel-fg: #fdfdf8;
  --code-bg: #f3f1e8; --code-comment: #8a8a7a; --code-kw: #8a2f1d;
  --code-str: #3a6a4a; --code-num: #7a5a1a; --code-fn: #1a4a7a;
}

/* ---------- fonts ---------- */
@font-face {
  font-family: "JetBrains Mono";
  src: url("/fonts/jetbrains-mono-latin-400.woff2") format("woff2");
  font-weight: 400; font-style: normal; font-display: swap;
}
@font-face {
  font-family: "JetBrains Mono";
  src: url("/fonts/jetbrains-mono-latin-700.woff2") format("woff2");
  font-weight: 700; font-style: normal; font-display: swap;
}

/* ---------- base ---------- */
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--mono);
  font-size: 0.9rem;
  line-height: 1.7;
}
a { color: inherit; text-decoration: underline; text-decoration-color: var(--rule); text-underline-offset: 3px; }
a:hover { background: var(--sel-bg); color: var(--sel-fg); text-decoration: none; }
img { max-width: 100%; height: auto; }
::selection { background: var(--sel-bg); color: var(--sel-fg); }

/* ---------- nav ---------- */
.site-nav {
  display: flex; justify-content: space-between; align-items: baseline;
  flex-wrap: wrap; gap: 0.5rem 1.5rem;
  max-width: 80ch; margin: 0 auto; padding: 1.1rem 1.25rem 0;
}
.site-nav .brand { font-weight: 700; text-decoration: none; }
.site-nav .nav-links { display: inline-flex; gap: 1.25rem; align-items: baseline; }
.site-nav a { text-decoration: none; }
.theme-toggle {
  display: none;
  font: inherit; color: var(--muted); background: none; border: none;
  cursor: pointer; padding: 0 0.25rem;
}
.theme-toggle:hover { background: var(--sel-bg); color: var(--sel-fg); }
html.js .theme-toggle { display: inline; }

/* ---------- man page scaffold ---------- */
.man-page { max-width: 80ch; margin: 0 auto; padding: 1.75rem 1.25rem 3rem; }
.manhead { display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 2rem; gap: 1rem; }
.manhead span:nth-child(2) { text-align: center; }
.man-sec { margin-bottom: 0.5rem; }
h2.sec, .man-page h1, .man-page h2 {
  font-size: 0.9rem; font-weight: 700; letter-spacing: 0.02em;
  margin: 1.6rem 0 0.35rem; text-transform: uppercase;
}
.ind { padding-left: 2.5rem; }
.ind p { margin: 0 0 0.7rem; max-width: 62ch; }
.man-page .prose p, .prose p { max-width: 68ch; }
@media (max-width: 600px) { .ind { padding-left: 1.1rem; } }

/* options-table rows (PROJECTS, KEY BINDINGS) */
.opt { display: grid; grid-template-columns: 13rem 1fr; gap: 0 1.5rem; margin-bottom: 0.55rem; max-width: 66ch; }
.opt b a { text-decoration: none; }
.opt i { color: var(--muted); }
@media (max-width: 600px) { .opt { grid-template-columns: 1fr; } .opt span { padding-left: 1.1rem; } }

/* post/list rows — pager targets */
.post-rows { list-style: none; margin: 0.4rem 0 0; padding: 0; }
.post-row {
  display: grid; grid-template-columns: 7.5rem 1fr; gap: 0 1.25rem;
  padding: 0.3rem 0.4rem; margin: 0 -0.4rem;
  transition: background 0.12s, color 0.12s;
}
.post-row .dt { color: var(--muted); font-variant-numeric: tabular-nums; }
.post-row a { text-decoration: none; }
.post-row a:hover { background: none; color: inherit; text-decoration: underline; }
.post-row.pager-selected { background: var(--sel-bg); color: var(--sel-fg); }
.post-row.pager-selected .dt { color: var(--sel-fg); }
@media (max-width: 600px) { .post-row { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { .post-row { transition: none; } }

/* blinking cursor */
.cursor { margin-left: 0.35rem; animation: blink 1.1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .cursor { animation: none; } }

/* ---------- generic prose (about, legacy fallback) ---------- */
.prose h1 { margin-top: 0; }
.prose blockquote { border-left: 3px solid var(--rule); margin: 1.25rem 0; padding: 0.2rem 1.25rem; color: var(--muted); }
.prose ul, .prose ol { padding-left: 2rem; }
.prose li { margin-bottom: 0.25rem; }
.prose table { border-collapse: collapse; }
.prose th, .prose td { border: 1px solid var(--rule); padding: 0.3rem 0.7rem; }

/* ---------- code ---------- */
code {
  font-family: var(--mono); font-size: 0.92em;
  background: var(--code-bg); padding: 0.1em 0.35em; border-radius: 2px;
}
pre {
  background: var(--code-bg); border: 1px solid var(--rule);
  padding: 0.9rem 1.1rem; overflow-x: auto; line-height: 1.55;
}
pre code { background: none; padding: 0; font-size: 0.85rem; }
.highlight { margin: 1.25rem 0; }
/* chroma palette (classes; both themes via tokens) */
.chroma .c, .chroma .c1, .chroma .cm, .chroma .ch { color: var(--code-comment); font-style: italic; }
.chroma .k, .chroma .kd, .chroma .kn, .chroma .kr, .chroma .kt, .chroma .kc { color: var(--code-kw); }
.chroma .s, .chroma .s1, .chroma .s2, .chroma .sb, .chroma .sx { color: var(--code-str); }
.chroma .m, .chroma .mi, .chroma .mf, .chroma .mh { color: var(--code-num); }
.chroma .nf, .chroma .fm { color: var(--code-fn); }

/* ---------- footer + status line ---------- */
.site-footer { max-width: 80ch; margin: 0 auto; padding: 0 1.25rem 3rem; }
.man-footline {
  display: flex; justify-content: space-between; font-weight: 700;
  border-top: 1px solid var(--rule); padding-top: 0.8rem; gap: 1rem;
}
.footlinks { margin-top: 0.6rem; font-size: 0.78rem; color: var(--muted); }
.footlinks a { color: var(--muted); }
.status-line {
  display: none;
  position: fixed; left: 0; right: 0; bottom: 0;
  background: var(--sel-bg); color: var(--sel-fg);
  font-family: var(--mono); font-size: 0.75rem;
  padding: 0.15rem 1.25rem;
}
html.js .status-line { display: block; }
html.js body { padding-bottom: 2rem; }

/* ---------- 404 ---------- */
.man-404 { font-weight: 700; }

/* ---------- search ---------- */
.search-form { display: flex; align-items: baseline; gap: 0.6rem; margin: 1.25rem 0 1.75rem; max-width: 34rem; }
.search-prompt { font-weight: 700; }
.search-input {
  flex: 1; font: inherit; color: inherit;
  background: var(--bg); border: 1px solid var(--rule); border-radius: 0;
  padding: 0.35rem 0.6rem;
}
.search-input:focus { outline: 2px solid var(--text); outline-offset: -1px; }
.search-button {
  font: inherit; font-weight: 700; cursor: pointer;
  color: var(--text); background: var(--bg); border: 1px solid var(--text);
  padding: 0.35rem 0.9rem;
}
.search-button:hover { background: var(--sel-bg); color: var(--sel-fg); }
.search-intro, .search-results-empty { color: var(--muted); }
.search-result-item { margin: 1.25rem 0; border-bottom: 1px solid var(--rule); padding-bottom: 1rem; }
.search-result-item h3 { margin: 0 0 0.25rem; font-size: 0.9rem; text-transform: none; }
.search-snippet { color: var(--muted); margin: 0.2rem 0; }
.search-snippet mark { background: var(--sel-bg); color: var(--sel-fg); }
.search-meta { margin: 0.2rem 0 0; }
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

/* ---------- keyboard focus ---------- */
a:focus-visible, button:focus-visible, input:focus-visible {
  outline: 2px solid var(--text); outline-offset: 1px;
}
```

- [ ] **Step 13: Build and verify**

```bash
make build
```
Expected: exits 0, no "found no layout" warnings for single/list/search pages (a warning for the *home* page HTML is acceptable in this task only — the home template lands in Task 4; if Hugo errors instead of warning, create a one-line placeholder `layouts/index.html` containing `{{ define "main" }}{{ end }}` and note it gets replaced in Task 4).

```bash
grep -rL "cdnjs\|cdn.jsdelivr\|googleapis\|gstatic" public/search/index.html && echo no-cdn
grep -q "jetbrains-mono-latin-400" public/css/*.css || grep -rq "jetbrains-mono-latin-400" public/ && echo font-ok
test -f public/posts/index.html && echo posts-list-ok
grep -q "General Commands Manual\|man-page" public/about/index.html && echo about-renders
grep -q "2023/04" public/sitemap.xml && echo old-urls-ok
```
Expected: `no-cdn`, `font-ok`, `posts-list-ok`, `about-renders`, `old-urls-ok`.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "Replace hugo-classic module with local man-page layouts

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Project data file

**Files:**
- Create: `data/projects.yaml`

**Interfaces:**
- Produces: `site.Data.projects.groups` — list of `{name, items: [{name, url, desc, meta, featured}]}`. `meta` is a display string (lang · license/org · rounded stars). Task 4 filters `featured`; Task 5 renders all groups in order.

- [ ] **Step 1: Create `data/projects.yaml`** (complete file; star counts are rounded 2026-07 figures, hand-maintained):

```yaml
# Single source of truth for /projects/ and the landing PROJECTS section.
# meta is a free-form display string; stars are rounded on purpose.
groups:
  - name: Created
    items:
      - name: LocalAI
        url: https://github.com/mudler/LocalAI
        desc: Open-source AI engine — LLMs, vision, voice, image and video on any hardware, no GPU required.
        meta: Go · MIT · 47k stars
        featured: true
      - name: LocalAGI
        url: https://github.com/mudler/LocalAGI
        desc: Self-hostable AI agent platform; drop-in replacement for the OpenAI Responses API.
        meta: Go · 1.8k stars
        featured: true
      - name: LocalRecall
        url: https://github.com/mudler/LocalRecall
        desc: 100% local memory layer and knowledge base for agents, with a web UI.
        meta: Go · 900+ stars
        featured: true
      - name: EdgeVPN
        url: https://github.com/mudler/edgevpn
        desc: Decentralized peer-to-peer VPN built on libp2p — no central server, token-based discovery.
        meta: Go · 1.9k stars
        featured: true
      - name: Kairos
        url: https://github.com/kairos-io/kairos
        desc: Immutable Linux meta-distribution for edge Kubernetes. Donated to the CNCF.
        meta: Go · CNCF · 1.7k stars
        featured: true
      - name: luet
        url: https://github.com/mudler/luet
        desc: Zero-dependency container-based package manager using SAT solving and QLearning.
        meta: Go · 300 stars
      - name: yip
        url: https://github.com/mudler/yip
        desc: YAML instructions processor — a lightweight cloud-init alternative.
        meta: Go
      - name: poco
        url: https://github.com/mudler/poco
        desc: Portable containers — turn container images into static, daemonless binaries.
        meta: Go
      - name: golauncher
        url: https://github.com/mudler/golauncher
        desc: Extensible application launcher and window switcher in under 300 lines of Go.
        meta: Go
      - name: docker-companion
        url: https://github.com/mudler/docker-companion
        desc: Squash and unpack Docker images, in Go.
        meta: Go
      - name: entities
        url: https://github.com/mudler/entities
        desc: Declarative modern identity manager for UNIX systems.
        meta: Go
      - name: MCPs
        url: https://github.com/mudler/MCPs
        desc: Personal MCP servers used with LocalAI.
        meta: Go

  - name: LocalAI ecosystem
    items:
      - name: apex-quant
        url: https://github.com/localai-org/apex-quant
        desc: Adaptive precision for expert models — MoE-aware mixed-precision quantization.
        meta: localai-org · 400 stars
      - name: privacy-filter.cpp
        url: https://github.com/localai-org/privacy-filter.cpp
        desc: OpenAI's privacy-filter NER model in a minimal C++/ggml runtime.
        meta: C++ · localai-org
      - name: LocalVQE
        url: https://github.com/localai-org/LocalVQE
        desc: Neural real-time acoustic echo cancellation — ggml and PyTorch inference.
        meta: C++ · localai-org
      - name: vibevoice.cpp
        url: https://github.com/localai-org/vibevoice.cpp
        desc: C++ port of Microsoft VibeVoice on ggml.
        meta: C++ · localai-org
      - name: ced.cpp
        url: https://github.com/localai-org/ced.cpp
        desc: ggml port of the CED audio-tagging model.
        meta: C++ · localai-org
      - name: moss-transcribe.cpp
        url: https://github.com/localai-org/moss-transcribe.cpp
        desc: C++17 port of OpenMOSS MOSS-Transcribe-Diarize.
        meta: C++ · localai-org
      - name: free-splatter.cpp
        url: https://github.com/localai-org/free-splatter.cpp
        desc: ggml port of FreeSplatter pose-free Gaussian splatting.
        meta: C++ · localai-org
      - name: rf-detr.cpp
        url: https://github.com/localai-org/rf-detr.cpp
        desc: RT-DETR object detection in C++ with ggml.
        meta: C++ · localai-org
      - name: voice-detect.cpp
        url: https://github.com/localai-org/voice-detect.cpp
        desc: C++17 speaker recognition and voice analysis engine.
        meta: C++ · localai-org

  - name: ggml / C++ ports
    items:
      - name: depth-anything.cpp
        url: https://github.com/mudler/depth-anything.cpp
        desc: From-scratch C++17/ggml port of ByteDance's Depth Anything 3. No Python at inference.
        meta: C++ · 800+ stars
        featured: true
      - name: parakeet.cpp
        url: https://github.com/mudler/parakeet.cpp
        desc: NVIDIA Parakeet ASR in C++ with ggml.
        meta: C++ · 700+ stars
        featured: true
      - name: locate-anything.cpp
        url: https://github.com/mudler/locate-anything.cpp
        desc: NVIDIA LocateAnything-3B ported to ggml.
        meta: C++ · 350+ stars
      - name: voxtral-tts.c
        url: https://github.com/mudler/voxtral-tts.c
        desc: Pure C implementation of Voxtral-4B-TTS.
        meta: C
      - name: vllm.cpp
        url: https://github.com/mudler/vllm.cpp
        desc: Community 1:1 vLLM port in C++.
        meta: C++ · active

  - name: Libraries & tools
    items:
      - name: cogito
        url: https://github.com/mudler/cogito
        desc: Go library for co-operative agentic software, tuned for small OSS models.
        meta: Go
      - name: nib
        url: https://github.com/mudler/nib
        desc: Zero-dependency terminal LLM agent harness — a single static binary.
        meta: Go
      - name: skillserver
        url: https://github.com/mudler/skillserver
        desc: Create, manage and share skills between agents.
        meta: Go
      - name: go-llama.cpp
        url: https://github.com/go-skynet/go-llama.cpp
        desc: The original Go bindings for llama.cpp.
        meta: go-skynet · 900+ stars
      - name: go-pluggable
        url: https://github.com/mudler/go-pluggable
        desc: Light bus-event driven plugin library for Golang.
        meta: Go
      - name: herd
        url: https://github.com/spectrocloud-labs/herd
        desc: An embeddable runnable DAG for Go.
        meta: Go
      - name: Mojo::IOLoop::ReadWriteProcess
        url: https://github.com/openSUSE/Mojo-IOLoop-ReadWriteProcess
        desc: Perl process management library, donated to openSUSE.
        meta: Perl
      - name: Algorithm::SAT & Algorithm::QLearning
        url: https://metacpan.org/dist/Algorithm-SAT-Backtracking
        desc: SAT solving and Q-learning on CPAN.
        meta: Perl

  - name: Contributed to
    items:
      - name: Gentoo Linux
        url: https://gentoo.org
        desc: Gentoo developer — genkernel-next, MATE maintainer.
      - name: Sabayon Linux
        url: https://github.com/Sabayon
        desc: Lead developer of the distribution and its community repositories.
      - name: openSUSE / openQA
        url: https://open.qa
        desc: Rewrote the openQA scheduler and its process-management layer at SUSE.
      - name: Cloud Foundry
        url: https://cloudfoundry.org
        desc: KubeCF and Quarks-operator work at SUSE; EiriniX extensions.
      - name: llama.cpp
        url: https://github.com/ggerganov/llama.cpp
        desc: Created the Go bindings; assorted fixes.
      - name: gpt4all
        url: https://github.com/nomic-ai/gpt4all
        desc: Contributed the Golang bindings.

  - name: Models
    items:
      - name: LocalAI function-call fine-tunes
        url: https://huggingface.co/mudler
        desc: Function-calling fine-tune family — llama3.2 1b/3b, phi-4, qwen2.5-7b, llama3-8b.
        meta: Hugging Face
      - name: Italian LLMs
        url: https://huggingface.co/mudler/Minerva-3B-Llama3-Instruct-v0.1
        desc: Minerva-3B instruct tunes (Minerva-3B-Llama3-Instruct, Asinello-Minerva).
        meta: Hugging Face

  - name: Talks & papers
    items:
      - name: Secure Edge-Native Architecture (with Intel)
        url: https://github.com/kairos-io/kairos/files/11250843/Secure-Edge-Native-Architecture-white-paper-20240417.3.pdf
        desc: Whitepaper on trusted boot and secure edge with Kairos.
      - name: Livin' Kubernetes on the (Immutable) Edge
        url: https://thenewstack.io/livin-kubernetes-on-the-immutable-edge-with-kairos-project/
        desc: The New Stack, on Kairos.
      - name: Trusted Boot at the Edge
        url: https://thenewstack.io/honey-i-secured-your-boot-edge-trusted-boot-with-kairos/
        desc: The New Stack, on securing devices at the edge.
      - name: LocalAI meets k8sgpt
        url: https://www.youtube.com/watch?v=PKrDNuJ_dfE
        desc: CNCF talk.
      - name: Building immutable Linux derivatives with cOS
        url: https://www.youtube.com/watch?v=4MLo3wWSoQo
        desc: Conference talk on the Elemental toolkit lineage.
```

- [ ] **Step 2: Verify it parses** — data files are validated at build time:

```bash
make build && echo yaml-ok
```

- [ ] **Step 3: Commit**

```bash
git add data/projects.yaml
git commit -m "Add projects data file

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Landing page — MUDLER(1)

**Files:**
- Create: `layouts/index.html` (replace placeholder if Task 2 created one)
- Modify: `content/_index.md`

**Interfaces:**
- Consumes: `site.Data.projects.groups[].items[].featured`, partial `post-item.html`, classes from Task 2.
- Produces: `.typewriter` span (Task 9 animates it), `.man-sec` sections (Task 9 staggers them), `[data-pager]` post list (Task 8 navigates it).

- [ ] **Step 1: Replace `content/_index.md`** (complete file):

```markdown
---
title: "mudler.pm"
---
```

- [ ] **Step 2: Create `layouts/index.html`** (complete file):

```html
{{ define "main" }}
<article class="man-page home">
  <div class="manhead"><span>MUDLER(1)</span><span>General Commands Manual</span><span>MUDLER(1)</span></div>

  <section class="man-sec">
    <h2 class="sec">NAME</h2>
    <div class="ind"><p><span class="typewriter"><b>mudler</b> — Ettore Di Giacinto; builds AI that runs on hardware you own</span></p></div>
  </section>

  <section class="man-sec">
    <h2 class="sec">SYNOPSIS</h2>
    <div class="ind"><p><b>mudler</b> [<b>--local</b>] [<b>--no-cloud</b>] [<b>--since</b> <i>2008</i>] <i>model</i> ...</p></div>
  </section>

  <section class="man-sec">
    <h2 class="sec">DESCRIPTION</h2>
    <div class="ind">
      <p>Local AI is the way. Creator of <a href="https://localai.io"><b>LocalAI</b></a>. Builds local-first AI infrastructure, immutable Linux, and from-scratch C++/ggml ports of models that were never meant to leave Python.</p>
      <p>Formerly: Gentoo developer, Sabayon lead, SUSE (openQA, Elemental), Rancher. Currently maintains the LocalAI ecosystem and CNCF Kairos.</p>
    </div>
  </section>

  <section class="man-sec">
    <h2 class="sec">PROJECTS</h2>
    <div class="ind">
      {{ range site.Data.projects.groups }}{{ range .items }}{{ if .featured }}
      <div class="opt"><b><a href="{{ .url }}">{{ .name }}</a></b><span>{{ .desc }}{{ with .meta }} <i>({{ . }})</i>{{ end }}</span></div>
      {{ end }}{{ end }}{{ end }}
      <div class="opt"><b>...</b><span><a href="/projects/"><i>see projects(7) for the full list</i></a></span></div>
    </div>
  </section>

  <section class="man-sec">
    <h2 class="sec">POSTS</h2>
    <div class="ind">
      <ul class="post-rows" data-pager>
        {{ range first 5 (where site.RegularPages "Section" "posts") }}{{ partial "post-item.html" . }}{{ end }}
      </ul>
      <p style="margin-top:0.7rem"><a href="/posts/"><i>all posts →</i></a></p>
    </div>
  </section>

  <section class="man-sec">
    <h2 class="sec">SEE ALSO</h2>
    <div class="ind"><p>
      <a href="https://github.com/mudler"><b>github</b>(1)</a>,
      <a href="https://twitter.com/mudler_it"><b>x</b>(1)</a>,
      <a href="https://huggingface.co/mudler"><b>huggingface</b>(1)</a>,
      <a href="https://www.linkedin.com/in/ettore-di-giacinto-211a4166/"><b>linkedin</b>(1)</a>,
      <a href="https://github.com/sponsors/mudler"><b>sponsor</b>(8)</a>,
      <a href="/index.xml"><b>rss</b>(5)</a>
    </p></div>
  </section>
</article>
{{ end }}
```

- [ ] **Step 3: Build and verify**

```bash
make build
grep -q "General Commands Manual" public/index.html && echo landing-ok
grep -c 'class="opt"' public/index.html    # expected: 8 (7 featured + "see projects(7)")
grep -q "see projects(7)" public/index.html && echo link-ok
grep -c "post-row" public/index.html       # expected: >= 5
```

- [ ] **Step 4: Commit**

```bash
git add layouts/index.html content/_index.md
git commit -m "Add MUDLER(1) landing page

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Projects page — projects(7)

**Files:**
- Create: `layouts/_default/projects.html`
- Create: `content/projects.md`

**Interfaces:**
- Consumes: `site.Data.projects.groups` (Task 3), man-page classes (Task 2).

- [ ] **Step 1: Create `content/projects.md`**:

```markdown
+++
title = "Projects"
layout = "projects"
+++
```

- [ ] **Step 2: Create `layouts/_default/projects.html`**:

```html
{{ define "main" }}
<article class="man-page projects">
  <div class="manhead"><span>PROJECTS(7)</span><span>Miscellaneous Information Manual</span><span>PROJECTS(7)</span></div>

  <section class="man-sec">
    <h2 class="sec">NAME</h2>
    <div class="ind"><p><b>projects</b> — things mudler has built, ported, maintained, or broken over ~two decades</p></div>
  </section>

  {{ range site.Data.projects.groups }}
  <section class="man-sec">
    <h2 class="sec">{{ upper .name }}</h2>
    <div class="ind">
      {{ range .items }}
      <div class="opt">
        <b>{{ if .url }}<a href="{{ .url }}">{{ .name }}</a>{{ else }}{{ .name }}{{ end }}</b>
        <span>{{ .desc }}{{ with .meta }} <i>({{ . }})</i>{{ end }}</span>
      </div>
      {{ end }}
    </div>
  </section>
  {{ end }}

  <section class="man-sec">
    <h2 class="sec">SEE ALSO</h2>
    <div class="ind"><p><a href="/"><b>mudler</b>(1)</a>, <a href="/about/"><b>about</b>(7)</a>, <a href="https://github.com/mudler"><b>github</b>(1)</a></p></div>
  </section>
</article>
{{ end }}
```

- [ ] **Step 3: Build and verify**

```bash
make build
grep -q "PROJECTS(7)" public/projects/index.html && echo projects-ok
grep -q "apex-quant" public/projects/index.html && echo ecosystem-ok
grep -q "Mojo::IOLoop" public/projects/index.html && echo perl-ok
```

- [ ] **Step 4: Commit**

```bash
git add layouts/_default/projects.html content/projects.md
git commit -m "Add projects(7) page

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Post pages as technical memos + tags

**Files:**
- Create: `layouts/posts/single.html` (memo treatment; `_default/single.html` keeps serving About)
- Create: `layouts/_default/terms.html`
- Create: `layouts/_default/_markup/render-heading.html`
- Modify: `assets/css/main.css` (append memo styles below)

**Interfaces:**
- Consumes: tokens/classes from Task 2.
- Produces: `.memo`, `.memo-rule`, `.memo-tag`, `.memo-head`, `.memo-byline`, `.memo-body`, `.memo-tags`, `.memo-seealso` (Task 9 animates `.memo-rule`, `.memo-head`, `.memo-tag`).

- [ ] **Step 1: Create `layouts/posts/single.html`**:

```html
{{ define "main" }}
<article class="memo">
  <hr class="memo-rule" aria-hidden="true"><hr class="memo-rule thin" aria-hidden="true">
  {{ $posts := where site.RegularPages "Section" "posts" }}
  {{ $n := len (where $posts "Date" "le" .Date) }}
  <div class="memo-tag"><span>MUDLER.PM</span><span>TECHNICAL MEMORANDUM</span><span>N. {{ $n }}</span></div>
  <header class="memo-head">
    <h1>{{ .Title }}</h1>
    <p class="memo-byline">{{ .Params.author | default "Ettore Di Giacinto" }} · {{ .Date.Format "2 January 2006" }} · {{ .ReadingTime }} min read</p>
  </header>
  <div class="memo-body">
    {{ .Content }}
  </div>
  {{ with .Params.tags }}
  <div class="memo-tags">{{ range . }}<a href="/tags/{{ . | urlize }}/">{{ . }}</a>{{ end }}</div>
  {{ end }}
  <nav class="memo-seealso">
    <h2>SEE ALSO</h2>
    <ul>
      {{ with .NextInSection }}<li><a href="{{ .RelPermalink }}">{{ .Title }}</a> <i>(newer)</i></li>{{ end }}
      {{ with .PrevInSection }}<li><a href="{{ .RelPermalink }}">{{ .Title }}</a> <i>(older)</i></li>{{ end }}
      <li><a href="/posts/">all posts</a></li>
    </ul>
  </nav>
</article>
{{ end }}
```

- [ ] **Step 2: Create `layouts/_default/_markup/render-heading.html`** (anchored headings in post bodies):

```html
<h{{ .Level }} id="{{ .Anchor | safeURL }}">{{ .Text | safeHTML }} <a class="hanchor" href="#{{ .Anchor | safeURL }}" aria-label="Link to this section">§</a></h{{ .Level }}>
```

- [ ] **Step 3: Create `layouts/_default/terms.html`** (tag/series/category index):

```html
{{ define "main" }}
<div class="man-page">
  <div class="manhead"><span>{{ upper .Title }}(7)</span><span>{{ site.Title }} Manual</span><span>{{ upper .Title }}(7)</span></div>
  <ul class="post-rows" data-pager>
    {{ range .Data.Terms.ByCount }}
    <li class="post-row"><span class="dt">{{ .Count }} post{{ if ne .Count 1 }}s{{ end }}</span><a href="{{ .Page.RelPermalink }}">{{ .Page.Title }}</a></li>
    {{ end }}
  </ul>
</div>
{{ end }}
```

- [ ] **Step 4: Append memo styles to `assets/css/main.css`**:

```css
/* ============================================================
   Technical memo — post pages
   ============================================================ */
.memo {
  max-width: 74ch; margin: 1.5rem auto 3rem; padding: 2.5rem clamp(1.25rem, 5vw, 3rem) 2.75rem;
  background: var(--bg2);
  font-family: var(--serif);
  font-size: 1.02rem; line-height: 1.72;
}
.memo-rule { border: 0; border-top: 2.5px solid var(--text); margin: 0 0 0.2rem; transform-origin: left; }
.memo-rule.thin { border-top-width: 1px; margin: 0 0 1.8rem; }
.memo-tag {
  display: flex; justify-content: space-between; gap: 1rem;
  font-family: var(--mono); font-size: 0.68rem; letter-spacing: 0.14em;
  color: var(--muted); margin-bottom: 2rem;
}
.memo-head h1 {
  font-size: 1.75rem; font-weight: 400; letter-spacing: -0.01em;
  line-height: 1.25; margin: 0 0 0.4rem; text-wrap: balance; text-transform: none;
}
.memo-byline { font-style: italic; color: var(--muted); margin: 0 0 2rem; }
.memo-body { max-width: 65ch; }
.memo-body h2, .memo-body h3, .memo-body h4 {
  font-family: var(--serif); font-weight: 700; text-transform: none; letter-spacing: 0;
  margin: 1.8rem 0 0.6rem; line-height: 1.3;
}
.memo-body h2 { font-size: 1.25rem; }
.memo-body h3 { font-size: 1.1rem; }
.memo-body .hanchor { visibility: hidden; text-decoration: none; color: var(--muted); font-size: 0.85em; }
.memo-body h2:hover .hanchor, .memo-body h3:hover .hanchor, .memo-body h4:hover .hanchor { visibility: visible; }
.memo-body blockquote { border-left: 3px solid var(--red); margin: 1.4rem 0; padding: 0.2rem 1.4rem; color: var(--muted); }
.memo-body pre, .memo-body code { font-family: var(--mono); }
.memo-body img { display: block; margin: 1.5rem auto; }
.memo-body ul, .memo-body ol { padding-left: 1.6rem; }
.memo-tags { margin-top: 2.25rem; font-variant: small-caps; letter-spacing: 0.06em; }
.memo-tags a { margin-right: 1rem; color: var(--muted); }
.memo-seealso { margin-top: 2rem; border-top: 1px solid var(--rule); padding-top: 1rem; font-family: var(--mono); font-size: 0.85rem; }
.memo-seealso h2 { font-size: 0.85rem; text-transform: uppercase; margin: 0 0 0.5rem; font-family: var(--mono); }
.memo-seealso ul { list-style: none; padding: 0; margin: 0; }
.memo-seealso li { margin-bottom: 0.3rem; }
.memo-seealso i { color: var(--muted); }
```

- [ ] **Step 5: Build and verify against real posts**

```bash
make build
P=$(ls -d public/posts/*/*/*/*/ | head -3)
grep -q "TECHNICAL MEMORANDUM" public/posts/*/*/*/*/index.html | head -1; echo memo-marker
grep -rl "TECHNICAL MEMORANDUM" public/posts | wc -l   # expected: 37 (one per post)
grep -q "memo-seealso" "$(ls -d public/posts/*/*/*/*/ | head -1)index.html" && echo seealso-ok
test -d public/tags && echo tags-ok
grep -q "twitter" public/posts/2026/*/*/*/index.html 2>/dev/null || true  # tweet shortcode post renders
```
Expected: 37 memo pages, `seealso-ok`, `tags-ok`. Manually open the oldest post and the newest (`grep -o '<title>[^<]*' …`) to sanity-check no broken markup.

- [ ] **Step 6: Commit**

```bash
git add layouts/posts layouts/_default/terms.html layouts/_default/_markup assets/css/main.css
git commit -m "Render posts as technical memos; add tag pages and heading anchors

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Rewrite About

**Files:**
- Modify: `content/about.md` (full rewrite below)

- [ ] **Step 1: Replace `content/about.md`** (complete file — keeps date/aliases so nothing breaks):

```markdown
+++
title = "About"
date = "2014-04-09"
aliases = ["about-me","contact"]
hideTitle = true
hidelanguage = true
[ author ]
  name = "Ettore Di Giacinto"
+++

# About me

![me](https://github.com/mudler/blog/assets/2420543/5794f640-7c7d-4f9a-a617-ecc31356c08a)

Hey! Thanks for stopping by.

I'm Ettore, known online as **mudler**. I've been an open source hacker and
hacktivist for nearly two decades — since organizing Linux Days as a teenager —
and I hold an MS in Computer Science.

I'm the creator and maintainer of [LocalAI](https://localai.io), the free,
open-source AI engine for running LLMs, vision, voice and image models on
hardware you own — no cloud required. Around it I maintain a growing
ecosystem: agents ([LocalAGI](https://github.com/mudler/LocalAGI)), memory
([LocalRecall](https://github.com/mudler/LocalRecall)), and a series of
from-scratch C++/ggml ports of modern models —
[parakeet.cpp](https://github.com/mudler/parakeet.cpp),
[depth-anything.cpp](https://github.com/mudler/depth-anything.cpp), and
friends. I also created [Kairos](https://github.com/kairos-io/kairos), the
immutable Linux meta-distribution for edge Kubernetes, donated to the CNCF,
which I still maintain.

Before all of this I was a Gentoo developer and led Sabayon Linux; later I
worked at SUSE on openQA (I rewrote its scheduler) and Cloud Foundry, and led
the Elemental team at Rancher. Local AI is the way: I believe computing — and
especially AI — should answer to the people who own the hardware it runs on.

These days I work as an independent OSS consultant, currently working with
[Spectro Cloud](https://www.spectrocloud.com/). If you need help with any of
my projects, or with local AI in general, you can
[sponsor my work](https://github.com/sponsors/mudler) or reach me at
`consulting@localai.io`.

Find me on [GitHub](https://github.com/mudler),
[X/Twitter](https://twitter.com/mudler_it),
[Hugging Face](https://huggingface.co/mudler),
[LinkedIn](https://linkedin.com/in/ettore-di-giacinto-211a4166), and
[CPAN](https://metacpan.org/author/MUDLER).

For everything I've built, ported, or contributed to, see
[projects(7)](/projects/).
```

- [ ] **Step 2: Build and verify**

```bash
make build
grep -q "Spectro Cloud" public/about/index.html && echo spectro-ok
grep -c "Spectro Cloud" public/ -r    # expected: exactly 1 file (about)
grep -q "projects(7)" public/about/index.html && echo xref-ok
test -d public/about-me && echo alias-ok
```

- [ ] **Step 3: Commit**

```bash
git add content/about.md
git commit -m "Rewrite About: present-first, projects moved to projects(7)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: less(1) interactivity — site.js, keybindings, status line

**Files:**
- Create: `assets/js/site.js`
- Create: `layouts/partials/keybindings.html`
- Modify: `layouts/_default/baseof.html` (include keybindings partial)
- Modify: `layouts/partials/head.html` (include site.js)
- Modify: `assets/css/main.css` (append overlay styles)

**Interfaces:**
- Consumes: `#theme-toggle`, `#status-line`, `[data-pager]`, `.post-row`, `.pager-selected` (Task 2); `#search-query` (search page); `./vendor/anime.esm.min.js` (Task 1).
- Produces: `html.js` class; `#kb-help` overlay; Task 9 appends animation code to this same file.

- [ ] **Step 1: Create `layouts/partials/keybindings.html`**:

```html
<div id="kb-help" class="kb-help" hidden>
  <div class="kb-box" role="dialog" aria-modal="true" aria-label="Key bindings">
    <div class="manhead"><span>KEYS(1)</span><span></span><span>KEYS(1)</span></div>
    <h2 class="sec">KEY BINDINGS</h2>
    <div class="ind">
      <div class="opt"><b>j / k</b><span>select next / previous entry</span></div>
      <div class="opt"><b>Enter</b><span>open selection</span></div>
      <div class="opt"><b>g / G</b><span>go to top / bottom</span></div>
      <div class="opt"><b>/</b><span>search the manual</span></div>
      <div class="opt"><b>t</b><span>toggle light / dark pager</span></div>
      <div class="opt"><b>q</b><span>quit to mudler(1)</span></div>
      <div class="opt"><b>?</b><span>toggle this help</span></div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Include it in `layouts/_default/baseof.html`** — add one line directly above the status-line div:

```html
{{ partial "keybindings.html" . }}
```

- [ ] **Step 3: Add the script to `layouts/partials/head.html`** — append at the end:

```html
{{ $js := resources.Get "js/site.js" | js.Build (dict "minify" true "target" "es2018") | fingerprint }}
<script type="module" src="{{ $js.RelPermalink }}"></script>
```

- [ ] **Step 4: Create `assets/js/site.js`** (complete file; the `ANIMATIONS` marker at the bottom is where Task 9 appends):

```js
// mudler.pm — the site behaves like less(1).
const html = document.documentElement
html.classList.add('js')

// ---------- theme ----------
const btn = document.getElementById('theme-toggle')
function currentTheme() {
  return html.getAttribute('data-theme') ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
}
function applyTheme(t) {
  html.setAttribute('data-theme', t)
  try { localStorage.setItem('theme', t) } catch { /* private mode */ }
  if (btn) btn.textContent = t === 'dark' ? '☀' : '☾'
}
if (btn) {
  btn.textContent = currentTheme() === 'dark' ? '☀' : '☾'
  btn.addEventListener('click', () => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'))
}

// ---------- pager selection ----------
const rows = Array.from(document.querySelectorAll('[data-pager] .post-row'))
let sel = -1
function select(i) {
  if (!rows.length) return
  const next = Math.max(0, Math.min(rows.length - 1, i))
  if (sel >= 0) rows[sel].classList.remove('pager-selected')
  sel = next
  rows[sel].classList.add('pager-selected')
  rows[sel].scrollIntoView({ block: 'nearest' })
}

// ---------- help overlay ----------
const help = document.getElementById('kb-help')
function toggleHelp(force) {
  if (!help) return
  help.hidden = force !== undefined ? !force : !help.hidden
}
if (help) help.addEventListener('click', e => { if (e.target === help) toggleHelp(false) })

// ---------- search jump ----------
function goSearch() {
  const q = document.getElementById('search-query')
  if (q) { q.focus(); q.select() } else { location.href = '/search/' }
}

// ---------- status line ----------
const statusEl = document.getElementById('status-line')
if (statusEl) {
  const lh = parseFloat(getComputedStyle(document.body).lineHeight) || 24
  let queued = false
  const update = () => {
    statusEl.textContent =
      `Manual page mudler(1) line ${Math.floor(window.scrollY / lh) + 1} (press ? for help)`
    queued = false
  }
  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(update) }
  }, { passive: true })
  update()
}

// ---------- keys ----------
document.addEventListener('keydown', e => {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return
  const t = e.target
  if (t instanceof HTMLElement &&
      (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
    if (e.key === 'Escape') t.blur()
    return
  }
  switch (e.key) {
    case 'j': select(sel + 1); break
    case 'k': select(sel - 1); break
    case 'Enter': {
      if (sel >= 0) { const a = rows[sel].querySelector('a'); if (a) a.click() }
      return
    }
    case 'g': scrollTo({ top: 0 }); break
    case 'G': scrollTo({ top: document.body.scrollHeight }); break
    case '/': e.preventDefault(); goSearch(); break
    case '?': toggleHelp(); break
    case 'Escape': toggleHelp(false); break
    case 'q': if (location.pathname !== '/') location.href = '/'; break
    case 't': applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'); break
  }
})

// ---------- ANIMATIONS (Task 9 appends below) ----------
```

- [ ] **Step 5: Append overlay styles to `assets/css/main.css`**:

```css
/* ---------- key-bindings overlay ---------- */
.kb-help {
  position: fixed; inset: 0; z-index: 10;
  background: color-mix(in srgb, var(--bg) 60%, transparent);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--mono);
}
.kb-box {
  background: var(--bg); border: 2px solid var(--text);
  max-width: 34rem; width: calc(100% - 2rem);
  padding: 1.25rem 1.5rem 1.5rem;
  box-shadow: 0.5rem 0.5rem 0 color-mix(in srgb, var(--text) 25%, transparent);
}
.kb-box .manhead { margin-bottom: 0.75rem; }
.kb-box h2.sec { margin-top: 0; }
```

- [ ] **Step 6: Build and verify**

```bash
make build
grep -q 'type="module"' public/index.html && echo js-wired
grep -q "kb-help" public/index.html && echo overlay-ok
JS=$(grep -o '/js/site[^"]*\.js' public/index.html | head -1); test -s "public$JS" && echo bundle-ok
grep -q "Manual page mudler" "public$JS" && echo status-ok
```

- [ ] **Step 7: Commit**

```bash
git add assets/js/site.js layouts/partials/keybindings.html layouts/_default/baseof.html layouts/partials/head.html assets/css/main.css
git commit -m "Add less(1) keyboard behavior, status line, key-bindings overlay

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: Animations (anime.js)

**Files:**
- Modify: `assets/js/site.js` (append below the `ANIMATIONS` marker; also add the import at the top)

**Interfaces:**
- Consumes: `.man-sec`, `[data-pager] .post-row`, `.memo-rule`, `.memo-head`, `.memo-tag`, `.typewriter`; `assets/js/vendor/anime.esm.min.js` exports `animate` and `stagger` (verified in Task 1 — if names differed there, adjust the import).

- [ ] **Step 1: Add the import as the first line of `assets/js/site.js`**:

```js
import { animate, stagger } from './vendor/anime.esm.min.js'
```

- [ ] **Step 2: Append below the `ANIMATIONS` marker**:

```js
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
if (!reduceMotion) {
  const secs = document.querySelectorAll('.man-sec')
  if (secs.length) {
    animate(secs, { opacity: [0, 1], translateY: [8, 0], delay: stagger(60), duration: 350, ease: 'outQuad' })
  }
  const listRows = document.querySelectorAll('[data-pager] .post-row')
  if (listRows.length) {
    animate(listRows, { opacity: [0, 1], delay: stagger(25), duration: 220, ease: 'linear' })
  }
  const rules = document.querySelectorAll('.memo-rule')
  if (rules.length) {
    animate(rules, { scaleX: [0, 1], duration: 500, ease: 'outQuart' })
  }
  const memoTop = document.querySelectorAll('.memo-tag, .memo-head')
  if (memoTop.length) {
    animate(memoTop, { opacity: [0, 1], translateY: [10, 0], duration: 400, delay: 150, ease: 'outQuad' })
  }
  // one-time typewriter on the NAME line
  const tw = document.querySelector('.typewriter')
  if (tw) {
    const full = tw.textContent
    tw.textContent = ''
    let i = 0
    const id = setInterval(() => {
      tw.textContent = full.slice(0, ++i)
      if (i >= full.length) clearInterval(id)
    }, 16)
  }
}
```

Note: the typewriter uses `textContent`, which flattens the `<b>mudler</b>` inside `.typewriter` — acceptable (the bold returns on next paint of finished text is NOT restored). To keep the bold, instead wrap ONLY the plain text after the dash in `.typewriter` in Task 4's template; do this now if the flattened look is unacceptable: change the NAME line to `<p><b>mudler</b> — <span class="typewriter">Ettore Di Giacinto; builds AI that runs on hardware you own</span></p>`. Prefer this variant; update `layouts/index.html` accordingly in this task.

- [ ] **Step 3: Build and verify**

```bash
make build
JS=$(grep -o '/js/site[^"]*\.js' public/index.html | head -1)
grep -q "outQuad\|scaleX" "public$JS" && echo anim-ok
grep -q "prefers-reduced-motion" "public$JS" && echo motion-gated
```

Expected: `anim-ok`, `motion-gated`. If `js.Build` errors on the vendor import, check the export names per Task 1 Step 2.

- [ ] **Step 4: Commit**

```bash
git add assets/js/site.js layouts/index.html
git commit -m "Add load animations: section stagger, memo rules, NAME typewriter

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: Full verification sweep

**Files:** none created — verification only (fix regressions inline if found).

- [ ] **Step 1: Clean build**

```bash
rm -rf public && make build
```
Expected: exit 0, no warnings about missing layouts.

- [ ] **Step 2: Zero external requests**

```bash
grep -rEo 'src="https?://[^"]*"|href="https?://[^"]*\.(css|js|woff2?)"' public --include='*.html' | sort -u
```
Expected: empty output (external `href` for normal links is fine — this pattern only catches loaded assets; if anything appears, vendor it).

- [ ] **Step 3: URL preservation** — every pre-refresh post URL still exists:

```bash
git stash list >/dev/null  # (no stash needed; compare against content files)
for f in content/posts/*.md; do
  slug=$(basename "$f" .md)
  found=$(find public/posts -type d -name "*$(echo "$slug" | cut -c1-30)*" | head -1)
  [ -z "$found" ] && echo "MISSING: $slug"
done; echo url-check-done
```
Expected: only `url-check-done` (investigate any MISSING line — slug transforms can differ; verify against `public/sitemap.xml` before declaring breakage).

```bash
test -f public/index.xml && test -f public/index.json && test -f public/search/index.html && echo endpoints-ok
```

- [ ] **Step 4: Both themes and no-JS sanity** — serve and eyeball:

```bash
make serve   # user checks: paper + dark toggle, j/k//?/q keys, typewriter, memo pages, search
```

Ask the user to review: landing, one old Sabayon post, the tweet-shortcode post (`a-call-to-opensource-maintainers…`), `/projects/`, `/about/`, `/search/?q=localai`, `/tags/`, 404, both themes, keyboard map.

- [ ] **Step 5: Final commit (if fixes were made) — then done**

```bash
git status --short   # commit any stragglers with an appropriate message
```

---

## Self-review notes

- Spec coverage: module removal (T2), AMP removal (T2 config), vendored assets (T1), tokens/fonts (T2), landing (T4), projects page (T3+T5), About + Spectro Cloud single mention (T7), memo posts + tags + anchors (T6), search restyle + 404 (T2), keyboard/status/overlay (T8), animations + reduced-motion (T9), verification incl. URL preservation and zero-external (T10). Theme toggle: button (T2 markup, T8 behavior), `t` key (T8), persisted + pre-paint script (T2 head.html).
- Type consistency: `data-pager`/`.post-row`/`.pager-selected` (T2→T4/T6/T8/T9), `#theme-toggle`/`#status-line`/`#kb-help` ids match between markup (T2/T8) and JS (T8), `site.Data.projects.groups` shape matches T3↔T4/T5, `.typewriter` T4↔T9.
- Known judgment calls recorded inline: interim home placeholder (T2 Step 13), typewriter bold-flattening fix (T9 Step 2), anime.js export-name check (T1 Step 2 ↔ T9).
