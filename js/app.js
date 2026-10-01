/* ═══════════════════════════════════════════════════════════════
   app.js — Shivani & Premal
   model → router → intro → profiles → browse → sheet → player → finale
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
const fmtShort = d => { const t = parseD(d); return t ? `${MONTHS[t.getMonth()].slice(0, 3)} ${t.getDate()}, ${t.getFullYear()}` : ''; };
const fmtTime = d => { const t = parseD(d); if (!t || !d || d.length < 16 || d.slice(11, 16) === '12:00') return ''; let h = t.getHours(); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return `${h}:${String(t.getMinutes()).padStart(2, '0')} ${ap}`; };
const secs = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const dayDiff = (a, b) => Math.round((parseD(a) - parseD(b)) / 864e5);

/* ── media helpers ──────────────────────────────────────── */
const pos = m => m && m.p ? `${Math.round(m.p[0] * 100)}% ${Math.round(m.p[1] * 100)}%` : '50% 30%';
const amb = m => (m && m.c) || '#5a1016';
/* blur-up image: tiny data URI behind the real one, which fades in on load */
const imgHTML = (m, cls = '', attrs = '') => `<span class="ph ${cls}" style="background-image:url(${m.b || ''})"><img src="${m.t}" alt="" loading="lazy" decoding="async" style="object-position:${pos(m)}" ${attrs}></span>`;
document.addEventListener('load', e => { if (e.target.tagName === 'IMG') e.target.classList.add('ld'); }, true);

/* ═══ MODEL ══════════════════════════════════════════════ */
const EXTRAS = { n: 99, slug: 'extras', title: 'Snaps & Extras', tag: 'Undated', blurb: 'Moments that lost their dates along the way. Tell Premal when they happened and they\'ll find their season.', hero: '' };
const seasons = [...SEASONS, EXTRAS].map(s => ({ ...s, episodes: [] }));
const byKey = {};
MEDIA.forEach(m => { byKey[m.key] = m; });

function seasonFor(d) {
  if (!d) return EXTRAS.n;
  const s = SEASONS.find(s => d.slice(0, 10) >= s.from && d.slice(0, 10) <= s.to);
  return s ? s.n : EXTRAS.n;
}
const stories = { ...STORIES };
const storyOf = m => (EPISODE_NOTES[(m.d || '').slice(0, 10)] || {}).story || stories[m.key] || '';

(function buildEpisodes() {
  const buckets = {};
  MEDIA.forEach(m => {
    const sn = seasonFor(m.d);
    const day = sn === EXTRAS.n ? 'undated' : m.d.slice(0, 10);
    (buckets[`${sn}|${day}`] ||= { sn, day, items: [] }).items.push(m);
  });
  let list = Object.values(buckets).sort((a, b) => a.day.localeCompare(b.day));
  // A lone photo with no story of its own joins the nearest episode within a week (same season).
  const anchored = b => b.items.length > 1 || b.day === 'undated' || EPISODE_NOTES[b.day] || b.items.some(m => stories[m.key]);
  list.filter(b => !anchored(b)).forEach(b => {
    const host = list.filter(h => h !== b && h.sn === b.sn && h.day !== 'undated' && !h.merged && Math.abs(dayDiff(h.day, b.day)) <= 7)
      .sort((x, y) => Math.abs(dayDiff(x.day, b.day)) - Math.abs(dayDiff(y.day, b.day)) || y.items.length - x.items.length)[0];
    if (host) { host.items.push(...b.items); b.merged = true; }
  });
  list = list.filter(b => !b.merged);
  list.forEach(b => {
    const season = seasons.find(s => s.n === b.sn);
    b.items.sort((a, c) => (a.d || '').localeCompare(c.d || ''));
    const note = EPISODE_NOTES[b.day] || {};
    const firstStory = b.items.map(m => stories[m.key]).find(Boolean);
    const title = note.title || (firstStory ? firstStory.replace(/\.$/, '') : (b.day === 'undated' ? 'Lost & found' : fmtMD(b.day)));
    const photos = b.items.filter(m => m.k === 'img').length, vids = b.items.length - photos;
    const runtime = b.items.reduce((t, m) => t + (m.k === 'vid' ? m.dur * 1000 : PHOTO_MS), 0);
    const cover = (note.thumb && byKey[note.thumb]) || b.items.find(m => m.k === 'img' && m.p) || b.items.find(m => m.k === 'img') || b.items[0];
    const days = [...new Set(b.items.map(m => (m.d || '').slice(0, 10)).filter(Boolean))].sort();
    const ep = {
      id: `${b.sn}-${b.day}`, season, n: season.episodes.length + 1, day: b.day, title, items: b.items, cover,
      photos, vids, runtime, days,
      sub: b.day === 'undated' ? '' : (note.title || firstStory ? fmtMD(b.day) : fmtWeekday(b.day)),
      len: [photos && `${photos} photo${photos > 1 ? 's' : ''}`, vids && `${vids} video${vids > 1 ? 's' : ''}`].filter(Boolean).join(' · '),
      story: note.story || b.items.map(storyOf).find(Boolean) || '',
      est: b.items.every(m => m.est),
      note: LOVE_NOTES[b.day] || '',
    };
    ep.label = season.n === EXTRAS.n ? `Extra ${ep.n}` : `S${season.n}:E${ep.n}`;
    season.episodes.push(ep);
  });
})();
const allEpisodes = seasons.flatMap(s => s.episodes);
const epById = Object.fromEntries(allEpisodes.map(e => [e.id, e]));
const epOf = new Map(); allEpisodes.forEach(e => e.items.forEach((m, k) => epOf.set(m, { ep: e, i: k })));
const epByDay = Object.fromEntries(allEpisodes.map(e => [e.day, e]));
const nextEpisode = ep => allEpisodes[allEpisodes.indexOf(ep) + 1] || null;
const latestDay = allEpisodes.filter(e => e.day !== 'undated').map(e => e.day).sort().pop() || '';
const isNew = ep => ep.day !== 'undated' && dayDiff(latestDay, ep.day) <= 45;
const realSeasons = () => seasons.filter(s => s.n !== EXTRAS.n && s.episodes.length);

