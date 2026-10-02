# Shivani & Premal — design audit and next steps

## Status (Oct 1, 2026)
Built and shipped: everything in sections A, B, C and E below, plus the Cutting Room edits (dates, covers, merges, titles and captions) and 21 Bruce Peninsula photos.
- `tools/smoke.js` drives the full path on phone and desktop and must print `PASS`.
- Episode titles and captions live in `EPISODE_NOTES` in `js/data.js`; date corrections live in `USER_DATES` in `tools/build_media.py`.
- Bump `VERSION` in `sw.js` on every deploy so returning visitors get fresh photos.
- Oct 2: added My List on episode rows, a "Recently Added" tag (last 14 days), pinch-to-zoom in the player, Netflix-voice captions for every photo, Bollywood-style titles for all 64 episodes and 6 seasons, a pool of 40 Bollywood billboard highlights that rotate a fresh mix each visit (`HIGHLIGHTS` in `js/data.js`), and face-first video poster frames.
- Checks (Oct 2): Lighthouse mobile, served gzipped like GitHub Pages: Performance 99, Accessibility 100, Best Practices 100 (FCP 1.1 s, LCP 2.1 s, TBT 0 ms, CLS 0). All text colours pass WCAG AA 4.5:1 on every background (muted grey is now #9e9e9e, red text #ff6b71).

Still open, all blocked on file size (the Drive connector can't download files over 10 MB):
- `graduation video.mp4` (177 MB) for Graduation Day, May 27 2025.
- `July 21st 2024.mp4` (48 MB) for Her Birthday, 2024.
- `20250527_175625.mp4` (311 MB), `20240720_232018.mp4` (86 MB), and the four Sept 25–26 2026 files from the original list.
Export them under 10 MB (or as a shared link to a smaller copy) and they can be added with the normal build.

A brief for whoever builds the next pass. It covers what exists today, what is still wrong screen by screen, how Netflix handles text and titles and how to copy that, and a prioritised backlog with implementation pointers.

Live site: https://premalpatell.github.io/netflix-anniversary/ (serves `master`).
Work branch: `claude/loving-hopper-2i10mc` (push both; `master` is a fast-forward of it).

## 1. What exists

| File | Role |
|---|---|
| `index.html` | Markup for all screens: `#intro`, `#profiles`, `#browse` (nav, `#billboard`, `#rows`, footer), `#sheet-wrap` (details), `#player`, `#finale`, `#toast`. |
| `css/app.css` | Design tokens on `:root`, one section per screen, `@media (min-width:720px)` for desktop, reduced-motion block at the end. |
| `js/data.js` | Everything hand-written: `SHOW`, `FEATURES` (billboard rotation), `LOVE_NOTES`, `PROFILES`, `SEASONS`, `STORIES` (per file), `EPISODE_NOTES` (per date: title, story, thumb), `TOP10`, `CREDITS`, `FINALE`. |
| `js/media.js` | Generated. One object per photo/video: `f` full, `t` thumb, `k` img/vid, `d` capture time, `w h`, `dur`, `key`, `est` (date guessed), `p` face focus `[x,y]` 0..1, `b` 12px blur-up data URI, `c` ambient colour. 429 items, 278 KB. |
| `js/app.js` | IIFE. Model (episodes = one per day, lone photos merge into a neighbour within 7 days), History-API router, intro, profiles, browse (rotating billboard, rows, parallax, hover previews), sheet, player (decode-before-swap, Ken Burns variants, title card, next-episode countdown, love-note card), finale. |
| `tools/build_media.py` | Pipeline: EXIF/filename/QuickTime dates, dHash dedupe, Haar-cascade face focus, blur-up, colour, 1440px full + 480px thumb, 720p H.264 video. `SNAP_DATES` holds hand-confirmed dates, `SKIP_RAW` the trimmed selfies. Needs `pillow`, `pillow-heif`, `opencv-python-headless<5`, ffmpeg. Raw originals are not in the repo. |

Routing: `state = {screen, overlay, ep, i, season, scroll}`; `go()` pushes a screen, `overlay()` pushes sheet/player, `popstate` closes overlays. Progress lives in `localStorage` under `sp.progress`.

Caveat when screenshotting in a sandbox: Google Fonts are blocked there, so Bebas Neue / Inter / Playfair fall back to system fonts. On the live site the real fonts load.

## 2. Audit by screen

### Intro
Kept as-is by decision (ripped 720p ident, letterboxed on phones). Not to be changed unless asked.

### Who's watching
- Premal's avatar is a photo of Shivani. Netflix profiles are visually distinct at a glance. Give Premal a drawn avatar (Netflix-style flat face on a coloured tile, SVG) or a couple photo.
- Nothing says this is her show. Add the series logo faintly above "Who's watching?" or the tagline under it in the display font.
- Netflix's screen has the profile tiles at 1:1 with a 2px border on hover and the name in grey turning white. We have that. Fine.

### Home: billboard
- The series slide uses the Montmorency portrait still on desktop. It crops well because of face focus, but a true landscape hero would be stronger. Pick or crop one 16:9 hero per feature (`FEATURES[].still`) rather than relying on cover-crop.
- The ambersand in the logo lockup is small and sits awkwardly in the "sm" variant on the details sheet. The logo needs real design (see §3.4).
- Metadata row: Netflix shows year, season count, a bordered maturity box and an "HD" box. Ours: "100% Match · 2023 – 2026 · [5 Seasons + Prequel] · [#1 in Our Hearts Today]". Add a bordered "L" maturity box with a reason line ("rated L for Love · contains: late-night drives, unlimited pizza") the way Netflix prints "language, smoking".
- The "#1 in Our Hearts Today" chip should use Netflix's Top 10 icon (red square, "TOP 10" stacked in two lines) followed by the text, not a plain red chip.
- "New Episode" slides should carry Netflix's red "NEW EPISODE" tag on the badge line and a "Watch now" primary button label instead of "Play".

### Home: rows
- Row titles are Title Case and bold, which matches Netflix. Subtitles in grey after the title are not a Netflix pattern; Netflix puts the qualifier in the title ("Top 10 TV Shows in Canada Today", "Continue Watching for Shivani"). Fold subtitles into titles: "Top 10 Moments, as Ranked by Premal", "On This Day, in Earlier Years".
- No row-end arrows on desktop. Netflix shows a translucent chevron on hover at each end of the row and a small pagination indicator top-right. Add both (`.strip` scrollBy one viewport width, dots from `scrollWidth / clientWidth`).
- Desktop cards don't open Netflix's hover "jawbone": the card grows, shows a muted preview, then a panel with Play, My List, Like buttons, metadata and tags. This is the single most recognisable desktop Netflix interaction and we have none of it beyond the scale and preview. See backlog B1.
- The welcome toast lands over the first row. Move it top-centre under the nav, or replace with Netflix's quiet profile fade.
- "Extras" row holds one undated video. Once dated it disappears; keep the code.
- Cards: video cards show the duration and weekday. Netflix shows the duration bottom-right over the art, not in the body. Minor.

### Details sheet
- Hero: the poster's sky dominates and the title overlaps her face. Either pick a landscape poster where the subject is on the right and the logo sits left, or position the logo by face focus (if the face is on the right, left-align the logo and vice versa).
- Episode rows repeat the date: title "Aug 25, 2024", then the "ep-date" line again "Sunday, August 25, 2024". When the title is a date, the date line should show only the weekday or nothing.
- Netflix details page has tabs: Episodes / Trailers & More / More Like This. Add "Trailers & More" (the Videos row) and "More Like This" (season posters) as tabs inside the sheet. Add "This show is: Heartfelt, Romantic, Feel-Good" tag line under the cast, which is a Netflix fixture.
- Netflix shows a "Play" + "Download" button pair; we could add "Share" (copies the link with a tiny preview) or "My List".
- Mobile: the sheet cannot be dragged down to close. Add drag-to-dismiss on the handle area.
- Season dropdown: Netflix's is a bordered select with a white caret. Ours matches. Fine.

### Player
- Netflix does not use tracked uppercase labels. Our "SEASON 3 · S3:E4", "SWIPE OR TAP · SPACE TO PAUSE" and the uppercase date line are Apple TV mannerisms. Netflix prints "S3:E4 Cactus Club" in regular case grey, with the show name above in white. Restyle `.pl-title b`, `.pl-caption .date`, `.pl-hint` and `.pl-titlecard small` to sentence case, no letter-spacing.
- The caption shows the story even when it equals the episode title ("Cactus Club Cafe, downtown Toronto." under an episode called the same). Suppress the caption when `storyOf(m)` equals `ep.title`; show the time of day there instead.
- Desktop: portrait photos are pillar-boxed in the centre with a blurred backdrop. It works but it is not a Netflix frame. Better: a two-panel desktop layout, photo filling the left 58% edge to edge and a typographic panel on the right (episode label, title, date, story, "next up" thumbnail). Photos that are landscape go full-bleed as now.
- The progress bar shows "2 / 6". Netflix shows time remaining. Keep the count but add remaining time ("0:24 left") computed from `prefix()`.
- Missing gestures people expect from Netflix and Photos: double-tap left/right to skip with a ripple, swipe down to close, long-press to pause, pinch to zoom a photo.
- Next-episode card: Netflix shows the next thumbnail large with "Next Episode" and the countdown inside the Play button. Ours matches. Fine.
- Title card: good. Consider showing the series logo small above the episode title on the first episode of each season, the way an Original opens.

### Finale (credits)
- Credit values wrap to two lines on phones ("Liu Loqum Atelier · Sep 30, 2024") and the last rows collide with the Skip button. Shorten values, widen the value column, and move Skip to the top-right.
- Large empty black band between the photo and the scrolling text on phones. Start the scroll higher (translateY(40vh)) and make the photo a little smaller.
- Netflix's post-play shows a "Watch credits" / "Next episode" split screen. A "post-play" layout with the credits on the left and the closing card's photo on the right would feel more like it on desktop.

### Closing card
- The background is dimmed to a muddy grey. Keep the photo brighter and put the darkening only behind the text block with a radial gradient.
- "The End · For Now" is a tracked uppercase label again. Netflix would print "To be continued" in sentence case.

## 3. How Netflix sets text, and how to copy it

### 3.1 Typeface and tokens
Netflix uses Netflix Sans (proprietary). Inter is the closest free match and is already loaded; use it for everything except the two display cases below. Self-host the three fonts as woff2 in `fonts/` with `font-display: swap` and a `<link rel="preload">` for the display face, so the site never depends on Google Fonts and never flashes fallback text.

Colour tokens Netflix uses on the web app:
- background `#141414`, card background `#2f2f2f` (we use `#222`)
- primary text `#e5e5e5` (we use `#fff`; soften row titles and body to `#e5e5e5`)
- secondary text `#808080` on dark, `#b3b3b3` for nav links
- red `#e50914`, match green `#46d369`
- Play button white `#fff` with black text; More Info `rgba(109,109,110,.7)`

### 3.2 Sizes and weights
- Row title: bold 700, ~1.4vw desktop, 18px mobile, `#e5e5e5`.
- Card title: 600, ~0.9vw desktop, 13px mobile.
- Billboard synopsis: 400, ~1.2vw, max 2 lines.
- Details title: the logo art, else bold 2.5vw.
- Metadata: 400, ~1vw, grey; badges in 1px white boxes with `padding: 0 .4em`.
- Episode list: number 1.5em grey; title 600 white with duration right-aligned in grey; description 2 lines, `#d2d2d2`.
- Letter-spacing: none, anywhere, except the small "N SERIES" ident. Replace all tracked uppercase labels in `app.css` (`.card-ep`, `.pl-caption .date`, `.pl-hint`, `.tap-label`, `.manage`, `.closing-body small`, `.next-body small`) with regular case grey text.

### 3.3 Copy conventions (this is what will make it read like Netflix)
- Row titles in Title Case. Episode titles are short noun phrases, 2 to 4 words, no trailing full stop: "The Temple", "First Date", "BarChef", "Navratri Nights", "Her First Car", "Clockwork Bar", "Roses at Arrivals", "The Letter", "Planta", "Graduation Day", "Crystal Beach", "The Bob", "The Last Day", "Montmorency", "Roses, Again".
- Episode descriptions are one or two sentences, present tense, third person, sentence case, ending with a full stop: "Shivani and Premal visit a temple together for the first time." Not "First time we went to a temple together." Rewrite every entry in `STORIES` and `EPISODE_NOTES` this way. Keep Premal's own voice for `LOVE_NOTES`, the Valentine entry and the birthday apology; those are letters, not synopses.
- Season labels: "Season 1", not "S1 · The Beginning", on posters and in the dropdown; the season name goes on the second line in grey.
- Billboard tags: "Series", "New Episode", "Top 10", "Season 0 · Prequel" are right. Add "Recently Added" to anything from the last 14 days.
- The maturity line: "Rated L · for Love" plus a reason list in grey after the box.
- Dates: Netflix shows the year only in metadata and never a weekday. Keep weekdays in the episode list subtitle only; everywhere else "Sep 30, 2024".

### 3.4 Title treatment
Netflix never uses plain text for a show title; each has a logo. Design a proper one:
- Stacked "SHIVANI" over "PREMAL" in Bebas Neue, with a large italic Playfair ampersand in red set between the lines and slightly behind them, so the & reads as a swash rather than a separate glyph.
- Export as an inline SVG (`<symbol id="logo">`) so it scales on the billboard, the details sheet, the player title card and the closing card, with a one-colour white variant for dark overlays.
- Also derive the favicon and the app icon from it (see B6).

## 4. Backlog, prioritised

Effort: S under 1 hour, M half a day, L a day or more.

### A. Fix first (correctness and polish)
1. S Remove tracked uppercase labels and restyle to Netflix case/colour (§3.2).
2. S Episode list: don't repeat the date when the title is a date.
3. S Player caption: hide the story when it equals the episode title.
4. S Credits: fix wrapping and the Skip collision; tighten the empty band.
5. S Closing card background brightness.
6. M Self-host fonts, preload the display face.
7. M Rewrite `STORIES` and `EPISODE_NOTES` into Netflix synopsis voice and short titles (§3.3). Premal must confirm the titles; produce a proposal table first.

### B. Netflix signature interactions
1. L Desktop hover "jawbone" card: on hover for 500 ms the card grows to ~1.5x, plays the clip or a 3-photo mini slideshow, then reveals a panel with Play, "+ My List", "Like", episode label, duration and three tags. Netflix anchors the expansion to the row edge so the first and last cards grow inward.
2. M Row chevrons and pagination dots on desktop.
3. M My List: heart on cards, sheet and player; "My List" row; stored in `localStorage` under `sp.list`.
4. M Thumbs up/down rating per episode, stored locally, with a "Send to Premal" button that copies a short code of her picks to the clipboard.
5. M Notifications bell in the nav: a dropdown listing the newest episodes and today's "On This Day" matches, with unread dot stored locally.
6. M Search: nav icon opens a full-screen search over titles, stories, dates and seasons, results as a grid of cards, like Netflix's.
7. M Details sheet tabs: Episodes / Trailers & More / More Like This; drag-to-dismiss on mobile.
8. L Player desktop two-panel layout (§2 Player).
9. M Player gestures: double-tap skip with ripple, swipe-down to close, long-press pause.
10. M "Previously on": auto-generated 15-second recap (the previous season's Top 10 picks, 1.5 s each, with the credits song fading under) that plays when she starts the first episode of a season, with a "Skip Recap" button.
11. M Series trailer: a 30-second montage of the Top 10 plus 3 video clips, under "Trailers & More" and as a "Watch Trailer" button on the series billboard slide.
12. S "Coming Soon" row with one tile: "Season 6 · Long Distance" and a "Remind me" bell that stores a flag and shows a toast.

### C. Make it feel like an app
1. M PWA: `manifest.webmanifest` (name, icons from the logo, `display: standalone`, theme `#141414`), `apple-touch-icon`, splash colour. "Add to Home Screen" then opens it full-screen with no browser chrome, which is the single biggest "this is an app" moment on her phone.
2. M Service worker: cache the shell on install, cache photos and thumbs as they are viewed (stale-while-revalidate), so the second visit is instant and works offline on a plane.
3. M Image formats: generate WebP (or AVIF) alongside JPEG in `build_media.py` and serve via `<picture>`; thumbs shrink by roughly half.
4. S Split `media.js`: move the blur-up strings into a second file loaded after first paint, so the first render is not blocked by 278 KB.
5. S Preload the first photo of the next episode when the next-episode card appears.

### D. Content and data
1. Name the episodes. A sheet of all 73 episodes with covers was sent to Premal; names go into `EPISODE_NOTES` by date.
2. Seven files over 10 MB never made it from Drive (IMG_6297, 6298, 6299, 6301, IMG_6541.MOV, 20260925_192338.mp4, 20260925_192119.mp4, 20260926_115932.jpg). Need smaller exports.
3. 84 Bruce Peninsula photos remain in Drive; import, pick ~30, add to Sept 17.
4. The remaining guessed dates (`est: 1`): contact sheet sent; corrections go into `SNAP_DATES` in `build_media.py`.
5. Date the one undated video (`videos/s_undated_1.mp4`), then the Extras season vanishes.
6. Season 5 may want splitting at Sept 27, 2026 into "Still Us" and a Season 6 "Long Distance".

### E. Accessibility
1. Every `<img alt="">` is empty. Generate alt text from the episode title and date in `imgHTML()`.
2. Trap focus inside the sheet and the player while open; return focus to the opener on close.
3. `#toast` has `role="status"`; add `aria-live="polite"`.
4. Check grey text contrast after retoning to `#808080` (it passes on `#141414` at 4.6:1 for text 14px+; keep small labels at `#b3b3b3`).

## 5. Implementation pointers
- Cards are built by `cardHTML()` in `js/app.js`; posters by the Seasons block in `renderRows()`; the billboard by `resolveFeatures()` and `showFeature()`.
- Face-aware cropping is `pos(m)`; anything that renders a photo should set `object-position` from it.
- The player's swap logic is `show()`; add gestures on `#stage`. Ken Burns variants are the `kb-*` classes in `app.css`.
- Rows get `.in` from an IntersectionObserver for the stagger; `content-visibility: auto` skips offscreen rows, so measure positions with `measure()` after rendering.
- The build is `python3 tools/build_media.py <raw-dir>`; videos are cached, photos regenerate in about three minutes. Keep `SNAP_DATES` and `SKIP_RAW` when editing.
- Test harness: serve with `python3 -m http.server 8787` and drive Chromium at `/opt/pw-browsers/chromium` with Playwright; the scratch scripts used so far click intro → profile → billboard → sheet → player → finale and assert no page errors. Rebuild that as `tools/smoke.js` so it lives in the repo.

## 6. Done means
- No console errors on phone (430×932) and desktop (1440×900) through the full click path.
- Every media reference in `data.js` exists on disk.
- Fonts load without flashing; Lighthouse performance above 85 on mobile with throttling.
- Both branches pushed; the live URL shows the change within two minutes.
