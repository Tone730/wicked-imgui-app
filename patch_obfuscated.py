"""Patch decoded strings inside the app's obfuscated JavaScript modules.

The obfuscator stores strings as custom-base64 + RC4 and rotates the array at
startup until a checksum matches. This tool decodes the final rotated array,
applies literal replacements, re-encodes with the same per-entry key, writes
values back to their original array slots, and leaves rotation untouched.

Usage:
  python patch_obfuscated.py <file> <replacements.json>
"""

from __future__ import annotations

import json
import math
import pathlib
import re
import sys
import urllib.parse

ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/'


def b64decode(s: str) -> bytes:
    out = bytearray()
    acc = 0
    bits = 0
    for ch in s:
        idx = ALPHABET.find(ch)
        if idx < 0:
            continue
        acc = (acc << 6) | idx
        bits += 6
        if bits >= 8:
            bits -= 8
            out.append((acc >> bits) & 0xFF)
    return bytes(out)


def b64encode(data: bytes) -> str:
    out = []
    acc = 0
    bits = 0
    for b in data:
        acc = (acc << 8) | b
        bits += 8
        while bits >= 6:
            bits -= 6
            out.append(ALPHABET[(acc >> bits) & 0x3F])
    if bits:
        out.append(ALPHABET[(acc << (6 - bits)) & 0x3F])
    return ''.join(out)


def rc4(text: str, key: str) -> str:
    if not key:
        return text
    S = list(range(256))
    j = 0
    for i in range(256):
        j = (j + S[i] + ord(key[i % len(key)])) % 256
        S[i], S[j] = S[j], S[i]
    i = j = 0
    out = []
    for ch in text:
        i = (i + 1) % 256
        j = (j + S[i]) % 256
        S[i], S[j] = S[j], S[i]
        out.append(chr(ord(ch) ^ S[(S[i] + S[j]) % 256]))
    return ''.join(out)


def decode_entry(raw: bytes, key) -> str:
    codes = b64decode(raw.decode('latin1'))
    pct = ''.join(f'%{b:02X}' for b in codes)
    text = urllib.parse.unquote(pct, encoding='utf-8', errors='replace')
    return rc4(text, str(key))


def encode_entry(text: str, key) -> bytes:
    enc = rc4(text, str(key))
    pct = ''.join(f'%{b:02X}' for b in enc.encode('utf-8'))
    return b64encode(pct.encode('ascii')).encode('ascii')


def js_parse_int(s):
    m = re.match(r'\s*([+-]?)(0[xX][0-9a-fA-F]+|\d+)', str(s))
    if not m:
        return math.nan
    sign = -1 if m.group(1) == '-' else 1
    num = m.group(2)
    return sign * (int(num, 16) if num.lower().startswith('0x') else int(num, 10))


SAFE_EXPR = re.compile(r'^[\s\dA-Fa-fxXK+\-*/().]+$')


def safe_expr(expr: str, X, K):
    expr = expr.strip()
    if not SAFE_EXPR.match(expr):
        raise ValueError(f'unsafe expression: {expr}')
    return eval(expr, {'__builtins__': {}}, {'X': X, 'K': K})


def printable_score(s: str) -> int:
    score = 0
    for ch in s:
        o = ord(ch)
        if 32 <= o < 127 or o in (9, 10, 13) or o >= 160:
            score += 1
        else:
            score -= 10
    return score - len(s) * 0


