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
  // Netflix's "This show is:" line
  moods: ['Heartfelt', 'Romantic', 'Feel-Good'],
  // Maturity box + reasons, as Netflix prints them
  maturity: 'L',
  advisories: 'late-night drives, too much pizza, happy tears',
  // Poster used on the details sheet
  poster: 'images/20250803_194808.jpg',
  // Closing card photo
  finalePhoto: 'images/20260423_171132.jpg',
};

/* Billboard features — the home page rotates through these every few seconds.
   kind: 'series' (the show itself), 'episode' (an episode by date), 'top' (a Top 10 moment by file), 'season' (by number).
   `video` plays muted when its orientation matches the screen; otherwise the still is shown. */
window.FEATURES = [
  { kind: 'series',  tag: 'Series', trailer: true, still: 'images/s_20260924_120000_15.jpg', video: 'videos/s_20260924_114730_1.mp4' },
  { kind: 'episode', tag: 'New Episode', day: '2026-09-26' },
  { kind: 'top',     tag: '#1 in Top 10', key: '20260423_171132.jpg' },
  { kind: 'season',  tag: 'Prequel', n: 0 },
];

/* Billboard highlights — a pool of Bollywood-style taglines. Each time the site opens,
   the billboard picks a fresh mix (avoiding the ones shown last time), with a random
   photo from that episode and a random filmy badge. Add as many as you like:
   { day: 'YYYY-MM-DD', line: '…' } for an episode, or { season: n, line: '…' } for a season. */
window.HIGHLIGHT_BADGES = ['Blockbuster', 'Superhit', 'Housefull', 'Now Showing', "Critics' Choice", 'Audience Favourite', 'Special Screening', 'Evergreen Classic', 'Family Favourite', 'Silver Jubilee'];
window.HIGHLIGHTS = [
  { season: 0,          line: 'Is kahani se pehle bhi ek kahani thi.' },
  { day: '2023-12-31',  line: 'Naya saal, wahi muskurahat.' },
  { day: '2024-05-11',  line: 'Shehar ke upar, sitaron ke beech ek dinner.' },
  { day: '2024-07-21',  line: 'Phoolon ki deewar ke saamne, sabse khoobsurat phool.' },
  { day: '2024-08-25',  line: 'Jhoole, lights, aur pehla pehla pyaar.' },
  { day: '2024-08-26',  line: 'Mandir ki ghantiyan, aur do dilon ki pehli dua.' },
  { day: '2024-09-30',  line: 'Pehli mulaqat. Ek coffee, ek cake, aur poori zindagi ki shuruaat.' },
  { day: '2024-10-12',  line: 'Dhuein mein cocktails, aankhon mein kahani.' },
  { day: '2024-10-14',  line: 'Dandiya, dhol, aur woh nazar jo baar baar milti rahi.' },
  { day: '2024-11-03',  line: 'Apni gaadi, apni manzil. Heroine ki grand entry.' },
  { day: '2024-12-14',  line: 'Royal York mein ek royal date.' },
  { day: '2024-12-15',  line: 'Shehar ki raatein, aur haath mein haath.' },
  { day: '2025-01-05',  line: 'Paani ka shor, aur dil mein bas ek naam.' },
  { day: '2025-01-09',  line: 'Woh Mumbai mein, yeh Toronto mein. Doori bhi filmy thi.' },
  { day: '2025-01-25',  line: 'Airport, gulaab aur intezaar. Filmy toh hona hi tha.' },
  { day: '2025-02-07',  line: 'Muskurahat non-stop, raat superhit.' },
  { day: '2025-04-05',  line: 'Ghar, sukoon, aur bas hum dono.' },
  { day: '2025-04-12',  line: 'Ek perfect date. Poora paisa vasool.' },
  { day: '2025-04-26',  line: 'Ek plate, do chammach, aur thodi si meethi ladai.' },
  { day: '2025-05-23',  line: 'Is raat ki heroine ne sabko deewana kar diya.' },
  { day: '2025-05-27',  line: 'Degree uske haath mein, garv uski aankhon mein.' },
  { day: '2025-06-29',  line: 'Pizza toh bahana tha. Nazar toh kahin aur thi.' },
  { day: '2025-07-06',  line: 'Lambi walk, thandi hawa, aur perfect insaan.' },
  { day: '2025-07-12',  line: 'Chhota sa shehar, badi si yaadein.' },
  { day: '2025-07-21',  line: 'Uska din, uska dress, aur ek dil jo sorry kehna chahta hai.' },
  { day: '2025-08-03',  line: 'Lehrein, ret, aur birthday wala pyaar.' },
  { day: '2025-10-12',  line: 'Garba ka doosra season. Chemistry ab bhi housefull.' },
  { day: '2025-11-04',  line: 'Bas woh. Aur kuch nahi chahiye.' },
  { day: '2026-02-14',  line: 'Ek chitthi jo dil mein hamesha ke liye frame ho gayi.' },
  { day: '2026-03-21',  line: 'Candlelight, sushi, aur ek date jo yaad reh gayi.' },
  { day: '2026-04-02',  line: 'Naya look, naya andaaz. Season ki scene stealer.' },
  { day: '2026-04-23',  line: 'Alvida nahi. Bas intermission.' },
  { day: '2026-04-25',  line: 'Baal naye, andaaz wahi.' },
  { day: '2026-05-27',  line: 'Jungle, jheel, aur ek solo heroine.' },
  { day: '2026-07-21',  line: 'Doori mein bhi, birthday wahi special.' },
  { day: '2026-09-17',  line: 'Paani itna saaf, jaise uska dil.' },
  { day: '2026-09-23',  line: 'Shehar naya, kahani wahi.' },
  { day: '2026-09-24',  line: 'Rangeen chhatriyan, purani galiyan, aur ek heroine.' },
  { day: '2026-09-25',  line: 'Trip ka last din. View ekdum first class.' },
  { day: '2026-09-26',  line: 'Phir se gulaab, phir se alvida. Picture abhi baaki hai.' },
];

