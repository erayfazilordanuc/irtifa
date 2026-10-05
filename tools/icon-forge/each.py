"""Her adayı ayrı dosya olarak dışa aktarır — dört bağlam tek şeritte."""
import os
import sys
sys.path.insert(0, sys.argv[1] if len(sys.argv) > 1 else '.')
from draw import rasterize
from png import write_png
from marks import (MARKS, EMERALD_LIGHT, EMERALD_DARK, ICON_GRADIENT,
                   SCREEN_LIGHT, SCREEN_DARK)

OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)
CELL = 240
WHITE = (255, 255, 255)


def grad_at(y, size, stops):
    p = y / max(size - 1, 1) * (len(stops) - 1)
    i = min(int(p), len(stops) - 2)
    f = p - i
    a, b = stops[i], stops[i + 1]
    return tuple(int(a[c] + (b[c] - a[c]) * f) for c in range(3))


SLUG = str.maketrans('çğıöşüÇĞİÖŞÜ ', 'cgiosucgiosu-')

for key, name, fn in MARKS:
    W, H = CELL * 4, CELL
    buf = bytearray(W * H * 4)
    mask = rasterize(CELL, *fn(CELL))
    m96 = rasterize(96, *fn(96))
    up = bytearray(CELL * CELL)
    for y in range(CELL):
        for x in range(CELL):
            up[y * CELL + x] = m96[(y * 96 // CELL) * 96 + (x * 96 // CELL)]

    panels = [(mask, WHITE, None, ICON_GRADIENT),
              (mask, EMERALD_LIGHT, SCREEN_LIGHT, None),
              (mask, EMERALD_DARK, SCREEN_DARK, None),
              (up, WHITE, (0x3f, 0x3f, 0x46), None)]

    for col, (m, fg, bg, grad) in enumerate(panels):
        for y in range(CELL):
            row = grad_at(y, CELL, grad) if grad else bg
            for x in range(CELL):
                al = m[y * CELL + x] / 255
                i = ((y) * W + col * CELL + x) * 4
                for c in range(3):
                    buf[i + c] = int(row[c] * (1 - al) + fg[c] * al)
                buf[i + 3] = 255

    slug = name.lower().translate(SLUG)
    path = os.path.join(OUT, f'{key}-{slug}.png')
    write_png(path, W, H, buf)
    print(path)