/* "On this day": episodes within ±3 days of today's date in earlier years */
function onThisDay() {
  const now = new Date(), y = now.getFullYear();
  const hits = [];
  allEpisodes.forEach(e => {
    if (e.day === 'undated') return;
    const t = parseD(e.day); if (t.getFullYear() >= y) return;
    const same = new Date(y, t.getMonth(), t.getDate());
    const diff = Math.round((same - new Date(y, now.getMonth(), now.getDate())) / 864e5);
    if (Math.abs(diff) <= 3) hits.push({ e, years: y - t.getFullYear(), diff });
  });
  return hits.sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff) || a.years - b.years);
}

/* progress: { epId: { i, frac, t } } */
const progress = store.get('progress', {});
const saveProgress = (ep, i, frac) => { progress[ep.id] = { i, frac, t: Date.now() }; store.set('progress', progress); };
const lastWatched = () => Object.entries(progress).sort((a, b) => b[1].t - a[1].t).map(([id, p]) => ({ ep: epById[id], ...p })).filter(x => x.ep);

/* ═══ ROUTER ═════════════════════════════════════════════ */
const screens = ['intro', 'profiles', 'browse', 'finale'];
let state = { screen: 'intro' };
function apply(s, fromPop) {
  const prev = state; state = s;
  if (prev.overlay === 'player' && s.overlay !== 'player') player.close();
  if (prev.overlay === 'sheet' && s.overlay !== 'sheet') sheet.hide();
  if (prev.screen === 'finale' && s.screen !== 'finale') finale.stop();
  if (prev.screen === 'intro' && s.screen !== 'intro') intro.stop();
  screens.forEach(n => $('#' + n).classList.toggle('on', n === s.screen));
  document.body.classList.toggle('locked', !!s.overlay || s.screen !== 'browse');
  if (s.screen === 'browse') browse.ensure(); else browse.pauseBB();
  if (s.screen === 'finale' && prev.screen !== 'finale') finale.start();
  if (s.overlay === 'sheet') sheet.show(s.season); else if (s.overlay === 'player') { if (!fromPop) player.open(s.ep, s.i); }
  if (!s.overlay && !fromPop) window.scrollTo({ top: s.scroll || 0 });
  browse.setPaused(!!s.overlay || s.screen !== 'browse');
}
const go = (screen, extra = {}) => { history.pushState({ screen, ...extra }, ''); apply({ screen, ...extra }); };
const overlay = (kind, extra = {}) => { const s = { ...state, overlay: kind, ...extra, scroll: window.scrollY }; history.pushState(s, ''); apply(s); };
const back = () => history.back();
window.addEventListener('popstate', e => {
  const s = e.state || { screen: 'intro' };
  if (s.overlay === 'player' && state.overlay !== 'player') { history.back(); return; }  // never re-enter player via forward
  apply(s, true);
});
history.replaceState({ screen: 'intro' }, '');

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
(function buildProfiles() {
  $('#profile-row').innerHTML = PROFILES.map((p, i) =>
    `<button class="profile" type="button" data-i="${i}"><span class="profile-img"><img src="${p.photo}" alt=""></span><span>${p.name}</span></button>`).join('');
  $('#profile-row').addEventListener('click', e => {
    const b = e.target.closest('.profile'); if (!b) return;
    profile = +b.dataset.i; store.set('profile', profile);
    go('browse'); toast(PROFILES[profile].greeting);
  });
  $('#replay-intro').addEventListener('click', () => go('intro'));
  $('#manage-btn').addEventListener('click', () => toast('These two profiles are permanent. ♡'));
  $('#nav-profile').addEventListener('click', () => go('profiles'));
})();

/* ═══ TOAST ══════════════════════════════════════════════ */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600); }

/* ═══ BROWSE ═════════════════════════════════════════════ */
const svgPlay = '<svg viewBox="0 0 24 24"><path d="M6 3l14 9-14 9z"/></svg>';
const svgNote = '<svg viewBox="0 0 24 24"><path d="M3 6h18v12H3z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 7l9 6 9-6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
const logoHTML = (small) => `<span class="logo ${small ? 'sm' : ''}" aria-label="${SHOW.title}"><b>Shivani</b><i>&amp;</i><b>Premal</b></span>`;

