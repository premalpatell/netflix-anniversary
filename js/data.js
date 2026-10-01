/* ─────────────────────────────────────────────────────────────
   data.js — everything hand-written lives here.
   Edit freely; js/media.js is generated and should not be edited.
   ───────────────────────────────────────────────────────────── */

window.SHOW = {
  title: 'Shivani & Premal',
  tagline: 'a love story in five seasons',
  year: '2023 – 2026',
  rating: 'Rated L · for Love',
  synopsis:
    'From a first hello in Toronto to a goodbye at the airport — and everything that came after. ' +
    'Temple mornings, Navratri nights, a graduation, one birthday that deserved better, and a thousand ordinary days that turned out to be the whole point.',
  cast: ['Shivani ♡', 'Premal'],
  creator: 'Fate, with a little help from Toronto',
  genres: ['Romance', 'Slice of Life', 'Feel-Good', 'Based on a True Story'],
  // Poster used on the details sheet
  poster: 'images/20250803_194808.jpg',
  // Closing card photo
  finalePhoto: 'images/20260423_171132.jpg',
};

/* Billboard features — the home page rotates through these every few seconds.
   kind: 'series' (the show itself), 'episode' (an episode by date), 'top' (a Top 10 moment by file), 'season' (by number).
   `video` plays muted when its orientation matches the screen; otherwise the still is shown. */
window.FEATURES = [
  { kind: 'series',  tag: 'Series', still: 'images/s_20260924_120000_15.jpg', video: 'videos/s_20260924_114730_1.mp4' },
  { kind: 'episode', tag: 'New Episode', day: '2026-09-26' },
  { kind: 'top',     tag: '#1 in Top 10', key: '20260423_171132.jpg' },
  { kind: 'season',  tag: 'Prequel', n: 0 },
];

/* Love notes — keyed by date (YYYY-MM-DD). An envelope appears on that episode;
   tapping it in the player opens the note as a card. Write as many as you like. */
window.LOVE_NOTES = {
  '2026-04-23': 'The last day before I left Canada. The photo I cherish the most. — Premal',
};

/* Profiles on the "Who's watching?" screen */
window.PROFILES = [
  { name: 'Shivani ♡', photo: 'images/t/20250721_151523.jpg', greeting: 'Welcome back, Shivani. Your story is ready.' },
  { name: 'Premal',    photo: 'images/t/20260423_171132.jpg', greeting: 'Welcome back, Premal.' },
];

/* Seasons — every photo/video is placed by its capture date (local Toronto time).
   `from`/`to` are inclusive YYYY-MM-DD. */
window.SEASONS = [
  { n: 0, slug: 's0', title: 'Before Us',          from: '2000-01-01', to: '2024-08-19',
    tag: 'Prequel', blurb: 'Before there was an "us", there were these days. The ones we didn\'t know were the beginning.',
    hero: 'images/s_20231021_171309_1.jpg' },
  { n: 1, slug: 's1', title: 'The Beginning',      from: '2024-08-20', to: '2024-09-30',
    tag: 'Aug – Sep 2024', blurb: 'A temple, a first date at Liu Loqum Atelier, and the moment it all started.',
    hero: 'images/20240930_174109.jpg' },
  { n: 2, slug: 's2', title: 'Growing Together',   from: '2024-10-01', to: '2024-12-31',
    tag: 'Oct – Dec 2024', blurb: 'Navratri nights, her first car, and date nights at the Fairmont.',
    hero: 'images/20241215_002835.jpg' },
  { n: 3, slug: 's3', title: 'Her Biggest Year',   from: '2025-01-01', to: '2025-06-30',
    tag: 'Jan – Jun 2025', blurb: 'An airport reunion with roses, Planta, Pai Thai — and the day she graduated.',
    hero: 'images/20250412_231204.jpg' },
  { n: 4, slug: 's4', title: 'One Full Year',      from: '2025-07-01', to: '2026-04-23',
    tag: 'Jul 2025 – Apr 2026', blurb: 'Her birthday, Crystal Beach, Navratri again, a letter, a haircut, and the hardest goodbye.',
    hero: 'images/20250803_194808.jpg' },
  { n: 5, slug: 's5', title: 'Still Us',           from: '2026-04-24', to: '2027-12-31',
    tag: 'Apr 2026 →', blurb: 'Different time zones, a summer back together, her Québec trip, and one more goodbye. Distance is just geography.',
    hero: 'images/s_20260721_145211_1.jpg', toBeContinued: true },
];

