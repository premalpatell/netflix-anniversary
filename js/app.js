/* ═══════════════════════════════════════════════════════════════
   app.js — Shivani & Premal
   model → router → intro → profiles → browse (billboard, rows, jawbone,
   bell, search) → sheet → player (recap, trailer, gestures) → finale
   ═══════════════════════════════════════════════════════════════ */
(() => {
'use strict';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const PHOTO_MS = 4800;
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
const canHover = matchMedia('(hover:hover)').matches;

/* ── storage (never throws) ─────────────────────────────── */
const store = {
  get(k, d) { try { const v = localStorage.getItem('sp.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('sp.' + k, JSON.stringify(v)); } catch {} },
};

/* ── dates ──────────────────────────────────────────────── */
const parseD = d => { if (!d) return null; const [y, m, day] = d.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, day, +d.slice(11, 13) || 12, +d.slice(14, 16) || 0); };
const fmtLong = d => { const t = parseD(d); return t ? `${DAYS[t.getDay()]}, ${MONTHS[t.getMonth()]} ${t.getDate()}, ${t.getFullYear()}` : 'Undated'; };
const fmtMD = d => { const t = parseD(d); return t ? `${MONTHS[t.getMonth()].slice(0, 3)} ${t.getDate()}, ${t.getFullYear()}` : 'Undated'; };
const fmtWeekday = d => { const t = parseD(d); return t ? DAYS[t.getDay()] : ''; };
const fmtTime = d => { const t = parseD(d); if (!t || !d || d.length < 16 || d.slice(11, 16) === '12:00') return ''; let h = t.getHours(); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return `${h}:${String(t.getMinutes()).padStart(2, '0')} ${ap}`; };
const secs = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const mins = ms => `${Math.max(1, Math.round(ms / 60000))}m`;
const dayDiff = (a, b) => Math.round((parseD(a) - parseD(b)) / 864e5);
const todayStr = () => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ── media helpers ──────────────────────────────────────── */
// WebP twins exist for every photo, thumbnail and poster; fall back to JPEG if one fails.
// Generated photos, thumbnails and posters are WebP; Premal's original photos are served untouched as JPEG.
const pic = p => /^(images\/s_|images\/t\/|videos\/p\/).*\.jpg$/i.test(p || '') ? p.replace(/\.jpg$/i, '.webp') : p;
document.addEventListener('error', e => { const t = e.target; if (t.tagName === 'IMG' && /\.webp$/.test(t.src)) t.src = t.src.replace(/\.webp$/, '.jpg'); }, true);
document.addEventListener('load', e => { if (e.target.tagName === 'IMG') e.target.classList.add('ld'); }, true);
const pos = m => m && m.p ? `${Math.round(m.p[0] * 100)}% ${Math.round(m.p[1] * 100)}%` : '50% 30%';
const amb = m => (m && m.c) || '#5a1016';
/* title treatment class for a title (see TITLE_LOOKS in data.js and .look-* in app.css) */
const lookCls = t => { const k = (window.TITLE_LOOKS || {})[t]; return k ? `look look-${k}` : ''; };
/* Title treatment: the generated logo when there is one, otherwise the CSS look */
const logoOf = t => (window.LOGOS || {})[t];
const titleHTML = (t, ctx) => { const L = logoOf(t); return L ? `<img class="tlogo tl-${ctx}" src="${L.f}" width="${L.w}" height="${L.h}" alt="${esc(t)}" loading="lazy" decoding="async">` : esc(t); };
const titleCls = (t, base) => logoOf(t) ? `${base} has-logo` : `${base} ${lookCls(t)}`;
const blurOf = m => (window.BLUR && m && BLUR[m.key]) || '';
/* blur-up image: tiny placeholder behind the real one, which fades in on load */
const imgHTML = (m, cls = '', alt = '') => `<span class="ph ${cls}" data-k="${m.key}"${blurOf(m) ? ` style="background-image:url(${blurOf(m)})"` : ''}><img src="${pic(m.t)}" alt="${esc(alt)}" loading="lazy" decoding="async" style="object-position:${pos(m)}"></span>`;
document.addEventListener('blur-ready', () => $$('.ph[data-k]').forEach(el => { if (!el.style.backgroundImage && BLUR[el.dataset.k]) el.style.backgroundImage = `url(${BLUR[el.dataset.k]})`; }));

/* ═══ MODEL ══════════════════════════════════════════════ */
const EXTRAS = { n: 99, slug: 'extras', title: 'Snaps & Extras', tag: 'Undated', blurb: 'Moments that lost their dates along the way.', hero: '' };
const seasons = [...SEASONS, EXTRAS].map(s => ({ ...s, episodes: [] }));
const byKey = {};
MEDIA.forEach(m => { byKey[m.key] = m; });
const NOTES = window.EPISODE_NOTES || {};

function seasonFor(d) {
  if (!d) return EXTRAS.n;
  const s = SEASONS.find(s => d.slice(0, 10) >= s.from && d.slice(0, 10) <= s.to);
  return s ? s.n : EXTRAS.n;
}
const stories = { ...STORIES };
const storyOf = m => (NOTES[(m.d || '').slice(0, 10)] || {}).story || stories[m.key] || '';

(function buildEpisodes() {
  const buckets = {};
  MEDIA.forEach(m => {
    const sn = seasonFor(m.d);
    const day = sn === EXTRAS.n ? 'undated' : m.d.slice(0, 10);
    (buckets[`${sn}|${day}`] ||= { sn, day, items: [] }).items.push(m);
  });
  let list = Object.values(buckets).sort((a, b) => a.day.localeCompare(b.day));
  // Days Premal folded together ("merge into next / previous episode").
  list.forEach((b, k) => {
    const how = (NOTES[b.day] || {}).merge; if (!how) return;
    const step = how === 'prev' ? -1 : 1;
    for (let j = k + step; j >= 0 && j < list.length; j += step) {
      const h = list[j];
      if (h.merged) continue;
      if (h.sn === b.sn) { h.items.push(...b.items); h.days = [...(h.days || [h.day]), b.day]; b.merged = true; }
      break;
    }
  });
  list = list.filter(b => !b.merged);
  // A lone photo with no story of its own joins the nearest episode within a week (same season).
  const anchored = b => b.items.length > 1 || b.day === 'undated' || NOTES[b.day] || b.items.some(m => stories[m.key]);
  list.filter(b => !anchored(b)).forEach(b => {
    const host = list.filter(h => h !== b && h.sn === b.sn && h.day !== 'undated' && !h.merged && Math.abs(dayDiff(h.day, b.day)) <= 7)
      .sort((x, y) => Math.abs(dayDiff(x.day, b.day)) - Math.abs(dayDiff(y.day, b.day)) || y.items.length - x.items.length)[0];
    if (host) { host.items.push(...b.items); b.merged = true; }
  });
  list = list.filter(b => !b.merged);
  list.forEach(b => {
    const season = seasons.find(s => s.n === b.sn);
    b.items.sort((a, c) => (a.d || '').localeCompare(c.d || ''));
    const note = NOTES[b.day] || {};
    const firstStory = b.items.map(m => stories[m.key]).find(Boolean);
    const named = !!(note.title || firstStory);
    const title = note.title || (firstStory ? firstStory.replace(/\.$/, '') : (b.day === 'undated' ? 'Lost & Found' : fmtMD(b.day)));
    const photos = b.items.filter(m => m.k === 'img').length, vids = b.items.length - photos;
    const runtime = b.items.reduce((t, m) => t + (m.k === 'vid' ? m.dur * 1000 : PHOTO_MS), 0);
    const cover = (note.thumb && byKey[note.thumb]) || b.items.find(m => m.k === 'img' && m.p) || b.items.find(m => m.k === 'img') || b.items[0];
    const days = [...new Set(b.items.map(m => (m.d || '').slice(0, 10)).filter(Boolean))].sort();
    const ep = {
      id: `${b.sn}-${b.day}`, season, n: season.episodes.length + 1, day: b.day, title, named, items: b.items, cover,
      photos, vids, runtime, days,
      sub: b.day === 'undated' ? '' : (named ? fmtMD(b.day) : fmtWeekday(b.day)),
      len: [photos && `${photos} photo${photos > 1 ? 's' : ''}`, vids && `${vids} video${vids > 1 ? 's' : ''}`].filter(Boolean).join(' · '),
      story: note.story || b.items.map(storyOf).find(Boolean) || '',
      est: b.items.every(m => m.est),
      note: (window.LOVE_NOTES || {})[b.day] || '',
    };
    ep.label = season.n === EXTRAS.n ? `Extra ${ep.n}` : `S${season.n}:E${ep.n}`;
    ep.alt = `${ep.title}, ${ep.day === 'undated' ? 'date unknown' : fmtLong(ep.day)}`;
    season.episodes.push(ep);
  });
})();
const allEpisodes = seasons.flatMap(s => s.episodes);
const epById = Object.fromEntries(allEpisodes.map(e => [e.id, e]));
const epOf = new Map(); allEpisodes.forEach(e => e.items.forEach((m, k) => epOf.set(m, { ep: e, i: k })));
const epByDay = {}; allEpisodes.forEach(e => (e.days.length ? e.days : [e.day]).forEach(d => { epByDay[d] ||= e; }));
const nextEpisode = ep => ep.virtual ? null : (allEpisodes[allEpisodes.indexOf(ep) + 1] || null);
const latestDay = allEpisodes.filter(e => e.day !== 'undated').map(e => e.day).sort().pop() || '';
const isNew = ep => ep.day !== 'undated' && dayDiff(latestDay, ep.day) <= 45;
const isRecent = ep => ep.day !== 'undated' && dayDiff(todayStr(), ep.day) <= 14 && dayDiff(todayStr(), ep.day) >= 0;
const newLabel = ep => isRecent(ep) ? 'Recently Added' : 'New Episode';
const realSeasons = () => seasons.filter(s => s.n !== EXTRAS.n && s.episodes.length);
const isPortrait = m => m && m.k === 'img' && m.h > m.w * 1.05;

/* "On this day": episodes within ±3 days of today's date in earlier years */
function onThisDay() {
  const now = new Date(), y = now.getFullYear(), hits = [];
  allEpisodes.forEach(e => {
    if (e.day === 'undated') return;
    const t = parseD(e.day); if (t.getFullYear() >= y) return;
    const diff = Math.round((new Date(y, t.getMonth(), t.getDate()) - new Date(y, now.getMonth(), now.getDate())) / 864e5);
    if (Math.abs(diff) <= 3) hits.push({ e, years: y - t.getFullYear(), diff });
  });
  return hits.sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff) || a.years - b.years);
}

/* Virtual episodes: the series trailer and each season's "Previously on" recap */
const virtualEp = (id, title, label, items, photoMs, extra = {}) => ({
  id, virtual: true, title, label, items, photoMs, n: 1, day: '', days: [], season: { n: -1, title: '' },
  cover: items.find(m => m.k === 'img') || items[0], len: '', story: '', note: '', runtime: items.reduce((t, m) => t + (m.k === 'vid' ? m.dur * 1000 : photoMs), 0), ...extra,
});
const trailerEp = (() => {
  const photos = TOP10.map(k => byKey[k]).filter(m => m && m.k === 'img');
  const clips = MEDIA.filter(m => m.k === 'vid' && m.dur >= 2.5 && m.dur <= 6).sort((a, b) => (b.d || '').localeCompare(a.d || '')).slice(0, 3);
  const items = []; photos.forEach((m, k) => { items.push(m); if (k % 3 === 2 && clips.length) items.push(clips.shift()); });
  return virtualEp('trailer', 'Official Trailer', 'Trailer', items, 2200);
})();
function recapEp(forEp) {
  const prev = seasons.find(s => s.n === forEp.season.n - 1); if (!prev || !prev.episodes.length) return null;
  const pool = [...TOP10.map(k => byKey[k]).filter(m => m && epOf.get(m)?.ep.season === prev), ...prev.episodes.map(e => e.cover)].filter(m => m && m.k === 'img');
  const items = [...new Set(pool)].slice(0, 9);
  return items.length >= 3 ? virtualEp(`recap-${forEp.season.n}`, `Previously on Shivani & Premal`, `Recap · Season ${prev.n}`, items, 1600, { then: forEp.id, recap: true, prevTitle: `Season ${prev.n}: ${prev.title}` }) : null;
}
epById.trailer = trailerEp;

/* per-device state: progress, My List, ratings, notifications, reminders */
const progress = store.get('progress', {});
const saveProgress = (ep, i, frac) => { if (ep.virtual) return; progress[ep.id] = { i, frac, t: Date.now() }; store.set('progress', progress); };
const lastWatched = () => Object.entries(progress).sort((a, b) => b[1].t - a[1].t).map(([id, p]) => ({ ep: epById[id], ...p })).filter(x => x.ep && !x.ep.virtual);
let myList = store.get('list', []).filter(id => epById[id]);
const inList = id => myList.includes(id);
function toggleList(id) {
  myList = inList(id) ? myList.filter(x => x !== id) : [id, ...myList]; store.set('list', myList);
  toast(inList(id) ? 'Added to My List' : 'Removed from My List'); browse.refresh();
  return inList(id);
}
const ratings = store.get('ratings', {});
const RATE = { '': ['i-up', 'Rate this'], up: ['i-up', 'I like this'], love: ['i-love', 'Love this!'], down: ['i-down', 'Not for me'] };
function cycleRating(id) {
  const order = ['', 'up', 'love', 'down'], cur = ratings[id] || '';
  const nxt = order[(order.indexOf(cur) + 1) % order.length];
  if (nxt) ratings[id] = nxt; else delete ratings[id];
  store.set('ratings', ratings); toast(nxt ? RATE[nxt][1] : 'Rating cleared');
  return nxt;
}
const rateIcon = id => RATE[ratings[id] || ''][0];

/* ═══ ROUTER ═════════════════════════════════════════════ */
const screens = ['intro', 'profiles', 'browse', 'finale'];
let state = { screen: 'intro' };
let opener = null;   // element focused before an overlay opened, to restore focus
function apply(s, fromPop) {
  const prev = state; state = s;
  if (prev.overlay && prev.overlay !== s.overlay) { if (prev.overlay === 'player') player.close(); if (prev.overlay === 'sheet') sheet.hide(); if (prev.overlay === 'search') search.hide(); if (opener && document.contains(opener)) opener.focus({ preventScroll: true }); opener = null; }
  if (prev.screen === 'finale' && s.screen !== 'finale') finale.stop();
  if (prev.screen === 'intro' && s.screen !== 'intro') intro.stop();
  screens.forEach(n => $('#' + n).classList.toggle('on', n === s.screen));
  document.body.classList.toggle('locked', !!s.overlay || s.screen !== 'browse');
  if (s.screen === 'browse') browse.ensure(); else browse.pause();
  if (s.screen === 'finale' && prev.screen !== 'finale') finale.start();
  if (s.overlay && s.overlay !== prev.overlay) opener = document.activeElement;
  if (s.overlay === 'sheet') sheet.show(s.season, s.tab); else if (s.overlay === 'search') search.show(); else if (s.overlay === 'player' && !fromPop) player.open(s.ep, s.i);
  if (!s.overlay && !fromPop) window.scrollTo({ top: s.scroll || 0 });
  browse.setPaused(!!s.overlay || s.screen !== 'browse');
  jaw.hide(); bell.close();
}
const go = (screen, extra = {}) => { history.pushState({ screen, ...extra }, ''); apply({ screen, ...extra }); };
const overlay = (kind, extra = {}) => { const s = { ...state, overlay: kind, ...extra, scroll: state.overlay ? state.scroll : window.scrollY }; history.pushState(s, ''); apply(s); };
const back = () => history.back();
const swapOverlay = (kind, extra) => { history.back(); setTimeout(() => overlay(kind, extra), 40); };
window.addEventListener('popstate', e => {
  const s = e.state || { screen: 'intro' };
  if (s.overlay === 'player' && state.overlay !== 'player') { history.back(); return; }  // never re-enter player via forward
  apply(s, true);
});
history.replaceState({ screen: 'intro' }, '');
const playEp = (id, i) => (state.overlay ? swapOverlay : overlay)('player', { ep: id, i: i ?? (progress[id]?.frac < 0.98 ? progress[id].i : 0) });

/* focus stays inside an open overlay */
document.addEventListener('keydown', e => {
  if (e.key !== 'Tab' || !state.overlay) return;
  const box = { sheet: $('#sheet'), player: $('#player'), search: $('#search') }[state.overlay]; if (!box) return;
  const f = $$('button:not([disabled]),select,input,[tabindex]:not([tabindex="-1"])', box).filter(el => el.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (!box.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* ═══ SHARED BACKGROUND MUSIC (recap, trailer, finale) ═══ */
const music = (() => {
  const a = $('#bgm'); let fadeT = 0;
  const ramp = (to, ms, done) => { clearInterval(fadeT); const from = a.volume, t0 = performance.now(); fadeT = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / ms); a.volume = from + (to - from) * k; if (k >= 1) { clearInterval(fadeT); done && done(); } }, 50); };
  return {
    play(vol = 0.85, at = FINALE.audioStart || 0) { if (!a.src) a.src = FINALE.audio; try { a.currentTime = at; } catch {} a.volume = 0; a.play().then(() => ramp(vol, 1200)).catch(() => {}); },
    stop(ms = 900) { if (a.paused) return; ramp(0, ms, () => a.pause()); },
  };
})();

/* ═══ INTRO ══════════════════════════════════════════════ */
const intro = (() => {
  const el = $('#intro'), v = $('#intro-video');
  let timer = null, started = false;
  const advance = () => { clearTimeout(timer); v.removeEventListener('ended', advance); go('profiles'); };
  $('#tap').addEventListener('click', () => {
    if (started) return; started = true;
    el.classList.add('playing');
    v.muted = false; v.volume = 1; v.currentTime = 0;
    v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
    v.addEventListener('ended', advance, { once: true });
    timer = setTimeout(advance, 6000);
  });
  return { stop() { clearTimeout(timer); v.pause(); el.classList.remove('playing'); started = false; } };
})();

/* ═══ PROFILES ═══════════════════════════════════════════ */
let profile = store.get('profile', 0);
const profileName = () => PROFILES[profile].name.replace(' ♡', '');
(function buildProfiles() {
  $('#profile-row').innerHTML = PROFILES.map((p, i) =>
    `<button class="profile" type="button" data-i="${i}"><span class="profile-img"><img src="${pic(p.photo)}" alt=""></span><span>${p.name}</span></button>`).join('');
  $('#profile-row').addEventListener('click', e => {
    const b = e.target.closest('.profile'); if (!b) return;
    profile = +b.dataset.i; store.set('profile', profile);
    go('browse'); setTimeout(() => toast(PROFILES[profile].greeting), 500);
  });
  $('#replay-intro').addEventListener('click', () => go('intro'));
  $('#manage-btn').addEventListener('click', () => toast('These two profiles are permanent ♡'));
  $('#nav-profile').addEventListener('click', () => go('profiles'));
})();

/* ═══ TOAST ══════════════════════════════════════════════ */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600); }

/* ═══ CARDS ══════════════════════════════════════════════ */
const svgPlay = '<svg viewBox="0 0 24 24"><path d="M6 3l14 9-14 9z"/></svg>';
const use = (id, cls = '') => `<svg class="${cls}"><use href="#${id}"/></svg>`;
const logoSVG = (cls = '') => `<svg class="logo ${cls}" role="img" aria-label="${esc(SHOW.title)}"><use href="#logo"/></svg>`;
const ART = window.ART || {};
/* Swap the drawn SVG wordmark and Top 10 badge for the generated artwork */
(() => {
  const L = logoOf(SHOW.title);
  if (L) $$('svg.logo').forEach(svg => { const im = new Image(L.w, L.h); im.src = L.f; im.alt = svg.getAttribute('aria-label') || ''; im.className = `${svg.getAttribute('class')} logo-img`; if (svg.id) im.id = svg.id; svg.replaceWith(im); });
  if (ART.top10) $$('.bb-rank svg').forEach(svg => { const im = new Image(26, 26); im.src = ART.top10; im.alt = ''; im.className = 'top10-img'; svg.replaceWith(im); });
})();

const cardHTML = (ep, opts = {}) => {
  const p = progress[ep.id], m = opts.m || ep.cover;
  return `<button class="card ${opts.vid ? 'vid' : ''}" type="button" data-ep="${ep.id}" ${opts.i != null ? `data-i="${opts.i}"` : ''} ${opts.vid ? `data-vid="${opts.m.f}"` : ''} aria-label="${esc(`${opts.ep || ep.label}: ${opts.title || ep.title}`)}">
    ${imgHTML(m, '', ep.alt)}
    ${opts.vid ? `<span class="card-vid">${svgPlay}</span><span class="dur">${secs(m.dur)}</span>` : ''}
    ${opts.badge !== false && isNew(ep) ? `<span class="badge-new">${newLabel(ep)}</span>` : ''}
    ${ep.note && !opts.vid ? `<span class="card-note" title="A note from Premal">${use('i-note')}</span>` : ''}
    <div class="card-body"><div class="card-ep">${esc(opts.ep || ep.label)}${ep.est ? ' · approx.' : ''}</div><div class="${titleCls(opts.title || ep.title, 'card-title')}">${titleHTML(opts.title || ep.title, 'card')}</div>${opts.len === '' ? '' : `<div class="card-len">${esc(opts.len != null ? opts.len : [ep.sub, ep.len].filter(Boolean).join(' · '))}</div>`}</div>
    ${p && opts.prog !== false ? `<div class="card-prog"><i style="width:${Math.round(p.frac * 100)}%"></i></div>` : ''}
  </button>`;
};
const posterHTML = s => { const m = MEDIA.find(x => x.f === s.hero) || s.episodes[0].cover; return `<button class="poster" type="button" data-season="${s.n}" style="--amb:${amb(m)}" aria-label="Season ${s.n}: ${esc(s.title)}">${imgHTML(m, '', `Season ${s.n}, ${s.title}`)}<span class="poster-num">${s.n}</span><div class="poster-body"><div class="card-ep">Season ${s.n}</div><div class="${titleCls(s.title, 'poster-title')}">${titleHTML(s.title, 'poster')}</div><div class="card-len">${s.episodes.length} episodes · ${esc(s.tag)}</div></div></button>`; };
const topCardHTML = (m, i) => { const at = epOf.get(m); return `<button class="top-card" type="button" data-ep="${at.ep.id}" data-i="${at.i}" aria-label="Number ${i + 1}: ${esc(at.ep.title)}"><span class="top-num" aria-hidden="true">${i + 1}</span>${imgHTML(m, 'top-img', at.ep.alt)}<div class="card-body"><div class="card-ep">${at.ep.label}</div><div class="${titleCls(at.ep.title, 'card-title')}">${titleHTML(at.ep.title, 'card')}</div></div></button>`; };
const rowHTML = (id, title, inner, cls = '', act = '') => `<section class="row ${cls}" id="row-${id}" aria-label="${esc(title)}"><div class="row-head"><h2 class="row-title">${esc(title)}</h2>${act}<span class="pager" aria-hidden="true"></span></div><button class="chev l" type="button" aria-label="Scroll left" tabindex="-1">${use('i-left')}</button><div class="strip ${cls === 'top10-row' ? 'top10' : ''}">${inner}</div><button class="chev r" type="button" aria-label="Scroll right" tabindex="-1">${use('i-right')}</button></section>`;

/* ═══ BROWSE ═════════════════════════════════════════════ */
const browse = (() => {
  let built = false, paused = true;
  const nav = $('#nav'), bb = $('#billboard'), layers = [$('#bb-a'), $('#bb-b')];
  let li = 0, fi = 0, rotT = 0, feats = [], curVideo = null;
  const stats = `${MEDIA.length} moments · ${allEpisodes.filter(e => e.day !== 'undated').length} days · ${realSeasons().length} seasons`;
  const metaSeries = `<span class="match">100% Match</span><span>${SHOW.year}</span><span class="box">${SHOW.maturity}</span><span>${SEASONS.length - 1} Seasons + Prequel</span><span class="box hd">HD</span>`;

  function resolveFeatures() {
    return FEATURES.map(f => {
      if (f.kind === 'series') {
        const m = MEDIA.find(x => x.f === f.still) || allEpisodes[0].cover;
        return { badge: 'Series', logo: true, rank: 'in Our Hearts Today', sub: 'A love story in five seasons. From a first hello in Toronto to Québec, and everything in between.', meta: metaSeries, m, video: f.video,
          play: () => playFirst(), playLabel: 'Play', info: () => overlay('sheet', { season: 1 }), trailer: f.trailer };
      }
      if (f.kind === 'episode') {
        const ep = epByDay[f.day]; if (!ep) return null;
        return { badge: 'Series', tagNew: isRecent(ep) ? 'Recently Added' : f.tag, title: ep.title, sub: ep.story || ep.len, meta: `<span class="match">New</span><span>${ep.label}</span><span>${fmtMD(ep.day)}</span><span class="box hd">HD</span>`, m: ep.cover,
          play: () => playEp(ep.id, 0), playLabel: 'Watch Now', info: () => overlay('sheet', { season: ep.season.n }) };
      }
      if (f.kind === 'top') {
        const m = byKey[f.key], at = m && epOf.get(m); if (!at) return null;
        return { badge: 'Series', rank: '#1 in Top 10 Moments', title: at.ep.title, sub: stories[f.key] || at.ep.story || at.ep.len, meta: `<span>${at.ep.label}</span><span>${fmtMD(at.ep.day)}</span>`, m,
          play: () => playEp(at.ep.id, at.i), playLabel: 'Play', info: () => overlay('sheet', { season: at.ep.season.n }) };
      }
      if (f.kind === 'season') {
        const s = seasons.find(x => x.n === f.n); if (!s || !s.episodes.length) return null;
        const m = MEDIA.find(x => x.f === s.hero) || s.episodes[0].cover;
        return { badge: f.tag, title: s.title, sub: s.blurb, meta: `<span>Season ${s.n}</span><span>${s.episodes.length} episodes</span><span>${esc(s.tag)}</span>`, m,
          play: () => playEp(s.episodes[0].id, 0), playLabel: 'Play', info: () => overlay('sheet', { season: s.n }) };
      }
      return null;
    }).filter(Boolean);
  }
  /* Bollywood highlights: a fresh mix on every visit, never repeating the last ones shown */
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { const b = [...a]; for (let k = b.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [b[k], b[j]] = [b[j], b[k]]; } return b; };
  function highlight(h) {
    const badge = rnd(window.HIGHLIGHT_BADGES || ['Superhit']);
    if (h.season != null) {
      const s = seasons.find(x => x.n === h.season); if (!s || !s.episodes.length) return null;
      const photos = s.episodes.map(e => e.cover).filter(m => m.k === 'img');
      const m = rnd(photos.filter(x => x.p).length ? photos.filter(x => x.p) : photos);
      return { key: 's' + h.season, badge: 'Series', tagNew: badge, title: s.title, sub: h.line, filmy: true, m,
        meta: `<span>Season ${s.n}</span><span>${s.episodes.length} episodes</span><span>${esc(s.tag)}</span><span class="box hd">HD</span>`,
        play: () => playEp(s.episodes[0].id, 0), playLabel: 'Play', info: () => overlay('sheet', { season: s.n }) };
    }
    const ep = epByDay[h.day]; if (!ep) return null;
    // prefer sharp, high-resolution photos with her face; fall back gracefully
    const photos = ep.items.filter(m => m.k === 'img'), faces = photos.filter(m => m.p), big = faces.filter(m => Math.max(m.w, m.h) >= 1400);
    const m = big.length ? rnd(big) : faces.length ? rnd(faces) : (photos.length ? rnd(photos) : ep.cover);
    return { key: h.day, badge: 'Series', tagNew: isRecent(ep) ? 'Recently Added' : badge, title: ep.title, sub: h.line, filmy: true, m,
      meta: `<span>${ep.label}</span><span>${fmtMD(ep.day)}</span><span>${esc(ep.len)}</span><span class="box hd">HD</span>`,
      play: () => playEp(ep.id, ep.items.indexOf(m) > -1 ? ep.items.indexOf(m) : 0), playLabel: isNew(ep) ? 'Watch Now' : 'Play', info: () => overlay('sheet', { season: ep.season.n }) };
  }
  function pickFeatures() {
    const series = resolveFeatures().find(f => f.logo);
    const pool = (window.HIGHLIGHTS || []).map(highlight).filter(Boolean);
    let seen = store.get('bbSeen', []);
    let fresh = pool.filter(f => !seen.includes(f.key));
    if (fresh.length < 5) { seen = []; fresh = pool; }
    const take = shuffle(fresh).slice(0, 5);
    store.set('bbSeen', [...seen, ...take.map(f => f.key)].slice(-30));
    return series ? [take[0], series, ...take.slice(1)].filter(Boolean) : take;
  }
  const playFirst = () => { const lw = lastWatched()[0]; const ep = lw && lw.frac < 0.98 ? lw.ep : (seasons.find(s => s.n === 1).episodes[0] || allEpisodes[0]); playEp(ep.id, lw && lw.ep === ep ? lw.i : 0); };

  function showFeature(k, first) {
    const f = feats[fi = k], L = layers[li = 1 - li], old = layers[1 - li];
    const useVideo = f.video && (window.innerHeight > window.innerWidth || window.innerWidth < 720) && !reduced;
    const lowres = Math.max(f.m.w || 0, f.m.h || 0) < 1400 && window.innerWidth >= 900;   // don't stretch small photos across a wide screen
    L.classList.toggle('lowres', lowres);
    L.innerHTML = `${lowres ? `<img class="bb-back" src="${pic(f.m.t)}" alt="">` : ''}<img src="${pic(f.m.f)}" alt="" style="object-position:${pos(f.m)}" decoding="async">${useVideo ? `<video muted playsinline loop preload="auto" src="${f.video}"></video>` : ''}`;
    L.style.setProperty('--ox', pos(f.m).split(' ')[0]); L.style.setProperty('--oy', pos(f.m).split(' ')[1]);
    bb.style.setProperty('--amb', amb(f.m));
    if (curVideo) { curVideo.pause(); curVideo = null; }
    const v = $('video', L);
    if (v) { curVideo = v; v.addEventListener('playing', () => v.classList.add('ready'), { once: true }); if (!paused) v.play().catch(() => {}); }
    $('#bb-mute').hidden = !v;
    const swap = () => { L.classList.add('on'); old.classList.remove('on'); setTimeout(() => { if (old !== layers[li]) old.innerHTML = ''; }, 1300); };
    const im = $('img:not(.bb-back)', L); (im.decode ? im.decode() : Promise.resolve()).then(swap, swap);
    const body = $('#bb-body');
    const fill = () => {
      $('#bb-tagline').innerHTML = `<svg viewBox="0 0 111 190"><use href="#n"/></svg><span>${esc(f.badge)}</span>${f.tagNew ? `<span class="tag-new">${esc(f.tagNew)}</span>` : ''}`;
      const t = f.logo ? SHOW.title : f.title;
      $('#bb-title').innerHTML = logoOf(t) ? titleHTML(t, 'bb').replace(' loading="lazy"', '') : f.logo ? logoSVG() : `<span class="bb-h ${lookCls(t)}">${esc(t)}</span>`;
      $('#bb-rank').hidden = !f.rank; $('#bb-rank span').textContent = f.rank || '';
      $('#bb-tag').textContent = f.sub || '';
      $('#bb-tag').classList.toggle('filmy', !!f.filmy);
      $('#bb-meta').innerHTML = f.meta + (f.logo ? `<span class="stats">${stats}</span>` : '');
      $('#bb-play span').textContent = f.playLabel;
      $('#bb-trailer').hidden = !f.trailer;
      body.classList.remove('out');
    };
    if (first) fill(); else { body.classList.add('out'); setTimeout(fill, 350); }
    $$('.bb-dots i').forEach((d, j) => d.classList.toggle('on', j === k));
  }
  function rotate() { clearTimeout(rotT); if (paused || feats.length < 2 || document.hidden) return; rotT = setTimeout(() => { showFeature((fi + 1) % feats.length); rotate(); }, 8000); }

  function build() {
    feats = pickFeatures();
    $('.bb-dots').innerHTML = feats.map(() => '<i></i>').join('');
    $('#bb-maturity').textContent = SHOW.maturity;
    showFeature(0, true);
    renderRows();
  }
  function renderRows() {
    const rows = [];
    const cw = lastWatched().filter(x => x.frac > 0.02 && x.frac < 0.98).slice(0, 12);
    if (cw.length) rows.push(rowHTML('continue', `Continue Watching for ${profileName()}`, cw.map(x => cardHTML(x.ep, { i: x.i })).join('')));
    const otd = onThisDay();
    if (otd.length) rows.push(rowHTML('today', 'On This Day in Earlier Years', otd.slice(0, 10).map(x => cardHTML(x.e, { ep: `${x.years} year${x.years > 1 ? 's' : ''} ago`, badge: false })).join('')));
    rows.push(rowHTML('top10', 'Top 10 Moments, Ranked by Premal', TOP10.map(k => byKey[k]).filter(m => m && epOf.get(m)).map(topCardHTML).join(''), 'top10-row'));
    const fresh = allEpisodes.filter(isNew).reverse().slice(0, 12);
    if (fresh.length) rows.push(rowHTML('new', 'New Episodes', fresh.map(e => cardHTML(e, { badge: false })).join('')));
    if (myList.length) rows.push(rowHTML('list', 'My List', myList.map(id => cardHTML(epById[id], { badge: false })).join(''), '', `<button class="row-act" type="button" data-act="send">Send to Premal</button>`));
    rows.push(rowHTML('seasons', 'Seasons', realSeasons().map(posterHTML).join(''), 'season-row'));
    const vids = MEDIA.filter(m => m.k === 'vid' && epOf.get(m));
    rows.push(rowHTML('videos', 'Videos', vids.map(m => { const at = epOf.get(m); return cardHTML(at.ep, { i: at.i, m, vid: true, title: at.ep.title, len: at.ep.sub, prog: false, badge: false }); }).join('')));
    const remind = store.get('remind', false);
    rows.push(rowHTML('soon', 'Coming Soon', (window.COMING_SOON || []).map(c => { const m = MEDIA.find(x => x.f === c.still) || allEpisodes[allEpisodes.length - 1].cover; return `<div class="soon">${ART.comingSoon ? `<img src="${ART.comingSoon}" alt="" loading="lazy" decoding="async">` : imgHTML(m, '', c.title)}<div class="soon-body"><small>${esc(c.tag)}</small><b>${esc(c.title)} · ${esc(c.name)}</b><p>${esc(c.blurb)}</p><button class="remind ${remind ? 'on' : ''}" type="button" data-act="remind">${use(remind ? 'i-check' : 'i-bell')}${remind ? 'Reminder set' : 'Remind Me'}</button></div></div>`; }).join('')));
    const ex = seasons.find(s => s.n === EXTRAS.n);
    if (ex.episodes.length) rows.push(rowHTML('extras', 'Extras', ex.episodes.map(e => cardHTML(e)).join('')));
    $('#rows').innerHTML = rows.join('');
    $$('.row').forEach(r => { io.observe(r); pager(r); });
    measure();
  }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  /* row pagination indicator */
  function pager(row) {
    const s = $('.strip', row), p = $('.pager', row); if (!s || !p) return;
    const n = Math.max(1, Math.ceil(s.scrollWidth / Math.max(1, s.clientWidth) - 0.05)), at = Math.round(s.scrollLeft / Math.max(1, s.clientWidth));
    p.innerHTML = n > 1 ? Array.from({ length: n }, (_, k) => `<i class="${k === Math.min(at, n - 1) ? 'on' : ''}"></i>`).join('') : '';
  }
  $('#rows').addEventListener('scroll', e => { if (e.target.classList && e.target.classList.contains('strip')) { pager(e.target.closest('.row')); jaw.hide(); } }, { capture: true, passive: true });

  /* cached row offsets so the scroll handler never forces layout */
  let marks = [], navBtns = $$('.nav-links button'), navCur = '', ticking = false, bbH = 600;
  function measure() { marks = ['videos', 'list', 'seasons'].map(id => ({ id, el: $('#row-' + id) })).filter(m => m.el).map(m => ({ id: m.id, top: m.el.offsetTop })).sort((a, b) => b.top - a.top); bbH = bb.offsetHeight || 600; $$('.row').forEach(pager); }
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('scroll', () => {
    if (state.screen !== 'browse' || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY;
      nav.classList.toggle('solid', y > 40);
      if (!reduced) { const k = Math.min(1, y / bbH); bb.style.setProperty('--py', `${(y * 0.35).toFixed(1)}px`); bb.style.setProperty('--dim', (1 - k * 0.85).toFixed(3)); }
      const cur = (marks.find(m => y + 120 >= m.top) || { id: 'top' }).id;
      if (cur !== navCur) { navCur = cur; navBtns.forEach(b => b.classList.toggle('cur', b.dataset.nav === cur)); }
      jaw.hide();
    });
  }, { passive: true });

  $('#rows').addEventListener('click', e => {
    const chev = e.target.closest('.chev');
    if (chev) { const s = $('.strip', chev.parentElement); s.scrollBy({ left: (chev.classList.contains('l') ? -1 : 1) * s.clientWidth * 0.9, behavior: reduced ? 'auto' : 'smooth' }); return; }
    const act = e.target.closest('[data-act]');
    if (act && act.dataset.act === 'send') return sendFavourites();
    if (act && act.dataset.act === 'remind') { const on = !store.get('remind', false); store.set('remind', on); toast(on ? 'We’ll remind you when Season 6 starts' : 'Reminder removed'); renderRows(); return; }
    const c = e.target.closest('[data-ep],[data-season]'); if (!c) return;
    if (c.dataset.season != null) return overlay('sheet', { season: +c.dataset.season });
    playEp(c.dataset.ep, c.dataset.i != null ? +c.dataset.i : undefined);
  });
  $('#bb-play').addEventListener('click', () => feats[fi].play());
  $('#bb-info').addEventListener('click', () => feats[fi].info());
  $('#bb-trailer').addEventListener('click', () => overlay('player', { ep: 'trailer', i: 0 }));
  $('.bb-dots').addEventListener('click', e => { const k = $$('.bb-dots i').indexOf(e.target); if (k >= 0) { showFeature(k); rotate(); } });
  $('#foot-credits').addEventListener('click', () => go('finale'));
  $('#foot-all').addEventListener('click', () => overlay('sheet', { season: 1 }));
  $('#foot-send').addEventListener('click', sendFavourites);
  $('.nav-logo').addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
  $('#bb-mute').addEventListener('click', () => { if (!curVideo) return; curVideo.muted = !curVideo.muted; $('#bb-mute').setAttribute('aria-label', curVideo.muted ? 'Unmute' : 'Mute'); $('#bb-mute').style.opacity = curVideo.muted ? '' : '.55'; });
  navBtns.forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.nav; if (t === 'finale') return go('finale');
    if (t === 'list' && !myList.length) return toast('Tap + on any episode to add it to My List');
    const el = t === 'top' ? null : $('#row-' + t);
    window.scrollTo({ top: el ? el.offsetTop - 70 : 0, behavior: reduced ? 'auto' : 'smooth' });
  }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) { clearTimeout(rotT); if (curVideo) curVideo.pause(); } else if (!paused) { if (curVideo) curVideo.play().catch(() => {}); rotate(); } });
  return {
    ensure() { if (!built) { build(); built = true; } else renderRows(); $('#nav-avatar').src = pic(PROFILES[profile].photo); bell.refreshDot(); },
    refresh() { if (built && state.screen === 'browse') { const y = window.scrollY; renderRows(); window.scrollTo(0, y); } },
    setPaused(p) { paused = p; if (p) { clearTimeout(rotT); if (curVideo) curVideo.pause(); } else { if (curVideo) curVideo.play().catch(() => {}); rotate(); } },
    pause() { if (curVideo) curVideo.pause(); },
    playTrailer() { overlay('player', { ep: 'trailer', i: 0 }); },
  };
})();

