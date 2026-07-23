import { animate, stagger } from './vendor/anime.esm.min.js'
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
let helpReturnFocus = null
function toggleHelp(force) {
  if (!help) return
  const open = force !== undefined ? force : help.hidden
  help.hidden = !open
  if (open) {
    helpReturnFocus = document.activeElement
    const box = help.querySelector('.kb-box')
    if (box) box.focus()
  } else if (helpReturnFocus && document.contains(helpReturnFocus)) {
    helpReturnFocus.focus()
    helpReturnFocus = null
  }
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