/* Love notes — keyed by date (YYYY-MM-DD). An envelope appears on that episode;
   tapping it in the player opens the note as a card. Write as many as you like. */
window.LOVE_NOTES = {
  '2026-04-23': 'The last day before I left Canada. The photo I cherish the most. — Premal',
};

/* "Coming Soon" row */
window.COMING_SOON = [
  { title: 'Season 6', name: 'Long Distance', tag: 'Coming soon',
    blurb: 'Two cities, one story. The next season starts the day Premal leaves Canada.',
    still: 'images/20260423_171132.jpg' },
];

/* Profiles on the "Who's watching?" screen */
window.PROFILES = [
  { name: 'Shivani ♡', photo: 'images/t/20250721_151523.jpg', greeting: 'Welcome back, Shivani. Your story is ready.' },
  { name: 'Premal',    photo: 'images/avatar-premal.svg',     greeting: 'Welcome back, Premal.' },
];

/* Seasons — every photo/video is placed by its capture date (local Toronto time).
   `from`/`to` are inclusive YYYY-MM-DD. */
window.SEASONS = [
  { n: 0, slug: 's0', title: 'Pehle Ki Kahani',          from: '2000-01-01', to: '2024-08-19',
    tag: 'Prequel', blurb: 'Before there was an "us", there were these days. The ones we didn\'t know were the beginning.',
    hero: 'images/s_20231021_171309_1.jpg' },
  { n: 1, slug: 's1', title: 'Shuruaat',      from: '2024-08-20', to: '2024-09-30',
    tag: 'Aug – Sep 2024', blurb: 'A temple, a first date at Liu Loqum Atelier, and the moment it all started.',
    hero: 'images/20240930_174109.jpg' },
  { n: 2, slug: 's2', title: 'Saath Saath',   from: '2024-10-01', to: '2024-12-31',
    tag: 'Oct – Dec 2024', blurb: 'Navratri nights, her first car, and date nights at the Fairmont.',
    hero: 'images/20241215_002835.jpg' },
  { n: 3, slug: 's3', title: 'Uska Saal',   from: '2025-01-01', to: '2025-06-30',
    tag: 'Jan – Jun 2025', blurb: 'An airport reunion with roses, Planta, Pai Thai — and the day she graduated.',
    hero: 'images/20250412_231204.jpg' },
  { n: 4, slug: 's4', title: 'Ek Saal',      from: '2025-07-01', to: '2026-04-23',
    tag: 'Jul 2025 – Apr 2026', blurb: 'Her birthday, Crystal Beach, Navratri again, a letter, a haircut, and the hardest goodbye.',
    hero: 'images/20250803_194808.jpg' },
  { n: 5, slug: 's5', title: 'Phir Bhi Hum',           from: '2026-04-24', to: '2027-12-31',
    tag: 'Apr 2026 →', blurb: 'Different time zones, a summer back together, her Québec trip, and one more goodbye. Distance is just geography.',
    hero: 'images/s_20260721_145211_1.jpg', toBeContinued: true },
];