/* "Send my favourites to Premal": loved + liked episodes and My List, as text */
async function sendFavourites() {
  const line = id => `• ${epById[id].title} (${epById[id].label})`;
  const loved = Object.keys(ratings).filter(id => ratings[id] === 'love' && epById[id]), liked = Object.keys(ratings).filter(id => ratings[id] === 'up' && epById[id]);
  if (!loved.length && !liked.length && !myList.length) return toast('Rate or add episodes first, then send them');
  const text = [`${profileName()}'s favourites from Shivani & Premal`, loved.length && `\nLoved:\n${loved.map(line).join('\n')}`, liked.length && `\nLiked:\n${liked.map(line).join('\n')}`, myList.length && `\nMy List:\n${myList.map(line).join('\n')}`].filter(Boolean).join('\n');
  try { if (navigator.share) { await navigator.share({ title: 'My favourites', text }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(text); toast('Copied. Paste it in a message to Premal'); } catch { toast('Couldn’t copy. Try again from Safari or Chrome'); }
}

/* ═══ JAWBONE (desktop hover card) ═══════════════════════ */
const jaw = (() => {
  const el = $('#jaw'), media = $('#jaw-media');
  let t = 0, cur = null, slideT = 0, hideT = 0;
  const enabled = () => canHover && window.innerWidth >= 720;
  function show(card) {
    const ep = epById[card.dataset.ep]; if (!ep) return;
    const r = card.getBoundingClientRect(), w = Math.min(r.width * 1.5, 420), g = 16;
    let left = r.left + r.width / 2 - w / 2; left = Math.max(g, Math.min(window.innerWidth - g - w, left));
    el.style.width = w + 'px'; el.style.left = left + 'px'; el.style.top = (r.top + window.scrollY - (w * 9 / 16 - r.height) / 2 - 8) + 'px';
    cur = { ep, i: card.dataset.i != null ? +card.dataset.i : null, vid: card.dataset.vid };
    clearInterval(slideT);
    if (cur.vid) media.innerHTML = `<video muted autoplay loop playsinline src="${cur.vid}"></video>`;
    else {
      const ims = [ep.cover, ...ep.items.filter(m => m.k === 'img' && m !== ep.cover)].slice(0, 4);
      media.innerHTML = ims.map((m, k) => `<img src="${pic(m.t)}" alt="" class="${k ? 'off' : ''}" style="object-position:${pos(m)}">`).join('');
      let k = 0; if (ims.length > 1 && !reduced) slideT = setInterval(() => { const all = $$('img', media); all[k].classList.add('off'); k = (k + 1) % all.length; all[k].classList.remove('off'); }, 1400);
    }
    const p = progress[ep.id];
    $('#jaw-meta').innerHTML = `${isNew(ep) ? `<span class="badge-inline">${newLabel(ep)}</span>` : ''}<span class="match">${ratings[ep.id] === 'down' ? '' : '100% Match'}</span><span class="box">${SHOW.maturity}</span><b>${esc(ep.label)}</b><span>${mins(ep.runtime)}</span><span class="box hd">HD</span>${p && p.frac < 0.98 ? `<span>${Math.round(p.frac * 100)}% watched</span>` : ''}<span style="flex-basis:100%;font-size:20px" class="${logoOf(ep.title) ? 'jaw-logo' : lookCls(ep.title) || 'jaw-t'}">${titleHTML(ep.title, 'jaw')}</span>`;
    $('#jaw-tags').innerHTML = [ep.season.title, ep.day !== 'undated' ? String(parseD(ep.day).getFullYear()) : '', ep.vids ? 'Videos' : 'Photos', ...(SHOW.moods || []).slice(0, 1)].filter(Boolean).map(x => `<span>${esc(x)}</span>`).join('');
    $('[data-act="list"] use', el).setAttribute('href', inList(ep.id) ? '#i-check' : '#i-plus');
    $('[data-act="like"] use', el).setAttribute('href', '#' + rateIcon(ep.id));
    el.hidden = false; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  }
  function hide() { clearTimeout(t); clearInterval(slideT); if (!el.hidden) { el.hidden = true; media.innerHTML = ''; cur = null; } }
  $('#rows').addEventListener('mouseover', e => {
    if (!enabled()) return;
    const c = e.target.closest('.card'); if (!c || (cur && cur.card === c)) return;
    clearTimeout(t); t = setTimeout(() => { show(c); if (cur) cur.card = c; }, 480);
  });
  $('#rows').addEventListener('mouseout', e => { const c = e.target.closest('.card'); if (c && !c.contains(e.relatedTarget) && !el.contains(e.relatedTarget)) { clearTimeout(t); hideT = setTimeout(() => { if (!el.matches(':hover')) hide(); }, 80); } });
  el.addEventListener('mouseleave', () => hide());
  el.addEventListener('mouseenter', () => clearTimeout(hideT));
  el.addEventListener('click', e => {
    if (!cur) return;
    const b = e.target.closest('[data-act]'), act = b ? b.dataset.act : 'play', ep = cur.ep;
    if (act === 'play') { const i = cur.i; hide(); playEp(ep.id, i ?? undefined); }
    else if (act === 'list') { const on = toggleList(ep.id); $('use', b).setAttribute('href', on ? '#i-check' : '#i-plus'); }
    else if (act === 'like') { cycleRating(ep.id); $('use', b).setAttribute('href', '#' + rateIcon(ep.id)); }
    else if (act === 'info') { hide(); overlay('sheet', { season: ep.season.n }); }
  });
  return { hide };
})();

/* ═══ NOTIFICATIONS BELL ═════════════════════════════════ */
const bell = (() => {
  const btn = $('#nav-bell'), menu = $('#bell-menu'), dot = $('#bell-dot');
  const seen = () => store.get('seen', { latest: '', otd: '' });
  const unread = () => { const s = seen(); return { fresh: latestDay > (s.latest || ''), otd: onThisDay().length > 0 && s.otd !== todayStr() }; };
  function refreshDot() { const u = unread(); dot.hidden = !(u.fresh || u.otd); }
  function item(ep, line, small, isUnread) { return `<button class="bell-item ${isUnread ? 'unread' : ''}" type="button" data-ep="${ep.id}">${imgHTML(ep.cover, '', ep.alt)}<span><b>${esc(line)}</b><span>${esc(ep.title)}</span><small>${esc(small)}</small></span></button>`; }
  function open() {
    const u = unread(), s = seen(), otd = onThisDay().slice(0, 4), fresh = allEpisodes.filter(isNew).reverse().slice(0, 6);
    menu.innerHTML = (otd.length ? `<h4>On this day</h4>${otd.map(x => item(x.e, `${x.years} year${x.years > 1 ? 's' : ''} ago today`, fmtMD(x.e.day), u.otd)).join('')}` : '') +
      (fresh.length ? `<h4>New episodes</h4>${fresh.map(e => item(e, newLabel(e), `${e.label} · ${fmtMD(e.day)}`, e.day > (s.latest || ''))).join('')}` : '') || '<p class="bell-empty">You’re all caught up.</p>';
    menu.hidden = false; btn.setAttribute('aria-expanded', 'true');
    store.set('seen', { latest: latestDay, otd: todayStr() }); refreshDot();
  }
  function close() { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
  btn.addEventListener('click', e => { e.stopPropagation(); menu.hidden ? open() : close(); });
  menu.addEventListener('click', e => { const b = e.target.closest('[data-ep]'); if (b) { close(); playEp(b.dataset.ep, 0); } });
  document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target)) close(); });
  return { refreshDot, close };
})();