const cardHTML = (ep, opts = {}) => {
  const p = progress[ep.id], m = opts.m || ep.cover;
  return `<button class="card ${opts.vid ? 'vid' : ''}" type="button" data-ep="${ep.id}" ${opts.i != null ? `data-i="${opts.i}"` : ''} ${opts.vid ? `data-vid="${opts.m.f}"` : ''}>
    ${imgHTML(m)}
    ${opts.vid ? `<span class="card-vid">${svgPlay}</span>` : ''}
    ${opts.badge !== false && isNew(ep) ? '<span class="badge-new">New</span>' : ''}
    ${ep.note && !opts.vid ? `<span class="card-note" title="A note from Premal">${svgNote}</span>` : ''}
    <div class="card-body"><div class="card-ep">${opts.ep || ep.label}${ep.est ? ' · approx.' : ''}</div><div class="card-title">${opts.title || ep.title}</div><div class="card-len">${opts.len != null ? opts.len : [ep.sub, ep.len].filter(Boolean).join(' · ')}</div></div>
    ${p && opts.prog !== false ? `<div class="card-prog"><i style="width:${Math.round(p.frac * 100)}%"></i></div>` : ''}
  </button>`;
};
const rowHTML = (id, title, sub, inner, cls = '') => `<section class="row ${cls}" id="row-${id}"><div class="row-head"><h2 class="row-title">${title}</h2>${sub ? `<span class="row-sub">${sub}</span>` : ''}</div><div class="strip ${cls === 'top10-row' ? 'top10' : ''}">${inner}</div></section>`;