/* Stories confirmed by Premal — keyed by the media file name.
   The first photo in an episode that has a story names the episode. */
window.STORIES = {
  '20240826_182222.jpg':'First time we went to a temple together.',
  '20240826_182223.jpg':'First time we went to a temple together.',
  '20240826_182226.jpg':'First time we went to a temple together.',
  'Snapchat-1409371325.jpg':'First time we went to a temple together.',
  '20240930_174104.jpg':'Our very first date — Liu Loqum Atelier, College St.',
  '20240930_174105.jpg':'Our very first date — Liu Loqum Atelier, College St.',
  '20240930_174109.jpg':'Our very first date — Liu Loqum Atelier, College St.',
  '20241012_012640.jpg':'BarChef Toronto.',
  '20241012_012827.jpg':'BarChef Toronto.',
  '20241012_021256.jpg':'BarChef Toronto.',
  '20241012_021345.jpg':'BarChef Toronto.',
  '20241012_021837.jpg':'BarChef Toronto.',
  '20241014_214812.jpg':'Atul Purohit Navratri.',
  '20241014_214813.jpg':'Atul Purohit Navratri.',
  '20241014_214823.jpg':'Atul Purohit Navratri.',
  '20241014_214824.jpg':'Atul Purohit Navratri.',
  'Snapchat-1006342143.jpg':'Navratri 2024.',
  'Snapchat-2117433068.jpg':'Navratri 2024.',
  '20241103_211756.jpg':'The day she got her first car — all by herself.',
  '20241103_211837.jpg':'The day she got her first car — all by herself.',
  'IMG_20241120_162835_667.jpg':'A random day exploring downtown together.',
  'Snapchat-552263264.jpg':'A random day exploring downtown together.',
  '20241214_233307.jpg':'Clockwork Bar at the Fairmont Royal York.',
  '20241214_233522.jpg':'Clockwork Bar at the Fairmont Royal York.',
  '20241215_002835.jpg':'A date night out, exploring the city together.',
  '20241215_003011.jpg':'A date night out, exploring the city together.',
  '20241215_003041.jpg':'A date night out, exploring the city together.',
  '20241215_003130.jpg':'A date night out, exploring the city together.',
  '20241215_003241.jpg':'A date night out, exploring the city together.',
  '20241215_003304.jpg':'A date night out, exploring the city together.',
  'IMG_20250105_232702_246.jpg':'A solo trip to Niagara Falls.',
  'Snapchat-1433906752.jpg':'The day she flew back to Canada from India. I was waiting with roses.',
  '20250207_233941.jpg':'Cactus Club Cafe, downtown Toronto.',
  '20250207_234003.jpg':'Cactus Club Cafe, downtown Toronto.',
  '20250207_234008.jpg':'Cactus Club Cafe, downtown Toronto.',
  '20250207_234919.jpg':'Cactus Club Cafe, downtown Toronto.',
  '20250207_234924.jpg':'Cactus Club Cafe, downtown Toronto.',
  '20250207_234928.jpg':'Cactus Club Cafe, downtown Toronto.',
  '20250208_000143.jpg':'Cactus Club Cafe, downtown Toronto.',
  'valentine.jpg':"Her Valentine's Day letter to me — a note I will keep forever.",
  '20250215_172023.jpg':'Wataly at the Shops at Don Mills.',
  'Snapchat-1945727858.jpg':'Home. Just us, being us.',
  'Snapchat-1960320966.jpg':'Home. Just us, being us.',
  '20250412_230943.jpg':'Planta Toronto.',
  '20250412_231012.jpg':'Planta Toronto.',
  '20250412_231015.jpg':'Planta Toronto.',
  '20250412_231130.jpg':'Planta Toronto.',
  '20250412_231133.jpg':'Planta Toronto.',
  '20250412_231204.jpg':'Planta Toronto.',
  '20250426_190640.jpg':'Pai Thai Uptown.',
  '20250426_221747.jpg':'Pai Thai Uptown.',
  '20250426_221751.jpg':'Pai Thai Uptown.',
  '20250426_221755.jpg':'Pai Thai Uptown.',
  '20250426_221758.jpg':'Pai Thai Uptown.',
  '20250426_223101.jpg':'Pai Thai Uptown.',
  '20250521_144010.jpg':'Surprised her at work.',
  '20250523_220814.jpg':'Piano Piano restaurant.',
  '20250527_182137.jpg':'Her graduation from Northeastern University. So incredibly proud of her.',
  '20250527_182725.jpg':'Her graduation from Northeastern University.',
  '20250527_182726.jpg':'Her graduation from Northeastern University.',
  '20250527_182736.jpg':'Her graduation from Northeastern University.',
  '20250527_182738.jpg':'Her graduation from Northeastern University.',
  '20250527_182746.jpg':'Her graduation from Northeastern University.',
  'Snapchat-1274994827.jpg':'Her graduation from Northeastern University.',
  'Snapchat-1963777634.jpg':'Her graduation from Northeastern University.',
  'Snapchat-524185506.jpg':'Her graduation from Northeastern University.',
  'Snapchat-687287911.jpg':'Her graduation from Northeastern University.',
  'Snapchat-790482175.jpg':'Her graduation from Northeastern University.',
  '20250629_151249.jpg':'Badiali Pizzeria.',
  '20250629_151320.jpg':'Badiali Pizzeria.',
  '20250629_151405.jpg':'Badiali Pizzeria.',
  '20250629_151406.jpg':'Badiali Pizzeria.',
  '20250629_151523.jpg':'Badiali Pizzeria.',
  '20250706_141011.jpg':"Alfie's Sandwiches, then a walk along Etobicoke Lakeshore.",
  '20250706_151749.jpg':'Etobicoke Lakeshore.',
  '20250706_151818.jpg':'Etobicoke Lakeshore.',
  '20250706_151820.jpg':'Etobicoke Lakeshore.',
  '20250706_151912.jpg':'Etobicoke Lakeshore.',
  '20250712_202435.jpg':'Elora, the Lobby Bar.',
  '20250712_202440.jpg':'Elora, the Lobby Bar.',
  '20250721_151523.jpg':'Her birthday. She wore the dress I gifted her.',
  '20250721_220526.jpg':"Cactus Club, Yonge & Sheppard. I'm sorry that day wasn't what you deserved, Shivani.",
  '20250721_220529.jpg':'Her birthday.',
  '20250721_220605.jpg':'Her birthday.',
  '20250721_220615.jpg':'Her birthday.',
  '20250727_201741.jpg':'Just us, on a random day.',
  '20250727_201742.jpg':'Just us, on a random day.',
  '20250803_194524.jpg':'Crystal Beach, Ontario.',
  '20250803_194526.jpg':'Crystal Beach, Ontario.',
  '20250803_194808.jpg':'Crystal Beach, Ontario.',
  '20251011_223537.jpg':'Navratri 2025.',
  '20251011_223614.jpg':'Navratri 2025.',
  '20251011_223618.jpg':'Navratri 2025.',
  '20251011_223639.jpg':'Navratri 2025.',
  'IMG_20251012_172701_525.jpg':'Navratri 2025.',
  'IMG_20251012_172719_495.jpg':'Navratri 2025.',
  'IMG_20251012_172727_997.jpg':'Navratri 2025.',
  'IMG_20251012_172731_352.jpg':'Navratri 2025.',
  'Snapchat-1884807469.jpg':'Navratri 2025.',
  'Snapchat-10814446.jpg':'Her, just being her.',
  'Snapchat-1605463310.jpg':'Her, just being her.',
  'Screenshot_20260221_202434_Instagram.jpg':'An old photo I keep coming back to.',
  '20260402_145233.jpg':'The day she got her bob haircut.',
  '20260402_145240.jpg':'The day she got her bob haircut.',
  'Snapchat-1282282821.jpg':'The day she got her bob haircut.',
  '20260423_171132.jpg':'The last day before I left Canada. The photo I cherish the most.',
};

