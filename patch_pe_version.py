"""Set honest Wicked version metadata in the packaged PE files.

The extracted Electron runtime still carries the original vendor's version
resource. This script rewrites the RT_VERSION blob in place and updates the
resource data-entry size. The version is read from app/package.json so the PE
strings and numeric fields always match the packaged application version.
It is called by build.ps1 so every rebuild is rebranded, not just the current
dist folder.
"""

from __future__ import annotations

import json
import pathlib
import struct
import sys

ROOT = pathlib.Path(__file__).resolve().parent
VERSION = json.loads((ROOT / "app" / "package.json").read_text(encoding="utf-8"))["version"]
_major, _minor, *_rest = (int(part) for part in VERSION.split("."))
FIXED_MS = (_major << 16) | (_minor & 0xFFFF)
FIXED_LS = ((_rest[0] if _rest else 0) & 0xFFFF) << 16

TARGETS = {
    "Wicked ImGui Maker.exe": [
        ("CompanyName", "Wicked"),
        ("FileDescription", "Wicked ImGui"),
        ("FileVersion", VERSION),
        ("InternalName", "Wicked"),
        ("LegalCopyright", "Copyright © 2026 Wicked"),
        ("OriginalFilename", "Wicked.exe"),
        ("ProductName", "Wicked"),
        ("ProductVersion", VERSION),
    ],
    "WickedUpdate.exe": [
        ("CompanyName", "Wicked"),
        ("FileDescription", "Wicked Update"),
        ("FileVersion", VERSION),
        ("InternalName", "WickedUpdate"),
        ("LegalCopyright", "© 2026 Wicked"),
        ("OriginalFilename", "WickedUpdate.exe"),
        ("ProductName", "Wicked"),
        ("ProductVersion", VERSION),
    ],
}


def pad4(data: bytes) -> bytes:
    return data + b"\0" * ((-len(data)) % 4)


def wstr(value: str) -> bytes:
    return value.encode("utf-16le") + b"\0\0"


