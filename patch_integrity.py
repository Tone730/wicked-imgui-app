"""Update the embedded Windows ASAR integrity record after repacking app.asar.

Electron hashes the ASAR header JSON string and compares it with the value in
the executable's ``Integrity``/``ElectronAsar`` PE resource. Repacking the
archive changes that hash, so the resource must be rewritten after every build.
"""

from __future__ import annotations

import hashlib
import pathlib
import re
import struct
import sys

RECORD_RE = re.compile(
    rb'\[\{"file":"resources\\\\app\.asar","alg":"[^"]+","value":"'
    rb'([0-9a-f]{64})'
    rb'"\}\]'
)


def header_hash(asar: pathlib.Path) -> str:
    data = asar.read_bytes()
    if data[:4] != b"\x04\x00\x00\x00":
        raise SystemExit(f"unexpected ASAR header prefix in {asar}")
    json_size = struct.unpack("<I", data[12:16])[0]
    return hashlib.sha256(data[16 : 16 + json_size]).hexdigest()


def patch(exe: pathlib.Path, new_hash: str) -> None:
    data = exe.read_bytes()
    matches = list(RECORD_RE.finditer(data))
    if len(matches) != 1:
        raise SystemExit(f"expected one integrity record in {exe}, found {len(matches)}")
    match = matches[0]
    old_hash = match.group(1).decode("ascii")
    patched = (
        data[: match.start(1)] + new_hash.encode("ascii") + data[match.end(1) :]
    )
    exe.write_bytes(patched)
    print(f"patched {exe.name}: {old_hash} -> {new_hash}")


if __name__ == "__main__":
    root = pathlib.Path(__file__).resolve().parent
    asar = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / "dist/resources/app.asar"
    exe = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else root / "dist/Wicked ImGui Maker.exe"
    digest = header_hash(asar)
    patch(exe, digest)
