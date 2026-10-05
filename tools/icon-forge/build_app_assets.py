import os
import sys

# Eski "Kademe" figürünü çizer; çalıştırılırsa güncel ikonları ezer.
# Güncel ikonlar: python3 tools/icon-forge/build_from_brand.py
if '--eski-kademe' not in sys.argv:
    sys.exit("Bu betik eski 'Kademe' ikonlarını üretir. Güncel ikonlar için:\n"
             "  python3 tools/icon-forge/build_from_brand.py\n"
             "Yine de çalıştırmak için: --eski-kademe")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from draw import rasterize
from png import write_png
from marks import (
    kademe,
    EMERALD_LIGHT,
    ICON_GRADIENT,
)

WHITE = (255, 255, 255)
ASSETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../assets'))

def grad_at(y, size, stops):
    p = y / max(size - 1, 1) * (len(stops) - 1)
    i = min(int(p), len(stops) - 2)
    f = p - i
    a, b = stops[i], stops[i + 1]
    return tuple(int(a[c] + (b[c] - a[c]) * f) for c in range(3))

def render(size, fg, bg=None, grad=None, scale=1.0):
    inner = int(size * scale)
    polys, holes = kademe(inner)
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
            if row is None:  # şeffaf zemin
                px[i:i + 3] = bytes(fg)
                px[i + 3] = a
            else:
                al = a / 255
                for c in range(3):
                    px[i + c] = int(row[c] * (1 - al) + fg[c] * al)
                px[i + 3] = 255
    return px

print("Generating app assets for assets/ root...")

# 1. Main app icon (1024x1024) - Gradient background, white mark
write_png(os.path.join(ASSETS_DIR, 'icon.png'), 1024, 1024, render(1024, WHITE, grad=ICON_GRADIENT))

# 2. Splash screen icon (1024x1024) - Transparent background, emerald mark
write_png(os.path.join(ASSETS_DIR, 'splash-icon.png'), 1024, 1024, render(1024, EMERALD_LIGHT, scale=0.75))

# 3. Android adaptive icon foreground (1024x1024) - Transparent background, white mark with safe area padding
write_png(os.path.join(ASSETS_DIR, 'android-icon-foreground.png'), 1024, 1024, render(1024, WHITE, scale=0.72))

# 4. Android adaptive icon monochrome (1024x1024) - Transparent background, white mark
write_png(os.path.join(ASSETS_DIR, 'android-icon-monochrome.png'), 1024, 1024, render(1024, WHITE, scale=0.72))

# 5. Notification icon (96x96) - Transparent background, white mark
write_png(os.path.join(ASSETS_DIR, 'notification-icon.png'), 96, 96, render(96, WHITE))

# 6. Favicon (48x48) - 48x48 icon
write_png(os.path.join(ASSETS_DIR, 'favicon.png'), 48, 48, render(48, WHITE, grad=ICON_GRADIENT))

print("Assets successfully generated!")
