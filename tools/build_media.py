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
FULL, THUMB = 1440, 480

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
}
SKIP = {'netflix-n.png'}


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


def save_img(im, out_full, out_thumb):
    im = ImageOps.exif_transpose(im).convert('RGB')
    w, h = im.size
    if out_full:
        f = im.copy(); f.thumbnail((FULL, FULL), Image.LANCZOS)
        f.save(out_full, 'JPEG', quality=80, optimize=True, progressive=True)
        w, h = f.size
    t = im.copy(); t.thumbnail((THUMB, THUMB), Image.LANCZOS)
    t.save(out_thumb, 'JPEG', quality=72, optimize=True, progressive=True)
    return w, h


def poster(src, dst):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', '0.3', '-i', src, '-frames:v', '1',
                    '-vf', f'scale={THUMB}:-2', '-q:v', '4', dst], check=True)


def encode_video(src, dst):
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
        w, h = save_img(im, None, f'{ROOT}/images/t/{fn}')
        hashes.append((dhash(ImageOps.exif_transpose(im)), d))
        items.append({'f': f'images/{fn}', 't': f'images/t/{fn}', 'k': 'img', 'd': d, 'w': w, 'h': h, 'key': fn})
    for p in sorted(glob.glob(f'{ROOT}/videos/*.mp4')):
        fn = os.path.basename(p)
        if fn.startswith('s_'):
            continue
        poster(p, f'{ROOT}/videos/p/{fn[:-4]}.jpg')
        _, dur = probe(p)
        items.append({'f': f'videos/{fn}', 't': f'videos/p/{fn[:-4]}.jpg', 'k': 'vid', 'd': name_date(fn),
                      'dur': round(dur, 1), 'key': fn})

    if RAW:
        add_raw(items, hashes)

    items.sort(key=lambda x: (x['d'] or '9999', x['f']))
    with open(f'{ROOT}/js/media.js', 'w') as fh:
        fh.write('/* Generated by tools/build_media.py - do not edit by hand. */\n')
        fh.write('window.MEDIA = ' + json.dumps(items, separators=(',', ':')).replace('},{', '},\n{') + ';\n')
    print(f'{len(items)} items -> js/media.js')


def add_raw(items, hashes):
    raw = []
    for p in sorted(glob.glob(f'{RAW}/*')):
        title = os.path.basename(p).split('__', 1)[-1]
        raw.append((p, title, title.rsplit('.', 1)[-1].lower()))

    # Pass 1: EXIF dates; iPhone numbers with dates become anchors for the undated ones
    imgs, anchors = [], {}
    for p, title, ext in raw:
        if ext in ('mp4', 'mov'):
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
        if est:
            it['est'] = 1
        items.append(it)

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
        if dur < 1.5:          # Live Photo motion clips, not real videos
            print('skip', title); continue
        sig = (round(dur, 1), os.path.getsize(p))
        if sig in seen:
            continue
        seen.add(sig)
        name = slug(d, 'mp4')
        encode_video(p, f'{ROOT}/videos/{name}')
        poster(f'{ROOT}/videos/{name}', f'{ROOT}/videos/p/{name[:-4]}.jpg')
        items.append({'f': f'videos/{name}', 't': f'videos/p/{name[:-4]}.jpg', 'k': 'vid', 'd': d,
                      'dur': round(dur, 1), 'key': name})


if __name__ == '__main__':
    main()
