"""Adayları dört bağlamda yan yana gösteren kontak sayfası."""
import sys
sys.path.insert(0, sys.argv[1] if len(sys.argv) > 1 else '.')
from draw import rasterize
from png import write_png
from marks import (MARKS, EMERALD_LIGHT, EMERALD_DARK, ICON_GRADIENT,
                   SCREEN_LIGHT, SCREEN_DARK)

CELL = 220
COLS, ROWS = len(MARKS), 4
W, H = CELL * COLS, CELL * ROWS
sheet = bytearray(W * H * 4)
WHITE = (255, 255, 255)


def grad_at(y, size, stops):
    """Dikey degradede y satırının rengi."""
    p = y / max(size - 1, 1) * (len(stops) - 1)
    i = min(int(p), len(stops) - 2)
    f = p - i
    a, b = stops[i], stops[i + 1]
    return tuple(int(a[c] + (b[c] - a[c]) * f) for c in range(3))


def put(mask, size, ox, oy, fg, bg=None, grad=None):
    for y in range(size):
        row_bg = grad_at(y, size, grad) if grad else bg
        for x in range(size):
            al = mask[y * size + x] / 255
            i = ((oy + y) * W + ox + x) * 4
            for c in range(3):
                sheet[i + c] = int(row_bg[c] * (1 - al) + fg[c] * al)
            sheet[i + 3] = 255


for col, (key, name, fn) in enumerate(MARKS):
    pc, hc = fn(CELL)
    p96, h96 = fn(96)
    a = rasterize(CELL, pc, hc)
    a96 = rasterize(96, p96, h96)
    up = bytearray(CELL * CELL)
    for y in range(CELL):
        for x in range(CELL):
            up[y * CELL + x] = a96[(y * 96 // CELL) * 96 + (x * 96 // CELL)]

    put(a, CELL, col * CELL, 0, WHITE, grad=ICON_GRADIENT)        # uygulama ikonu
    put(a, CELL, col * CELL, CELL, EMERALD_LIGHT, bg=SCREEN_LIGHT) # açık tema
    put(a, CELL, col * CELL, 2 * CELL, EMERALD_DARK, bg=SCREEN_DARK) # koyu tema
    put(up, CELL, col * CELL, 3 * CELL, WHITE, bg=(0x3f, 0x3f, 0x46)) # 96px siluet

write_png(sys.argv[2], W, H, sheet)
print('sheet:', sys.argv[2], W, 'x', H)