/* Per-photo captions, keyed by the media file name, written in Netflix's synopsis voice
   (present tense, third person). Premal's own letters stay in his voice.
   An episode's caption in EPISODE_NOTES wins over these. */
window.STORIES = {
  '20240826_182222.jpg':"Shivani and Premal visit a temple together for the first time.",
  '20240826_182223.jpg':"Shivani and Premal visit a temple together for the first time.",
  '20240826_182226.jpg':"Shivani and Premal visit a temple together for the first time.",
  'Snapchat-1409371325.jpg':"Shivani and Premal visit a temple together for the first time.",
  '20240930_174104.jpg':"Their very first date, at Liu Loqum Atelier on College Street.",
  '20240930_174105.jpg':"Their very first date, at Liu Loqum Atelier on College Street.",
  '20240930_174109.jpg':"Their very first date, at Liu Loqum Atelier on College Street.",
  '20241012_012640.jpg':"Cocktails and a late night at BarChef Toronto.",
  '20241012_012827.jpg':"Cocktails and a late night at BarChef Toronto.",
  '20241012_021256.jpg':"Cocktails and a late night at BarChef Toronto.",
  '20241012_021345.jpg':"Cocktails and a late night at BarChef Toronto.",
  '20241012_021837.jpg':"Cocktails and a late night at BarChef Toronto.",
  '20241014_214812.jpg':"Their first Navratri together, dancing garba to Atul Purohit.",
  '20241014_214813.jpg':"Their first Navratri together, dancing garba to Atul Purohit.",
  '20241014_214823.jpg':"Their first Navratri together, dancing garba to Atul Purohit.",
  '20241014_214824.jpg':"Their first Navratri together, dancing garba to Atul Purohit.",
  'Snapchat-1006342143.jpg':"One more night of garba before the festival ends.",
  'Snapchat-2117433068.jpg':"One more night of garba before the festival ends.",
  '20241103_211756.jpg':"Shivani buys her first car, all by herself.",
  '20241103_211837.jpg':"Shivani buys her first car, all by herself.",
  'IMG_20241120_162835_667.jpg':"A random weekday spent wandering downtown together.",
  'Snapchat-552263264.jpg':"A random weekday spent wandering downtown together.",
  '20241214_233307.jpg':"Drinks at the Clockwork bar inside the Fairmont Royal York.",
  '20241214_233522.jpg':"Drinks at the Clockwork bar inside the Fairmont Royal York.",
  '20241215_002835.jpg':"A night out exploring the city together.",
  '20241215_003011.jpg':"A night out exploring the city together.",
  '20241215_003041.jpg':"A night out exploring the city together.",
  '20241215_003130.jpg':"A night out exploring the city together.",
  '20241215_003241.jpg':"A night out exploring the city together.",
  '20241215_003304.jpg':"A night out exploring the city together.",
  'IMG_20250105_232702_246.jpg':"Premal at Niagara Falls on a cold January day.",
  'Snapchat-1433906752.jpg':"Shivani flies back from India. Premal is waiting at the airport with roses.",
  '20250207_233941.jpg':"One of the good ones. Dinner downtown, and she doesn't stop smiling all night.",
  '20250207_234003.jpg':"One of the good ones. Dinner downtown, and she doesn't stop smiling all night.",
  '20250207_234008.jpg':"One of the good ones. Dinner downtown, and she doesn't stop smiling all night.",
  '20250207_234919.jpg':"One of the good ones. Dinner downtown, and she doesn't stop smiling all night.",
  '20250207_234924.jpg':"One of the good ones. Dinner downtown, and she doesn't stop smiling all night.",
  '20250207_234928.jpg':"One of the good ones. Dinner downtown, and she doesn't stop smiling all night.",
  '20250208_000143.jpg':"One of the good ones. Dinner downtown, and she doesn't stop smiling all night.",
  'valentine.jpg':"Her Valentine's Day letter to me. A note I will keep forever.",
  '20250215_172023.jpg':"A slow afternoon at Eataly at the Shops at Don Mills.",
  'Snapchat-1945727858.jpg':"Home. Just the two of them, being them.",
  'Snapchat-1960320966.jpg':"Home. Just the two of them, being them.",
  '20250412_230943.jpg':"Dinner at Planta Queen. Good food, better company, and a date neither of them wants to end.",
  '20250412_231012.jpg':"Dinner at Planta Queen. Good food, better company, and a date neither of them wants to end.",
  '20250412_231015.jpg':"Dinner at Planta Queen. Good food, better company, and a date neither of them wants to end.",
  '20250412_231130.jpg':"Dinner at Planta Queen. Good food, better company, and a date neither of them wants to end.",
  '20250412_231133.jpg':"Dinner at Planta Queen. Good food, better company, and a date neither of them wants to end.",
  '20250412_231204.jpg':"Dinner at Planta Queen. Good food, better company, and a date neither of them wants to end.",
  '20250426_190640.jpg':"Pai Thai uptown, sharing plates and stealing bites off each other's.",
  '20250426_221747.jpg':"Pai Thai uptown, sharing plates and stealing bites off each other's.",
  '20250426_221751.jpg':"Pai Thai uptown, sharing plates and stealing bites off each other's.",
  '20250426_221755.jpg':"Pai Thai uptown, sharing plates and stealing bites off each other's.",
  '20250426_221758.jpg':"Pai Thai uptown, sharing plates and stealing bites off each other's.",
  '20250426_223101.jpg':"Pai Thai uptown, sharing plates and stealing bites off each other's.",
  '20250521_144010.jpg':"Premal surprises Shivani at work.",
  '20250523_220814.jpg':"Dinner at Piano Piano. She looks unreal tonight, and he can't stop telling her.",
  '20250527_182137.jpg':"Shivani graduates from Northeastern University. Premal has never been prouder.",
  '20250527_182725.jpg':"Shivani graduates from Northeastern University. Premal has never been prouder.",
  '20250527_182726.jpg':"Shivani graduates from Northeastern University. Premal has never been prouder.",
  '20250527_182736.jpg':"Shivani graduates from Northeastern University. Premal has never been prouder.",
  '20250527_182738.jpg':"Shivani graduates from Northeastern University. Premal has never been prouder.",
  '20250527_182746.jpg':"Shivani graduates from Northeastern University. Premal has never been prouder.",
  'Snapchat-1274994827.jpg':"Shivani graduates from Northeastern University. Premal has never been prouder.",
  'Snapchat-1963777634.jpg':"Shivani graduates from Northeastern University. Premal has never been prouder.",
  'Snapchat-524185506.jpg':"Shivani graduates from Northeastern University. Premal has never been prouder.",
  'Snapchat-687287911.jpg':"Shivani graduates from Northeastern University. Premal has never been prouder.",
  'Snapchat-790482175.jpg':"Shivani graduates from Northeastern University. Premal has never been prouder.",
  '20250629_151249.jpg':"Pizza at Badiali, with Shivani looking far too good for a pizza place.",
  '20250629_151320.jpg':"Pizza at Badiali, with Shivani looking far too good for a pizza place.",
  '20250629_151405.jpg':"Pizza at Badiali, with Shivani looking far too good for a pizza place.",
  '20250629_151406.jpg':"Pizza at Badiali, with Shivani looking far too good for a pizza place.",
  '20250629_151523.jpg':"Pizza at Badiali, with Shivani looking far too good for a pizza place.",
  '20250706_141011.jpg':"Sandwiches at Alfie's, then a long walk along the Etobicoke lakeshore.",
  '20250706_151749.jpg':"A long walk along the Etobicoke lakeshore. A perfect day, with the perfect person.",
  '20250706_151818.jpg':"A long walk along the Etobicoke lakeshore. A perfect day, with the perfect person.",
  '20250706_151820.jpg':"A long walk along the Etobicoke lakeshore. A perfect day, with the perfect person.",
  '20250706_151912.jpg':"A long walk along the Etobicoke lakeshore. A perfect day, with the perfect person.",
  '20250712_202435.jpg':"Drinks at the Lobby Bar in Elora.",
  '20250712_202440.jpg':"Drinks at the Lobby Bar in Elora.",
  '20250721_151523.jpg':"Shivani's birthday, in the dress Premal gave her.",
  '20250721_220526.jpg':"Cactus Club, Yonge and Sheppard. I'm sorry that day wasn't what you deserved, Shivani.",
  '20250721_220529.jpg':"Shivani's birthday.",
  '20250721_220605.jpg':"Shivani's birthday.",
  '20250721_220615.jpg':"Shivani's birthday.",
  '20250727_201741.jpg':"A random Sunday, just the two of them.",
  '20250727_201742.jpg':"A random Sunday, just the two of them.",
  '20250803_194524.jpg':"Premal's birthday trip, together at Crystal Beach.",
  '20250803_194526.jpg':"Premal's birthday trip, together at Crystal Beach.",
  '20250803_194808.jpg':"Premal's birthday trip, together at Crystal Beach.",
  '20251011_223537.jpg':"Navratri again, and this time it already feels like tradition.",
  '20251011_223614.jpg':"Navratri again, and this time it already feels like tradition.",
  '20251011_223618.jpg':"Navratri again, and this time it already feels like tradition.",
  '20251011_223639.jpg':"Navratri again, and this time it already feels like tradition.",
  'IMG_20251012_172701_525.jpg':"Navratri again, and this time it already feels like tradition.",
  'IMG_20251012_172719_495.jpg':"Navratri again, and this time it already feels like tradition.",
  'IMG_20251012_172727_997.jpg':"Navratri again, and this time it already feels like tradition.",
  'IMG_20251012_172731_352.jpg':"Navratri again, and this time it already feels like tradition.",
  'Snapchat-1884807469.jpg':"Navratri again, and this time it already feels like tradition.",
  'Snapchat-10814446.jpg':"Shivani, just being Shivani. Premal's favourite thing to look at.",
  'Snapchat-1605463310.jpg':"Shivani, just being Shivani. Premal's favourite thing to look at.",
  'Screenshot_20260221_202434_Instagram.jpg':"An old photo I keep coming back to.",
  '20260402_145233.jpg':"Shivani gets her bob. It suits her perfectly, and she loves it this way.",
  '20260402_145240.jpg':"Shivani gets her bob. It suits her perfectly, and she loves it this way.",
  'Snapchat-1282282821.jpg':"Shivani gets her bob. It suits her perfectly, and she loves it this way.",
  '20260423_171132.jpg':"The last day before I left Canada. The photo I cherish the most.",
};

