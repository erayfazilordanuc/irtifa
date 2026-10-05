"""Seçilen markayı `assets/brand/` altına üretir.

Başka bir aday seçilirse tek yapılacak: aşağıdaki CHOSEN'ı değiştirmek.
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from draw import rasterize
from png import write_png
from marks import (MARKS, EMERALD_LIGHT, EMERALD_DARK, ICON_GRADIENT,
                   SCREEN_LIGHT, SCREEN_DARK)

CHOSEN = 'A'          # Denge
OUT = sys.argv[1] if len(sys.argv) > 1 else 'assets/brand'
WHITE = (255, 255, 255)

fn = next(f for k, _, f in MARKS if k == CHOSEN)
name = next(n for k, n, _ in MARKS if k == CHOSEN)
os.makedirs(OUT, exist_ok=True)


def grad_at(y, size, stops):
    p = y / max(size - 1, 1) * (len(stops) - 1)
    i = min(int(p), len(stops) - 2)
    f = p - i
    a, b = stops[i], stops[i + 1]
    return tuple(int(a[c] + (b[c] - a[c]) * f) for c in range(3))


def render(size, fg, bg=None, grad=None, scale=1.0):
    """scale < 1 ise figür küçülüp ortalanır (adaptive icon güvenli alanı)."""
    inner = int(size * scale)
    polys, holes = fn(inner)
    off = (size - inner) / 2
    polys = [[(x + off, y + off) for x, y in p] for p in polys]
    holes = [[(x + off, y + off) for x, y in p] for p in holes]
    mask = rasterize(size, polys, holes)
    px = bytearray(size * size * 4)
    for y in range(size):
        row = grad_at(y, size, grad) if grad else bg
        for x in range(size):
            a = mask[y * size + x]
            i = (y * size + x) * 4
            if row is None:                      # şeffaf zemin
                px[i:i + 3] = bytes(fg)
                px[i + 3] = a
            else:
                al = a / 255
                for c in range(3):
                    px[i + c] = int(row[c] * (1 - al) + fg[c] * al)
                px[i + 3] = 255
    return px


# 1) Ana marka — şeffaf zemin, kimlik yeşili. Türetmelerin kaynağı budur.
write_png(f'{OUT}/mark.png', 1024, 1024, render(1024, EMERALD_LIGHT))

# 2) Uygulama ikonu görünümü — degrade zemin (profil ekranıyla aynı yön), beyaz figür.
write_png(f'{OUT}/app-icon.png', 1024, 1024, render(1024, WHITE, grad=ICON_GRADIENT))

# 3) Dört bağlam tek karede — göz kararı için.
CELL = 260
W, H = CELL * 4, CELL
sheet = bytearray(W * H * 4)
panels = [
    render(CELL, WHITE, grad=ICON_GRADIENT),
    render(CELL, EMERALD_LIGHT, bg=SCREEN_LIGHT),
    render(CELL, EMERALD_DARK, bg=SCREEN_DARK),
    None,
]
small = rasterize(96, *fn(96))
up = bytearray(CELL * CELL * 4)
for y in range(CELL):
    for x in range(CELL):
        a = small[(y * 96 // CELL) * 96 + (x * 96 // CELL)] / 255
        i = (y * CELL + x) * 4
        for c, v in enumerate((0x3f, 0x3f, 0x46)):
            up[i + c] = int(v * (1 - a) + 255 * a)
        up[i + 3] = 255
panels[3] = up
for col, p in enumerate(panels):
    for y in range(CELL):
        for x in range(CELL):
            src = (y * CELL + x) * 4
            dst = (y * W + col * CELL + x) * 4
            sheet[dst:dst + 4] = p[src:src + 4]
write_png(f'{OUT}/contexts.png', W, H, sheet)

print(f'seçilen: {CHOSEN} — {name}')
for f in ('mark.png', 'app-icon.png', 'contexts.png'):
    print(f'  {OUT}/{f}  ({os.path.getsize(f"{OUT}/{f}")} bayt)')
