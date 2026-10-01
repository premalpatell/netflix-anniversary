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

/* ── storage (never throws) ─────────────────────────────── */
const store = {
  get(k, d) { try { const v = localStorage.getItem('sp.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('sp.' + k, JSON.stringify(v)); } catch {} },
};

/* ── dates ──────────────────────────────────────────────── */
const parseD = d => { if (!d) return null; const [y, m, day] = d.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, day, +d.slice(11, 13) || 12, +d.slice(14, 16) || 0); };
const fmtLong = d => { const t = parseD(d); return t ? `${DAYS[t.getDay()]}, ${MONTHS[t.getMonth()]} ${t.getDate()}, ${t.getFullYear()}` : 'Undated'; };
const fmtDay = d => { const t = parseD(d); return t ? `${DAYS[t.getDay()]}, ${MONTHS[t.getMonth()]} ${t.getDate()}` : 'Undated'; };
const fmtShort = d => { const t = parseD(d); return t ? `${MONTHS[t.getMonth()].slice(0, 3)} ${t.getDate()}, ${t.getFullYear()}` : ''; };
const fmtTime = d => { const t = parseD(d); if (!t || !d || d.length < 16 || d.slice(11, 16) === '12:00') return ''; let h = t.getHours(); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return `${h}:${String(t.getMinutes()).padStart(2, '0')} ${ap}`; };
const secs = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

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
  Object.values(buckets).sort((a, b) => a.day.localeCompare(b.day)).forEach(b => {
    const season = seasons.find(s => s.n === b.sn);
    b.items.sort((a, c) => (a.d || '').localeCompare(c.d || ''));
    const note = EPISODE_NOTES[b.day] || {};
    const firstStory = b.items.map(m => stories[m.key]).find(Boolean);
    const title = note.title || (firstStory ? firstStory.replace(/\.$/, '') : (b.day === 'undated' ? 'Lost & found' : fmtDay(b.day)));
    const photos = b.items.filter(m => m.k === 'img').length, vids = b.items.length - photos;
    const runtime = b.items.reduce((t, m) => t + (m.k === 'vid' ? m.dur * 1000 : PHOTO_MS), 0);
    const thumbItem = (note.thumb && byKey[note.thumb]) || b.items.find(m => m.k === 'img' && m.w >= m.h) || b.items.find(m => m.k === 'img') || b.items[0];
    const ep = {
      id: `${b.sn}-${b.day}`, season, n: season.episodes.length + 1, day: b.day, title, items: b.items,
      thumb: thumbItem.t, thumbFull: thumbItem.f, photos, vids, runtime,
      len: [photos && `${photos} photo${photos > 1 ? 's' : ''}`, vids && `${vids} video${vids > 1 ? 's' : ''}`].filter(Boolean).join(' · '),
      story: note.story || b.items.map(storyOf).find(Boolean) || '',
      est: b.items.every(m => m.est),
    };
    ep.label = season.n === EXTRAS.n ? `Extra ${ep.n}` : `S${season.n}:E${ep.n}`;
    season.episodes.push(ep);
  });
})();
const allEpisodes = seasons.flatMap(s => s.episodes);
const epById = Object.fromEntries(allEpisodes.map(e => [e.id, e]));
const epOf = new Map(); allEpisodes.forEach(e => e.items.forEach((m, k) => epOf.set(m, { ep: e, i: k })));
const nextEpisode = ep => allEpisodes[allEpisodes.indexOf(ep) + 1] || null;
/* "New" = within 45 days of the most recent dated episode */
const latestDay = allEpisodes.filter(e => e.day !== 'undated').map(e => e.day).sort().pop() || '';
const isNew = ep => ep.day !== 'undated' && (parseD(latestDay) - parseD(ep.day)) / 864e5 <= 45;

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
  if (s.screen === 'browse') browse.ensure();
  if (s.screen === 'finale' && prev.screen !== 'finale') finale.start();
  if (s.overlay === 'sheet') sheet.show(s.season); else if (s.overlay === 'player') { if (!fromPop) player.open(s.ep, s.i); }
  if (!s.overlay && !fromPop) window.scrollTo({ top: s.scroll || 0 });
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
    `<button class="profile" type="button" data-i="${i}"><img src="${p.photo}" alt=""><span>${p.name}</span></button>`).join('');
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
const cardHTML = (ep, i, opts = {}) => {
  const p = progress[ep.id];
  return `<button class="card" type="button" data-ep="${ep.id}" ${opts.i != null ? `data-i="${opts.i}"` : ''}>
    <img src="${opts.thumb || ep.thumb}" alt="" loading="lazy" decoding="async">
    ${opts.vid ? `<span class="card-vid">${svgPlay}</span>` : ''}
    ${opts.badge !== false && isNew(ep) ? '<span class="badge-new">New</span>' : ''}
    <div class="card-body"><div class="card-ep">${ep.label}${ep.est ? ' · approx. date' : ''}</div><div class="card-title">${opts.title || ep.title}</div><div class="card-len">${opts.len || ep.len}</div></div>
    ${p && opts.prog !== false ? `<div class="card-prog"><i style="width:${Math.round(p.frac * 100)}%"></i></div>` : ''}
  </button>`;
};
const rowHTML = (id, title, sub, inner, cls = '') => `<section class="row ${cls}" id="row-${id}"><div class="row-head"><h2 class="row-title">${title}</h2>${sub ? `<span class="row-sub">${sub}</span>` : ''}</div><div class="strip ${cls === 'top10-row' ? 'top10' : ''}">${inner}</div></section>`;

