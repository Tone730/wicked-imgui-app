"""Repack the Wicked ImGui Maker source tree into an Electron ASAR archive.

Usage: python build_asar.py [source_dir] [output_asar] [unpacked_dir]

The source directory mirrors the original app.asar layout. Files under
``vendor/`` are marked ``unpacked`` and copied to ``unpacked_dir/vendor``.
All other files are packed into the ASAR. SHA-256 integrity metadata matching
Electron's ASAR format is generated for every file.
"""

from __future__ import annotations

import hashlib
import json
import pathlib
import shutil
import struct
import sys

BLOCK_SIZE = 4 * 1024 * 1024
ALIGN = 4


def integrity(raw: bytes) -> dict:
    blocks = [
        hashlib.sha256(raw[i : i + BLOCK_SIZE]).hexdigest()
        for i in range(0, len(raw), BLOCK_SIZE)
    ]
    if not blocks:
        blocks = [hashlib.sha256(b"").hexdigest()]
    return {
        "algorithm": "SHA256",
        "hash": hashlib.sha256(raw).hexdigest(),
        "blockSize": BLOCK_SIZE,
        "blocks": blocks,
    }


def pad4(data: bytearray) -> None:
    while len(data) % ALIGN:
        data.append(0)


def build(source: pathlib.Path, output: pathlib.Path, unpacked: pathlib.Path) -> None:
    root: dict = {"files": {}}
    payload = bytearray()
    seen: dict[tuple[int, str], int] = {}

    # Deterministic ordering: directories before files, then alphabetical.
    entries = sorted(source.rglob("*"), key=lambda p: (p.is_file(), p.relative_to(source).as_posix().lower()))

    for entry in entries:
        if entry.is_symlink():
            raise RuntimeError(f"Symlinks are not supported: {entry}")
        rel = entry.relative_to(source).as_posix()
        parts = rel.split("/")
        node = root
        for part in parts[:-1]:
            child = node["files"].setdefault(part, {"files": {}})
            if "files" not in child:
                raise RuntimeError(f"File/directory conflict at {rel}")
            node = child

        name = parts[-1]
        if entry.is_dir():
            meta = node["files"].setdefault(name, {"files": {}})
            if "files" not in meta:
                raise RuntimeError(f"File/directory conflict at {rel}")
            if rel == "vendor" or rel.startswith("vendor/"):
                meta["unpacked"] = True
            continue

        raw = entry.read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        meta = {"size": len(raw), "integrity": integrity(raw)}
        if rel == "vendor" or rel.startswith("vendor/"):
            meta["unpacked"] = True
            dest = unpacked / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(raw)
        else:
            key = (len(raw), digest)
            offset = seen.get(key)
            if offset is None:
                pad4(payload)
                offset = len(payload)
                payload.extend(raw)
                seen[key] = offset
            meta["offset"] = str(offset)
        node["files"][name] = meta

    json_bytes = json.dumps(root, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    padded_json = json_bytes + b"\0" * ((-len(json_bytes)) % ALIGN)
    string_pickle = struct.pack("<I", len(padded_json) + 4) + struct.pack("<I", len(json_bytes)) + padded_json
    header_pickle = struct.pack("<I", 4) + struct.pack("<I", len(string_pickle)) + string_pickle

    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("wb") as fh:
        fh.write(header_pickle)
        fh.write(payload)

    print(f"packed {len(entries)} entries, header {len(header_pickle)} bytes, payload {len(payload)} bytes")
    print(f"wrote {output}")


if __name__ == "__main__":
    src = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "app")
    out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else "dist/resources/app.asar")
    unp = pathlib.Path(sys.argv[3] if len(sys.argv) > 3 else "dist/resources/app.asar.unpacked")
    if unp.exists():
        shutil.rmtree(unp)
    unp.mkdir(parents=True, exist_ok=True)
    build(src, out, unp)
