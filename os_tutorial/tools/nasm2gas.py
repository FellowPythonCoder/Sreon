#!/usr/bin/env python3
"""nasm2gas.py - translate a small NASM-subset file into GNU as syntax.

If you don't have NASM installed, the TinyOS Makefile uses this script
together with the GNU assembler (as) that comes with every Linux and with
the i386-elf-binutils package on macOS.

Usage:  python3 tools/nasm2gas.py input.s output.s
        as --32 -o output.o output.s

Supported NASM features (all TinyOS needs):
  comments (;)  global/extern  section .text/.data/.bss  align  NAME equ X
  dd/dw/db/resb  labels  %macro ... %endmacro (with %1)
  the usual instructions (intel syntax)

Anything unknown is reported loudly - it never silently mistranslates.
"""
import re
import sys

REGS = set("""eax ecx edx ebx esp ebp esi edi ax cx dx bx sp bp si di
al cl dl bl ah ch dh bh cs ds es fs gs ss eip""".split())

SIZE_WORDS = {"dword", "word", "byte", "qword"}

RENAMES = {}   # NASM 32-bit spellings work as-is in .code32 GNU as

JUMP_OPS = {"jmp", "call", "loop", "loope", "loopne", "loopz", "loopnz",
            "jcxz", "jecxz"}
JUMP_OPS |= {o for o in
             ("jo jno jb jnae jc jnb jae je jz jne jnz jbe jna ja jnbe js jns "
              "jp jpe jnp jpo jl jnge jge jnl jle jng jg jnle").split()}


def fail(msg, line):
    sys.stderr.write("nasm2gas: cannot translate: %s\n  line: %s\n" % (msg, line))
    sys.exit(1)


SYMBOL_RE = re.compile(r"(^|[^0-9A-Za-z_$.])([A-Za-z_.][\w.]*)")


def convert_operand(op, line):
    op = op.strip()
    low = op.lower()
    # sized memory or sized immediate: "dword [x]" / "dword 0"
    for sz in SIZE_WORDS:
        if low.startswith(sz + " "):
            rest = op[len(sz) + 1:].strip()
            if rest.startswith("["):
                return "%s ptr %s" % (sz, rest)
            imm = convert_operand(rest, line)
            return "%s ptr %s" % (sz, imm)         # keeps push at 32-bit width
    if op.startswith("["):
        return op                                  # memory
    if low in REGS:
        return op                                  # register
    # immediate: a number stays bare; symbols need OFFSET FLAT:
    if SYMBOL_RE.search(op):
        return "OFFSET FLAT:" + op
    if re.fullmatch(r"[0-9A-Fa-fxX()+\- */|~]+", op):
        return op
    fail("operand %r" % op, line)


def split_operands(s):
    parts, depth, cur = [], 0, ""
    for ch in s:
        if ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
        if ch == "," and depth == 0:
            parts.append(cur)
            cur = ""
        else:
            cur += ch
    if cur.strip():
        parts.append(cur)
    return [p.strip() for p in parts]


def translate(line):
    code = line.split(";", 1)[0].rstrip()
    if not code.strip():
        return ""
    s = code.strip()

    m = re.fullmatch(r"([A-Za-z_.][\w.]*):", s)
    if m:
        return s                                   # plain label

    m = re.fullmatch(r"([A-Za-z_.][\w.]*):\s+(.+)", s)
    if m:
        return m.group(1) + ":\n" + translate(m.group(2))   # label + instruction

    m = re.fullmatch(r"global\s+([\w.]+)", s)
    if m:
        return "\t.globl %s" % m.group(1)

    m = re.fullmatch(r"extern\s+([\w.]+)", s)
    if m:
        return "\t.extern %s" % m.group(1)         # harmless in gas

    m = re.fullmatch(r"section\s+(\.\w+)", s)
    if m:
        return "\t.section %s" % m.group(1)

    m = re.fullmatch(r"align\s+(\d+)", s)
    if m:
        return "\t.balign %s" % m.group(1)

    m = re.fullmatch(r"([\w.]+)\s+equ\s+(.+)", s)
    if m:
        return "\t.equ %s, %s" % (m.group(1), m.group(2))

    m = re.fullmatch(r"(dd|dw|db)\s+(.+)", s)
    if m:
        size = {"dd": ".long", "dw": ".short", "db": ".byte"}[m.group(1)]
        return "\t%s %s" % (size, m.group(2))

    m = re.fullmatch(r"resb\s+(.+)", s)
    if m:
        return "\t.space %s" % m.group(1)
    m = re.fullmatch(r"resd\s+(.+)", s)
    if m:
        return "\t.space 4*(%s)" % m.group(1)

    # instructions
    parts = s.split(None, 1)
    op = parts[0].lower()
    operand_text = parts[1] if len(parts) > 1 else ""
    operands = split_operands(operand_text) if operand_text else []

    # far jump / far call: "jmp 0x08:label"
    if op in ("jmp", "call") and len(operands) == 1:
        m = re.fullmatch(r"(0[xX][0-9A-Fa-f]+|\d+)\s*:\s*([\w.]+)", operands[0])
        if m:
            kind = "ljmp" if op == "jmp" else "lcall"
            return "\t%s %s, %s" % (kind, m.group(1), m.group(2))

    op = RENAMES.get(op, op)

    if not operands:
        return "\t" + op

    if op in JUMP_OPS:
        return "\t%s %s" % (op, ", ".join(operands))   # jump targets stay bare

    conv = [convert_operand(o, s) for o in operands]
    return "\t%s %s" % (op, ", ".join(conv))


def expand_macros(lines):
    macros, plain, i = {}, [], 0
    while i < len(lines):
        head = lines[i].split(";", 1)[0].strip()
        if head.startswith("%macro"):
            fields = head.split()
            name, nargs = fields[1], int(fields[2])
            body, i = [], i + 1
            while i < len(lines) and lines[i].split(";", 1)[0].strip() != "%endmacro":
                body.append(lines[i])
                i += 1
            if i >= len(lines):
                fail("unterminated %macro", head)
            macros[name] = (nargs, body)
        else:
            plain.append(lines[i])
        i += 1

    out = []
    for line in plain:
        head = line.split(";", 1)[0].strip()
        m = re.fullmatch(r"([A-Za-z_][\w]*)\s+(.+)", head)
        if m and m.group(1) in macros:
            name, arg = m.group(1), m.group(2).strip()
            nargs, body = macros[name]
            if nargs != 1:
                fail("only 1-argument macros supported", line)
            for bl in body:
                out.append(bl.replace("%1", arg))
        else:
            out.append(line)
    return out


def main():
    if len(sys.argv) != 3:
        sys.stderr.write("usage: nasm2gas.py input.s output.s\n")
        sys.exit(2)
    with open(sys.argv[1]) as f:
        lines = f.read().splitlines()
    body = [translate(l) for l in expand_macros(lines)]
    with open(sys.argv[2], "w") as f:
        f.write("\t.intel_syntax noprefix\n\t.code32\n")
        f.write("\n".join(body) + "\n")


if __name__ == "__main__":
    main()