/* Episode notes — keyed by date (YYYY-MM-DD). Fill these in for the new photos:
     '2023-09-23': { title: 'Where it started', story: 'The first time we…', thumb: 'file.jpg' },
   `title` names the episode; `story` shows under every photo of that day;
   `thumb` (optional) is the media file name to use as the episode's cover. */
window.EPISODE_NOTES = {
  '2026-07-21': { title: 'Her birthday, 2026', story: '' },
  '2026-09-17': { title: 'Bruce Peninsula', story: '' },
  '2026-09-23': { title: 'Montréal, on the way to Québec', story: 'Shivani\'s Québec trip, day one.', thumb: 's_20260923_120000_3.jpg' },
  '2026-09-24': { title: 'Old Québec & Montmorency Falls', story: 'Umbrella street, the Château Frontenac and the falls.', thumb: 's_20260924_120000_11.jpg' },
  '2026-09-25': { title: 'Lakes & lookouts, Québec', story: 'The last day of the trip.' },
  '2026-09-26': { title: 'Roses, before the goodbye', story: 'Our last outing before Premal left Canada on September 27.' },
};

/* Top 10 Moments — in order. Media keys (file names). */
window.TOP10 = [
  '20260423_171132.jpg',   // the last day
  'valentine.jpg',         // her letter
  '20240930_174104.jpg',   // first date
  '20240826_182222.jpg',   // first temple
  '20250527_182736.jpg',   // graduation
  'Snapchat-1433906752.jpg', // airport, roses
  '20250803_194808.jpg',   // crystal beach
  '20250721_151523.jpg',   // birthday dress
  's_20260924_120000_11.jpg', // umbrella street, Québec
  's_20260926_120000_1.jpg',  // roses, the night before
];