const browse = (() => {
  let built = false, paused = true;
  const nav = $('#nav'), bb = $('#billboard'), layers = [$('#bb-a'), $('#bb-b')];
  let li = 0, fi = 0, rotT = 0, feats = [], curVideo = null;
  const stats = `${MEDIA.length} moments · ${allEpisodes.filter(e => e.day !== 'undated').length} days · ${realSeasons().length} seasons`;

  /* resolve FEATURES into billboard slides */
  function resolveFeatures() {
    return FEATURES.map(f => {
      if (f.kind === 'series') {
        const m = MEDIA.find(x => x.f === f.still) || allEpisodes[0].cover;
        return { tag: f.tag, logo: true, sub: SHOW.tagline, meta: `<span class="match">100% Match</span><span>${SHOW.year}</span><span class="chip">${SEASONS.length - 1} Seasons + Prequel</span><span class="chip top">#1 in Our Hearts Today</span>`, m, video: f.video, play: () => playFirst(), info: () => overlay('sheet', { season: 1 }) };
      }
      if (f.kind === 'episode') {
        const ep = epByDay[f.day]; if (!ep) return null;
        return { tag: f.tag, title: ep.title, sub: `${ep.label} · ${fmtLong(ep.day)}`, meta: `<span>${ep.len}</span>${ep.story ? `<span class="story">${ep.story}</span>` : ''}`, m: ep.cover, play: () => overlay('player', { ep: ep.id, i: 0 }), info: () => overlay('sheet', { season: ep.season.n }) };
      }
      if (f.kind === 'top') {
        const m = byKey[f.key], at = m && epOf.get(m); if (!at) return null;
        return { tag: f.tag, title: at.ep.title, sub: `${at.ep.label} · ${fmtLong(at.ep.day)}`, meta: `<span>${stories[f.key] || at.ep.len}</span>`, m, play: () => overlay('player', { ep: at.ep.id, i: at.i }), info: () => overlay('sheet', { season: at.ep.season.n }) };
      }
      if (f.kind === 'season') {
        const s = seasons.find(x => x.n === f.n); if (!s || !s.episodes.length) return null;
        const m = MEDIA.find(x => x.f === s.hero) || s.episodes[0].cover;
        return { tag: `${f.tag} · Season ${s.n}`, title: s.title, sub: s.tag, meta: `<span>${s.episodes.length} episodes</span><span class="story">${s.blurb}</span>`, m, play: () => overlay('player', { ep: s.episodes[0].id, i: 0 }), info: () => overlay('sheet', { season: s.n }) };
      }
      return null;
    }).filter(Boolean);
  }
  const playFirst = () => { const lw = lastWatched()[0]; const ep = lw && lw.frac < 0.98 ? lw.ep : (seasons.find(s => s.n === 1).episodes[0] || allEpisodes[0]); overlay('player', { ep: ep.id, i: lw && lw.ep === ep ? lw.i : 0 }); };

  function showFeature(k, first) {
    const f = feats[fi = k], L = layers[li = 1 - li], old = layers[1 - li];
    const tall = window.innerHeight > window.innerWidth;
    const useVideo = f.video && (tall || window.innerWidth < 720) && !reduced;
    L.innerHTML = `<img src="${f.m.f}" alt="" style="object-position:${pos(f.m)}" decoding="async">${useVideo ? `<video muted playsinline loop preload="auto" src="${f.video}"></video>` : ''}`;
    L.style.setProperty('--ox', pos(f.m).split(' ')[0]); L.style.setProperty('--oy', pos(f.m).split(' ')[1]);
    bb.style.setProperty('--amb', amb(f.m));
    if (curVideo) { curVideo.pause(); curVideo = null; }
    const v = $('video', L);
    if (v) { curVideo = v; v.addEventListener('playing', () => v.classList.add('ready'), { once: true }); if (!paused) v.play().catch(() => {}); }
    const swap = () => { L.classList.add('on'); old.classList.remove('on'); setTimeout(() => { if (old !== layers[li]) old.innerHTML = ''; }, 1300); };
    const im = $('img', L); (im.decode ? im.decode() : Promise.resolve()).then(swap, swap);
    const body = $('#bb-body');
    const fill = () => {
      $('#bb-tagline').innerHTML = `<svg class="n" viewBox="0 0 111 190"><polygon points="0,0 27,0 27,190 0,190" fill="#E50914"/><polygon points="84,0 111,0 111,190 84,190" fill="#E50914"/><polygon points="0,0 27,0 111,190 84,190" fill="#B20710"/></svg><span>${f.tag}</span>`;
      $('#bb-title').innerHTML = f.logo ? logoHTML() : `<span class="bb-h">${f.title}</span>`;
      $('#bb-tag').textContent = f.sub || '';
      $('#bb-meta').innerHTML = f.meta + (f.logo ? `<span class="stats">${stats}</span>` : '');
      body.classList.remove('out');
    };
    if (first) fill(); else { body.classList.add('out'); setTimeout(fill, 350); }
    $$('.bb-dots i').forEach((d, j) => d.classList.toggle('on', j === k));
  }
  function rotate() { clearTimeout(rotT); if (paused || feats.length < 2 || document.hidden) return; rotT = setTimeout(() => { showFeature((fi + 1) % feats.length); rotate(); }, 8000); }

  function build() {
    feats = resolveFeatures();
    $('.bb-dots').innerHTML = feats.map(() => '<i></i>').join('');
    $('#nav-avatar').src = PROFILES[profile].photo;
    showFeature(0, true);
    renderRows();
  }
  function renderRows() {
    const rows = [];
    const cw = lastWatched().filter(x => x.frac > 0.02 && x.frac < 0.98).slice(0, 12);
    if (cw.length) rows.push(rowHTML('continue', `Continue Watching for ${PROFILES[profile].name.replace(' ♡', '')}`, '', cw.map(x => cardHTML(x.ep, { i: x.i })).join('')));
    const otd = onThisDay();
    if (otd.length) rows.push(rowHTML('today', 'On This Day', `${MONTHS[new Date().getMonth()].slice(0, 3)} ${new Date().getDate()}, in earlier years`, otd.slice(0, 10).map(x => cardHTML(x.e, { ep: `${x.years} year${x.years > 1 ? 's' : ''} ago`, badge: false })).join('')));
    rows.push(rowHTML('top10', 'Top 10 Moments', 'as ranked by Premal', TOP10.map((k, i) => {
      const m = byKey[k]; const at = m && epOf.get(m); if (!at) return '';
      return `<button class="top-card" type="button" data-ep="${at.ep.id}" data-i="${at.i}"><span class="top-num">${i + 1}</span>${imgHTML(m, 'top-img')}<div class="card-body"><div class="card-ep">${at.ep.label}</div><div class="card-title">${at.ep.title}</div></div></button>`;
    }).join(''), 'top10-row'));
    const fresh = allEpisodes.filter(isNew).reverse().slice(0, 12);
    if (fresh.length) rows.push(rowHTML('new', 'New Episodes', `latest from Season ${fresh[0].season.n}`, fresh.map(e => cardHTML(e, { badge: false })).join('')));
    rows.push(rowHTML('seasons', 'Seasons', `${realSeasons().length} seasons · ${allEpisodes.filter(e => e.season.n !== EXTRAS.n).length} episodes`, realSeasons().map(s => {
      const m = MEDIA.find(x => x.f === s.hero) || s.episodes[0].cover;
      return `<button class="poster" type="button" data-season="${s.n}" style="--amb:${amb(m)}">${imgHTML(m)}<span class="poster-num">${s.n}</span><div class="poster-body"><div class="card-ep">Season ${s.n} · ${s.tag}</div><div class="poster-title">${s.title}</div><div class="card-len">${s.episodes.length} episodes</div></div></button>`;
    }).join(''), 'season-row'));
    const vids = MEDIA.filter(m => m.k === 'vid');
    rows.push(rowHTML('videos', 'Videos', `${vids.length} clips`, vids.map(m => { const at = epOf.get(m); return cardHTML(at.ep, { i: at.i, m, vid: true, title: at.ep.title, len: [secs(m.dur), at.ep.sub].filter(Boolean).join(' · '), prog: false, badge: false }); }).join('')));
    const ex = seasons.find(s => s.n === EXTRAS.n);
    if (ex.episodes.length) rows.push(rowHTML('extras', 'Extras', ex.blurb, ex.episodes.map(e => cardHTML(e)).join('')));
    $('#rows').innerHTML = rows.join('');
    $$('.row').forEach(r => io.observe(r));
    measure();
  }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });

  /* cached row offsets so the scroll handler never forces layout */
  let marks = [], navBtns = $$('.nav-links button'), navCur = '', ticking = false, bbH = 600;
  function measure() { marks = ['videos', 'seasons'].map(id => ({ id, el: $('#row-' + id) })).filter(m => m.el).map(m => ({ id: m.id, top: m.el.offsetTop })); bbH = bb.offsetHeight || 600; }
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
    });
  }, { passive: true });

  $('#rows').addEventListener('click', e => {
    const c = e.target.closest('[data-ep],[data-season]'); if (!c) return;
    if (c.dataset.season != null) return overlay('sheet', { season: +c.dataset.season });
    const ep = epById[c.dataset.ep]; const i = c.dataset.i != null ? +c.dataset.i : (progress[ep.id]?.frac < 0.98 ? progress[ep.id].i : 0);
    overlay('player', { ep: ep.id, i });
  });
  /* desktop hover previews: videos play muted, photos zoom (CSS) */
  if (canHover) {
    let hoverT = 0;
    $('#rows').addEventListener('mouseover', e => {
      const c = e.target.closest('.card[data-vid]'); if (!c || c.querySelector('video')) return;
      clearTimeout(hoverT);
      hoverT = setTimeout(() => { const v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.src = c.dataset.vid; v.className = 'preview'; $('.ph', c).appendChild(v); v.play().catch(() => {}); }, 350);
    });
    $('#rows').addEventListener('mouseout', e => {
      const c = e.target.closest('.card[data-vid]'); if (!c || c.contains(e.relatedTarget)) return;
      clearTimeout(hoverT); const v = $('video', c); if (v) { v.pause(); v.remove(); }
    });
  }
  $('#bb-play').addEventListener('click', () => feats[fi].play());
  $('#bb-info').addEventListener('click', () => feats[fi].info());
  $('.bb-dots').addEventListener('click', e => { const k = $$('.bb-dots i').indexOf(e.target); if (k >= 0) { showFeature(k); rotate(); } });
  $('#foot-credits').addEventListener('click', () => go('finale'));
  $('#foot-all').addEventListener('click', () => overlay('sheet', { season: 1 }));
  $('#bb-mute').addEventListener('click', () => { if (!curVideo) return; curVideo.muted = !curVideo.muted; $('#bb-mute').setAttribute('aria-label', curVideo.muted ? 'Unmute' : 'Mute'); $('#bb-mute').style.opacity = curVideo.muted ? '' : '.55'; });
  $$('.nav-links button').forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.nav; if (t === 'finale') return go('finale');
    const el = t === 'top' ? null : $('#row-' + t);
    window.scrollTo({ top: el ? el.offsetTop - 70 : 0, behavior: reduced ? 'auto' : 'smooth' });
  }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) { clearTimeout(rotT); if (curVideo) curVideo.pause(); } else if (!paused) { if (curVideo) curVideo.play().catch(() => {}); rotate(); } });
  return {
    ensure() { if (!built) { build(); built = true; } else { renderRows(); } $('#nav-avatar').src = PROFILES[profile].photo; },
    setPaused(p) { paused = p; if (p) { clearTimeout(rotT); if (curVideo) curVideo.pause(); } else { if (curVideo) curVideo.play().catch(() => {}); rotate(); } },
    pauseBB() { if (curVideo) curVideo.pause(); },
  };
})();