/* ═══ SEARCH ═════════════════════════════════════════════ */
const search = (() => {
  const el = $('#search'), input = $('#search-input'), grid = $('#search-grid'), hint = $('#search-hint');
  const index = allEpisodes.map(e => ({ e, hay: norm([e.title, e.story, e.label, e.season.title, `season ${e.season.n}`, e.day === 'undated' ? 'undated' : `${fmtLong(e.day)} ${MONTHS[parseD(e.day).getMonth()]} ${parseD(e.day).getFullYear()}`, e.vids ? 'video videos' : '', e.note ? 'note letter' : ''].join(' ')) }));
  function run() {
    const q = norm(input.value);
    if (!q) {
      const picks = TOP10.map(k => epOf.get(byKey[k])?.ep).filter(Boolean);
      hint.textContent = 'Try “Navratri”, “Québec”, “birthday”, “July” or “2024”. Top picks:';
      grid.innerHTML = [...new Set(picks)].map(e => cardHTML(e, { badge: false })).join(''); return;
    }
    const terms = q.split(' ');
    const hits = index.filter(x => terms.every(t => x.hay.includes(t))).map(x => x.e);
    hint.textContent = hits.length ? `${hits.length} episode${hits.length > 1 ? 's' : ''} for “${input.value.trim()}”` : `No episodes match “${input.value.trim()}”. Try a place, a month or a year.`;
    grid.innerHTML = hits.map(e => cardHTML(e, { badge: false })).join('');
  }
  input.addEventListener('input', run);
  grid.addEventListener('click', e => { const c = e.target.closest('[data-ep]'); if (c) playEp(c.dataset.ep, 0); });
  $('#search-close').addEventListener('click', back);
  $('#nav-search').addEventListener('click', () => overlay('search'));
  return { show() { el.hidden = false; run(); setTimeout(() => input.focus(), 50); }, hide() { el.hidden = true; } };
})();

