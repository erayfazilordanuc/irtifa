import zlib, struct

def read_png(path):
    d = open(path,'rb').read()
    assert d[:8] == b'\x89PNG\r\n\x1a\n', 'not png'
    pos, idat, pal, trns = 8, b'', None, None
    w=h=bd=ct=0
    while pos < len(d):
        ln = struct.unpack('>I', d[pos:pos+4])[0]
        typ = d[pos+4:pos+8]
        data = d[pos+8:pos+8+ln]
        if typ == b'IHDR':
            w,h,bd,ct,_,_,il = struct.unpack('>IIBBBBB', data)
            assert il == 0, 'interlaced unsupported'
        elif typ == b'IDAT': idat += data
        elif typ == b'PLTE': pal = data
        elif typ == b'tRNS': trns = data
        elif typ == b'IEND': break
        pos += 12 + ln
    assert bd == 8, f'bit depth {bd} unsupported'
    ch = {0:1, 2:3, 3:1, 4:2, 6:4}[ct]
    raw = zlib.decompress(idat)
    stride = w*ch
    out = bytearray(h*stride)
    prev = bytearray(stride)
    p = 0
    for y in range(h):
        f = raw[p]; p += 1
        line = bytearray(raw[p:p+stride]); p += stride
        if f == 1:
            for i in range(ch, stride): line[i] = (line[i] + line[i-ch]) & 255
        elif f == 2:
            for i in range(stride): line[i] = (line[i] + prev[i]) & 255
        elif f == 3:
            for i in range(stride):
                a = line[i-ch] if i >= ch else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 255
        elif f == 4:
            for i in range(stride):
                a = line[i-ch] if i >= ch else 0
                c = prev[i-ch] if i >= ch else 0
                b = prev[i]
                pa, pb, pc = abs(b-c), abs(a-c), abs(a+b-2*c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pr) & 255
        out[y*stride:(y+1)*stride] = line
        prev = line
    # normalize to RGBA
    px = bytearray(w*h*4)
    for i in range(w*h):
        s = i*ch
        if ct == 6:   r,g,b,a = out[s],out[s+1],out[s+2],out[s+3]
        elif ct == 2: r,g,b,a = out[s],out[s+1],out[s+2],255
        elif ct == 0: r=g=b=out[s]; a=255
        elif ct == 4: r=g=b=out[s]; a=out[s+1]
        else:
            idx = out[s]; r,g,b = pal[idx*3],pal[idx*3+1],pal[idx*3+2]
            a = trns[idx] if trns and idx < len(trns) else 255
        px[i*4:i*4+4] = bytes((r,g,b,a))
    return w, h, px

def write_png(path, w, h, px):
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        raw += px[y*w*4:(y+1)*w*4]
    def chunk(t, d):
        c = t + d
        return struct.pack('>I', len(d)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    out = b'\x89PNG\r\n\x1a\n'
    out += chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
    out += chunk(b'IDAT', zlib.compress(bytes(raw), 9))
    out += chunk(b'IEND', b'')
    open(path,'wb').write(out)