/* End credits — in chronological order. */
window.CREDITS = [
  ['Directed by',          'God & the universe'],
  ['Starring',             'Shivani ♡ · Premal'],
  ['',                     ''],
  ['Before us',            'Toronto, 2023'],
  ['First temple visit',   'Aug 26, 2024 · together'],
  ['First date',           'Liu Loqum Atelier · Sep 30, 2024'],
  ['BarChef Toronto',      'Oct 12, 2024'],
  ['First Navratri',       'Atul Purohit · Oct 14, 2024'],
  ['Her first car',        'All by herself · Nov 2024'],
  ['Clockwork Bar',        'Fairmont Royal York · Dec 2024'],
  ['Airport reunion',      'Jan 25, 2025 · with roses'],
  ['Cactus Club',          'Feb 2025'],
  ["Valentine's note",     "A letter I'll keep forever"],
  ['Planta Toronto',       'Apr 2025'],
  ['Pai Thai Uptown',      'Apr 2025'],
  ['Piano Piano',          'May 2025'],
  ['Her graduation',       'Northeastern University · May 29, 2025'],
  ['Badiali Pizzeria',     'Jun 2025'],
  ['Etobicoke Lakeshore',  'Jul 2025'],
  ['Elora, the Lobby Bar', 'Jul 2025'],
  ['Her birthday',         'Jul 21, 2025 · she wore my gift'],
  ['A birthday apology',   "That day wasn't what you deserved. I'm sorry, Shivani."],
  ['Crystal Beach',        'Aug 3, 2025 · Ontario'],
  ['Navratri 2025',        'Oct 2025 · together again'],
  ['The bob haircut',      'Apr 2, 2026'],
  ['The hardest goodbye',  'Apr 23, 2026 · but not the last chapter'],
  ['Her birthday, 2026',   'Jul 21, 2026'],
  ['Bruce Peninsula',      'Sep 17, 2026'],
  ['Her Québec trip',      'Sep 23 – 25, 2026'],
  ['Roses',                'Sep 26, 2026 · the night before'],
  ['Another goodbye',      'Sep 27, 2026 · still not the last chapter'],
  ['Still us',             'Every day since'],
  ['',                     ''],
  ['Soundtrack',           'Beete Lamhein'],
  ['Location',             'Toronto — every corner of it'],
  ['Shot on',              'Our camera rolls & stolen moments'],
  ['Written by',           'Every day we chose each other'],
  ['Executive producer',   'Fate, for planning all of this'],
  ['',                     ''],
  ['To Shivani',           'you are my favourite person in the world'],
  ['',                     '— Premal ♡'],
];

window.FINALE = {
  line1: 'To Shivani',
  line2: 'you are my favourite person in the world',
  sign:  '— Premal ♡',
  audio: 'audio/Beete Lamhein The Train 320 Kbps.mp3',
  audioStart: 47,
};