/* ═══ DETAILS SHEET ══════════════════════════════════════ */
const sheet = (() => {
  const wrap = $('#sheet-wrap'), box = $('#sheet'), sel = $('#season-select');
  let cur = 1;
  function show(n = 1, tab = 'eps') {
    cur = seasons.some(s => s.n === n && s.episodes.length) ? n : 1;
    const pm = MEDIA.find(x => x.f === SHOW.poster);
    $('#sheet-img').src = pic(SHOW.poster); $('#sheet-img').alt = `${SHOW.title} poster`;
    if (pm) $('#sheet-img').style.objectPosition = pos(pm);
    const faceRight = !pm || !pm.p || pm.p[0] >= 0.5;   // put the logo on the side away from her face
    $('#sheet-title').classList.toggle('right', !faceRight);
    $('#sheet-hero').style.setProperty('--fade-dir', faceRight ? 'right' : 'left');
    $('#sheet-meta').innerHTML = `<span class="match">100% Match</span><span>${SHOW.year}</span><span class="box">${SHOW.maturity}</span><span>${SEASONS.length - 1} Seasons + Prequel</span><span class="box hd">HD</span><span class="adv">${esc(SHOW.rating)}: ${esc(SHOW.advisories)}</span>`;
    $('#sheet-syn').textContent = SHOW.synopsis;
    $('#sheet-cast').innerHTML = `<b>Starring:</b> <span>${SHOW.cast.join(', ')}</span><br><b>Genres:</b> <span>${SHOW.genres.join(', ')}</span><br><b>This show is:</b> <span>${(SHOW.moods || []).join(', ')}</span><br><b>Created by:</b> <span>${esc(SHOW.creator)}</span>`;
    sel.innerHTML = seasons.filter(s => s.episodes.length).map(s => `<option value="${s.n}" ${s.n === cur ? 'selected' : ''}>${s.n === EXTRAS.n ? 'Extras' : `Season ${s.n}`}</option>`).join('');
    renderSeason(); renderMore(); renderLike(); setTab(tab || 'eps');
    wrap.classList.add('on'); box.scrollTop = 0; box.style.transform = '';
    setTimeout(() => $('#sheet-close').focus({ preventScroll: true }), 60);
  }
  function setTab(t) { $$('.sheet-tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === t)); ['eps', 'more', 'like'].forEach(k => { $('#tab-' + k).hidden = k !== t; }); }
  function renderSeason() {
    const s = seasons.find(x => x.n === cur);
    $('#season-count').textContent = `${s.title} · ${s.episodes.length} episodes`;
    $('#season-blurb').textContent = s.blurb;
    $('#ep-list').innerHTML = s.episodes.map(ep => {
      const p = progress[ep.id], hasStory = ep.story && norm(ep.story) !== norm(ep.title);
      const dateIsTitle = !ep.named;
      const when = ep.day === 'undated' ? 'Date unknown' : (dateIsTitle ? fmtWeekday(ep.day) : fmtLong(ep.day));
      const extra = ep.days.length > 1 ? ` + ${ep.days.length - 1} more day${ep.days.length > 2 ? 's' : ''}` : '';
      const fav = ratings[ep.id] === 'love' || ratings[ep.id] === 'up' ? `<i class="ep-fav">${use(rateIcon(ep.id))}</i>` : '';
      return `<div class="ep-row"><button class="ep" type="button" data-ep="${ep.id}">
        <span class="ep-n">${ep.n}</span>
        <span class="ep-thumb">${imgHTML(ep.cover, '', ep.alt)}<span class="play"><i>${svgPlay}</i></span>${p ? `<span class="card-prog"><i style="width:${Math.round(p.frac * 100)}%"></i></span>` : ''}</span>
        <span class="ep-body"><span class="ep-title"><span>${esc(ep.title)}${ep.note ? `<i class="ep-note">${use('i-note')}</i>` : ''}${fav}</span><small>${mins(ep.runtime)}</small></span>
        <span class="ep-story">${esc(hasStory ? ep.story : ep.len)}</span><span class="ep-date">${when}${extra}${ep.est ? ' (approx.)' : ''}${hasStory ? ' · ' + ep.len : ''}</span></span></button>
        <button class="round ep-add" type="button" data-add="${ep.id}" aria-label="${inList(ep.id) ? 'Remove from' : 'Add to'} My List: ${esc(ep.title)}" aria-pressed="${inList(ep.id)}">${use(inList(ep.id) ? 'i-check' : 'i-plus')}</button></div>`;
    }).join('');
    $('#tbc').classList.toggle('hide', !s.toBeContinued);
    const lw = lastWatched()[0]; $('#sheet-play span').textContent = lw && lw.frac < 0.98 ? 'Resume' : 'Play';
  }
  function renderMore() {
    const vids = MEDIA.filter(m => m.k === 'vid' && epOf.get(m));
    $('#tab-more').innerHTML = `<button class="trailer-card" type="button" data-trailer>${ART.trailer ? `<img src="${ART.trailer}" alt="" loading="lazy" decoding="async">` : imgHTML(trailerEp.cover, '', 'Trailer')}<span class="play"><i>${svgPlay}</i></span><span class="tc-body"><b>Official Trailer</b><span>${secs(trailerEp.runtime / 1000)} · Top 10 moments and a few clips</span></span></button>
      <h3 class="sub-h">Clips</h3><div class="more-grid">${vids.map(m => { const at = epOf.get(m); return cardHTML(at.ep, { i: at.i, m, vid: true, len: at.ep.sub, prog: false, badge: false }); }).join('')}</div>`;
  }
  function renderLike() {
    $('#tab-like').innerHTML = `<h3 class="sub-h">Seasons</h3><div class="more-grid">${realSeasons().map(posterHTML).join('')}</div>
      <h3 class="sub-h" style="margin-top:18px">Top 10 Moments</h3><div class="more-grid">${TOP10.map(k => byKey[k]).filter(m => m && epOf.get(m)).map(m => { const at = epOf.get(m); return cardHTML(at.ep, { i: at.i, m, badge: false }); }).join('')}</div>`;
  }
  sel.addEventListener('change', () => { cur = +sel.value; renderSeason(); });
  $('.sheet-tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) setTab(b.dataset.tab); });
  box.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) { const on = toggleList(add.dataset.add); add.innerHTML = use(on ? 'i-check' : 'i-plus'); add.setAttribute('aria-pressed', on); add.setAttribute('aria-label', `${on ? 'Remove from' : 'Add to'} My List`); return; }
    if (e.target.closest('[data-trailer]')) return swapOverlay('player', { ep: 'trailer', i: 0 });
    const s = e.target.closest('[data-season]'); if (s && s.closest('#tab-like')) { cur = +s.dataset.season; sel.value = cur; renderSeason(); setTab('eps'); box.scrollTo({ top: $('#tab-eps').offsetTop - 60, behavior: 'smooth' }); return; }
    const b = e.target.closest('[data-ep]'); if (!b || !box.contains(b)) return;
    playEp(b.dataset.ep, b.dataset.i != null ? +b.dataset.i : undefined);
  });
  $('#sheet-play').addEventListener('click', () => { const lw = lastWatched()[0]; const ep = lw && lw.frac < 0.98 ? lw.ep : seasons.find(x => x.n === cur).episodes[0]; playEp(ep.id, lw && lw.ep === ep ? lw.i : 0); });
  $('#sheet-trailer').addEventListener('click', () => swapOverlay('player', { ep: 'trailer', i: 0 }));
  $('#sheet-close').addEventListener('click', back);
  wrap.addEventListener('click', e => { if (e.target === wrap) back(); });
  /* drag the sheet down to close it (phones) */
  let y0 = null, dy = 0;
  box.addEventListener('touchstart', e => { if (box.scrollTop > 0 || window.innerWidth >= 720) { y0 = null; return; } y0 = e.touches[0].clientY; dy = 0; }, { passive: true });
  box.addEventListener('touchmove', e => { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); if (dy > 0) { box.classList.add('drag'); box.style.transform = `translate3d(0,${dy}px,0)`; } }, { passive: true });
  box.addEventListener('touchend', () => { if (y0 == null) return; box.classList.remove('drag'); if (dy > 110) back(); else box.style.transform = ''; y0 = null; });
  return { show, hide() { wrap.classList.remove('on'); box.style.transform = ''; } };
})();