/* ═══ DETAILS SHEET ══════════════════════════════════════ */
const sheet = (() => {
  const wrap = $('#sheet-wrap'), sel = $('#season-select');
  let cur = 1;
  function show(n = 1) {
    cur = n;
    const pm = MEDIA.find(x => x.f === SHOW.poster);
    $('#sheet-img').src = SHOW.poster; if (pm) $('#sheet-img').style.objectPosition = pos(pm);
    $('#sheet-title').innerHTML = logoHTML(true);
    $('#sheet-meta').innerHTML = `<span class="match" style="color:var(--green);font-weight:700">100% Match</span><span>${SHOW.year}</span><span class="chip">${SEASONS.length - 1} Seasons + Prequel</span><span>${SHOW.rating}</span>`;
    $('#sheet-syn').textContent = SHOW.synopsis;
    $('#sheet-cast').innerHTML = `<b>Starring:</b> ${SHOW.cast.join(', ')} &nbsp;·&nbsp; <b>Created by:</b> ${SHOW.creator} &nbsp;·&nbsp; <b>Genres:</b> ${SHOW.genres.join(', ')}`;
    sel.innerHTML = seasons.filter(s => s.episodes.length).map(s => `<option value="${s.n}" ${s.n === n ? 'selected' : ''}>${s.n === EXTRAS.n ? 'Extras' : `Season ${s.n} · ${s.title}`}</option>`).join('');
    renderSeason(); wrap.classList.add('on'); $('#sheet').scrollTop = 0;
  }
  function renderSeason() {
    const s = seasons.find(x => x.n === cur);
    $('#season-blurb').textContent = s.blurb;
    $('#ep-list').innerHTML = s.episodes.map(ep => { const p = progress[ep.id]; const hasStory = ep.story && ep.story.replace(/\.$/, '') !== ep.title; return `<button class="ep" type="button" data-ep="${ep.id}">
      <span class="ep-n">${ep.n}</span>
      <span class="ep-thumb">${imgHTML(ep.cover)}<span class="play"><i>${svgPlay}</i></span>${p ? `<span class="card-prog"><i style="width:${Math.round(p.frac * 100)}%"></i></span>` : ''}</span>
      <span class="ep-body"><span class="ep-title"><span>${ep.title}${ep.note ? `<i class="ep-note">${svgNote}</i>` : ''}</span><small>${Math.max(1, Math.round(ep.runtime / 60000))}m</small></span>
      <span class="ep-story">${hasStory ? ep.story : ep.len}</span><span class="ep-date">${ep.day === 'undated' ? 'Date unknown' : fmtLong(ep.day)}${ep.days.length > 1 ? ` + ${ep.days.length - 1} nearby day${ep.days.length > 2 ? 's' : ''}` : ''}${ep.est ? ' (approx.)' : ''}${hasStory ? ' · ' + ep.len : ''}</span></span></button>`; }).join('');
    $('#tbc').classList.toggle('hide', !s.toBeContinued);
    const lw = lastWatched()[0]; $('#sheet-play').querySelector('span').textContent = lw && lw.frac < 0.98 ? 'Resume' : 'Play';
  }
  sel.addEventListener('change', () => { cur = +sel.value; renderSeason(); });
  $('#ep-list').addEventListener('click', e => { const b = e.target.closest('.ep'); if (!b) return; const ep = epById[b.dataset.ep]; history.back(); setTimeout(() => overlay('player', { ep: ep.id, i: progress[ep.id]?.frac < 0.98 ? progress[ep.id].i : 0 }), 30); });
  $('#sheet-play').addEventListener('click', () => { const lw = lastWatched()[0]; const ep = lw && lw.frac < 0.98 ? lw.ep : seasons.find(x => x.n === cur).episodes[0]; history.back(); setTimeout(() => overlay('player', { ep: ep.id, i: lw && lw.ep === ep ? lw.i : 0 }), 30); });
  $('#sheet-close').addEventListener('click', back);
  wrap.addEventListener('click', e => { if (e.target === wrap) back(); });
  return { show, hide() { wrap.classList.remove('on'); } };
})();