/* Episode notes — keyed by date (YYYY-MM-DD). Fill these in for the new photos:
     '2023-09-23': { title: 'Where it started', story: 'The first time we…', thumb: 'file.jpg' },
   `title` names the episode; `story` shows under every photo of that day;
   `thumb` (optional) is the media file name to use as the episode's cover;
   `merge: 'next' | 'prev'` folds that day into the neighbouring episode. */
window.EPISODE_NOTES = {
  // ── Season 0 · Before Us
  '2023-12-03': { title: 'Baar Baar Dekho', story: 'A night out at a Toronto bar whose name neither of them can quite remember.', thumb: 's_20231203_215002_1.jpg' },
  '2023-12-31': { title: 'Saal Mubarak', story: "Shivani rings in the new year at her brother's restaurant.", thumb: 's_20231231_210403_1.jpg' },
  '2024-05-11': { title: 'Asmaan Pe Dinner', story: 'Dinner at Louix Louis, high above the city at the St. Regis.', thumb: 's_20240511_000600_1.jpg' },
  '2024-07-21': { title: 'Janamdin, 2024', story: "Shivani's birthday, in front of the flower wall at Befikr." },
  '2024-05-20': { thumb: 's_20240520_161758_1.jpg', title: 'Neela Aasmaan', story: 'A blue top, a bluer sky, and summer arriving early.' },
  '2023-11-03': { thumb: 's_20231103_185218_1.mp4', title: 'Style Statement', story: 'Seven clips of pure attitude in front of the mirror.' },
  '2023-10-21': { thumb: 's_20231021_172016_1.jpg', title: 'Party Toh Banti Hai', story: 'Balloons, a neon sign and a black dress. Tonight belongs to her.' },
  '2023-12-09': { thumb: 's_20231209_211928_1.jpg', title: 'Mahal Ki Shehzadi', story: 'Chandeliers, marble floors and a princess in black.' },
  '2024-06-10': { title: 'Aaina', story: 'Mirror selfies as summer begins.', thumb: 's_20240610_193550_1.jpg' },
  '2024-03-15': { thumb: 's_20240315_234335_1.jpg', title: 'Phoolon Wali Shaam', story: 'All in white at a flower-filled café, with spring just around the corner.' },
  // ── Season 1 · The Beginning
  '2024-08-25': { title: 'Mela', story: 'Rides, lights and fair food at the Canadian National Exhibition.', thumb: 's_20240825_120000_1.jpg' },
  '2024-08-26': { title: 'Mandir Ki Ghanti', story: 'Shivani and Premal visit a temple together for the first time.', thumb: '20240826_182222.jpg' },
  '2024-09-30': { title: 'Pehli Mulaqat', story: 'Their very first date, at Liu Loqum Atelier on College Street.' },
  // ── Season 2 · Growing Together
  '2024-10-12': { title: 'Dhuaan', story: 'Cocktails and a late night at BarChef Toronto.' },
  '2024-10-14': { title: 'Dandiya Raat', story: 'Their first Navratri together, dancing garba to Atul Purohit.' },
  '2024-10-18': { title: 'Ek Aur Raat', story: 'One more night of garba before the festival ends.' },
  '2024-11-03': { title: 'Meri Gaadi', story: 'Shivani buys her first car, all by herself.' },
  '2024-11-20': { title: 'Shehar Ki Sair', story: 'A random weekday spent wandering downtown together.' },
  '2024-12-14': { title: 'Royal Raat', story: 'Drinks at the Clockwork bar inside the Fairmont Royal York.' },
  '2024-12-15': { title: 'Chand Sitare', story: 'A night out under a window full of stars.' },
  // ── Season 3 · Her Biggest Year
  '2025-01-05': { title: 'Jharna', story: 'Premal at Niagara Falls on a cold January day.' },
  '2025-01-09': { title: 'Mumbai Meri Jaan', story: 'Shivani home in India, at Bastian in Mumbai. The weeks apart felt much longer to Premal.' },
  '2025-01-25': { title: 'Gulaab Aur Intezaar', story: 'Shivani flies back from India. Premal is waiting at the airport with roses.' },
  '2025-02-07': { title: 'Muskaan', story: "One of the good ones. Dinner downtown, and she doesn't stop smiling all night." },
  '2025-02-08': { merge: 'prev' },
  '2025-02-15': { title: 'Italian Shaam', story: 'A slow afternoon at Eataly at the Shops at Don Mills.' },
  '2025-04-05': { title: 'Ghar', story: 'Home. Just the two of them, being them.' },
  '2025-04-12': { title: 'Planta Ki Rani', story: 'Dinner at Planta Queen. Good food, better company, and a date neither of them wants to end.' },
  '2025-04-26': { title: 'Thai Tadka', story: "Pai Thai uptown, sharing plates and stealing bites off each other's." },
  '2025-05-21': { title: 'Achanak', story: 'Premal surprises Shivani at work.' },
  '2025-05-23': { title: 'Piano Piano', story: "Dinner at Piano Piano. She looks unreal tonight, and he can't stop telling her." },
  '2025-05-27': { title: 'Mubarak Ho, Graduate', story: 'Shivani graduates from Northeastern University. Premal has never been prouder.' },
  '2025-06-29': { title: 'Pizza Wali Pari', story: 'Pizza at Badiali, with Shivani looking far too good for a pizza place.' },
  // ── Season 4 · One Full Year
  '2025-07-06': { title: 'Kinara', story: "Sandwiches at Alfie's, then a long walk along the Etobicoke lakeshore. A perfect day, with the perfect person." },
  '2025-07-12': { title: 'Elora Express', story: 'Drinks at the Lobby Bar in Elora.' },
  '2025-07-21': { title: 'Janamdin, 2025', story: "Shivani's birthday, in the dress Premal gave her. The day doesn't go the way she deserves, and he is still sorry it didn't." },
  '2025-07-27': { title: 'Hum Tum', story: 'A random Sunday, just the two of them.' },
  '2025-08-03': { title: 'Lehrein', story: "Premal's birthday trip, together at Crystal Beach." },
  '2025-10-11': { merge: 'next' },
  '2025-10-12': { title: 'Garba Returns', story: 'Navratri again, and this time it already feels like tradition.' },
  '2025-11-04': { title: 'Befikr', story: 'Shivani, carefree in front of the Befikr flower wall. Premal\'s favourite thing to look at.' },
  '2026-02-14': { title: 'Chitthi', story: "Her Valentine's Day letter to me. A note I will keep forever." },
  '2026-02-21': { title: 'Purani Yaad' },
  '2026-03-21': { title: 'Nobu Nights', story: 'Dinner at Nobu. One of their best dates ever.' },
  '2026-04-02': { title: 'Naya Andaaz', story: 'Shivani gets her bob. It suits her perfectly, and she loves it this way.' },
  '2026-04-23': { title: 'Intermission' },
  // ── Season 5 · Still Us
  '2026-04-25': { title: 'Rang De', story: 'Shivani colours her hair, a soft balayage.' },
  '2026-05-27': { title: 'Jungle Safari', story: "Shivani's trip to Algonquin Park." },
  '2026-06-06': { merge: 'next' },
  '2026-07-21': { title: 'Janamdin, 2026', thumb: 's_20260721_145211_1.jpg' },
  '2026-09-17': { title: 'Neela Paani', story: 'Water so clear you can count the stones. Bruce Peninsula in September.' },
  '2026-09-23': { title: 'Montréal Mein', story: 'Day one of Shivani\'s Québec trip, with the whole city below her.', thumb: 's_20260923_120000_3.jpg' },
  '2026-09-24': { title: 'Chhatriyon Wali Gali', story: 'Umbrella Street, the Château Frontenac and Montmorency Falls.', thumb: 's_20260924_120000_11.jpg' },
  '2026-09-25': { title: 'Nazara', story: 'The last day of the Québec trip.' },
  '2026-09-26': { title: 'Phir Se Gulaab', story: 'Their last outing before Premal leaves Canada on September 27.', thumb: 's_20260926_120000_1.jpg' },
  '2023-09-23': { title: 'Pehli Jhalak', story: 'Season zero opens on a night out in Toronto, and the first frames of a heroine.' },
  '2023-09-30': { title: 'Raat Ki Rani', story: 'A late walk past glowing shopfronts, dressed for the city.' },
  '2023-10-04': { title: 'Outfit Check', story: 'Three takes in the closet mirror. Every one a keeper.' },
  '2023-10-07': { title: 'Safar', story: 'Selfies on the road, with sunlight in her hair.' },
  '2023-10-08': { title: 'Itwaar', story: 'A lazy Sunday, and a camera that clearly loves her.' },
  '2024-06-20': { title: 'Kesariya', story: 'An orange dress in front of Old City Hall, and the whole square watching.' },
  '2024-09-01': { title: 'Sunehri Shaam', story: 'A yellow dress, city lights, and the last weekend of summer.' },
  '2024-11-02': { title: 'Selfie Queen', story: 'Twenty-eight photos in one day. The camera never stood a chance.' },
  '2025-05-11': { title: 'Bunny Chappal', story: 'A pair of very fluffy slippers gets a scene of its own.' },
  '2026-06-23': { title: 'Flying Kiss', story: 'Long distance, one flying kiss at a time.' },
  '2026-06-24': { title: 'Gulabi', story: 'A pink shirt and a quiet day, sent across the miles.' },
  '2026-09-22': { title: 'Safar Shuru', story: 'Window seat, open road, and the start of something good.', thumb: 's_20260922_191542_1.jpg' },
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
  ['Louix Louis',          'May 2024'],
  ['Her birthday, 2024',   'Jul 21, 2024'],
  ['The CNE',              'Aug 25, 2024'],
  ['First temple visit',   'Aug 26, 2024'],
  ['First date',           'Liu Loqum Atelier'],
  ['BarChef Toronto',      'Oct 12, 2024'],
  ['First Navratri',       'Oct 14, 2024'],
  ['Her first car',        'All by herself'],
  ['Clockwork',            'Fairmont Royal York'],
  ['Airport reunion',      'With roses'],
  ['Cactus Club',          'Feb 2025'],
  ["Valentine's note",     'Kept forever'],
  ['Planta Queen',         'Apr 2025'],
  ['Pai',                  'Apr 2025'],
  ['Piano Piano',          'May 2025'],
  ['Her graduation',       'May 27, 2025'],
  ['Badiali',              'Jun 2025'],
  ['The lakeshore',        'Jul 2025'],
  ['Elora',                'Jul 2025'],
  ['Her birthday',         'Jul 21, 2025'],
  ['A birthday apology',   "I'm sorry, Shivani"],
  ['Crystal Beach',        'My birthday trip'],
  ['Navratri 2025',        'Together again'],
  ['The bob haircut',      'Apr 2, 2026'],
  ['Nobu',                 'Mar 21, 2026'],
  ['The hardest goodbye',  'Apr 23, 2026'],
  ['Her birthday, 2026',   'Jul 21, 2026'],
  ['Bruce Peninsula',      'Sep 17, 2026'],
  ['Her Québec trip',      'Sep 23 – 25, 2026'],
  ['Roses, again',         'Sep 26, 2026'],
  ['Another goodbye',      'Sep 27, 2026'],
  ['Still us',             'Every day since'],
  ['',                     ''],
  ['Soundtrack',           'Beete Lamhein'],
  ['Location',             'Toronto, mostly'],
  ['Shot on',              'Our camera rolls'],
  ['Written by',           'Every day together'],
  ['Executive producer',   'Fate'],
  ['',                     ''],
  ['To Shivani',           'my favourite person'],
  ['',                     '— Premal ♡'],
];

window.FINALE = {
  line1: 'To Shivani',
  line2: 'you are my favourite person in the world',
  sign:  '— Premal ♡',
  audio: 'audio/Beete Lamhein The Train 320 Kbps.mp3',
  audioStart: 47,
};
