"""Terakki logo adayları — yeşil kimlik.

Ortak kısıtlar:
  · Figür 512'lik tuvalin orta ~%78'ine sığar (adaptive icon güvenli alanı).
  · En fazla üç temel şekil. İnce çizgi yok; 96px'te siluet olarak ayakta kalır.
  · Anlam: kişisel gelişim + kariyer + "aydın" (ışık) — tek fikirde toplanır,
    figür yığmadan.
"""
from draw import circle, rrect, thick_line


def _module(x, y, size, r, u):
    return rrect(x * u, y * u, size * u, size * u, r * u)


def _outline(x, y, size, r, u, wall=22):
    """Dolu değil, çerçeve modül: dış kare eksi iç kare."""
    return (_module(x, y, size, r, u),
            _module(x + wall, y + wall, size - 2 * wall, max(r - wall, 6), u))


def kademe(S):
    """A — Kademe.

    Eşit modüller sabit adımla yükseliyor; sonuncusu boş.

    Düzen  → modüller birebir aynı, aralık sabit.
    Sistem → yerleşim serbest değil, tek bir adım kuralına uyuyor.
    Yükselme → çapraz.
    Gelişme → dizinin açık ucu; şekil "bitti" demiyor.
    """
    u = S / 512.0
    m, dx, dy, x0, y0 = 96, 104, 84, 48, 344
    filled = [_module(x0 + dx * i, y0 - dy * i, m, 26, u) for i in range(3)]
    outer, inner = _outline(x0 + dx * 3, y0 - dy * 3, m, 26, u)
    return filled + [outer], [inner]


def kademe_buyuyen(S):
    """B — Kademe (büyüyen).

    Aynı ritim, ama modüller yükseldikçe büyüyor. Düzenden bir miktar feragat
    edip gelişmeyi öne alıyor: yalnızca ilerlemiyorsun, kapasiten de artıyor.
    """
    u = S / 512.0
    spec = [(104, 380, 72), (196, 296, 84), (292, 208, 96)]
    filled = [_module(cx - s / 2, cy - s / 2, s, s * 0.27, u) for cx, cy, s in spec]
    ox, oy, os_ = 388, 116, 108
    outer, inner = _outline(ox - os_ / 2, oy - os_ / 2, os_, os_ * 0.27, u, wall=24)
    return filled + [outer], [inner]


def ag(S):
    """C — Ağ.

    Birbirine bağlı düğümler yükselen bir hat üzerinde. Sistem en yalın hâliyle
    budur: düğümler ve aralarındaki bağ. Düğümler büyüyerek gidiyor — ilerledikçe
    kapasite artıyor.
    """
    u = S / 512.0
    nodes = [(106, 386, 38), (256, 268, 50), (406, 140, 62)]
    links = [thick_line((nodes[i][0] * u, nodes[i][1] * u),
                        (nodes[i + 1][0] * u, nodes[i + 1][1] * u), 30 * u)
             for i in range(len(nodes) - 1)]
    return links + [circle(cx * u, cy * u, r * u) for cx, cy, r in nodes], []


MARKS = [
    ('A', 'Kademe', kademe),
    ('B', 'Kademe büyüyen', kademe_buyuyen),
    ('C', 'Ağ', ag),
]

# — Kimlik renkleri (kaynak: src/components/AppUI.tsx + ScreenBackground.tsx) —
EMERALD_LIGHT = (0x05, 0x96, 0x69)   # toneColor('emerald', true)
EMERALD_DARK = (0x34, 0xd3, 0x99)    # toneColor('emerald', false)
# Uygulama ikonu gradienti: profil ekranıyla aynı yön — üstte açık, altta derin.
ICON_GRADIENT = [(0x10, 0xb9, 0x81), (0x05, 0x96, 0x69), (0x04, 0x78, 0x57)]
SCREEN_LIGHT = (0xf6, 0xfd, 0xf9)    # profil gradientinin orta durağı
SCREEN_DARK = (0x12, 0x12, 0x14)