def string_entry(name: str, value: str) -> bytes:
    key = wstr(name)
    val = wstr(value)
    body = pad4(struct.pack("<HHH", 0, len(val) // 2, 1) + key) + pad4(val)
    return struct.pack("<H", len(body)) + body[2:]


def build_version_blob(prefix: bytes, fields: list[tuple[str, str]], varinfo: bytes) -> bytes:
    entries = b"".join(string_entry(k, v) for k, v in fields)
    table_body = pad4(struct.pack("<HHH", 0, 0, 1) + wstr("040904b0") + entries)
    table = struct.pack("<H", len(table_body)) + table_body[2:]
    sfi_body = pad4(struct.pack("<HHH", 0, 0, 1) + wstr("StringFileInfo") + table + varinfo)
    sfi = struct.pack("<H", len(sfi_body)) + sfi_body[2:]
    blob = pad4(prefix + sfi)
    return struct.pack("<H", len(blob)) + blob[2:]


def parse_pe(data: bytes) -> tuple[list[tuple[int, int, int, int, str]], int, int]:
    pe = struct.unpack_from("<I", data, 0x3C)[0]
    if data[pe : pe + 4] != b"PE\0\0":
        raise ValueError("not a PE file")
    section_count = struct.unpack_from("<H", data, pe + 6)[0]
    optional_size = struct.unpack_from("<H", data, pe + 20)[0]
    section_base = pe + 24 + optional_size
    sections = []
    for i in range(section_count):
        off = section_base + 40 * i
        name = data[off : off + 8].rstrip(b"\0").decode("ascii", "replace")
        virtual_size, virtual_address, raw_size, raw_pointer = struct.unpack_from("<IIII", data, off + 8)
        sections.append((virtual_address, virtual_size, raw_pointer, raw_size, name))
    # PE32+ optional header data directories start at optional+112; resource is index 2.
    resource_rva, resource_size = struct.unpack_from("<II", data, pe + 24 + 112 + 16)
    return sections, resource_rva, resource_size


def rva_to_offset(sections, rva: int) -> tuple[int, int]:
    for virtual_address, virtual_size, raw_pointer, raw_size, _ in sections:
        span = max(virtual_size, raw_size)
        if virtual_address <= rva < virtual_address + span:
            delta = rva - virtual_address
            return raw_pointer + delta, raw_pointer + raw_size - delta
    raise ValueError(f"RVA 0x{rva:x} is outside every section")


def section_virtual_remaining(sections, rva: int) -> int:
    for virtual_address, virtual_size, _, _, _ in sections:
        if virtual_address <= rva < virtual_address + virtual_size:
            return virtual_address + virtual_size - rva
    raise ValueError(f"RVA 0x{rva:x} is outside every section virtual range")


def walk_directory(data: bytes, sections, resource_rva: int, directory_offset: int, path: list[int]) -> list[int]:
    """Return file offsets of data entries below a numeric resource path.

    Directory and leaf pointers in a PE resource tree are offsets from the
    start of the resource directory, not RVAs.
    """
    file_offset, _ = rva_to_offset(sections, resource_rva + directory_offset)
    named, ids = struct.unpack_from("<HH", data, file_offset + 12)
    results: list[int] = []
    for i in range(named + ids):
        entry_off = file_offset + 16 + 8 * i
        name, target = struct.unpack_from("<II", data, entry_off)
        is_dir = bool(target & 0x80000000)
        child_offset = target & 0x7FFFFFFF
        if path:
            if name != path[0]:
                continue
            if is_dir:
                results.extend(walk_directory(data, sections, resource_rva, child_offset, path[1:]))
            elif not path[1:]:
                results.append(rva_to_offset(sections, resource_rva + child_offset)[0])
        elif is_dir:
            results.extend(walk_directory(data, sections, resource_rva, child_offset, []))
        else:
            results.append(rva_to_offset(sections, resource_rva + child_offset)[0])
    return results


def collect_data_entries(data: bytes, sections, resource_rva: int) -> list[tuple[int, int]]:
    """Return every leaf payload (offset, size) in the PE resource tree.

    Resources are a three-level tree (type -> name -> language). A two-level
    walk misses the language level, which makes the next-payload calculation
    think there is free space after RT_VERSION when RT_MANIFEST actually starts
    immediately after it. Writing an enlarged version blob into that space
    corrupts the embedded application manifest and breaks Windows activation.
    """
    root, _ = rva_to_offset(sections, resource_rva)
    entries: list[tuple[int, int]] = []

    def visit(directory: int) -> None:
        named, ids = struct.unpack_from("<HH", data, directory + 12)
        for i in range(named + ids):
            _, target = struct.unpack_from("<II", data, directory + 16 + 8 * i)
            child_offset = target & 0x7FFFFFFF
            if target & 0x80000000:
                child, _ = rva_to_offset(sections, resource_rva + child_offset)
                visit(child)
                continue
            entry_off, _ = rva_to_offset(sections, resource_rva + child_offset)
            payload_rva, size, _, _ = struct.unpack_from("<IIII", data, entry_off)
            payload_off, _ = rva_to_offset(sections, payload_rva)
            entries.append((payload_off, size))

    visit(root)
    return entries


def patch(path: pathlib.Path, fields: list[tuple[str, str]]) -> None:
    data = bytearray(path.read_bytes())
    sections, resource_rva, _ = parse_pe(data)
    entry_offsets = walk_directory(data, sections, resource_rva, 0, [16, 1, 1033])
    if not entry_offsets:
        entry_offsets = walk_directory(data, sections, resource_rva, 0, [16])
    if not entry_offsets:
        raise ValueError(f"{path.name}: no RT_VERSION resource found")
    if len(entry_offsets) != 1:
        raise ValueError(f"{path.name}: expected one RT_VERSION resource, found {len(entry_offsets)}")
    entry_offset = entry_offsets[0]
    payload_rva, old_size, _, _ = struct.unpack_from("<IIII", data, entry_offset)
    payload_offset, section_remaining = rva_to_offset(sections, payload_rva)
    original = bytes(data[payload_offset : payload_offset + old_size])

    key = "StringFileInfo".encode("utf-16le")
    child_offset = original.find(key) - 6
    if child_offset <= 0:
        raise ValueError(f"{path.name}: unexpected version resource layout")
    prefix = bytearray(original[:child_offset])
    # VS_FIXEDFILEINFO starts after the 2-byte-padded key; 0x28 is its
    # signature offset in both packaged PE files.
    fixed = 0x28
    if struct.unpack_from("<I", prefix, fixed)[0] != 0xFEEF04BD:
        raise ValueError(f"{path.name}: unexpected VS_FIXEDFILEINFO signature")
    struct.pack_into("<I", prefix, fixed + 8, FIXED_MS)  # FileVersionMS
    struct.pack_into("<I", prefix, fixed + 12, FIXED_LS)  # FileVersionLS
    struct.pack_into("<I", prefix, fixed + 16, FIXED_MS)  # ProductVersionMS
    struct.pack_into("<I", prefix, fixed + 20, FIXED_LS)  # ProductVersionLS

    varkey = "VarFileInfo".encode("utf-16le")
    var_offset = original.find(varkey)
    if var_offset < 0:
        raise ValueError(f"{path.name}: missing VarFileInfo")
    varinfo = original[var_offset - 6 :]

    new_blob = build_version_blob(prefix, fields, varinfo)
    next_payload = min(
        (off for off, _ in collect_data_entries(data, sections, resource_rva) if off > payload_offset),
        default=payload_offset + section_remaining,
    )
    available = min(
        section_remaining,
        section_virtual_remaining(sections, payload_rva),
        next_payload - payload_offset,
    )
    if len(new_blob) > available:
        raise ValueError(f"{path.name}: version resource needs {len(new_blob)} bytes, only {available} available")

    data[payload_offset : payload_offset + old_size] = new_blob.ljust(old_size, b"\0")[:old_size]
    if len(new_blob) > old_size:
        data[payload_offset + old_size : payload_offset + len(new_blob)] = new_blob[old_size:]
    struct.pack_into("<I", data, entry_offset + 4, len(new_blob))
    path.write_bytes(data)
    print(f"rebranded version resource: {path.name} ({old_size} -> {len(new_blob)} bytes)")


def main() -> int:
    dist = ROOT / "dist"
    for name, fields in TARGETS.items():
        subdir = pathlib.Path("resources/updater") if name == "WickedUpdate.exe" else pathlib.Path()
        target = dist / subdir / name
        if not target.is_file():
            print(f"skip missing {target}")
            continue
        patch(target, fields)
    return 0


if __name__ == "__main__":
    sys.exit(main())
