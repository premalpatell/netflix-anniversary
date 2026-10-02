#!/usr/bin/env python3
"""Build web-ready media + js/media.js.

  python3 tools/build_media.py [RAW_DIR]

Inputs : images/*.jpg and videos/*.mp4 already in the repo, plus (optionally)
         a folder of raw camera-roll files named "<driveId>__<title>".
Outputs: images/<name>.jpg (1440px, metadata stripped), images/t/<name>.jpg (480px),
         videos/<name>.mp4 (720p H.264 faststart), videos/p/<name>.jpg (poster),
         js/media.js  -> window.MEDIA = [{f,t,k,d,w,h,dur,key,est}]

Capture time priority: EXIF DateTimeOriginal > Snapchat filename > QuickTime
creation date (converted to Toronto time) > estimate from neighbouring iPhone
photo numbers (flagged est:1).
Near-duplicate photos (dHash within 6 bits, same 2-day window) are dropped,
preferring files already in the repo so STORIES keys keep matching.
Needs: pillow, pillow-heif, ffmpeg/ffprobe.
"""
import glob, json, os, re, subprocess, sys
from datetime import datetime
from zoneinfo import ZoneInfo
from PIL import Image, ImageOps
import pillow_heif
pillow_heif.register_heif_opener()

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = sys.argv[1] if len(sys.argv) > 1 else None
TOR = ZoneInfo('America/Toronto')
FULL, THUMB = 1920, 720