/* ═══ PLAYER ═════════════════════════════════════════════ */
const player = (() => {
  const el = $('#player'), frames = [$('#frame-a'), $('#frame-b')], blur = $('#stage-blur');
  const fill = $('#fill'), knob = $('#knob'), timeEl = $('#pl-time'), next = $('#next'), loader = $('#pl-loader'), titleCard = $('#pl-titlecard'), noteEl = $('#note');
  let ep = null, i = 0, playing = true, fi = 0, raf = 0, t0 = 0, elapsed = 0, curDur = PHOTO_MS, video = null, hideT = 0, nextT = 0, nextTick = 0, seq = 0, cardT = 0, prefixes = [], wasPlaying = true;
  const cache = new Map();   // src -> decoded Image (bounded)
  const preload = m => {
    if (!m || m.k !== 'img' || cache.has(m.f)) return;
    const im = new Image(); im.decoding = 'async'; im.src = m.f; cache.set(m.f, im);
    if (cache.size > 8) cache.delete(cache.keys().next().value);
  };
  const KB = ['kb-in', 'kb-left', 'kb-up', 'kb-out', 'kb-right'];

  const prefix = idx => prefixes[idx] || 0;
  function open(epId, idx = 0) {
    ep = epById[epId]; i = Math.min(idx, ep.items.length - 1);
    prefixes = [0]; ep.items.forEach((m, k) => { prefixes[k + 1] = prefixes[k] + (m.k === 'vid' ? m.dur * 1000 : PHOTO_MS); });
    el.classList.add('on'); el.classList.toggle('first', !store.get('hinted', false)); store.set('hinted', true);
    const sLabel = ep.season.n === EXTRAS.n ? 'Extras' : `Season ${ep.season.n}`;
    $('#pl-ep').textContent = `${sLabel} · ${ep.label}`;
    $('#pl-name').textContent = ep.title;
    $('#ticks').innerHTML = ep.items.length > 24 ? '' : ep.items.slice(1).map((_, k) => `<i style="left:${(prefix(k + 1) / ep.runtime * 100).toFixed(2)}%"></i>`).join('');
    const n = nextEpisode(ep); $('#pl-nextep').style.visibility = n ? '' : 'hidden';
    $('#pl-note').classList.toggle('hide', !ep.note); noteEl.classList.remove('on');
    $('#tc-ep').textContent = `${sLabel} · ${ep.label}`; $('#tc-title').textContent = ep.title;
    $('#tc-sub').textContent = ep.day === 'undated' ? ep.len : `${fmtLong(ep.day)}${ep.est ? ' (approx.)' : ''} · ${ep.len}`;
    clearTimeout(cardT); titleCard.classList.add('on'); cardT = setTimeout(() => titleCard.classList.remove('on'), 3400);
    playing = true; setIcon(); showUI(); show(i);
  }
  function close() {
    cancelAnimationFrame(raf); clearTimeout(hideT); clearTimeout(nextT); clearInterval(nextTick); clearTimeout(cardT);
    if (video) { video.pause(); video.removeAttribute('src'); video.load(); video = null; }
    frames.forEach(f => { f.innerHTML = ''; f.classList.remove('on'); });
    next.classList.remove('on'); titleCard.classList.remove('on'); loader.classList.remove('on'); blur.classList.remove('on'); noteEl.classList.remove('on');
    el.classList.remove('on'); ep = null; seq++;
  }
  function show(idx) {
    i = idx; clearTimeout(nextT); clearInterval(nextTick); next.classList.remove('on');
    const m = ep.items[i], f = frames[fi = 1 - fi], old = frames[1 - fi], my = ++seq;
    if (video) { video.pause(); video.removeAttribute('src'); video.load(); video = null; }
    cancelAnimationFrame(raf);
    f.innerHTML = '';
    $('#pl-date').textContent = [fmtLong(m.d), fmtTime(m.d)].filter(Boolean).join(' · ') + (m.est ? ' · approx.' : '');
    $('#pl-story').textContent = storyOf(m);
    timeEl.textContent = `${i + 1} / ${ep.items.length}`;
    el.style.setProperty('--amb', amb(m));
    preload(ep.items[i + 1]); preload(ep.items[i + 2]);
    const commit = () => {
      if (my !== seq) return;
      loader.classList.remove('on');
      blur.style.backgroundImage = `url("${m.t}")`; blur.classList.add('on');
      f.classList.add('on'); old.classList.remove('on');
      setTimeout(() => { if (my === seq && old !== frames[fi]) old.innerHTML = ''; }, 700);
      elapsed = 0; t0 = performance.now(); setPlayState(); tick();
      saveProgress(ep, i, prefix(i) / ep.runtime);
    };
    if (m.k === 'img') {
      const img = cache.get(m.f) || new Image(); if (!img.src) { img.decoding = 'async'; img.src = m.f; }
      cache.delete(m.f); img.alt = '';
      const portrait = m.h > m.w * 1.05, tall = window.innerHeight > window.innerWidth;
      if (portrait !== tall) img.classList.add('fit');
      const p = m.p || [0.5, 0.35];
      img.style.setProperty('--ox', `${Math.round(p[0] * 100)}%`); img.style.setProperty('--oy', `${Math.round(p[1] * 100)}%`);
      img.style.objectPosition = `${Math.round(p[0] * 100)}% ${Math.round(p[1] * 100)}%`;
      img.style.setProperty('--kb', `${PHOTO_MS + 1200}ms`);
      img.classList.add(KB[Math.floor(Math.random() * KB.length)]);
      curDur = PHOTO_MS;
      const slow = setTimeout(() => { if (my === seq) loader.classList.add('on'); }, 350);
      const ready = () => { clearTimeout(slow); if (my !== seq) return; f.appendChild(img); commit(); };
      (img.decode ? img.decode() : Promise.resolve()).then(ready, ready);
    } else {
      video = document.createElement('video'); video.src = m.f; video.playsInline = true; video.preload = 'auto'; video.poster = m.t;
      video.muted = false; f.appendChild(video); curDur = m.dur * 1000;
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
      const frac = Math.min(1, (prefix(i) + Math.min(elapsed, curDur)) / ep.runtime);
      fill.style.width = knob.style.left = `${(frac * 100).toFixed(2)}%`;
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
  function finish() {
    saveProgress(ep, ep.items.length - 1, 1);
    const n = nextEpisode(ep);
    if (!n) { history.back(); setTimeout(() => go('finale'), 60); return; }
    $('#next-img').src = n.cover.t; $('#next-img').style.objectPosition = pos(n.cover); $('#next-title').textContent = `${n.label} · ${n.title}`;
    next.classList.add('on'); showUI(true); playing = false; setIcon();
    clearInterval(nextTick);
    let left = 6; const ring = $('#ring-fg'); ring.style.strokeDashoffset = 0;
    nextTick = setInterval(() => { left--; ring.style.strokeDashoffset = 56.5 * (1 - left / 6); if (left <= 0) { clearInterval(nextTick); playNext(); } }, 1000);
  }
  function playNext() { clearInterval(nextTick); if (!ep) return; const n = nextEpisode(ep); if (!n) return; history.replaceState({ ...state, ep: n.id, i: 0 }, ''); state = { ...state, ep: n.id, i: 0 }; open(n.id, 0); }
  function setPlayState() {
    el.style.setProperty('--play', playing ? 'running' : 'paused');
    if (video) { playing ? video.play().catch(() => {}) : video.pause(); }
    if (!video && playing) t0 = performance.now() - elapsed;
    setIcon();
  }
  function setIcon() { $('#ico-pause').classList.toggle('hide', !playing); $('#ico-play').classList.toggle('hide', playing); $('#pl-toggle').setAttribute('aria-label', playing ? 'Pause' : 'Play'); }
  function toggle() { playing = !playing; setPlayState(); showUI(); if (!playing) clearTimeout(hideT); }
  function showUI(sticky) { el.classList.add('ui'); clearTimeout(hideT); if (!sticky && playing) hideT = setTimeout(() => { el.classList.remove('ui', 'first'); }, 3200); }
  function openNote() { if (!ep || !ep.note) return; $('#note-text').textContent = ep.note; $('#note-date').textContent = fmtLong(ep.day); wasPlaying = playing; playing = false; setPlayState(); noteEl.classList.add('on'); showUI(true); }
  function closeNote() { noteEl.classList.remove('on'); if (wasPlaying) { playing = true; setPlayState(); } showUI(); }

  /* interaction */
  $('#pl-back').addEventListener('click', back);
  $('#pl-toggle').addEventListener('click', toggle);
  $('#pl-prev').addEventListener('click', () => { advance(-1); showUI(); });
  $('#pl-next').addEventListener('click', () => { advance(1); showUI(); });
  $('#pl-nextep').addEventListener('click', () => { saveProgress(ep, ep.items.length - 1, 1); playNext(); });
  $('#pl-note').addEventListener('click', openNote);
  $('#note-close').addEventListener('click', closeNote);
  $('#next-play').addEventListener('click', playNext);
  $('#next-cancel').addEventListener('click', () => { clearInterval(nextTick); next.classList.remove('on'); playing = false; setPlayState(); showUI(true); });
  $('#pl-list').addEventListener('click', () => { const s = ep.season.n; history.back(); setTimeout(() => overlay('sheet', { season: s }), 30); });
  $('#scrub').addEventListener('click', e => { const r = $('#scrub .bar').getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * ep.runtime; let k = 0; while (k < ep.items.length - 1 && prefix(k + 1) <= x) k++; show(k); showUI(); });
  let sx = 0, sy = 0, st = 0;
  $('#stage').addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now(); }, { passive: true });
  $('#stage').addEventListener('touchend', e => {
    if (noteEl.classList.contains('on')) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { advance(dx < 0 ? 1 : -1); showUI(); }
    else if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && Date.now() - st < 300) { el.classList.contains('ui') ? toggle() : showUI(); }
  }, { passive: true });
  $('#stage').addEventListener('click', e => { if (!('ontouchstart' in window) && !noteEl.classList.contains('on')) { el.classList.contains('ui') ? toggle() : showUI(); } });
  $('#stage').addEventListener('mousemove', () => { if (ep) showUI(); });
  document.addEventListener('keydown', e => {
    if (state.overlay === 'player') {
      if (noteEl.classList.contains('on')) { if (e.key === 'Escape' || e.key === ' ') { e.preventDefault(); closeNote(); } return; }
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle(); }
      else if (e.key === 'ArrowRight') { advance(1); showUI(); } else if (e.key === 'ArrowLeft') { advance(-1); showUI(); }
      else if (e.key === 'Escape') back();
    } else if (state.overlay === 'sheet' && e.key === 'Escape') back();
  });
  return { open, close };
})();