/* ═══ PLAYER ═════════════════════════════════════════════ */
const player = {};
Object.assign(player, (() => {
  const el = $('#player'), frames = [$('#frame-a'), $('#frame-b')], blur = $('#stage-blur');
  const fill = $('#fill'), knob = $('#knob'), timeEl = $('#pl-time'), countEl = $('#pl-count'), next = $('#next'), loader = $('#pl-loader'), titleCard = $('#pl-titlecard'), noteEl = $('#note');
  let segCur = null, ep = null, i = 0, playing = true, fi = 0, raf = 0, t0 = 0, elapsed = 0, curDur = PHOTO_MS, video = null, hideT = 0, nextTick = 0, seq = 0, cardT = 0, prefixes = [], wasPlaying = true;
  const cache = new Map();
  const preload = m => {
    if (!m || m.k !== 'img' || cache.has(m.f)) return;
    const im = new Image(); im.decoding = 'async'; im.src = pic(m.f); cache.set(m.f, im);
    if (cache.size > 8) cache.delete(cache.keys().next().value);
  };
  const KB = ['kb-in', 'kb-left', 'kb-up', 'kb-out', 'kb-right'];
  const photoMs = () => (ep && ep.photoMs) || PHOTO_MS;
  const prefix = idx => prefixes[idx] || 0;
  const splitOK = () => window.innerWidth >= 1000;

  function open(epId, idx = 0) {
    let e = epById[epId]; if (!e) return;
    // "Previously on…" before the first episode of a season, once per season
    const recaps = store.get('recaps', {});
    if (!e.virtual && e.n === 1 && e.season.n >= 1 && e.season.n !== EXTRAS.n && !idx && !recaps[e.season.n]) {
      const r = recapEp(e); if (r) { recaps[e.season.n] = 1; store.set('recaps', recaps); epById[r.id] = r; e = r; idx = 0; }
    }
    ep = e; i = Math.min(idx, ep.items.length - 1);
    prefixes = [0]; ep.items.forEach((m, k) => { prefixes[k + 1] = prefixes[k] + (m.k === 'vid' ? m.dur * 1000 : photoMs()); });
    el.classList.add('on'); el.classList.toggle('first', !store.get('hinted2', false)); store.set('hinted2', true);
    el.style.transform = ''; el.style.opacity = '';
    const sLabel = ep.virtual ? '' : (ep.season.n === EXTRAS.n ? 'Extras' : `Season ${ep.season.n}`);
    $('#pl-ep').textContent = ep.virtual ? SHOW.title : `${ep.label}`;
    $('#pl-name').textContent = ep.title;
    $('#segs').innerHTML = ep.items.map(() => '<i><b></b></i>').join('');
    $('#ticks').innerHTML = ep.items.length > 24 ? '' : ep.items.slice(1).map((_, k) => `<i style="left:${(prefix(k + 1) / ep.runtime * 100).toFixed(2)}%"></i>`).join('');
    const n = nextEpisode(ep); $('#pl-nextep').style.visibility = n ? '' : 'hidden';
    $('#pl-note').classList.toggle('hide', !ep.note); noteEl.classList.remove('on');
    ['#pl-like', '#pl-mylist'].forEach(s => $(s).classList.toggle('hide', !!ep.virtual));
    syncButtons();
    $('#skip-recap').hidden = !ep.recap;
    if (ep.virtual) music.play(0.6); else music.stop(600);
    $('#tc-ep').textContent = ep.virtual ? (ep.recap ? 'Previously on' : 'Official Trailer') : `${sLabel} · Episode ${ep.n}`;
    const tct = ep.recap ? ep.prevTitle : ep.title;
    $('#tc-title').innerHTML = ep.virtual ? esc(tct) : titleHTML(tct, 'tc').replace(' loading="lazy"', '');
    $('#tc-title').className = ep.virtual ? '' : logoOf(tct) ? 'has-logo' : lookCls(tct);
    $('#tc-sub').textContent = ep.virtual ? SHOW.title : (ep.day === 'undated' ? ep.len : `${fmtLong(ep.day)}${ep.est ? ' (approx.)' : ''} · ${ep.len}`);
    titleCard.classList.toggle('first', ep.virtual || ep.n === 1);
    const art = ep.virtual && (ep.recap ? ART.previously : ART.trailer), artEl = $('#pl-art');
    if (art) artEl.style.backgroundImage = `url("${art}")`;
    artEl.classList.toggle('on', !!art);
    clearTimeout(cardT); titleCard.classList.add('on'); cardT = setTimeout(() => { titleCard.classList.remove('on'); artEl.classList.remove('on'); }, 3400);
    const nx = nextEpisode(ep);
    $('#ps-next').innerHTML = nx ? `${imgHTML(nx.cover, '', nx.alt)}<span>Next<b>${esc(nx.label)} · ${esc(nx.title)}</b></span>` : '';
    playing = true; setIcon(); showUI(); show(i);
    setTimeout(() => $('#pl-back').focus({ preventScroll: true }), 60);
  }
  function syncButtons() {
    if (!ep || ep.virtual) return;
    $('#pl-mylist use').setAttribute('href', inList(ep.id) ? '#i-check' : '#i-plus');
    $('#pl-mylist').setAttribute('aria-label', inList(ep.id) ? 'Remove from My List' : 'Add to My List');
    $('#pl-like use').setAttribute('href', '#' + rateIcon(ep.id));
  }
  function close() {
    cancelAnimationFrame(raf); clearTimeout(hideT); clearInterval(nextTick); clearTimeout(cardT);
    if (video) { video.pause(); video.removeAttribute('src'); video.load(); video = null; }
    frames.forEach(f => { f.innerHTML = ''; f.classList.remove('on'); });
    next.classList.remove('on'); titleCard.classList.remove('on'); $('#pl-art').classList.remove('on'); loader.classList.remove('on'); blur.classList.remove('on'); noteEl.classList.remove('on');
    el.classList.remove('on', 'split'); el.style.transform = ''; el.style.opacity = '';
    if (ep && ep.virtual) music.stop();
    ep = null; seq++;
  }
  function show(idx) {
    if (player.resetZoom) player.resetZoom();
    i = idx; clearInterval(nextTick); next.classList.remove('on');
    const m = ep.items[i], f = frames[fi = 1 - fi], old = frames[1 - fi], my = ++seq;
    if (video) { video.pause(); video.removeAttribute('src'); video.load(); video = null; }
    cancelAnimationFrame(raf);
    f.innerHTML = '';
    const story = ep.virtual ? '' : storyOf(m);
    const showStory = story && norm(story) !== norm(ep.title);
    $('#pl-date').textContent = ep.recap ? '' : [fmtLong(m.d), fmtTime(m.d)].filter(Boolean).join(' · ') + (m.est ? ' · approx.' : '');
    $('#pl-story').textContent = showStory ? story : '';
    countEl.textContent = `${i + 1} / ${ep.items.length}`;
    $$('#segs b').forEach((b, k) => { b.style.width = k < i ? '100%' : '0%'; });
    segCur = $$('#segs b')[i] || null;
    el.style.setProperty('--amb', amb(m));
    const split = splitOK() && isPortrait(m) && !ep.virtual;
    el.classList.toggle('split', split);
    if (split) { $('#ps-ep').textContent = `${ep.season.n === EXTRAS.n ? 'Extras' : 'Season ' + ep.season.n} · Episode ${ep.n}`; $('#ps-title').innerHTML = titleHTML(ep.title, 'ps'); $('#ps-title').className = logoOf(ep.title) ? 'has-logo' : lookCls(ep.title); $('#ps-date').textContent = [fmtLong(m.d), fmtTime(m.d)].filter(Boolean).join(' · '); $('#ps-story').textContent = story || ''; }
    preload(ep.items[i + 1]); preload(ep.items[i + 2]);
    const commit = () => {
      if (my !== seq) return;
      loader.classList.remove('on');
      blur.style.backgroundImage = `url("${pic(m.t)}")`; blur.classList.add('on');
      f.classList.add('on'); old.classList.remove('on');
      setTimeout(() => { if (my === seq && old !== frames[fi]) old.innerHTML = ''; }, 700);
      elapsed = 0; t0 = performance.now(); setPlayState(); tick();
      saveProgress(ep, i, prefix(i) / ep.runtime);
    };
    if (m.k === 'img') {
      const img = cache.get(m.f) || new Image(); if (!img.src) { img.decoding = 'async'; img.src = pic(m.f); }
      cache.delete(m.f); img.alt = ep.virtual ? '' : ep.alt;
      // like a story: the whole photo stays visible, unless it already matches the screen's shape
      const ar = (m.w || 3) / (m.h || 4), sr = window.innerWidth / window.innerHeight;
      if (!split && Math.abs(Math.log(ar / sr)) > 0.16) img.classList.add('fit');
      const p = m.p || [0.5, 0.35];
      img.style.setProperty('--ox', `${Math.round(p[0] * 100)}%`); img.style.setProperty('--oy', `${Math.round(p[1] * 100)}%`);
      img.style.objectPosition = `${Math.round(p[0] * 100)}% ${Math.round(p[1] * 100)}%`;
      img.style.setProperty('--kb', `${photoMs() + 1200}ms`);
      img.classList.add(KB[Math.floor(Math.random() * KB.length)]);
      curDur = photoMs();
      const slow = setTimeout(() => { if (my === seq) loader.classList.add('on'); }, 350);
      const ready = () => { clearTimeout(slow); if (my !== seq) return; f.appendChild(img); commit(); };
      (img.decode ? img.decode() : Promise.resolve()).then(ready, ready);
    } else {
      video = document.createElement('video'); video.src = m.f; video.playsInline = true; video.preload = 'auto'; video.poster = pic(m.t);
      video.muted = !!ep.virtual; f.appendChild(video); curDur = m.dur * 1000;
      video.addEventListener('ended', () => { if (my === seq) advance(1); });
      video.addEventListener('timeupdate', () => { if (my === seq) elapsed = video.currentTime * 1000; });
      video.addEventListener('waiting', () => { if (my === seq) loader.classList.add('on'); });
      video.addEventListener('playing', () => { if (my === seq) loader.classList.remove('on'); });
      video.play().catch(() => { if (video) { video.muted = true; video.play().catch(() => {}); } });
      commit();
    }
  }
  function tick() {
    cancelAnimationFrame(raf);
    const loop = now => {
      if (!ep) return;
      if (!video && playing) elapsed = now - t0;
      const done = prefix(i) + Math.min(elapsed, curDur), frac = Math.min(1, done / ep.runtime);
      fill.style.width = knob.style.left = `${(frac * 100).toFixed(2)}%`;
      if (segCur) segCur.style.width = `${Math.min(100, elapsed / curDur * 100).toFixed(1)}%`;
      timeEl.textContent = `${secs(Math.max(0, (ep.runtime - done) / 1000))} left`;
      if (!video && playing && elapsed >= curDur) { advance(1); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }
  function advance(dir) {
    const n = i + dir;
    if (n < 0) return show(0);
    if (n >= ep.items.length) return finish();
    show(n);
  }
  function replaceWith(id) { history.replaceState({ ...state, ep: id, i: 0 }, ''); state = { ...state, ep: id, i: 0 }; open(id, 0); }
  function finish() {
    if (ep.virtual) { const then = ep.then; music.stop(); if (then) { const e = epById[then]; ep = null; return replaceWith(e.id); } return back(); }
    saveProgress(ep, ep.items.length - 1, 1);
    const n = nextEpisode(ep);
    if (!n) { history.back(); setTimeout(() => go('finale'), 60); return; }
    $('#next-img').src = pic(n.cover.t); $('#next-img').style.objectPosition = pos(n.cover); $('#next-img').alt = n.alt; $('#next-title').textContent = `${n.label} · ${n.title}`;
    preload(n.items[0]); preload(n.cover);
    next.classList.add('on'); showUI(true); playing = false; setIcon();
    clearInterval(nextTick);
    let left = 6; const ring = $('#ring-fg'); ring.style.strokeDashoffset = 0;
    nextTick = setInterval(() => { left--; ring.style.strokeDashoffset = 56.5 * (1 - left / 6); if (left <= 0) { clearInterval(nextTick); playNext(); } }, 1000);
  }
  function playNext() { clearInterval(nextTick); if (!ep) return; const n = nextEpisode(ep); if (!n) return; replaceWith(n.id); }
  function setPlayState() {
    el.style.setProperty('--play', playing ? 'running' : 'paused');
    if (video) { playing ? video.play().catch(() => {}) : video.pause(); }
    if (!video && playing) t0 = performance.now() - elapsed;
    setIcon();
  }
  function setIcon() {
    $('#ico-pause').classList.toggle('hide', !playing); $('#ico-play').classList.toggle('hide', playing); $('#pl-toggle').setAttribute('aria-label', playing ? 'Pause' : 'Play');
    $('#pl-pause-ico').setAttribute('d', playing ? 'M6 4h4v16H6zm8 0h4v16h-4z' : 'M7 4l13 8-13 8z'); $('#pl-pause').setAttribute('aria-label', playing ? 'Pause' : 'Play');
    el.classList.toggle('paused', !playing);
  }
  function toggle() { playing = !playing; setPlayState(); showUI(); if (!playing) clearTimeout(hideT); }
  function showUI(sticky) { el.classList.add('ui'); clearTimeout(hideT); if (!sticky && playing) hideT = setTimeout(() => { el.classList.remove('ui', 'first'); }, 3200); }
  function openNote() { if (!ep || !ep.note) return; $('#note-text').textContent = ep.note; $('#note-date').textContent = fmtLong(ep.day); wasPlaying = playing; playing = false; setPlayState(); noteEl.classList.add('on'); showUI(true); $('#note-close').focus(); }
  function closeNote() { noteEl.classList.remove('on'); if (wasPlaying) { playing = true; setPlayState(); } showUI(); }
  function skip(dir, quiet) { const r = $(dir < 0 ? '#rip-l' : '#rip-r'); r.classList.remove('go'); void r.offsetWidth; r.classList.add('go'); advance(dir); if (!quiet) showUI(); }

  /* buttons */
  $('#pl-back').addEventListener('click', back);
  $('#pl-toggle').addEventListener('click', toggle);
  $('#pl-pause').addEventListener('click', () => { toggle(); if (!playing) showUI(true); });
  $('#pl-prev').addEventListener('click', () => { advance(-1); showUI(); });
  $('#pl-next').addEventListener('click', () => { advance(1); showUI(); });
  $('#pl-nextep').addEventListener('click', () => { saveProgress(ep, ep.items.length - 1, 1); playNext(); });
  $('#pl-note').addEventListener('click', openNote);
  $('#note-close').addEventListener('click', closeNote);
  $('#pl-mylist').addEventListener('click', () => { if (ep && !ep.virtual) { toggleList(ep.id); syncButtons(); showUI(); } });
  $('#pl-like').addEventListener('click', () => { if (ep && !ep.virtual) { cycleRating(ep.id); syncButtons(); showUI(); } });
  $('#skip-recap').addEventListener('click', () => { if (ep && ep.recap) { music.stop(400); const then = ep.then; ep = null; replaceWith(then); } });
  $('#next-play').addEventListener('click', playNext);
  $('#next-cancel').addEventListener('click', () => { clearInterval(nextTick); next.classList.remove('on'); playing = false; setPlayState(); showUI(true); });
  $('#pl-list').addEventListener('click', () => { const s = ep && !ep.virtual ? ep.season.n : 1; swapOverlay('sheet', { season: s }); });
  $('#scrub').addEventListener('click', e => { const r = $('#scrub .bar').getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * ep.runtime; let k = 0; while (k < ep.items.length - 1 && prefix(k + 1) <= x) k++; show(k); showUI(); });

  /* gestures, like a story: tap right = next, tap left = back, swipe sideways = next/previous episode,
     swipe down = close, press and hold = pause while held */
  const stage = $('#stage');
  let sx = 0, sy = 0, st = 0, moved = false, pulling = false, holding = false, holdT = 0, tapT = 0;
  /* pinch to zoom: two fingers scale the current photo, one finger pans while zoomed */
  const Z = { on: false, scale: 1, x: 0, y: 0, d0: 0, s0: 1, px: 0, py: 0, x0: 0, y0: 0, paused: false };
  const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  const zoomEl = () => $('.frame.on img', stage);
  function applyZoom() { const im = zoomEl(); if (!im) return; const lim = (Z.scale - 1) * 0.5; Z.x = Math.max(-lim * innerWidth, Math.min(lim * innerWidth, Z.x)); Z.y = Math.max(-lim * innerHeight, Math.min(lim * innerHeight, Z.y)); if (Z.scale > 1.01) { im.style.animation = 'none'; im.style.transform = `translate(${Z.x}px,${Z.y}px) scale(${Z.scale})`; } else { im.style.transform = ''; } }
  function resetZoom() { const was = Z.scale > 1.01; Z.on = false; Z.scale = 1; Z.x = Z.y = 0; const im = zoomEl(); if (im) { im.style.transform = ''; im.style.animation = ''; } el.classList.remove('zoomed'); if (was && Z.paused) { Z.paused = false; playing = true; setPlayState(); } }
  player.resetZoom = resetZoom;
  function tap(x) {
    if (next.classList.contains('on')) return;
    const r = el.classList.contains('split') ? $('.frame.on', stage)?.getBoundingClientRect() : null;
    const left = r && r.width ? r.left : 0, width = r && r.width ? r.width : window.innerWidth;
    const dir = x - left < width * 0.3 ? -1 : 1;
    if (!playing && !holding) { playing = true; setPlayState(); }
    if (dir < 0 && i === 0 && !ep.virtual && prevEpisode()) return swipeEpisode(-1);
    skip(dir, true);
  }
  function prevEpisode() { const all = allEpisodes, k = all.indexOf(ep); return k > 0 ? all[k - 1] : null; }
  function swipeEpisode(dir) {
    if (!ep || ep.virtual) return advance(dir);
    if (dir > 0) { const n = nextEpisode(ep); if (n) { saveProgress(ep, ep.items.length - 1, 1); replaceWith(n.id); } else finish(); }
    else { const p = prevEpisode(); if (p) replaceWith(p.id); else show(0); }
  }
  stage.addEventListener('touchstart', e => {
    if (noteEl.classList.contains('on')) return;
    if (e.touches.length === 2 && ep && ep.items[i].k === 'img') {
      clearTimeout(holdT); clearTimeout(tapT); Z.on = true; Z.d0 = dist(e.touches); Z.s0 = Z.scale; moved = true;
      if (playing) { Z.paused = true; playing = false; setPlayState(); }
      el.classList.add('zoomed'); return;
    }
    if (Z.scale > 1.01 && e.touches.length === 1) { Z.px = e.touches[0].clientX; Z.py = e.touches[0].clientY; Z.x0 = Z.x; Z.y0 = Z.y; }
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now(); moved = false; pulling = false;
    clearTimeout(holdT); holdT = setTimeout(() => { if (!moved && playing) { holding = true; wasPlaying = true; playing = false; setPlayState(); } }, 450);
  }, { passive: true });
  stage.addEventListener('touchmove', e => {
    if (Z.on && e.touches.length === 2) { Z.scale = Math.max(1, Math.min(4, Z.s0 * dist(e.touches) / Z.d0)); applyZoom(); return; }
    if (Z.scale > 1.01) { Z.x = Z.x0 + e.touches[0].clientX - Z.px; Z.y = Z.y0 + e.touches[0].clientY - Z.py; moved = true; applyZoom(); return; }
    const dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy;
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) { moved = true; clearTimeout(holdT); }
    if (!holding && dy > 12 && dy > Math.abs(dx) * 1.3) { pulling = true; el.classList.add('pulling'); el.style.transform = `translate3d(0,${dy * 0.6}px,0) scale(${1 - Math.min(dy, 400) / 2000})`; el.style.opacity = String(1 - Math.min(dy, 400) / 900); }
  }, { passive: true });
  stage.addEventListener('touchend', e => {
    clearTimeout(holdT);
    if (Z.on) { if (e.touches.length < 2) { Z.on = false; if (Z.scale < 1.08) resetZoom(); } return; }
    if (Z.scale > 1.01) { if (!moved && Date.now() - st < 300) resetZoom(); return; }   // tap while zoomed = zoom out
    if (holding) { holding = false; playing = true; setPlayState(); return; }
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    el.classList.remove('pulling');
    if (pulling) { pulling = false; if (dy > 120) back(); else { el.style.transform = ''; el.style.opacity = ''; } return; }
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) swipeEpisode(dx < 0 ? 1 : -1);
    else if (!moved && Date.now() - st < 300) tap(e.changedTouches[0].clientX);
  }, { passive: true });
  stage.addEventListener('click', e => { if (!('ontouchstart' in window) && !noteEl.classList.contains('on')) tap(e.clientX); });
  stage.addEventListener('mousemove', () => { if (ep) showUI(); });
  document.addEventListener('keydown', e => {
    if (state.overlay === 'player') {
      if (noteEl.classList.contains('on')) { if (e.key === 'Escape' || e.key === ' ') { e.preventDefault(); closeNote(); } return; }
      if (e.target.closest && e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle(); }
      else if (e.key === 'ArrowRight') skip(1); else if (e.key === 'ArrowLeft') skip(-1);
      else if (e.key === 'Escape') back();
    } else if ((state.overlay === 'sheet' || state.overlay === 'search') && e.key === 'Escape') back();
    else if (!state.overlay && state.screen === 'browse' && e.key === '/' ) { e.preventDefault(); overlay('search'); }
  });
  return { open, close };
})());