const browse = (() => {
  let built = false;
  const nav = $('#nav'), bbv = $('#bb-video');
  function build() {
    $('#bb-title').innerHTML = SHOW.title.replace('&', '<em>&amp;</em>');
    $('#bb-tag').textContent = SHOW.tagline;
    $('#bb-meta').innerHTML = `<span class="match">100% Match</span><span>${SHOW.year}</span><span class="chip">${SEASONS.length - 1} Seasons + Prequel</span><span class="chip top">#1 in Our Hearts Today</span>`;
    $('#bb-poster').src = SHOW.billboardPoster;
    $('#nav-avatar').src = PROFILES[profile].photo;
    renderRows();
  }
  function renderRows() {
    const rows = [];
    const cw = lastWatched().filter(x => x.frac > 0.02 && x.frac < 0.98).slice(0, 12);
    if (cw.length) rows.push(rowHTML('continue', `Continue Watching for ${PROFILES[profile].name.replace(' ♡', '')}`, '', cw.map(x => cardHTML(x.ep, x.i)).join('')));
    rows.push(rowHTML('top10', 'Top 10 Moments', 'as ranked by Premal', TOP10.map((k, i) => {
      const m = byKey[k]; const at = m && epOf.get(m); if (!at) return '';
      return `<button class="top-card" type="button" data-ep="${at.ep.id}" data-i="${at.i}"><span class="top-num">${i + 1}</span><img src="${m.t}" alt="" loading="lazy" decoding="async"><div class="card-body"><div class="card-ep">${at.ep.label}</div><div class="card-title">${at.ep.title}</div></div></button>`;
    }).join(''), 'top10-row'));
    const fresh = allEpisodes.filter(isNew).reverse().slice(0, 12);
    if (fresh.length) rows.push(rowHTML('new', 'New Episodes', `latest from Season ${fresh[0].season.n}`, fresh.map(e => cardHTML(e, 0, { badge: false })).join('')));
    rows.push(rowHTML('seasons', 'Seasons', `${SEASONS.length} seasons · ${allEpisodes.filter(e => e.season.n !== EXTRAS.n).length} episodes`, SEASONS.map(s => {
      const se = seasons.find(x => x.n === s.n);
      return `<button class="card season" type="button" data-season="${s.n}"><img src="${s.hero.replace('images/', 'images/t/')}" alt="" loading="lazy" decoding="async"><div class="card-body"><div class="card-ep">Season ${s.n} · ${s.tag}</div><div class="card-title">${s.title}</div><div class="card-len">${se.episodes.length} episodes · ${s.blurb}</div></div></button>`;
    }).join(''), 'season-row'));
    seasons.filter(s => s.episodes.length && s.n !== EXTRAS.n).forEach(s =>
      rows.push(rowHTML(s.slug, `Season ${s.n} · ${s.title}`, s.tag, s.episodes.map(e => cardHTML(e)).join(''))));
    const vids = MEDIA.filter(m => m.k === 'vid');
    rows.push(rowHTML('videos', 'Videos', `${vids.length} clips`, vids.map(m => { const at = epOf.get(m); return cardHTML(at.ep, 0, { i: at.i, thumb: m.t, vid: true, len: [secs(m.dur), fmtShort(m.d)].filter(Boolean).join(' · '), prog: false, badge: false }); }).join('')));
    const ex = seasons.find(s => s.n === EXTRAS.n);
    if (ex.episodes.length) rows.push(rowHTML('extras', 'Extras', ex.blurb, ex.episodes.map(e => cardHTML(e)).join('')));
    $('#rows').innerHTML = rows.join('');
    measure();
  }
  /* cached row offsets so the scroll handler never forces layout */
  let marks = [], navBtns = $$('.nav-links button'), navCur = '', ticking = false;
  function measure() { marks = ['videos', 'seasons'].map(id => ({ id, el: $('#row-' + id) })).filter(m => m.el).map(m => ({ id: m.id, top: m.el.offsetTop })); }
  window.addEventListener('resize', measure, { passive: true });
  $('#rows').addEventListener('click', e => {
    const c = e.target.closest('[data-ep],[data-season]'); if (!c) return;
    if (c.dataset.season != null) return overlay('sheet', { season: +c.dataset.season });
    const ep = epById[c.dataset.ep]; const i = c.dataset.i != null ? +c.dataset.i : (progress[ep.id]?.frac < 0.98 ? progress[ep.id].i : 0);
    overlay('player', { ep: ep.id, i });
  });
  $('#bb-play').addEventListener('click', () => { const lw = lastWatched()[0]; const ep = lw && lw.frac < 0.98 ? lw.ep : seasons.find(s => s.n === 1).episodes[0] || allEpisodes[0]; overlay('player', { ep: ep.id, i: lw && lw.ep === ep ? lw.i : 0 }); });
  $('#bb-info').addEventListener('click', () => overlay('sheet', { season: 1 }));
  $('#foot-credits').addEventListener('click', () => go('finale'));
  $('#bb-mute').addEventListener('click', () => { bbv.muted = !bbv.muted; $('#bb-mute').setAttribute('aria-label', bbv.muted ? 'Unmute' : 'Mute'); $('#bb-mute').style.opacity = bbv.muted ? '' : '.55'; });
  $$('.nav-links button').forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.nav; if (t === 'finale') return go('finale');
    const el = t === 'top' ? null : $('#row-' + t);
    window.scrollTo({ top: el ? el.offsetTop - 70 : 0, behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' });
  }));
  window.addEventListener('scroll', () => {
    if (state.screen !== 'browse' || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY;
      nav.classList.toggle('solid', y > 40);
      const cur = (marks.find(m => y + 120 >= m.top) || { id: 'top' }).id;
      if (cur !== navCur) { navCur = cur; navBtns.forEach(b => b.classList.toggle('cur', b.dataset.nav === cur)); }
    });
  }, { passive: true });
  function startBillboard() {
    if (!bbv.src) { bbv.src = SHOW.billboardVideo; bbv.addEventListener('playing', () => bbv.classList.add('ready'), { once: true }); }
    bbv.play().catch(() => {});
  }
  return {
    ensure() { if (!built) { build(); built = true; } else renderRows(); $('#nav-avatar').src = PROFILES[profile].photo; startBillboard(); },
    pauseBB() { bbv.pause(); },
  };
})();

