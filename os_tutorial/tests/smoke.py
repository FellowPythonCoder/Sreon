#!/usr/bin/env python3
"""smoke.py - boot TinyOS in a tiny x86 emulator and check it works.

This runs the kernel headlessly (no window, no QEMU needed) and verifies:
  * the kernel boots from its multiboot entry point,
  * the screen driver writes "TinyOS" and "READY" to the framebuffer,
  * the serial logbook receives the same messages.

Usage:  python3 tests/smoke.py kernel.elf
"""
import struct
import sys

try:
    from unicorn import Uc, UcError, UC_ARCH_X86, UC_MODE_32, UC_HOOK_MEM_UNMAPPED, UC_HOOK_INSN
    from unicorn.x86_const import (UC_X86_INS_IN, UC_X86_INS_OUT,
                               UC_X86_REG_EAX, UC_X86_REG_EBX)
    from unicorn import UC_SECOND_SCALE
except ImportError:
    sys.exit("this test needs the 'unicorn' package: pip3 install unicorn")

RAM_SIZE = 32 * 1024 * 1024
MBI_ADDR = 0x9000
MMAP_ADDR = 0x9100
FB_ADDR = 0xB8000
SERIAL_DATA = 0x3F8


def load_elf32(path, mu):
    data = open(path, "rb").read()
    if data[:4] != b"\x7fELF":
        sys.exit("not an ELF file: " + path)
    (e_type, e_machine, _ver, e_entry, e_phoff, _shoff, _flags,
     _ehsize, e_phentsize, e_phnum) = struct.unpack_from("<HHIIIIIHHH", data, 16)
    for i in range(e_phnum):
        off = e_phoff + i * e_phentsize
        (p_type, p_offset, p_vaddr, p_paddr, p_filesz, p_memsz,
         _p_flags, _p_align) = struct.unpack_from("<IIIIIIII", data, off)
        if p_type != 1:  # PT_LOAD
            continue
        if p_paddr + p_memsz > RAM_SIZE:
            sys.exit("segment does not fit in RAM")
        if p_filesz:
            mu.mem_write(p_paddr, data[p_offset:p_offset + p_filesz])
    return e_entry


def build_multiboot_info(mu):
    # flags: bit0 = mem_lower/upper valid, bit6 = mmap valid
    buf = bytearray(52)
    struct.pack_into("<I", buf, 0, 0x1 | 0x40)               # flags
    struct.pack_into("<I", buf, 4, 640)                      # mem_lower (KB)
    struct.pack_into("<I", buf, 8, (RAM_SIZE - 0x100000) // 1024)  # mem_upper
    struct.pack_into("<I", buf, 20, 0)                       # mods_count
    struct.pack_into("<I", buf, 44, 3 * 24)                  # mmap_length
    struct.pack_into("<I", buf, 48, MMAP_ADDR)               # mmap_addr
    entries = b""
    entries += struct.pack("<IIIIII", 20, 0x00000000, 0, 0x0009FC00, 0, 1)
    entries += struct.pack("<IIIIII", 20, 0x0009FC00, 0, 0x00000400, 0, 2)
    entries += struct.pack("<IIIIII", 20, 0x00100000, 0, RAM_SIZE - 0x100000, 0, 1)
    mu.mem_write(MBI_ADDR, bytes(buf))
    mu.mem_write(MMAP_ADDR, entries)


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    serial_log = []

    mu = Uc(UC_ARCH_X86, UC_MODE_32)
    mu.mem_map(0, RAM_SIZE)
    entry = load_elf32(sys.argv[1], mu)
    build_multiboot_info(mu)

    def hook_out(uc, port, size, value, user):
        if port == SERIAL_DATA:
            serial_log.append(chr(value & 0xFF))

    def hook_in(uc, port, size, user):
        if port == SERIAL_DATA + 5:      # line status: always "ready"
            return 0x20
        return 0

    def hook_bad(uc, access, address, size, value, user):
        print("SMOKE FAIL: bad memory access at 0x%x (size %d)" % (address, size))
        return False

    mu.hook_add(UC_HOOK_INSN, hook_out, None, 1, 0, UC_X86_INS_OUT)
    mu.hook_add(UC_HOOK_INSN, hook_in, None, 1, 0, UC_X86_INS_IN)
    mu.hook_add(UC_HOOK_MEM_UNMAPPED, hook_bad)

    mu.reg_write(UC_X86_REG_EAX, 0x2BADB002)   # multiboot magic
    mu.reg_write(UC_X86_REG_EBX, MBI_ADDR)     # pointer to multiboot info

    try:
        mu.emu_start(entry, 0, timeout=2 * UC_SECOND_SCALE, count=30_000_000)
    except UcError as e:
        # HLT after READY is fine; a crash before that is not
        if not serial_log:
            raise

    text = "".join(serial_log)
    fb = bytes(mu.mem_read(FB_ADDR, 80 * 25 * 2))
    screen = "".join(chr(fb[i]) for i in range(0, len(fb), 2)).rstrip()

    checks = [
        ("serial log has banner", "TinyOS" in text),
        ("serial log reaches READY", "READY" in text),
        ("screen shows banner", "TinyOS" in screen),
        ("screen shows READY", "READY" in screen),
        ("gdt message", "gdt" in text),
        ("paging message", "paging" in text),
        ("pmm counts frames", "page frames" in text),
    ]
    ok = True
    for name, passed in checks:
        print(("PASS  " if passed else "FAIL  ") + name)
        ok = ok and passed

    if not ok:
        print("\n--- serial log ---\n" + text)
        sys.exit(1)
    print("\nTinyOS smoke test passed: it boots, prints and initializes.")


if __name__ == "__main__":
    main()
