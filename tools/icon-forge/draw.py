"""Küçük anti-aliased poligon rasterleyici.

Supersample yok; scanline ile 4x çözünürlükte doldurup kutu-örnekleme ile
indiriyoruz. Yalnızca poligon var — yuvarlak köşeler ve daireler de
poligon olarak üretiliyor.
"""
import math

SS = 4  # supersample faktörü


def _fill(w, h, polys):
    """polys: [[(x,y), ...], ...] — nonzero winding. w,h zaten 4x."""
    cov = bytearray(w * h)
    edges = []
    for poly in polys:
        # Sarım yönünü tekdüze yap. Aksi hâlde ters saran iki poligonun
        # çakıştığı bölgede nonzero kuralı 0 verip şeklin içini deliyor
        # (ok gövdesi ok başının içinde delik açıyordu).
        area = sum(poly[i][0] * poly[(i + 1) % len(poly)][1]
                   - poly[(i + 1) % len(poly)][0] * poly[i][1]
                   for i in range(len(poly)))
        if area < 0:
            poly = poly[::-1]
        n = len(poly)
        for i in range(n):
            x0, y0 = poly[i]
            x1, y1 = poly[(i + 1) % n]
            if y0 == y1:
                continue
            edges.append((y0, y1, x0, x1))
    if not edges:
        return cov
    ymin = max(0, int(math.floor(min(min(e[0], e[1]) for e in edges))))
    ymax = min(h - 1, int(math.ceil(max(max(e[0], e[1]) for e in edges))))
    for y in range(ymin, ymax + 1):
        yc = y + 0.5
        xs = []
        for y0, y1, x0, x1 in edges:
            if (y0 <= yc < y1) or (y1 <= yc < y0):
                t = (yc - y0) / (y1 - y0)
                xs.append((x0 + t * (x1 - x0), 1 if y1 > y0 else -1))
        if not xs:
            continue
        xs.sort()
        wind = 0
        row = y * w
        for i in range(len(xs) - 1):
            wind += xs[i][1]
            if wind != 0:
                xa = max(0, int(math.ceil(xs[i][0] - 0.5)))
                xb = min(w - 1, int(math.floor(xs[i + 1][0] - 0.5)))
                for x in range(xa, xb + 1):
                    cov[row + x] = 1
    return cov


def rasterize(size, polys, holes=()):
    """size: çıktı kenarı (px). polys: 0..size koordinatlarında. -> alfa bytearray.

    `holes` verilirse o şekiller doldurulandan çıkarılır. Ayrı bir geçişle
    yapılıyor; nonzero sarımla delik açmaya çalışmak, şekiller çakıştığında
    öngörülemez sonuç veriyor.
    """
    w = h = size * SS
    cov = _fill(w, h, [[(x * SS, y * SS) for x, y in p] for p in polys])
    if holes:
        neg = _fill(w, h, [[(x * SS, y * SS) for x, y in p] for p in holes])
        for i in range(w * h):
            if neg[i]:
                cov[i] = 0
    alpha = bytearray(size * size)
    area = SS * SS
    for y in range(size):
        for x in range(size):
            s = 0
            for dy in range(SS):
                row = (y * SS + dy) * w + x * SS
                for dx in range(SS):
                    s += cov[row + dx]
            alpha[y * size + x] = (s * 255) // area
    return alpha


# ---- şekil üreticileri ----

def rrect(x, y, w, h, r, seg=8):
    """Yuvarlak köşeli dikdörtgen poligonu."""
    r = min(r, w / 2, h / 2)
    pts = []
    corners = [
        (x + w - r, y + h - r, 0),
        (x + r,     y + h - r, 90),
        (x + r,     y + r,     180),
        (x + w - r, y + r,     270),
    ]
    for cx, cy, a0 in corners:
        for i in range(seg + 1):
            a = math.radians(a0 + 90 * i / seg)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def circle(cx, cy, r, seg=64):
    return [(cx + r * math.cos(2 * math.pi * i / seg),
             cy + r * math.sin(2 * math.pi * i / seg)) for i in range(seg)]


