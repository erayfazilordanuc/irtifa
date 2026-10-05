"""Uygulama ikonlarını `assets/brand/ikon/` kaynağından üretir.

Kaynaklar:
  irtifa-icon-master.svg → zemin degradesi (stop-color'lar)
  irtifa-icon-mark.svg   → figür geometrisi (yalnızca M/L/Z poligonları).
                           `data-role="main"` yolu ana renk, `data-role="accent"`
                           yolu kendi `fill` rengiyle (vurgu) boyanır.

Figür, mark.svg'deki tam tuval yerleşiminin MARK_SCALE katı olarak ortalanır.
Tek renkli çıktılar (Android ön plan / monokrom, splash) iki yolun birleşimidir;
vurgu rengi yalnızca degrade zeminli tam ikonda görünür.
Degrade SVG ile birebir aynı: yukarıdan aşağı, piksel merkezinden örneklenir.

Kullanım:
    python3 tools/icon-forge/build_from_brand.py
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from draw import rasterize
from png import write_png

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
BRAND = os.path.join(ROOT, 'assets/brand/ikon')
ASSETS = os.path.join(ROOT, 'assets')

SIZE = 1024
MARK_SCALE = 0.62  # amblem boyutu — İrtifa'nın dar İ işareti için (Terakki'de 0.52)
# Splash görseli tam boy figür taşır; ekrandaki boyutu app.json → expo-splash-screen
# `imageWidth` belirler ve SplashOverlay aynı değeri kullanır.
SPLASH_SCALE = 1.0
WHITE = (255, 255, 255)


def _svg(name):
    s = open(os.path.join(BRAND, name), encoding='utf-8').read()
    return re.sub(r'<metadata>.*?</metadata>', '', s, flags=re.S)


def gradient_stops():
    found = re.findall(r'<stop offset="([\d.]+)" stop-color="#([0-9A-Fa-f]{6})"',
                       _svg('irtifa-icon-master.svg'))
    assert len(found) >= 2, 'master.svg içinde degrade durakları bulunamadı'
    return [(float(o), tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))) for o, c in found]


def grad_at(y, size, stops):
    t = (y + 0.5) / size
    for (o0, c0), (o1, c1) in zip(stops, stops[1:]):
        if t <= o1:
            break
    f = min(max((t - o0) / (o1 - o0), 0.0), 1.0)
    return tuple(round(c0[i] + (c1[i] - c0[i]) * f) for i in range(3))


def _paths():
    """mark.svg'deki yollar: [(rol, fill, transform, d), ...]."""
    s = _svg('irtifa-icon-mark.svg')
    found = []
    for tag in re.findall(r'<path\b[^>]*>', s):
        role = (re.search(r'data-role="([^"]+)"', tag) or [None, 'main'])[1]
        fill = (re.search(r'fill="#([0-9A-Fa-f]{6})"', tag) or [None, 'FFFFFF'])[1]
        tx, ty, k = map(float, re.search(
            r'translate\(([-\d.]+),([-\d.]+)\) scale\(([-\d.]+)\)', tag).groups())
        d = re.search(r' d="([^"]+)"', tag).group(1)
        assert set(re.findall(r'[A-Za-z]', d)) <= {'M', 'L', 'Z'}, 'yalnızca M/L/Z destekleniyor'
        found.append((role, tuple(int(fill[i:i + 2], 16) for i in (0, 2, 4)), (tx, ty, k), d))
    assert found, 'mark.svg içinde yol bulunamadı'
    return found


def mark_polys(size, scale, roles=('main', 'accent')):
    u = size / 1024
    polys = []
    for role, _fill, (tx, ty, k), d in _paths():
        if role not in roles:
            continue
        for sub in re.findall(r'M([^Z]+)Z', d):
            nums = list(map(float, re.findall(r'-?\d+(?:\.\d+)?', sub)))
            polys.append([((((x * k + tx) - 512) * scale + 512) * u,
                           (((y * k + ty) - 512) * scale + 512) * u)
                          for x, y in zip(nums[0::2], nums[1::2])])
    return polys


def accent_color():
    for role, fill, _t, _d in _paths():
        if role == 'accent':
            return fill
    return None


def compose(mask, fg, stops=None, accent=None):
    """stops yoksa şeffaf zemin; varsa degrade zemin üzerine figür.
    accent = (maske, renk) verilirse o bölge figürün üstüne vurgu rengiyle boyanır."""
    px = bytearray(SIZE * SIZE * 4)
    for y in range(SIZE):
        row = grad_at(y, SIZE, stops) if stops else None
        for x in range(SIZE):
            a = mask[y * SIZE + x]
            i = (y * SIZE + x) * 4
            if row is None:
                px[i:i + 3] = bytes(fg)
                px[i + 3] = a
            else:
                al = a / 255
                base = [row[c] * (1 - al) + fg[c] * al for c in range(3)]
                if accent is not None:
                    ac = accent[0][y * SIZE + x] / 255
                    base = [base[c] * (1 - ac) + accent[1][c] * ac for c in range(3)]
                for c in range(3):
                    px[i + c] = round(base[c])
                px[i + 3] = 255
    return px


FAVICON_SIZE = 48


def downscale(px, src, dst):
    """Alan ortalamasıyla küçültür: her hedef piksel, kapladığı kaynak
    piksellerin ortalamasıdır (bilinear küçültmede kenarlar tırtıklanır)."""
    out = bytearray(dst * dst * 4)
    edges = [round(i * src / dst) for i in range(dst + 1)]
    for y in range(dst):
        y0, y1 = edges[y], edges[y + 1]
        for x in range(dst):
            x0, x1 = edges[x], edges[x + 1]
            acc = [0, 0, 0, 0]
            for sy in range(y0, y1):
                row = sy * src
                for sx in range(x0, x1):
                    i = (row + sx) * 4
                    for c in range(4):
                        acc[c] += px[i + c]
            n = (y1 - y0) * (x1 - x0)
            out[(y * dst + x) * 4:(y * dst + x) * 4 + 4] = bytes(round(v / n) for v in acc)
    return out


def main():
    stops = gradient_stops()
    print('Degrade:', ' → '.join('#%02X%02X%02X' % c for _, c in stops))
    mask = rasterize(SIZE, mark_polys(SIZE, MARK_SCALE))
    accent = accent_color()
    accent_layer = (rasterize(SIZE, mark_polys(SIZE, MARK_SCALE, ('accent',))), accent) if accent else None
    icon = compose(mask, WHITE, stops, accent_layer)
    fg = compose(mask, WHITE)
    targets = [
        ('icon.png', icon),
        ('brand/app-icon.png', icon),
        ('android-icon-background.png', compose(bytes(SIZE * SIZE), WHITE, stops)),
        ('android-icon-foreground.png', fg),
        ('android-icon-monochrome.png', fg),
        ('splash-icon.png', compose(rasterize(SIZE, mark_polys(SIZE, SPLASH_SCALE)), WHITE)),
    ]
    for name, px in targets:
        write_png(os.path.join(ASSETS, name), SIZE, SIZE, px)
        print('  yazıldı: assets/' + name)

    # Web simgesi (app.json → web.favicon): icon.png'nin küçültülmüşü.
    write_png(os.path.join(ASSETS, 'favicon.png'), FAVICON_SIZE, FAVICON_SIZE,
              downscale(icon, SIZE, FAVICON_SIZE))
    print('  yazıldı: assets/favicon.png')


if __name__ == '__main__':
    main()