/* ═══ FINALE ═════════════════════════════════════════════ */
const finale = (() => {
  const inner = $('#credits-inner'), photo = $('#credits-photo'), post = $('#credits-post'), closing = $('#closing');
  const slides = [...TOP10].reverse().map(k => byKey[k]).filter(Boolean);
  let si = 0, slideT = 0, started = false;
  inner.innerHTML = CREDITS.map(([l, v]) => `<div class="credit"><b>${esc(l)}</b><span>${esc(v)}</span></div>`).join('');
  const imgs = (cls) => slides.map(m => `<img src="${pic(m.f)}" alt="" class="${cls(m)}" style="object-position:${pos(m)}" loading="lazy">`).join('');
  photo.innerHTML = imgs(m => m.h > m.w * 1.25 ? '' : 'fit');
  post.innerHTML = imgs(() => '');
  $('#closing-l1').textContent = FINALE.line1; $('#closing-l2').textContent = FINALE.line2; $('#closing-sign').textContent = FINALE.sign;
  $('#closing-bg').style.backgroundImage = `url("${pic(SHOW.finalePhoto)}")`;
  function slide() { [photo, post].forEach(c => $$('img', c).forEach((im, k) => im.classList.toggle('on', k === si))); si = (si + 1) % slides.length; slideT = setTimeout(slide, 3400); }
  function start() {
    closing.classList.remove('on'); started = true;
    inner.classList.remove('go'); void inner.offsetHeight;
    inner.style.setProperty('--dur', `${Math.max(40, CREDITS.length * 1.6)}s`); inner.classList.add('go');
    si = 0; slide();
    music.play(0.85);
  }
  function end() { if (!started) return; clearTimeout(slideT); closing.classList.add('on'); $('#watch-again').focus({ preventScroll: true }); }
  function stop() { started = false; clearTimeout(slideT); music.stop(500); inner.classList.remove('go'); closing.classList.remove('on'); }
  inner.addEventListener('animationend', end);
  $('#credits-skip').addEventListener('click', end);
  $('#watch-again').addEventListener('click', () => go('profiles'));
  $('#closing-browse').addEventListener('click', () => go('browse'));
  return { start, stop };
})();

/* ═══ INIT ═══════════════════════════════════════════════ */
apply({ screen: 'intro' });
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
console.info(`${allEpisodes.length} episodes across ${seasons.filter(s => s.episodes.length).length} seasons`);
})();