def thick_line(p0, p1, width, cap_round=True, seg=10):
    """Kalın çizgi; uçları yuvarlak."""
    (x0, y0), (x1, y1) = p0, p1
    dx, dy = x1 - x0, y1 - y0
    L = math.hypot(dx, dy)
    ux, uy = dx / L, dy / L
    nx, ny = -uy, ux
    hw = width / 2
    pts = []
    if cap_round:
        a0 = math.atan2(ny, nx)
        for i in range(seg + 1):  # p1 ucu
            a = a0 - math.pi * i / seg
            pts.append((x1 + hw * math.cos(a), y1 + hw * math.sin(a)))
        for i in range(seg + 1):  # p0 ucu
            a = a0 + math.pi - math.pi * i / seg
            pts.append((x0 + hw * math.cos(a), y0 + hw * math.sin(a)))
    else:
        pts = [(x0 + nx * hw, y0 + ny * hw), (x1 + nx * hw, y1 + ny * hw),
               (x1 - nx * hw, y1 - ny * hw), (x0 - nx * hw, y0 - ny * hw)]
    return pts


def chevron(cx, cy, half_w, rise, thick):
    """Yukarı bakan kalın chevron (^). cx,cy = tepe noktası."""
    t = thick
    return [
        (cx - half_w, cy + rise),
        (cx - half_w + t * 0.85, cy + rise - t * 0.1),
        (cx, cy + t * 0.75),
        (cx + half_w - t * 0.85, cy + rise - t * 0.1),
        (cx + half_w, cy + rise),
        (cx + half_w - t, cy + rise + t * 0.62),
        (cx, cy + t * 1.5),
        (cx - half_w + t, cy + rise + t * 0.62),
    ]


def arrow_head(tip, direction, length, half_w):
    """Yöne hizalı üçgen ok başı. direction: (dx,dy) birim olmayabilir."""
    dx, dy = direction
    L = math.hypot(dx, dy)
    ux, uy = dx / L, dy / L
    nx, ny = -uy, ux
    bx, by = tip[0] - ux * length, tip[1] - uy * length
    return [tip,
            (bx + nx * half_w, by + ny * half_w),
            (bx - nx * half_w, by - ny * half_w)]


def half_disc(cx, cy, r, seg=72):
    """Üst yarım daire; düz kenarı (cx,cy) hizasında."""
    pts = [(cx + r * math.cos(math.pi + math.pi * i / seg),
            cy + r * math.sin(math.pi + math.pi * i / seg)) for i in range(seg + 1)]
    return pts


def arc(cx, cy, r, a0, a1, thick, round_caps=True, seg=64):
    """Kalınlığı olan yay. a0/a1 derece, saat yönünün tersi."""
    ro, ri = r + thick / 2, r - thick / 2
    A0, A1 = math.radians(a0), math.radians(a1)
    pts = [(cx + ro * math.cos(A0 + (A1 - A0) * i / seg),
            cy + ro * math.sin(A0 + (A1 - A0) * i / seg)) for i in range(seg + 1)]
    if round_caps:
        ec = (cx + r * math.cos(A1), cy + r * math.sin(A1))
        base = A1 - math.pi / 2 if A1 > A0 else A1 + math.pi / 2
        for i in range(seg // 4 + 1):
            a = base - math.pi * i / (seg // 4)
            pts.append((ec[0] + thick / 2 * math.cos(a), ec[1] + thick / 2 * math.sin(a)))
    pts += [(cx + ri * math.cos(A1 + (A0 - A1) * i / seg),
             cy + ri * math.sin(A1 + (A0 - A1) * i / seg)) for i in range(seg + 1)]
    if round_caps:
        sc = (cx + r * math.cos(A0), cy + r * math.sin(A0))
        base = A0 + math.pi / 2 if A1 > A0 else A0 - math.pi / 2
        for i in range(seg // 4 + 1):
            a = base - math.pi * i / (seg // 4)
            pts.append((sc[0] + thick / 2 * math.cos(a), sc[1] + thick / 2 * math.sin(a)))
    return pts


def bez(*ctrl, seg=24):
    """Bezier eğrisi üzerinde nokta listesi. 3 nokta = quadratic, 4 = cubic."""
    n = len(ctrl) - 1
    out = []
    for i in range(seg + 1):
        t = i / seg
        x = y = 0.0
        for k, (px, py) in enumerate(ctrl):
            b = math.comb(n, k) * (t ** k) * ((1 - t) ** (n - k))
            x += px * b
            y += py * b
        out.append((x, y))
    return out
