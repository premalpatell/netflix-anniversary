/* Smoke test: drives the whole site in Chromium on a phone and a desktop viewport.
   Usage:  python3 -m http.server 8787 &   node tools/smoke.js [outDir]
   Needs Playwright (Chromium at /opt/pw-browsers/chromium in Claude Code cloud sessions). */
const { chromium } = require('playwright');
const OUT = process.argv[2] || '/tmp/smoke';
const URL = process.env.URL || 'http://localhost:8787/';
require('fs').mkdirSync(OUT, { recursive: true });

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' });
  let failed = 0;
  for (const [name, vp, mobile] of [['phone', { width: 430, height: 932 }, true], ['desktop', { width: 1440, height: 900 }, false]]) {
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, serviceWorkers: 'block' });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errs.push('console: ' + m.text()); });
    p.on('requestfailed', r => { if (!/intro\.mp4|\.mp4$|\.mp3$/.test(r.url())) errs.push('failed: ' + r.url()); });
    p.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errs.push(`${r.status()}: ${r.url()}`); });
    const shot = n => p.screenshot({ path: `${OUT}/${name}-${n}.jpg`, quality: 70 });
    const click = sel => p.evaluate(s => { const el = document.querySelector(s); if (!el) throw new Error('missing ' + s); el.dispatchEvent(new MouseEvent('click', { bubbles: true })); }, sel);
    const log = (...a) => console.log(name.padEnd(8), ...a);

    await p.goto(URL); await p.waitForTimeout(400);
    await click('#tap'); await p.waitForTimeout(6500); await shot('profiles');
    await click('.profile'); await p.waitForTimeout(1500); await shot('home');
    log('rows:', (await p.$$eval('.row-title', e => e.map(x => x.textContent))).join(' | '));
    const firstVisit = await p.$eval('#bb-title', e => (e.textContent.trim() || (e.querySelector('img') || {}).alt || '') + ' / ' + document.querySelector('#bb-tag').textContent);
    log('billboard slide 1:', firstVisit, '| slides:', await p.$$eval('.bb-dots i', e => e.length));
    await p.evaluate(() => window.scrollTo(0, 800)); await p.waitForTimeout(800); await shot('rows');

    if (!mobile) {   // hover card + row arrows
      await p.$eval('#row-new', e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(700);
      await p.hover('#row-new .card'); await p.waitForTimeout(900);
      log('jawbone open:', await p.$eval('#jaw', e => !e.hidden)); await shot('jawbone');
      await p.click('#jaw [data-act="list"]'); await p.waitForTimeout(300);
      log('my list row:', !!(await p.$('#row-list')));
      await p.mouse.move(5, 5); await p.waitForTimeout(300);
    }
    // bell + search
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
    await click('#nav-bell'); await p.waitForTimeout(300); await shot('bell');
    log('bell items:', await p.$$eval('.bell-item', e => e.length));
    await click('#nav-bell');
    await click('#nav-search'); await p.waitForTimeout(300); await p.fill('#search-input', 'navratri'); await p.waitForTimeout(300);
    log('search navratri:', await p.$$eval('#search-grid .card', e => e.length)); await shot('search');
    await p.goBack(); await p.waitForTimeout(300);
    // sheet + tabs
    await click('#bb-info'); await p.waitForTimeout(800); await shot('sheet');
    await click('[data-tab="more"]'); await p.waitForTimeout(200); await shot('sheet-more');
    await click('[data-tab="eps"]');
    // My List button on an episode row
    await click('#ep-list .ep-add'); await p.waitForTimeout(200);
    log('episode-row My List:', await p.$eval('#ep-list .ep-add', e => e.getAttribute('aria-pressed')));
    // first episode of Season 1 plays the recap first
    await p.selectOption('#season-select', '1'); await p.waitForTimeout(200);
    await click('#ep-list .ep'); await p.waitForTimeout(1500);
    log('recap:', await p.$eval('#skip-recap', e => !e.hidden), '|', await p.$eval('#pl-name', e => e.textContent)); await shot('recap');
    await click('#skip-recap'); await p.waitForTimeout(1500);
    log('after skip:', await p.$eval('#pl-name', e => e.textContent)); await shot('player');
    await p.waitForTimeout(4500);
    log('time:', await p.$eval('#pl-time', e => e.textContent), '| count:', await p.$eval('#pl-count', e => e.textContent), '| split:', await p.$eval('#player', e => e.classList.contains('split')));
    await shot('player2');
    if (mobile) {   // two-finger pinch on the current photo
      const z = await p.evaluate(async () => {
        const st = document.querySelector('#stage');
        const T = (id, x, y) => new Touch({ identifier: id, target: st, clientX: x, clientY: y });
        const fire = (type, ts) => st.dispatchEvent(new TouchEvent(type, { touches: ts, changedTouches: ts, bubbles: true, cancelable: true }));
        fire('touchstart', [T(1, 180, 450), T(2, 250, 450)]);
        fire('touchmove', [T(1, 120, 450), T(2, 310, 450)]);
        await new Promise(r => setTimeout(r, 50));
        const im = document.querySelector('.frame.on img'); const tf = im ? im.style.transform : '';
        fire('touchend', []);
        return tf;
      });
      log('pinch zoom transform:', z || '(none)');
    }
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(600);
    await click('#pl-like'); await click('#pl-mylist');
    await p.goBack(); await p.waitForTimeout(400);
    // trailer
    await click('#bb-info'); await p.waitForTimeout(500); await click('#sheet-trailer'); await p.waitForTimeout(1600);
    log('trailer:', await p.$eval('#pl-name', e => e.textContent)); await p.goBack(); await p.waitForTimeout(400);
    // love note
    await click('#bb-info'); await p.waitForTimeout(500); await p.selectOption('#season-select', '4'); await p.waitForTimeout(200);
    await p.evaluate(() => { const b = [...document.querySelectorAll('#ep-list .ep')].find(x => x.querySelector('.ep-note')); b.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    await p.waitForTimeout(1200); await click('#pl-note'); await p.waitForTimeout(400);
    log('note open:', await p.$eval('#note', e => e.classList.contains('on'))); await shot('note');
    await click('#note-close'); await p.goBack(); await p.waitForTimeout(400);
    // credits
    await click('#foot-credits'); await p.waitForTimeout(5000); await shot('credits');
    await click('#credits-skip'); await p.waitForTimeout(1800); await shot('closing');
    await p.goto(URL); await p.waitForTimeout(300); await click('#tap'); await p.waitForTimeout(6500); await click('.profile'); await p.waitForTimeout(1200);
    const second = await p.$eval('#bb-title', e => (e.textContent.trim() || (e.querySelector('img') || {}).alt || '') + ' / ' + document.querySelector('#bb-tag').textContent);
    log('billboard on next visit:', second, second !== firstVisit ? '(different)' : '(SAME)');
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    log('horizontal overflow:', overflow);
    log('errors:', errs.length ? '\n  ' + errs.join('\n  ') : 'none');
    if (errs.length || overflow) failed++;
    await ctx.close();
  }
  await b.close();
  console.log(failed ? `FAILED on ${failed} viewport(s)` : 'PASS');
  process.exit(failed ? 1 : 0);
})();