/* ═══ DETAILS SHEET ══════════════════════════════════════ */
const sheet = (() => {
  const wrap = $('#sheet-wrap'), sel = $('#season-select');
  let cur = 1;
  function show(n = 1) {
    cur = n;
    $('#sheet-img').src = SHOW.billboardPoster; $('#sheet-title').textContent = SHOW.title;
    $('#sheet-meta').innerHTML = `<span class="match" style="color:var(--green);font-weight:700">100% Match</span><span>${SHOW.year}</span><span class="chip">${SEASONS.length - 1} Seasons + Prequel</span><span>${SHOW.rating}</span>`;
    $('#sheet-syn').textContent = SHOW.synopsis;
    $('#sheet-cast').innerHTML = `<b>Starring:</b> ${SHOW.cast.join(', ')} &nbsp;·&nbsp; <b>Created by:</b> ${SHOW.creator} &nbsp;·&nbsp; <b>Genres:</b> ${SHOW.genres.join(', ')}`;
    sel.innerHTML = seasons.filter(s => s.episodes.length).map(s => `<option value="${s.n}" ${s.n === n ? 'selected' : ''}>${s.n === EXTRAS.n ? 'Extras' : `Season ${s.n} · ${s.title}`}</option>`).join('');
    renderSeason(); wrap.classList.add('on'); $('#sheet').scrollTop = 0;
  }
  function renderSeason() {
    const s = seasons.find(x => x.n === cur);
    $('#season-blurb').textContent = s.blurb;
    $('#ep-list').innerHTML = s.episodes.map(ep => { const p = progress[ep.id]; return `<button class="ep" type="button" data-ep="${ep.id}">
      <span class="ep-n">${ep.n}</span>
      <span class="ep-thumb"><img src="${ep.thumb}" alt="" loading="lazy"><span class="play"><i>${svgPlay}</i></span>${p ? `<span class="card-prog"><i style="width:${Math.round(p.frac * 100)}%"></i></span>` : ''}</span>
      <span class="ep-body"><span class="ep-title"><span>${ep.title}</span><small>${Math.max(1, Math.round(ep.runtime / 60000))}m</small></span>
      <span class="ep-story">${ep.story && ep.story.replace(/\.$/, '') !== ep.title ? ep.story : ep.len}</span><span class="ep-date">${ep.day === 'undated' ? 'Date unknown' : fmtLong(ep.day)}${ep.est ? ' (approx.)' : ''}${ep.story && ep.story.replace(/\.$/, '') !== ep.title ? ' · ' + ep.len : ''}</span></span></button>`; }).join('');
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
  const fill = $('#fill'), knob = $('#knob'), timeEl = $('#pl-time'), next = $('#next'), loader = $('#pl-loader'), titleCard = $('#pl-titlecard');
  let ep = null, i = 0, playing = true, fi = 0, raf = 0, t0 = 0, elapsed = 0, curDur = PHOTO_MS, video = null, hideT = 0, nextT = 0, nextTick = 0, seq = 0, cardT = 0, prefixes = [];
  const cache = new Map();   // src -> decoded Image (bounded)
  const preload = m => {
    if (!m || m.k !== 'img' || cache.has(m.f)) return;
    const im = new Image(); im.decoding = 'async'; im.src = m.f; cache.set(m.f, im);
    if (cache.size > 8) cache.delete(cache.keys().next().value);
  };

  const prefix = idx => prefixes[idx] || 0;
  function open(epId, idx = 0) {
    ep = epById[epId]; i = Math.min(idx, ep.items.length - 1);
    prefixes = [0]; ep.items.forEach((m, k) => { prefixes[k + 1] = prefixes[k] + (m.k === 'vid' ? m.dur * 1000 : PHOTO_MS); });
    browse.pauseBB();
    el.classList.add('on'); el.classList.toggle('first', !store.get('hinted', false)); store.set('hinted', true);
    const sLabel = ep.season.n === EXTRAS.n ? 'Extras' : `Season ${ep.season.n}`;
    $('#pl-ep').textContent = `${sLabel} · ${ep.label}`;
    $('#pl-name').textContent = ep.title;
    $('#ticks').innerHTML = ep.items.length > 24 ? '' : ep.items.slice(1).map((_, k) => `<i style="left:${(prefix(k + 1) / ep.runtime * 100).toFixed(2)}%"></i>`).join('');
    const n = nextEpisode(ep); $('#pl-nextep').style.visibility = n ? '' : 'hidden';
    // Netflix-style title card for the first few seconds of an episode
    $('#tc-ep').textContent = `${sLabel} · ${ep.label}`; $('#tc-title').textContent = ep.title;
    $('#tc-sub').textContent = ep.day === 'undated' ? ep.len : `${fmtLong(ep.day)}${ep.est ? ' (approx.)' : ''} · ${ep.len}`;
    clearTimeout(cardT); titleCard.classList.add('on'); cardT = setTimeout(() => titleCard.classList.remove('on'), 3400);
    playing = true; setIcon(); showUI(); show(i);
  }
  function close() {
    cancelAnimationFrame(raf); clearTimeout(hideT); clearTimeout(nextT); clearInterval(nextTick); clearTimeout(cardT);
    if (video) { video.pause(); video.removeAttribute('src'); video.load(); video = null; }
    frames.forEach(f => { f.innerHTML = ''; f.classList.remove('on'); });
    next.classList.remove('on'); titleCard.classList.remove('on'); loader.classList.remove('on'); blur.classList.remove('on');
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
      img.style.setProperty('--ox', `${35 + Math.random() * 30}%`); img.style.setProperty('--oy', `${20 + Math.random() * 40}%`);
      img.style.setProperty('--kb', `${PHOTO_MS + 800}ms`);
      curDur = PHOTO_MS;
      // Only swap once the image is decoded: no flash, no half-painted frame.
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
    $('#next-img').src = n.thumb; $('#next-title').textContent = `${n.label} · ${n.title}`;
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

  /* interaction */
  $('#pl-back').addEventListener('click', back);
  $('#pl-toggle').addEventListener('click', toggle);
  $('#pl-prev').addEventListener('click', () => { advance(-1); showUI(); });
  $('#pl-next').addEventListener('click', () => { advance(1); showUI(); });
  $('#pl-nextep').addEventListener('click', () => { saveProgress(ep, ep.items.length - 1, 1); playNext(); });
  $('#next-play').addEventListener('click', playNext);
  $('#next-cancel').addEventListener('click', () => { clearInterval(nextTick); next.classList.remove('on'); playing = false; setPlayState(); showUI(true); });
  $('#pl-list').addEventListener('click', () => { const s = ep.season.n; history.back(); setTimeout(() => overlay('sheet', { season: s }), 30); });
  $('#scrub').addEventListener('click', e => { const r = $('#scrub .bar').getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * ep.runtime; let k = 0; while (k < ep.items.length - 1 && prefix(k + 1) <= x) k++; show(k); showUI(); });
  let sx = 0, sy = 0, st = 0;
  $('#stage').addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now(); }, { passive: true });
  $('#stage').addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { advance(dx < 0 ? 1 : -1); showUI(); }
    else if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && Date.now() - st < 300) { el.classList.contains('ui') ? toggle() : showUI(); }
  }, { passive: true });
  $('#stage').addEventListener('click', e => { if (!('ontouchstart' in window)) { el.classList.contains('ui') ? toggle() : showUI(); } });
  $('#stage').addEventListener('mousemove', () => { if (ep) showUI(); });
  document.addEventListener('keydown', e => {
    if (state.overlay === 'player') {
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
  photo.innerHTML = slides.map((m, k) => `<img src="${m.f}" alt="" class="${m.h > m.w * 1.25 ? '' : 'fit'}" loading="lazy">`).join('');
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