# Dates confirmed by hand for files whose names carry no date (from the old index.html)
SNAP_DATES = {
  'Snapchat-1006342143.jpg': '2024-10-18', 'Snapchat-10814446.jpg': '2025-11-04',
  'Snapchat-1274994827.jpg': '2025-05-29', 'Snapchat-1282282821.jpg': '2026-04-02',
  'Snapchat-1409371325.jpg': '2024-08-26', 'Snapchat-1433906752.jpg': '2025-01-25',
  'Snapchat-1605463310.jpg': '2025-11-04', 'Snapchat-1884807469.jpg': '2025-10-12',
  'Snapchat-1945727858.jpg': '2025-04-05', 'Snapchat-1960320966.jpg': '2025-04-05',
  'Snapchat-1963777634.jpg': '2025-05-29', 'Snapchat-2117433068.jpg': '2024-10-18',
  'Snapchat-524185506.jpg': '2025-05-29',  'Snapchat-552263264.jpg': '2024-11-20',
  'Snapchat-687287911.jpg': '2025-05-29',  'Snapchat-790482175.jpg': '2025-05-29',
  'valentine.jpg': '2026-02-14',
  # Confirmed by Premal (these IMG_ numbers were guessed wrong)
  'IMG_5230.JPG': '2024-08-25', 'IMG_5231.jpg': '2024-08-25', 'IMG_5233.JPG': '2024-08-25',
  # Sept 2026: Shivani's Quebec trip (dated by the user from the contact sheet) + last outing flowers
  'Snapchat-58892558.jpg': '2026-09-17',  # #48
  'Snapchat-379522744.jpg': '2026-09-17',  # #49
  'Snapchat-1898231155.jpg': '2026-09-23',  # #10
  'Snapchat-1763367632.jpg': '2026-09-23',  # #12
  'Snapchat-1533350762.jpg': '2026-09-23',  # #15
  'Snapchat-775701662.jpg': '2026-09-23',  # #25
  'Snapchat-1262736469.jpg': '2026-09-23',  # #34
  'Snapchat-877446127.jpg': '2026-09-23',  # #13
  'Snapchat-953240537.jpg': '2026-09-23',  # #67
  'Snapchat-1519252535.jpg': '2026-09-23',  # #71
  'Snapchat-1692021133.jpg': '2026-09-23',  # #72
  'Snapchat-1161689235.jpg': '2026-09-24',  # #5
  'Snapchat-1090526165.jpg': '2026-09-24',  # #6
  'Snapchat-842324961.jpg': '2026-09-24',  # #8
  'Snapchat-1170726861.jpg': '2026-09-24',  # #11
  'Snapchat-1315543665.jpg': '2026-09-24',  # #14
  'Snapchat-1408809778.jpg': '2026-09-24',  # #19
  'Snapchat-1799361220.jpg': '2026-09-24',  # #20
  'Snapchat-144796690.jpg': '2026-09-24',  # #21
  'Snapchat-279122388.jpg': '2026-09-24',  # #23
  'Snapchat-1801574389.jpg': '2026-09-24',  # #27
  'Snapchat-1439531535.jpg': '2026-09-24',  # #28
  'Snapchat-397317949.jpg': '2026-09-24',  # #31
  'Snapchat-261805749.jpg': '2026-09-24',  # #33
  'Snapchat-1675897112.jpg': '2026-09-24',  # #35
  'Snapchat-1963362128.jpg': '2026-09-24',  # #36
  'Snapchat-1384785441.jpg': '2026-09-24',  # #37
  'Snapchat-766892859.jpg': '2026-09-24',  # #39
  'Snapchat-554377905.jpg': '2026-09-24',  # #41
  'Snapchat-1140959699.jpg': '2026-09-24',  # #44
  'Snapchat-692691928.jpg': '2026-09-24',  # #50
  'Snapchat-1815952221.jpg': '2026-09-24',  # #51
  'Snapchat-1662310138.jpg': '2026-09-24',  # #52
  'Snapchat-1980739793.jpg': '2026-09-24',  # #53
  'Snapchat-1142385251.jpg': '2026-09-24',  # #55
  'Snapchat-1217051938.jpg': '2026-09-24',  # #57
  'Snapchat-2087444229.jpg': '2026-09-24',  # #59
  'Snapchat-388645732.jpg': '2026-09-24',  # #60
  'Snapchat-1328559998.jpg': '2026-09-24',  # #61
  'Snapchat-1607970198.jpg': '2026-09-24',  # #62
  'Snapchat-2127207180.jpg': '2026-09-24',  # #70
  'Snapchat-536460620.jpg': '2026-09-24',  # #22
  'Snapchat-534238978.jpg': '2026-09-24',  # #29
  'Snapchat-766148922.jpg': '2026-09-24',  # #30
  'Snapchat-2111209050.jpg': '2026-09-24',  # #40
  'Snapchat-769528473.jpg': '2026-09-24',  # #45
  'Snapchat-1860678894.jpg': '2026-09-24',  # #73
  'Snapchat-1578586602.jpg': '2026-09-24',  # #3
  'Snapchat-2113371422.jpg': '2026-09-24',  # #17
  'Snapchat-225799036.jpg': '2026-09-25',  # #4
  'Snapchat-819829774.jpg': '2026-09-25',  # #7
  'Snapchat-1467093322.jpg': '2026-09-25',  # #9
  'Snapchat-1665065057.jpg': '2026-09-25',  # #16
  'Snapchat-2012477947.jpg': '2026-09-25',  # #18
  'Snapchat-1948759972.jpg': '2026-09-25',  # #24
  'Snapchat-1173658082.jpg': '2026-09-25',  # #26
  'Snapchat-918908314.jpg': '2026-09-25',  # #32
  'Snapchat-379051952.jpg': '2026-09-25',  # #38
  'Snapchat-1667864078.jpg': '2026-09-25',  # #46
  'Snapchat-1639861238.jpg': '2026-09-25',  # #47
  'Snapchat-1446016345.jpg': '2026-09-25',  # #54
  'Snapchat-1932869101.jpg': '2026-09-25',  # #58
  'Snapchat-2089084440.jpg': '2026-09-25',  # #63
  'Snapchat-1849604723.jpg': '2026-09-25',  # #64
  'Snapchat-939790105.jpg': '2026-09-25',  # #65
  'Snapchat-2005705401.jpg': '2026-09-25',  # #66
  'Snapchat-16417243.jpg': '2026-09-25',  # #68
  'Snapchat-1497567681.jpg': '2026-09-25',  # #69
  'Snapchat-876610309.jpg': '2026-09-26',  # #42
  'IMG_1281.JPG': '2026-09-26',  # #43
  'Snapchat-352657970.jpg': '2026-09-26',  # #56
}
SOURCES = {}
# Dates Premal set in the Cutting Room review page (Oct 2026). These win over everything above.
USER_DATES = {
  # Bruce Peninsula, Sept 17 2026 (resized copies, dates stripped by the resizer)
  'IMG_5929-3mb.jpg': '2026-09-17',
  'IMG_5930-3mb.jpg': '2026-09-17',
  'IMG_5939-3mb.jpg': '2026-09-17',
  'IMG_5940-3mb.jpg': '2026-09-17',
  'IMG_5941-3mb.jpg': '2026-09-17',
  'IMG_5942-3mb.jpg': '2026-09-17',
  'IMG_5946-3mb.jpg': '2026-09-17',
  'IMG_5947-3mb.jpg': '2026-09-17',
  'IMG_5948-3mb.jpg': '2026-09-17',
  'IMG_5954-3mb.jpg': '2026-09-17',
  'IMG_5955-3mb.jpg': '2026-09-17',
  'IMG_5956-3mb.jpg': '2026-09-17',
  'IMG_5958-3mb.jpg': '2026-09-17',
  'IMG_5960-3mb.jpg': '2026-09-17',
  'IMG_5961-3mb.jpg': '2026-09-17',
  'IMG_5990-3mb.jpg': '2026-09-17',
  'IMG_5991-3mb.jpg': '2026-09-17',
  'IMG_5992-3mb.jpg': '2026-09-17',
  'IMG_5993-3mb.jpg': '2026-09-17',
  'IMG_5994-3mb.jpg': '2026-09-17',
  'IMG_5995-3mb.jpg': '2026-09-17',
  'IMG_8810.JPG': '2023-09-23',
  '0743e95b7d824f4c96eb3ae51df6bdc7.MOV': '2023-09-30',
  'IMG_9372.JPG': '2023-10-04',
  'IMG_9278.JPG': '2023-10-21',
  'SNAP_20231126-015602.MP4': '2023-12-09',
  'IMG_5233.JPG': '2024-05-20',
  'IMG_1234.jpg': '2024-07-21',
  'IMG_1265.jpg': '2024-07-21',
  'IMG_1281.JPG': '2024-07-21',
  'Snapchat-1274994827.jpg': '2025-05-27',
  'Snapchat-1963777634.jpg': '2025-05-27',
  'Snapchat-524185506.jpg': '2025-05-27',
  'Snapchat-687287911.jpg': '2025-05-27',
  'Snapchat-790482175.jpg': '2025-05-27',
  'IMG_4764.JPG': '2026-03-21',
  'IMG_4765.JPG': '2026-03-21',
  'IMG_4766.JPG': '2026-03-21',
  'IMG_4767.JPG': '2026-03-21',
  'IMG_4768.JPG': '2026-03-21',
  'IMG_4769.JPG': '2026-03-21',
  'IMG_4770.JPG': '2026-03-21',
  'IMG_4771.JPG': '2026-03-21',
  'IMG_4772.JPG': '2026-03-21',
  'IMG_4773.JPG': '2026-03-21',
  'IMG_4845.HEIC': '2026-04-02',
  'IMG_4846.HEIC': '2026-04-02',
  'IMG_4847.heic': '2026-04-02',
  'IMG_4850.JPG': '2026-04-02',
  'IMG_4856.JPG': '2026-04-02',
  'IMG_4862.JPG': '2026-04-02',
  'IMG_4867.JPG': '2026-04-02',
  'IMG_4917.JPG': '2026-04-25',
  'Snapchat-379522744.jpg': '2026-09-25',
  'Snapchat-58892558.jpg': '2026-09-25',
}
SNAP_DATES.update(USER_DATES)