/* ═══ FINALE ═════════════════════════════════════════════ */
const finale = (() => {
  const inner = $('#credits-inner'), photo = $('#credits-photo'), audio = $('#bgm'), closing = $('#closing');
  const slides = [...TOP10].reverse().map(k => byKey[k]).filter(Boolean);
  let si = 0, slideT = 0, started = false;
  inner.innerHTML = CREDITS.map(([l, v]) => `<div class="credit"><b>${l}</b><span>${v}</span></div>`).join('');
  photo.innerHTML = slides.map(m => `<img src="${m.f}" alt="" class="${m.h > m.w * 1.25 ? '' : 'fit'}" style="object-position:${pos(m)}" loading="lazy">`).join('');
  $('#closing-l1').textContent = FINALE.line1; $('#closing-l2').textContent = FINALE.line2; $('#closing-sign').textContent = FINALE.sign;
  $('#closing-bg').style.backgroundImage = `url("${SHOW.finalePhoto}")`;
  function slide() { const imgs = $$('img', photo); imgs.forEach((im, k) => im.classList.toggle('on', k === si)); si = (si + 1) % imgs.length; slideT = setTimeout(slide, 3400); }
  function start() {
    closing.classList.remove('on'); started = true;
    inner.classList.remove('go'); void inner.offsetHeight;
    inner.style.setProperty('--dur', `${Math.max(40, CREDITS.length * 1.7)}s`); inner.classList.add('go');
    si = 0; slide();
    if (!audio.src) audio.src = FINALE.audio;
    audio.currentTime = FINALE.audioStart || 0; audio.volume = 0.85; audio.play().catch(() => {});
  }
  function end() { if (!started) return; clearTimeout(slideT); closing.classList.add('on'); }
  function stop() { started = false; clearTimeout(slideT); audio.pause(); inner.classList.remove('go'); closing.classList.remove('on'); }
  inner.addEventListener('animationend', end);
  $('#credits-skip').addEventListener('click', end);
  $('#watch-again').addEventListener('click', () => go('profiles'));
  $('#closing-browse').addEventListener('click', () => go('browse'));
  return { start, stop };
})();

/* ═══ INIT ═══════════════════════════════════════════════ */
apply({ screen: 'intro' });
console.info(`${allEpisodes.length} episodes across ${seasons.filter(s => s.episodes.length).length} seasons`);
})();
