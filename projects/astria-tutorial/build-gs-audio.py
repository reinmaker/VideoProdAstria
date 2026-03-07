#!/usr/bin/env python3
"""
Build combined voiceover for Getting Started video.
Concatenates per-scene MP3s with silence padding to match scene start times.

Scene layout (seconds):
  01 Title:          0 – 6      audio: 5.4s   → starts at 0s
  02 What is Astria: 6 – 20     audio: 13.1s  → starts at 6s
  03 Dashboard:     20 – 47     audio: 25.5s  → starts at 20s  (scene 27s)
  04 Concepts:      47 – 91     audio: 43.0s  → starts at 47s  (scene 44s)
  05 Generate:      91 – 114    audio: 21.1s  → starts at 91s  (scene 23s)
  06 Packs concept:114 – 135    audio: 20.2s  → starts at 114s (scene 21s)
  07 Packs demo:   135 – 159    audio: 23.0s  → starts at 135s (scene 24s)
  08 Results:      159 – 173    audio: 12.0s  → starts at 159s (scene 14s)
  09 CTA:          173 – 194    audio: 19.9s  → starts at 173s (scene 21s)

Total video = 194s = 5820 frames
"""
import subprocess
from pathlib import Path

BASE  = Path(__file__).parent / 'public/audio/gs-scenes'
OUT   = Path(__file__).parent / 'public/audio/gs-voiceover.mp3'
TMPDIR = Path('/tmp/gs-audio')
TMPDIR.mkdir(exist_ok=True)

def silence(duration_s: float, out: Path):
    subprocess.run([
        'ffmpeg', '-y',
        '-f', 'lavfi', '-i', f'anullsrc=r=44100:cl=mono',
        '-t', str(duration_s),
        '-c:a', 'libmp3lame', '-q:a', '4',
        str(out),
    ], check=True, capture_output=True)

def concat(files: list[Path], out: Path):
    list_file = TMPDIR / 'concat.txt'
    with open(list_file, 'w') as f:
        for p in files:
            f.write(f"file '{p.absolute()}'\n")
    subprocess.run([
        'ffmpeg', '-y',
        '-f', 'concat', '-safe', '0',
        '-i', str(list_file),
        '-c:a', 'libmp3lame', '-q:a', '2',
        str(out),
    ], check=True, capture_output=True)

# Scene start times (seconds) — matches scene durations 6+14+27+44+23+21+24+14+13=186
starts = {
    '01': 0,    # title starts at 0
    '02': 6,    # after title (6s)
    '03': 20,   # after what-is-astria (6+14)
    '04': 47,   # after dashboard (20+27)
    '05': 91,   # after concepts (47+44)
    '06': 114,  # after generate (91+23)
    '07': 135,  # after packs-concept (114+21)
    '08': 159,  # after packs-demo (135+24)
    '09': 173,  # after results (159+14)
}

segments = []
prev_end = 0.0

scene_files = ['01', '02', '03', '04', '05', '06', '07', '08', '09']

for key in scene_files:
    matches = list(BASE.glob(f'{key}-*.mp3'))
    if not matches:
        print(f'WARNING: no MP3 found for scene {key}')
        continue
    mp3 = matches[0]

    start = starts[key]
    gap = start - prev_end
    if gap > 0.05:
        sil = TMPDIR / f'gap-before-{key}.mp3'
        silence(gap, sil)
        segments.append(sil)

    segments.append(mp3)

    # Get duration
    result = subprocess.run(
        ['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(mp3)],
        capture_output=True, text=True
    )
    dur = float(result.stdout.strip())
    prev_end = start + dur
    print(f'  Scene {key}: starts {start}s, audio {dur:.2f}s, ends {prev_end:.2f}s')

# Trailing silence to 194s
tail = 194.0 - prev_end
if tail > 0:
    sil = TMPDIR / 'tail-silence.mp3'
    silence(tail, sil)
    segments.append(sil)

print(f'\nConcatenating {len(segments)} segments...')
concat(segments, OUT)
print(f'✅ Output: {OUT}')

# Verify
result = subprocess.run(
    ['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(OUT)],
    capture_output=True, text=True
)
print(f'   Duration: {result.stdout.strip()}s')