SKIP = {'netflix-n.png', 'Snapchat-1493094235.jpg', 'Snapchat-918357969.jpg'}  # not of Shivani
# Raw files left out on purpose: 18 near-identical car selfies trimmed to 4 (keep 4850, 4856, 4862, 4867)
SKIP_RAW = {f'IMG_{n}.JPG' for n in (4851, 4852, 4853, 4855, 4857, 4858, 4859, 4860, 4861, 4863, 4864, 4865, 4866)} | {'IMG_4854.jpg'}

import base64, io
try:
    import cv2, numpy as np
    _CASC = [cv2.CascadeClassifier(cv2.data.haarcascades + f) for f in
             ('haarcascade_frontalface_default.xml', 'haarcascade_profileface.xml')]
except Exception:   # pragma: no cover
    cv2 = None


def focus(im):
    """Face-aware focal point (x, y in 0..1) so thumbnails crop around her face."""
    if cv2 is None:
        return None
    g = im.convert('L'); g.thumbnail((640, 640))
    a = np.asarray(g); a = cv2.equalizeHist(a)
    faces = []
    for c in _CASC:
        f = c.detectMultiScale(a, scaleFactor=1.1, minNeighbors=5, minSize=(max(24, a.shape[1] // 16),) * 2)
        faces += [tuple(x) for x in f]
    if not faces:
        return None
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    return [round(float(x + w / 2) / a.shape[1], 2), round(float(y + h / 2) / a.shape[0], 2)]


def tiny(im):
    """Blur-up placeholder: ~12px wide JPEG as a data URI."""
    t = im.copy(); t.thumbnail((12, 12)); buf = io.BytesIO()
    t.convert('RGB').save(buf, 'JPEG', quality=40, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()


def colour(im):
    """Average colour, nudged toward the most saturated quadrant, as #rrggbb."""
    t = im.convert('RGB').resize((4, 4), Image.LANCZOS)
    px = [t.getpixel((i % 4, i // 4)) for i in range(16)]
    sat = lambda c: max(c) - min(c)
    px.sort(key=sat, reverse=True)
    top = px[:6]
    r, g, b = (sum(c[i] for c in top) // len(top) for i in range(3))
    return '#%02x%02x%02x' % (r, g, b)


def enrich(it, im):
    im = ImageOps.exif_transpose(im)
    p = focus(im)
    if p:
        it['p'] = p
    it['b'] = tiny(im); it['c'] = colour(im)


def dhash(im):
    g = im.convert('L').resize((9, 8), Image.LANCZOS)
    px = list(g.getdata())
    return sum(1 << i for i in range(64) if px[(i // 8) * 9 + i % 8] > px[(i // 8) * 9 + i % 8 + 1])


def name_date(fn):
    """Date from camera-style names (20240826_182222, VID_20250803_164935, SNAP_20231007-181241).
    Snapchat-<random id> names carry no date."""
    if fn.startswith('Snapchat-'):
        return None
    for pat, fmt in ((r'(?<!\d)(20\d\d)(\d\d)(\d\d)[-_](\d\d)(\d\d)(\d\d)', '{0}-{1}-{2}T{3}:{4}:{5}'),
                     (r'(?<!\d)(20\d\d)(\d\d)(\d\d)(?!\d)', '{0}-{1}-{2}T12:00:00')):
        m = re.search(pat, fn)
        if m and 1 <= int(m[2]) <= 12 and 1 <= int(m[3]) <= 31:
            return fmt.format(*m.groups())
    return None


def exif_date(im):
    ex = im.getexif(); sub = ex.get_ifd(0x8769)
    d = sub.get(36867) or ex.get(306)
    if not d:
        return None, ex.get(272)
    return d[:10].replace(':', '-') + 'T' + d[11:19], ex.get(272)


def probe(path):
    r = subprocess.run(['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', path],
                       capture_output=True, text=True)
    j = json.loads(r.stdout or '{}')
    tags = j.get('format', {}).get('tags', {})
    dur = float(j.get('format', {}).get('duration', 0) or 0)
    ct = tags.get('com.apple.quicktime.creationdate') or tags.get('creation_time')
    if not ct:
        return None, dur
    ct = re.sub(r'\.\d+', '', ct).replace('Z', '+00:00')
    ct = re.sub(r'([+-]\d\d)(\d\d)$', r'\1:\2', ct)
    dt = datetime.fromisoformat(ct)
    if dt.tzinfo:
        dt = dt.astimezone(TOR)
    return dt.strftime('%Y-%m-%dT%H:%M:%S'), dur


def webp(im, path, q):
    im.save(path[:-4] + '.webp', 'WEBP', quality=q, method=6)


def save_img(im, out_full, out_thumb, repo_full=None):
    im = ImageOps.exif_transpose(im).convert('RGB')
    w, h = im.size
    if out_full:
        # Full-size photos ship as high-quality WebP only (every current browser supports it)
        f = im.copy(); f.thumbnail((FULL, FULL), Image.LANCZOS)
        webp(f, out_full, 86)
        w, h = f.size
    elif repo_full and os.path.exists(repo_full[:-4] + '.webp'):
        os.remove(repo_full[:-4] + '.webp')   # repo originals are served as-is, never re-compressed
    t = im.copy(); t.thumbnail((THUMB, THUMB), Image.LANCZOS)
    t.save(out_thumb, 'JPEG', quality=84, optimize=True, progressive=True)
    webp(t, out_thumb, 84)
    return w, h


def face_area(im):
    """Area of the largest detected face (0 if none), used to pick the best video frame."""
    if cv2 is None:
        return 0
    g = im.convert('L'); g.thumbnail((480, 480)); a = cv2.equalizeHist(np.asarray(g))
    best = 0
    for c in _CASC:
        for (x, y, w, h) in c.detectMultiScale(a, scaleFactor=1.1, minNeighbors=5, minSize=(24, 24)):
            best = max(best, int(w) * int(h))
    return best


def poster(src, dst):
    """Poster frame: sample a few moments and keep the one with the largest visible face."""
    dur = probe(src)[1] or 1
    tmp = dst + '.cand.jpg'; best = (-1, None)
    for t in sorted({0.3, dur * 0.2, dur * 0.4, dur * 0.6, dur * 0.8}):
        if t >= dur:
            continue
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{t:.2f}', '-i', src, '-frames:v', '1',
                        '-vf', f'scale={THUMB}:-2', '-q:v', '4', tmp], check=True)
        if not os.path.exists(tmp):
            continue
        im = Image.open(tmp).convert('RGB'); area = face_area(im)
        if area > best[0]:
            best = (area, im.copy())
    os.remove(tmp) if os.path.exists(tmp) else None
    if best[1] is None:
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', '0', '-i', src, '-frames:v', '1',
                        '-vf', f'scale={THUMB}:-2', '-q:v', '4', dst], check=True)
        best = (0, Image.open(dst).convert('RGB'))
    best[1].save(dst, 'JPEG', quality=86, optimize=True)
    webp(best[1], dst, 84)


def encode_video(src, dst):
    if os.path.exists(dst) and os.path.getsize(dst) > 0 and os.path.getmtime(dst) > os.path.getmtime(src):
        return
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src, '-map_metadata', '-1',
                    '-vf', "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))'",
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', dst], check=True)


def main():
    os.makedirs(f'{ROOT}/images/t', exist_ok=True)
    os.makedirs(f'{ROOT}/videos/p', exist_ok=True)
    os.makedirs(f'{ROOT}/js', exist_ok=True)
    items, hashes = [], []

    # 1. Media already in the repo (filenames kept so STORIES keys still match)
    for p in sorted(glob.glob(f'{ROOT}/images/*.jpg')):
        fn = os.path.basename(p)
        if fn in SKIP or fn.startswith('s_'):
            continue
        im = Image.open(p)
        d = SNAP_DATES.get(fn)
        d = d + 'T12:00:00' if d else name_date(fn)
        w, h = save_img(im, None, f'{ROOT}/images/t/{fn}', repo_full=p)
        hashes.append((dhash(ImageOps.exif_transpose(im)), d))
        it = {'f': f'images/{fn}', 't': f'images/t/{fn}', 'k': 'img', 'd': d, 'w': w, 'h': h, 'key': fn}
        enrich(it, im); items.append(it)
    for p in sorted(glob.glob(f'{ROOT}/videos/*.mp4')):
        fn = os.path.basename(p)
        if fn.startswith('s_'):
            continue
        poster(p, f'{ROOT}/videos/p/{fn[:-4]}.jpg')
        _, dur = probe(p)
        vd = SNAP_DATES.get(fn)
        it = {'f': f'videos/{fn}', 't': f'videos/p/{fn[:-4]}.jpg', 'k': 'vid', 'd': (vd + 'T12:00:00') if vd else name_date(fn),
              'dur': round(dur, 1), 'key': fn}
        enrich(it, Image.open(it['t'])); items.append(it)

    if RAW:
        add_raw(items, hashes)

    items.sort(key=lambda x: (x['d'] or '9999', x['f']))
    blur = {it['key']: it.pop('b') for it in items if 'b' in it}
    with open(f'{ROOT}/js/media.js', 'w') as fh:
        fh.write('/* Generated by tools/build_media.py - do not edit by hand. */\n')
        fh.write('window.MEDIA = ' + json.dumps(items, separators=(',', ':')).replace('},{', '},\n{') + ';\n')
    with open(f'{ROOT}/js/blur.js', 'w') as fh:
        fh.write('/* Generated: 12px blur-up placeholders, loaded after first paint. */\n')
        fh.write('window.BLUR = ' + json.dumps(blur, separators=(',', ':')) + ';\n')
        fh.write("document.dispatchEvent(new Event('blur-ready'));\n")
    print(f'{len(items)} items -> js/media.js')
    if RAW:
        json.dump(SOURCES, open(os.path.join(os.path.dirname(os.path.abspath(RAW)), 'sources.json'), 'w'), indent=0)


def add_raw(items, hashes):
    raw = []
    for p in sorted(glob.glob(f'{RAW}/*')):
        title = re.sub(r'^[\w-]{33}__', '', os.path.basename(p))  # Drive ids may themselves contain '__'
        raw.append((p, title, title.rsplit('.', 1)[-1].lower()))

    # Pass 1: EXIF dates; iPhone numbers with dates become anchors for the undated ones
    imgs, anchors = [], {}
    for p, title, ext in raw:
        if ext in ('mp4', 'mov') or title in SKIP_RAW:
            continue
        im = Image.open(p)
        d, model = exif_date(im)
        n = re.match(r'IMG_(\d+)', title)
        if d and model and n:
            anchors.setdefault(model, []).append((int(n[1]), d))
        imgs.append((p, title, im, d, int(n[1]) if n else None))

    def estimate(num):
        best = None
        for model, pts in anchors.items():
            pts.sort()
            if len(pts) < 4 or not (pts[0][0] - 150 <= num <= pts[-1][0] + 150):
                continue
            before = [q for q in pts if q[0] <= num]
            after = [q for q in pts if q[0] >= num]
            a = before[-1] if before else after[0]
            b = after[0] if after else before[-1]
            gap = abs(b[0] - a[0])
            if best is None or gap < best[0]:
                if a[0] == b[0]:
                    d = a[1]
                else:
                    da, db = datetime.fromisoformat(a[1]), datetime.fromisoformat(b[1])
                    d = (da + (db - da) * ((num - a[0]) / (b[0] - a[0]))).strftime('%Y-%m-%dT%H:%M:%S')
                best = (gap, d)
        return best[1] if best else None

    seq = {}
    def slug(d, ext):
        base = 's_' + (d or 'undated').replace('-', '').replace(':', '').replace('T', '_')
        seq[base] = seq.get(base, 0) + 1
        return f'{base}_{seq[base]}.{ext}'

    for p, title, im, d, num in imgs:
        est = False
        if title in SNAP_DATES:
            d = SNAP_DATES[title] + (d[10:] if d else 'T12:00:00')
        if not d:
            d = name_date(title)
        if not d and num:
            d = estimate(num); est = bool(d)
        h = dhash(ImageOps.exif_transpose(im))
        dup = False
        for oh, od in hashes:
            close = not od or not d or abs((datetime.fromisoformat(od) - datetime.fromisoformat(d)).days) <= 2
            if bin(h ^ oh).count('1') <= 6 and close:
                dup = True; break
        if dup:
            print('dup ', title); continue
        hashes.append((h, d))
        name = slug(d, 'jpg')
        w, hh = save_img(im, f'{ROOT}/images/{name}', f'{ROOT}/images/t/{name}')
        it = {'f': f'images/{name}', 't': f'images/t/{name}', 'k': 'img', 'd': d, 'w': w, 'h': hh, 'key': name}
        SOURCES[name] = title
        if est:
            it['est'] = 1
        enrich(it, im); items.append(it)

    seen = set()
    for p, title, ext in raw:
        if ext not in ('mp4', 'mov'):
            continue
        d, dur = probe(p)
        if title.startswith('SNAP_'):
            d = name_date(title)
        # Chat-exported clips with hex names carry the Drive upload time, not a capture time
        if re.match(r'^[0-9a-f]{32}\.', title) and d and d.startswith('2026-09-17T18'):
            d = None
        if title in SNAP_DATES:
            d = SNAP_DATES[title] + (d[10:] if d else 'T12:00:00')
        if dur < 1.5:          # Live Photo motion clips, not real videos
            print('skip', title); continue
        sig = (round(dur, 1), os.path.getsize(p))
        if sig in seen:
            continue
        seen.add(sig)
        name = slug(d, 'mp4')
        encode_video(p, f'{ROOT}/videos/{name}')
        poster(f'{ROOT}/videos/{name}', f'{ROOT}/videos/p/{name[:-4]}.jpg')
        it = {'f': f'videos/{name}', 't': f'videos/p/{name[:-4]}.jpg', 'k': 'vid', 'd': d, 'dur': round(dur, 1), 'key': name}
        SOURCES[name] = title
        enrich(it, Image.open(it['t'])); items.append(it)


if __name__ == '__main__':
    main()