def patch(path: pathlib.Path, replacements: list[tuple[str, str]]) -> None:
    text = path.read_text(encoding='utf-8')

    m_arr = re.search(
        r'function\s+p\s*\(\s*\)\s*\{\s*const\s+\w+\s*=\s*\[(.*?)\]\s*;\s*p\s*=\s*function',
        text,
        re.S,
    )
    if not m_arr:
        raise RuntimeError(f'{path}: string array not found')
    arr_span = m_arr.span(1)
    raw_items = re.findall(r"'((?:\\.|[^'])*)'", m_arr.group(1), re.S)
    if not raw_items:
        raise RuntimeError(f'{path}: no string entries')
    arr = [s.replace('\\x20', ' ').replace("\\'", "'").replace('\\\\', '\\').encode('latin1') for s in raw_items]

    m_y = re.search(
        r'function\s+y\s*\(\s*X\s*,\s*K\s*\)\s*\{\s*X\s*=\s*X\s*-\s*(0x[0-9a-f]+|\d+)',
        text,
    )
    if not m_y:
        raise RuntimeError(f'{path}: decoder offset not found')
    y_sub = int(m_y.group(1), 0)

    m_target = re.search(r'\}\s*\(\s*p\s*,\s*(0x[0-9a-f]+|\d+)\s*\)\s*\)?\s*;?', text)
    if not m_target:
        raise RuntimeError(f'{path}: checksum target not found')
    target_span = m_target.span(1)
    target = int(m_target.group(1), 0)

    m_check = re.search(
        r'const\s+(\w+)\s*=\s*(.*?)\s*;\s*if\s*\(\s*\1\s*===\s*(\w+)\s*\)\s*break',
        text,
    )
    if not m_check:
        raise RuntimeError(f'{path}: checksum expression not found')
    expr = m_check.group(2)

    helpers: dict[str, tuple[str, str]] = {}
    for m in re.finditer(
        r'function\s+(\w+)\s*\(\s*X\s*,\s*K\s*\)\s*\{\s*return\s+y\s*\(\s*(.*?)\s*,\s*(.*?)\s*\)\s*;?\s*\}',
        text,
    ):
        helpers[m.group(1)] = (m.group(2), m.group(3))

    def rotate_calc(V):
        def y_lookup(X, K):
            try:
                idx = X - y_sub
            except Exception:
                return None
            if not 0 <= idx < len(V):
                return None
            try:
                return decode_entry(V[idx], K)
            except Exception:
                return None

        env = {'parseInt': js_parse_int, 'Math': math, 'String': str}
        for name, (arg1, arg2) in helpers.items():
            def make_helper(a1, a2):
                return lambda X, K: y_lookup(safe_expr(a1, X, K), safe_expr(a2, X, K))
            env[name] = make_helper(arg1, arg2)
        try:
            return eval(expr, {'__builtins__': {}}, env)
        except Exception:
            return math.nan

    V = arr[:]
    rotation = None
    debug = bool(__import__('os').environ.get('WICKED_PATCH_DEBUG'))
    if debug:
        print('DEBUG', path.name, 'target', hex(target), 'expr', expr[:120], 'helpers', list(helpers))
    for i in range(len(V)):
        if rotate_calc(V) == target:
            rotation = i
            break
        V.append(V.pop(0))
    if rotation is None:
        raise RuntimeError(f'{path}: rotation did not converge')

    # Map each array index to the RC4 key(s) used by call sites.
    index_keys: dict[int, list[str]] = {}
    all_keys: list[str] = []
    for name, (arg1_expr, arg2_expr) in helpers.items():
        key_pos = 1 if arg2_expr.strip() == 'K' else 0
        for call in re.finditer(r'\b' + re.escape(name) + r'\s*\(\s*([^(),]+)\s*,\s*([^(),]+)\s*\)', text):
            args = [call.group(1).strip(), call.group(2).strip()]
            km = re.match(r"['\"]([^'\"]+)['\"]", args[key_pos])
            if not km:
                continue
            key = km.group(1)
            if key not in all_keys:
                all_keys.append(key)
            try:
                idx = int(safe_expr(arg1_expr, args[0], args[1]) - y_sub)
            except Exception:
                continue
            index_keys.setdefault(idx, [])
            if key not in index_keys[idx]:
                index_keys[idx].append(key)
    all_keys.sort(key=len, reverse=True)

    decoded = []
    used_keys = []
    for final_idx, raw in enumerate(V):
        best = None
        best_score = -10**9
        keys = index_keys.get(final_idx + y_sub, all_keys)
        for key in keys:
            try:
                val = decode_entry(raw, key)
            except Exception:
                continue
            score = printable_score(val)
            if score > best_score:
                best_score = score
                best = (val, key)
        if best is None:
            best = (V and decode_entry(raw, '') or '', '')
        decoded.append(best[0])
        used_keys.append(best[1])

    changed = 0
    patched = []
    for value in decoded:
        new = value
        for old, replacement in replacements:
            if old in new:
                new = new.replace(old, replacement)
                changed += 1
        patched.append(new)

    original = [None] * len(arr)
    for final_idx, value in enumerate(patched):
        original[(final_idx + rotation) % len(arr)] = encode_entry(value, used_keys[final_idx])

    new_items = ','.join("'" + item.decode('latin1').replace('\\', '\\\\').replace("'", "\\'") + "'" for item in original)
    new_target = rotate_calc(original)
    if not isinstance(new_target, (int, float)) or not math.isfinite(new_target):
        raise RuntimeError(f'{path}: new checksum is not finite')
    new_target_int = int(new_target)
    text = text[:arr_span[0]] + new_items + text[arr_span[1]:]
    text = text[:target_span[0]] + hex(new_target_int) + text[target_span[1]:]
    path.write_text(text, encoding='utf-8')

    # Verify rotation still converges (strings are re-encoded with matching keys).
    check = path.read_text(encoding='utf-8')
    m_arr2 = re.search(
        r'function\s+p\s*\(\s*\)\s*\{\s*const\s+\w+\s*=\s*\[(.*?)\]\s*;\s*p\s*=\s*function',
        check,
        re.S,
    )
    raw2 = re.findall(r"'((?:\\.|[^'])*)'", m_arr2.group(1), re.S)
    arr2 = [s.replace('\\x20', ' ').replace("\\'", "'").replace('\\\\', '\\').encode('latin1') for s in raw2]

    def rotate_calc2(V):
        def y_lookup(X, K):
            try:
                idx = X - y_sub
            except Exception:
                return None
            if not 0 <= idx < len(V):
                return None
            try:
                return decode_entry(V[idx], K)
            except Exception:
                return None
        env = {'parseInt': js_parse_int, 'Math': math, 'String': str}
        for name, (arg1, arg2) in helpers.items():
            def make_helper(a1, a2):
                return lambda X, K: y_lookup(safe_expr(a1, X, K), safe_expr(a2, X, K))
            env[name] = make_helper(arg1, arg2)
        try:
            return eval(expr, {'__builtins__': {}}, env)
        except Exception:
            return math.nan

    V2 = arr2[:]
    ok = False
    for _ in range(len(V2)):
        if rotate_calc2(V2) == new_target_int:
            ok = True
            break
        V2.append(V2.pop(0))
    if not ok:
        raise RuntimeError(f'{path}: verification failed')
    print(f'{path.name}: changed {changed} strings (rotation {rotation})')


if __name__ == '__main__':
    src = pathlib.Path(sys.argv[1])
    reps = json.loads(pathlib.Path(sys.argv[2]).read_text(encoding='utf-8'))
    patch(src, [(k, v) for k, v in reps.items()])
