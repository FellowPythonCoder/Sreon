# part23.py - Part 2 (learn to code) + Part 3 (build TinyOS) chapters.
import os
from reportlab.lib.units import cm
from reportlab.platypus import Spacer, PageBreak
from make_pdf import (body, ChapterTitle, RoundedBox, Picture, CodeBlock,
                      PartBanner, S_BODY, CREAM, LIGHT, PINKBG,
                      TEAL, ORANGE, GOLD, GREEN, NAVY)


def add_parts(story, W):
    A = os.path.dirname(os.path.abspath(__file__))

    # ============================= PART TWO =============================
    story.append(PageBreak())
    story.append(PartBanner("PART TWO", "LEARN TO CODE, FROM ZERO",
        "no experience needed - by the end of this part you can read and write C",
        GREEN, width=W))

    # ---------------------------- CH 16 ----------------------------
    story.append(PageBreak())
    story.append(ChapterTitle(16, "What programming really is", GREEN, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "Time to open the hood! A <b>program</b> is just a list of tiny instructions "
        "for an extremely obedient helper. It never guesses, never improvises, and "
        "never gets the joke. &ldquo;Put the milk in the bowl. Put the bowl in the "
        "sink.&rdquo; If you say it wrong, the milk goes in the sink - and that is "
        "NOT the helper's fault. That is debugging: finding the wrong step."))
    story.append(body(
        "Programmers write those instructions in a tidy text file (the <b>source "
        "code</b>). A special translator program then converts the text into the "
        "raw number-codes the CPU actually understands (the <b>machine code</b>). "
        "Your job is never &ldquo;math genius&rdquo; - it is clear thinking, careful "
        "spelling, and patience."))
    story.append(RoundedBox(
        "The three skills you need (really, just three)",
        "1) Read a recipe and re-type it exactly. 2) When it misbehaves, compare "
        "what you WROTE with what you MEANT. 3) Look things up (every programmer "
        "does this all day long). Programming is a craft like woodworking: you "
        "learn it by doing it, badly at first, then better.",
        LIGHT, GREEN, width=W))
    story.append(Spacer(1, 0.3 * cm))
    story.append(body(
        "The workshop where programmers work looks scary but is simple: it is the "
        "<b>Terminal</b> - a window where you type short orders. <b>cd</b> = walk "
        "into a folder. <b>ls</b> = list what is here. <b>make</b> = build my "
        "project. That is 90% of it. You will be fluent in a week."))

    # ---------------------------- CH 17 ----------------------------
    story.append(PageBreak())
    story.append(ChapterTitle(17, "Your first C programs", TEAL, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "We will learn <b>C</b> - the language this whole course uses. Make a "
        "folder, open a text editor (the built-in TextEdit works; VS Code is nicer), "
        "and type this into a file called <b>hello.c</b>:"))
    story.append(CodeBlock(r'''#include <stdio.h>

int main(void) {
    int apples = 3;
    apples = apples + 2;
    printf("I have %d apples!\n", apples);
    return 0;
}''', "hello.c - a complete, runnable program"))
    story.append(body(
        "Read it like English: <i>include</i> the printing toolbox; <i>main</i> is "
        "where every program starts; make a box named <b>apples</b> holding the "
        "number 3; add 2 to it; print the result. In the Terminal:"))
    story.append(CodeBlock(r'''cc hello.c -o hello
./hello
# prints: I have 5 apples!''', "cc = compile (translate) this; -o = output name"))
    story.append(body(
        "The <b>%d</b> is a blank slot filled with the number after the comma. "
        "Decisions and repetition: <b>if (apples &gt; 4) { ... } else { ... }</b> "
        "does one thing or the other; <b>while (apples &gt; 0) { apples--; }</b> "
        "repeats until the test fails. <b>apples--</b> means &ldquo;one less&rdquo;."))
    story.append(RoundedBox(
        "Try these tiny exercises",
        "1) Print your name and age. 2) Count from 1 to 10 with a while loop "
        "(print each number). 3) Print &ldquo;many&rdquo; if a number is over 100, "
        "else &ldquo;few&rdquo;. Type them! Typing is the only way this sticks.",
        PINKBG, TEAL, width=W))

    # ---------------------------- CH 18 ----------------------------
    story.append(PageBreak())
    story.append(ChapterTitle(18, "Functions: recipes inside recipes", ORANGE, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "Typing the same steps again and again is how mistakes are born. The fix: "
        "name a group of steps once, then call it whenever you need it. That named "
        "group is a <b>function</b>."))
    story.append(CodeBlock(r'''#include <stdio.h>

int square(int x) {         /* the recipe: take a number... */
    return x * x;           /* ...give back x times x      */
}

void greet(char *name) {    /* gives nothing back - just acts */
    printf("Hello, %s!\n", name);
}

int main(void) {
    greet("Ada");
    int n = square(5);
    printf("5 squared is %d\n", n);   /* 25 */
    return 0;
}''', "two functions: one returns a value, one just acts"))
    story.append(body(
        "The words before the name say what comes back: <b>int</b> = a number, "
        "<b>void</b> = nothing. The words in parentheses are the <b>arguments</b> "
        "(the ingredients handed in). And <b>char *name</b>? That is a pointer - "
        "the very next chapter, and the key to everything the OS code does."))
    story.append(RoundedBox(
        "About those odd /* ... */ marks",
        "Anything between slash-star and star-slash is a COMMENT - a note for "
        "humans that the compiler ignores. Good programmers comment like this: "
        "WHY the code does something, not WHAT it obviously does. In assembly "
        "files, comments start with a semicolon (;).",
        LIGHT, ORANGE, width=W))

    # ---------------------------- CH 19 ----------------------------
    story.append(PageBreak())
    story.append(ChapterTitle(19, "Memory, pointers and structs", GOLD, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "Remember the warehouse of numbered lockers (chapter 6)? Memory is exactly "
        "that: millions of tiny boxes, each with an <b>address</b>. When you write "
        "<b>int apples = 3;</b> the compiler rents a box and sticks the label "
        "&ldquo;apples&rdquo; on it. A <b>pointer</b> is simply a box that holds "
        "another box's ADDRESS - a note saying &ldquo;the treasure is in locker "
        "45067&rdquo;."))
    story.append(CodeBlock(r'''int apples = 3;
int *p = &apples;    /* p now holds the ADDRESS of apples   */
printf("%d\n", *p);  /* * means "the treasure at that address" -> 3 */
*p = 10;             /* change apples THROUGH the note: apples == 10 */

int scores[4];       /* an ARRAY: 4 number-boxes in a row  */
scores[0] = 99;      /* first box is number 0! */

struct point {       /* a STRUCT: a labeled pocket with mixed fields */
    int x;
    int y;
};
struct point pt;
pt.x = 7;''', "& = \"the address of\", * = \"the treasure at\""))
    story.append(body(
        "<b>Strings</b> are just arrays of letters with a hidden zero at the end: "
        "<b>&quot;hi&quot;</b> is 'h', 'i', 0. And here is why OS programmers love "
        "structs: hardware often hands you a pocket of bytes with an EXACT layout - "
        "like the multiboot note or a GDT entry. The magic words "
        "<b>__attribute__((packed))</b> tell the compiler: &ldquo;no padding, lay "
        "the fields out exactly as I wrote them&rdquo;. The OS code uses it "
        "everywhere - now you can read it!"))
    story.append(RoundedBox(
        "The one sentence to memorize",
        "A variable is a box with a NAME. A pointer is a box holding an ADDRESS. "
        "* follows the address to the treasure. &amp; takes a name and gives you "
        "its address. That's the whole idea - everything else is practice.",
        CREAM, GOLD, width=W))

    # ---------------------------- CH 20 ----------------------------
    story.append(PageBreak())
    story.append(ChapterTitle(20, "Compiler, linker and Make", TEAL, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "How does text become a running program? Two workshop machines:"))
    story.append(body(
        "1) The <b>compiler</b> (cc / gcc) translates each .c file into an "
        "object file (.o) - half-finished machine code. 2) The <b>linker</b> (ld) "
        "glues all the .o files together into one finished program, like snapping "
        "LEGO sets into a castle. (A third tiny tool, the assembler, does the same "
        "for assembly files.)"))
    story.append(CodeBlock(r'''OBJECTS = loader.o kmain.o

kernel.elf: $(OBJECTS)
    ld -T link.ld -melf_i386 $(OBJECTS) -o kernel.elf

%.o: %.c
    gcc -m32 -ffreestanding -fno-builtin -c $< -o $@''',
        "Makefile excerpt: 'make' reads these recipes and runs them"))
    story.append(body(
        "A <b>Makefile</b> is the recipe card for your whole project: what depends "
        "on what, and how to rebuild only what changed. You will just type "
        "<b>make</b> and <b>make run</b> - but now you can read what happens "
        "underneath."))
    story.append(RoundedBox(
        "The strange flags, translated",
        "<b>-m32</b>: speak in 32-bit x86 (our CPU's dialect). "
        "<b>-ffreestanding</b>: there is NO operating system behind this code - "
        "it IS the operating system. <b>-fno-builtin</b>: don't assume any "
        "library exists. <b>-nostdlib -nostartfiles</b>: bring no house "
        "furniture - we build our own. <b>-Wall</b>: warn me about every smell. "
        "The flags sound scary; the reasons are all just &ldquo;you are the OS "
        "now&rdquo;.",
        LIGHT, TEAL, width=W))

    # ---------------------------- CH 21 ----------------------------
    story.append(PageBreak())
    story.append(ChapterTitle(21, "Assembly in one sitting", ORANGE, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "Assembly is the CPU's own language - one line per single machine action. "
        "You only need to READ a little of it (and the course's assembly files are "
        "small and commented). Meet the cast: the CPU has 8 little hands called "
        "<b>registers</b>: eax, ebx, ecx, edx (general purpose), esp (stack "
        "pointer), ebp (frame base), esi, edi."))
    story.append(CodeBlock(r'''mov eax, 5        ; eax = 5
add eax, 1        ; eax = 6
cmp eax, 10       ; compare... (sets flags)
jg  bigger        ; ..."jump if greater"
push eax          ; park a value on the STACK
pop ebx           ; take it back into ebx
call my_function  ; run this recipe, then come back
ret               ; ..."recipe finished, go back"
jmp loop_start    ; jump with no conditions''',
        "the eight-move vocabulary of assembly"))
    story.append(body(
        "The <b>stack</b> is a pile of plates: last one on, first one off. It is "
        "where function calls park their stuff. And when C code calls assembly "
        "(or vice versa) they follow the same handshake, called <b>cdecl</b>: "
        "arguments go onto the stack right-to-left, and the answer comes back in "
        "<b>eax</b>. That is exactly how our OS will glue its assembly helpers "
        "onto its C brain."))
    story.append(CodeBlock(r'''  push dword 3     ; third argument
  push dword 2     ; second argument
  push dword 1     ; first argument
  call sum_of_three
  ; the answer is now in eax''',
        "cdecl in action: this is how assembly calls C"))
    story.append(RoundedBox(
        "Give yourself permission to skim",
        "Nobody memorizes assembly. Even experts keep a reference open. The goal "
        "is to RECOGNIZE the moves: this line stores, this line jumps, this line "
        "calls a recipe. That is plenty for building an OS.",
        PINKBG, ORANGE, width=W))

    # ---------------------------- CH 22 ----------------------------
    story.append(PageBreak())
    story.append(ChapterTitle(22, "Set up your Mac workshop", GOLD, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "Time to set up the real workshop. The book this course follows was "
        "written for Ubuntu, but everything works beautifully on a Mac - Apple "
        "Silicon or Intel alike. Open Terminal and install the tools "
        "(once):"))
    story.append(CodeBlock(r'''# 1) Homebrew - the Mac's toolbox installer (skip if you have it)
/bin/bash -c "$(curl -fsSL \
  https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2) the OS-building toolchain
brew install nasm i386-elf-gcc i386-elf-binutils qemu''',
        "two commands and your Mac is a kernel factory"))
    story.append(body(
        "Now grab the course project (it came with this guide) and try it:"))
    story.append(CodeBlock(r'''cd os_tutorial
make          # builds kernel.elf + program.bin
make run      # boots YOUR operating system in QEMU!''', None))
    story.append(body(
        "A window opens and TinyOS boots: text appears, and if a guest program "
        "was installed, it drops into user mode and echoes your keystrokes. "
        "<b>QEMU</b> is the pretend computer (an emulator) - the same one you "
        "will use all course long. It is fast to start and impossible to break: "
        "if your OS crashes, only the pretend machine dies!"))
    story.append(RoundedBox(
        "Sanity check - what you should see",
        "In the QEMU window: a banner &ldquo;Welcome to TinyOS 0.1!&rdquo;, a "
        "step-by-step init log, then READY - and either the echo shell or the "
        "user-mode hello. In the Terminal: the same lines through the serial "
        "logbook. If you see that, your workshop is PERFECT. Problems? "
        "The FAQ in os_tutorial/README.md covers the usual suspects.",
        LIGHT, GOLD, width=W))

    # ============================ PART THREE ============================
    story.append(PageBreak())
    story.append(PartBanner("PART THREE", "BUILD YOUR OS, MILESTONE BY MILESTONE",
        "nine milestones - each one is small, tested and yours",
        ORANGE, width=W))

    story.append(Spacer(1, 0.5 * cm))
    story.append(body(
        "Welcome to the construction site! The finished project "
        "(<b>os_tutorial/</b> in the course repository) is only about 1,200 lines "
        "of code in total - small enough to truly understand. Each milestone "
        "below shows you the beating heart of the code, tells you where the file "
        "lives, and what you should see when it works."))
    story.append(CodeBlock(r'''os_tutorial/
|-- loader.s      first code that runs (multiboot handshake + stack)
|-- kmain.c       the boss's first day at work
|-- fb.c          screen driver          serial.c   logbook driver
|-- cpu.s         loads GDT/IDT tables   gdt.c      segments & privilege
|-- isr.s         interrupt stubs        idt.c      interrupt dispatch
|-- pic.c         interrupt controller   keyboard.c keys -> characters
|-- paging.c      fake addresses on      pmm.c      page-frame landlord
|-- syscall.c     int 0x80 service bell  usermode.c starts user apps
|-- switch.s      the iret into user mode
|-- user/         your first guest program
|-- grub/         GRUB files for the optional bootable ISO
|-- tools/        nasm2gas.py (build even without NASM)
+-- tests/        smoke.py (instant headless check: make smoke)''',
        "the whole map - every milestone below lights up one of these"))
    story.append(body(
        "A golden rule from the original book: after EVERY milestone - no matter "
        "how small - build it and run it. Ten minutes of testing now saves a "
        "night of hunting later."))

    # ---------------------------- CH 23 ----------------------------
    story.append(PageBreak())
    story.append(ChapterTitle(23, "Milestone 0: the spark", ORANGE, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "The first code has three jobs: show the secret handshake so the "
        "bootloader agrees to start us, set up a stack (C cannot run without "
        "one), and call our C function. That is ALL of <b>loader.s</b> - read it "
        "slowly, you know every word now:"))
    story.append(CodeBlock(r'''; loader.s - the first code that runs (NASM assembly)
global loader
extern kmain

MAGIC_NUMBER  equ 0x1BADB002             ; the bootloader's magic number
ALIGN_MODULES equ 0x00000001             ; page-align loaded modules
MEMINFO       equ 0x00000002             ; give us a memory map
FLAGS         equ ALIGN_MODULES | MEMINFO
CHECKSUM      equ -(MAGIC_NUMBER + FLAGS)

KERNEL_STACK_SIZE equ 16384              ; 16 KB of stack

section .text
align 4
    dd MAGIC_NUMBER                      ; the handshake itself
    dd FLAGS
    dd CHECKSUM                          ; magic + flags + checksum = 0

loader:
    mov esp, kernel_stack + KERNEL_STACK_SIZE
    push ebx                     ; argument 2: the bootloader's info note
    push eax                     ; argument 1: multiboot magic
    call kmain                   ; jump into C code!
.hang:
    cli
    hlt
    jmp .hang

section .bss
align 16
kernel_stack: resb KERNEL_STACK_SIZE''', "loader.s - complete"))
    story.append(body(
        "And the blueprint that says WHERE it lives in memory - <b>link.ld</b>. "
        "Everything below 1 MB belongs to the BIOS and old machinery, so we live "
        "at 1 MB and up:"))
    story.append(CodeBlock(r'''ENTRY(loader)
SECTIONS
{
    . = 0x00100000;              /* load at 1 MB */
    .text ALIGN(0x1000)  : { *(.text) }
    .rodata ALIGN(0x1000): { *(.rodata*) }
    .data ALIGN(0x1000)  : { *(.data) }
    .bss ALIGN(0x1000)   : { *(COMMON) *(.bss) }
    _kernel_end = .;             /* the landlord needs this label */
}''', "link.ld - complete"))
    story.append(body(
        "Build with <b>make</b> and boot with <b>make run</b>... nothing appears "
        "on screen yet (of course - we have no screen driver!). The victory "
        "condition is in the QEMU monitor: press <b>Ctrl-Alt-2</b>, type "
        "<b>info registers</b>, and find <b>EAX=cafebabe</b>. Your code is "
        "running inside a pretend computer. THAT is the spark."))

    # ---------------------------- CH 24 ----------------------------
    story.append(PageBreak())
    story.append(ChapterTitle(24, "Milestone 1: your C code runs", GREEN, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "The stack in loader.s means C can now run. <b>kmain.c</b> is the boss's "
        "first day - a plain C function. Here is a tiny version you can start "
        "with (the full version in the project does much more; we will grow it "
        "together):"))
    story.append(CodeBlock(r'''/* kmain.c - start with THIS tiny version */
#include "types.h"

void kmain(u32 magic, u32 mbi_addr) {
    /* The screen is 80x25 tiles at memory address 0xB8000.
       Each tile is 2 bytes: letter + colors. Let us wave hello! */
    volatile u16 *fb = (volatile u16 *)0x000B8000;
    const char *msg = "Hi, I am TinyOS!";
    for (u32 i = 0; msg[i]; i++)
        fb[i] = (u16)(msg[i] | 0x0F00);   /* letter + white-on-black */
    for (;;) { }
}''', "proof of life: the smallest possible C kernel"))
    story.append(body(
        "The cast: <b>u32</b> / <b>u16</b> are our nicknames for number types "
        "(defined in <b>types.h</b> - the OS has no standard library, so it "
        "brings its own basics). The magic value 0x0F00 = white letters on black. "
        "Boot it: words appear! That is C code, running on bare metal, drawing "
        "to a real screen."))
    story.append(RoundedBox(
        "Milestone 1 victory condition",
        "The QEMU window shows &ldquo;Hi, I am TinyOS!&rdquo; on the top-left "
        "tile row. If so: delete this toy version and restore the project's "
        "kmain.c - from now on we build the real boss.",
        LIGHT, GREEN, width=W))

    # ---------------------------- CH 25 ----------------------------
    story.append(PageBreak())
    story.append(ChapterTitle(25, "Milestone 2: the screen driver", TEAL, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(Picture(A + "/screen.jpg",
        "Recap: the screen is a board of 80x25 light-up tiles.", width=9.5 * cm))
    story.append(body(
        "Poking 0xB8000 raw works, but every part of the OS doing that would be "
        "chaos. A <b>driver</b> wraps the hardware in a friendly function. Two "
        "files: <b>fb.c</b> (the screen) and <b>io.s</b> (two assembly helpers "
        "for the cursor's I/O ports):"))
    story.append(CodeBlock(r'''global outb
global inb

outb:                       ; outb(port, data) - send a byte to a port
    mov al, [esp + 8]       ; the data byte
    mov dx, [esp + 4]       ; the port number
    out dx, al
    ret

inb:                        ; inb(port) - read a byte from a port
    mov dx, [esp + 4]
    xor eax, eax
    in al, dx
    ret''', "io.s - complete (see the cdecl handshake from chapter 21?)"))
    story.append(CodeBlock(r'''void fb_putc(char c) {
    if (c == '\n') { cursor_col = 0; cursor_row++; }
    else {
        fb[cursor_row * FB_COLS + cursor_col] =
            (u16)((u8)c | ((u16)((bg << 4) | fg) << 8));
        cursor_col++;
        if (cursor_col == FB_COLS) { cursor_col = 0; cursor_row++; }
    }
    if (cursor_row == FB_ROWS) scroll();   /* push everything up */
    move_cursor();
}''', "fb.c - the heart of the screen driver (fb.c also scrolls + colors)"))
    story.append(body(
        "See the struct-sized thinking from chapter 19? Each tile packs a letter "
        "and two colors into one 16-bit number - exactly the layout the hardware "
        "wants. <b>fb_write(buf, len)</b>, <b>fb_clear</b> and a color setter "
        "complete the driver. The whole system now says "
        "&ldquo;print this&rdquo; and the driver handles the nerdy bits."))

    # ---------------------------- CH 26 ----------------------------
    story.append(PageBreak())
    story.append(ChapterTitle(26, "Milestone 3: the logbook", ORANGE, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "The serial driver from chapter 5, now real: <b>serial.c</b> configures "
        "COM1 and writes bytes to it. QEMU shows those bytes in the Terminal "
        "(-serial stdio) - a logbook that survives whatever happens on screen:"))
    story.append(CodeBlock(r'''void serial_init(void) {
    serial_configure_baud_rate(1);   /* 115200 bits per second */
    outb(LINE_COMMAND_PORT(COM1), 0x03);  /* 8 bits, no parity, 1 stop */
    outb(FIFO_COMMAND_PORT(COM1), 0xC7);  /* enable + clear the buffers */
    outb(MODEM_COMMAND_PORT(COM1), 0x03); /* ready to talk */
}

void serial_putc(char c) {
    while (!transmit_fifo_empty())   /* wait until the wire is free */
        ;
    outb(DATA_PORT(COM1), (u8)c);
}''', "serial.c - the two functions that matter"))
    story.append(body(
        "Then the finishing touch: <b>klib.c</b> with a tiny <b>kprintf</b> that "
        "prints to BOTH screen and logbook - and a <b>panic</b> function that "
        "prints the bad news in red and stops. Your future debugging self says "
        "thank you."))
    story.append(RoundedBox(
        "Milestone 3 victory condition",
        "kmain prints a banner via kprintf - and you see it TWICE: in the QEMU "
        "window and in the Terminal. From now on, every milestone's success "
        "message rides the logbook.",
        LIGHT, ORANGE, width=W))

    # ---------------------------- CH 27 ----------------------------
    story.append(PageBreak())
    story.append(ChapterTitle(27, "Milestone 4: the boss's uniform", GOLD, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "Recap chapter 6 and 8: segments carry privilege levels. Now we build "
        "the real GDT with five name tags - null, kernel code/data (boss), "
        "user code/data (visitor), plus the <b>TSS</b> (the reception desk that "
        "tells the CPU which stack to switch to when a visitor rings). "
        "<b>gdt.c</b> fills a table of 8-byte entries; <b>cpu.s</b> loads it:"))
    story.append(CodeBlock(r'''static void gdt_set_gate(int i, u32 base, u32 limit,
                         u8 access, u8 gran) {
    gdt[i].base_low    = (u16)(base & 0xFFFF);
    gdt[i].base_mid    = (u8)((base >> 16) & 0xFF);
    gdt[i].base_high   = (u8)((base >> 24) & 0xFF);
    gdt[i].limit_low   = (u16)(limit & 0xFFFF);
    gdt[i].granularity = (u8)(((limit >> 16) & 0x0F) | (gran & 0xF0));
    gdt[i].access      = access;
}

gdt_set_gate(0, 0, 0, 0, 0);                /* 0x00: the mandatory null */
gdt_set_gate(1, 0, 0xFFFFFFFF, 0x9A, 0xCF); /* 0x08: kernel code, PL0  */
gdt_set_gate(2, 0, 0xFFFFFFFF, 0x92, 0xCF); /* 0x10: kernel data, PL0  */
gdt_set_gate(3, 0, 0xFFFFFFFF, 0xFA, 0xCF); /* 0x18: user code,   PL3  */
gdt_set_gate(4, 0, 0xFFFFFFFF, 0xF2, 0xCF); /* 0x20: user data,   PL3  */''',
        "gdt.c - the five name tags (0x9A = \"code, boss only\", 0xFA = \"code, visitors too\")"))
    story.append(CodeBlock(r'''gdt_flush:                  ; load the GDT, then reload the registers
    mov eax, [esp + 4]
    lgdt [eax]
    mov ax, 0x10            ; kernel DATA selector
    mov ds, ax
    mov es, ax
    mov fs, ax
    mov gs, ax
    mov ss, ax
    jmp 0x08:.flush         ; far jump: reloads CS (code selector)
.flush:
    ret''', "cpu.s - the famous far jump from the segmentation chapter!"))
    story.append(body(
        "The <b>packed struct</b> behind each 8-byte entry is exactly why "
        "chapter 19 insisted on <b>__attribute__((packed))</b>. The bytes must "
        "land where the CPU expects them - no padding allowed."))

    # ---------------------------- CH 28 ----------------------------
    story.append(PageBreak())
    story.append(ChapterTitle(28, "Milestone 5: doorbells", TEAL, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "Recap chapter 7: interrupts need a phone book (the IDT) and stubs that "
        "know which doorbell rang. <b>isr.s</b> uses NASM macros - now you can "
        "read them - to stamp out 48 nearly-identical stubs:"))
    story.append(CodeBlock(r'''%macro no_error_code_interrupt_handler 1
global isr_%1
isr_%1:
    push dword 0            ; fake error code (this interrupt has none)
    push dword %1           ; which interrupt is this?
    jmp isr_common
%endmacro

isr_common:                 ; the common path for every interrupt
    pusha                   ; save ALL general registers
    mov eax, esp            ; eax points at the saved registers
    push eax                ; ...pushed as the argument to the C function
    call interrupt_handler
    add esp, 4
    popa                    ; restore ALL general registers
    add esp, 8              ; remove error code + interrupt number
    iret                    ; back to whatever was interrupted''',
        "isr.s - one macro and one common path do the whole job"))
    story.append(body(
        "The C side, <b>idt.c</b>, fills the phone book and takes the calls. "
        "Look who is inside - the exception names, the keyboard, and the "
        "system-call doorbell from chapter 13:"))
    story.append(CodeBlock(r'''void interrupt_handler(cpu_state_t *cpu) {
    if (cpu->int_no < 32) {
        kprintf("EXCEPTION %u (%s) at eip=0x%x\n",
                cpu->int_no, exception_names[cpu->int_no], cpu->eip);
        panic("unhandled CPU exception");
    } else if (cpu->int_no < 48) {
        if (cpu->int_no == 33) keyboard_interrupt();   /* IRQ1 = keyboard */
        pic_acknowledge(cpu->int_no);
    } else if (cpu->int_no == 0x80) {
        cpu->eax = syscall_dispatch(cpu);   /* the answer goes to eax! */
    }
}''', "idt.c - the switchboard of the whole OS"))
    story.append(body(
        "<b>pic.c</b> does the remap dance (the mailroom chapter of the book) so "
        "hardware doorbells arrive as interrupts 32-47, and unmasks ONLY the "
        "keyboard. One ritual to remember: after handling, say thank you with "
        "<b>pic_acknowledge</b> or the mailroom goes silent."))

    # ---------------------------- CH 29 ----------------------------
    story.append(PageBreak())
    story.append(ChapterTitle(29, "Milestone 6: your OS reads keys", GREEN, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "The keyboard does not send letters - it sends <b>scan codes</b> "
        "(chapter 7's Morse taps). <b>keyboard.c</b> translates taps to "
        "characters with a little table, and parks them in a <b>ring buffer</b> "
        "(a circular queue - the fancy name for a list that wraps around):"))
    story.append(CodeBlock(r'''void keyboard_interrupt(void) {
    u8 sc = inb(KBD_DATA_PORT);   /* read = "got it!" to the keyboard */
    if (sc & 0x80) return;        /* key RELEASE - ignore for now */
    char c = scancode_to_ascii[sc];
    if (!c) return;
    u32 next = (ring_head + 1) % 256;
    if (next == ring_tail) return;    /* ring full: drop the key */
    ring[ring_head] = c;
    ring_head = next;
}''', "keyboard.c - interrupts fill the ring, the kernel drinks from it"))
    story.append(body(
        "Meanwhile <b>keyboard_getchar()</b> waits politely: if the ring is "
        "empty it says <b>sti; hlt</b> - &ldquo;wake me when a doorbell "
        "rings&rdquo; (the nap we met in chapter 7). Wire it into the echo "
        "shell in kmain.c and the magic moment arrives:"))
    story.append(RoundedBox(
        "Milestone 6 victory condition - a REAL moment",
        "Boot your OS, click the QEMU window, and TYPE. Your keystrokes appear "
        "on the screen one by one. Read that again: an interrupt storm from the "
        "keyboard hardware flowed through the PIC, the IDT, your driver, and "
        "onto the framebuffer - in YOUR operating system. Make yourself a "
        "coffee. You earned it.",
        CREAM, GREEN, width=W))

    # ---------------------------- CH 30 ----------------------------
    story.append(PageBreak())
    story.append(ChapterTitle(30, "Milestone 7: fake addresses on", ORANGE, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "Recap chapter 9: paging hands every program a polite lie. Our version "
        "is beautifully small - identity mapping (fake address = real address) "
        "in four big 4 MB slices, and one slice marked VISITORS WELCOME for the "
        "user program. Here is the whole <b>paging.c</b> heart:"))
    story.append(CodeBlock(r'''static u32 page_directory[1024] __attribute__((aligned(4096)));

void paging_init(void) {
    for (int i = 0; i < 4; i++) {          /* the four slices */
        u32 flags = PAGE_PRESENT | PAGE_RW | PAGE_4MB;
        if (i == 1) flags |= PAGE_USER;    /* visitors may enter slice 1 */
        page_directory[i] = (u32)(i * 0x00400000) | flags;
    }

    /* PSE on (4 MB pages), point cr3 at the directory, enable paging */
    asm volatile("mov %%cr4, %%eax; or $0x10, %%eax; mov %%eax, %%cr4"
                 ::: "eax", "memory");
    asm volatile("mov %0, %%cr3" :: "r"(page_directory) : "memory");
    asm volatile("mov %%cr0, %%eax; or $0x80000000, %%eax; \
                  mov %%eax, %%cr0" ::: "eax", "memory");
}''', "paging.c - the cake with four slices (0-4MB boss-only, 4-8MB for guests)"))
    story.append(body(
        "The page directory must sit at a <b>4096-aligned</b> address - hence "
        "the <b>aligned(4096)</b> request to the compiler. Those three little "
        "assembly blocks are exactly the &ldquo;enable paging&rdquo; recipe from "
        "chapter 9: set cr4's PSE bit, load cr3, set cr0's PG bit."))
    story.append(RoundedBox(
        "Milestone 7 victory condition",
        "The logbook says &ldquo;paging: fake addresses ON&rdquo; and the OS "
        "keeps running. Want proof it protects? Try reading address 0 from the "
        "kernel after paging is on - the CPU fires exception 14 (page fault) and "
        "your new exception handler prints the red panic message with the "
        "offending address. Turn the bug off again afterwards!",
        PINKBG, ORANGE, width=W))

    # ---------------------------- CH 31 ----------------------------
    story.append(PageBreak())
    story.append(ChapterTitle(31, "Milestone 8: the landlord", TEAL, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "Recap chapter 10: somebody must know which 4 KB page frames are free. "
        "<b>pmm.c</b> keeps one checkbox (bit) per frame - a <b>bitmap</b> - and "
        "fills it from the bootloader's memory map. The frame the OS itself "
        "sits on? Never rent it out!"))
    story.append(CodeBlock(r'''void pmm_init(multiboot_info_t *mbi, u32 kernel_end) {
    /* start by assuming EVERYTHING is taken... */
    for (u32 i = 0; i < BITMAP_BYTES; i++) bitmap[i] = 0xFF;

    /* ...then trust the bootloader's map of usable RAM */
    if (mbi->flags & MULTIBOOT_INFO_MMAP) {
        /* walk the map entries, mark_range_free(usable parts) */
    } else if (mbi->flags & MULTIBOOT_INFO_MEMORY) {
        /* short version: RAM = 1 MB .. 1 MB + mem_upper */
    }

    mark_range_used(0x00000000, kernel_end);  /* OUR rooms! + BIOS */
}

u32 pmm_alloc_frame(void) {          /* ask for one free 4 KB frame */
    for (u32 f = 0; f < frame_count; f++)
        if (!is_used(f)) { mark_used(f); return f * FRAME_SIZE; }
    return 0;                        /* out of memory */
}''', "pmm.c - the landlord with the checklist"))
    story.append(body(
        "Boot and read the logbook: the OS prints the memory map it found and "
        "&ldquo;page frames: N total, M free (4 KB each)&rdquo;. Your computer's "
        "RAM, itemized by YOUR code. Add a test call to <b>pmm_alloc_frame()</b> "
        "and watch the free count drop by one - the landlord works."))

    # ---------------------------- CH 32 ----------------------------
    story.append(PageBreak())
    story.append(ChapterTitle(32, "Milestone 9: user mode!", GOLD, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(Picture(A + "/modes.jpg",
        "Recap: visitors stay outside the castle - with one service bell.",
        width=9.5 * cm))
    story.append(body(
        "The finish line. Three moves: (1) the CPU drops into visitor clothes "
        "with the ONE instruction that can do it - <b>iret</b>, dressed up as a "
        "fake interrupt-return (chapter 11's recipe, in <b>switch.s</b>):"))
    story.append(CodeBlock(r'''enter_user_mode:
    cli
    mov ax, 0x23             ; user DATA selector (0x20) | RPL 3
    mov ds, ax
    mov es, ax
    push dword 0x23          ; ss  - user data selector | RPL 3
    push dword 0x00800000    ; esp - top of the user stack
    pushfd
    pop eax
    or eax, 0x200            ; turn the INTERRUPT flag back ON
    push eax
    push dword 0x1B          ; cs  - user code selector (0x18) | RPL 3
    push dword 0x00400000    ; eip - first instruction of the program
    iret                     ; knock-knock: user mode!''',
        "switch.s - complete. This is the whole trick of entering user mode."))
    story.append(body(
        "(2) The guest program lives at 0x400000 with its stack at 0x800000 - "
        "both inside our &ldquo;visitors welcome&rdquo; slice. It may only act "
        "through the service bell - <b>int 0x80</b>:"))
    story.append(CodeBlock(r'''static u32 syscall2(u32 n, u32 a, u32 b) {
    u32 ret;
    __asm__ volatile("int $0x80"           /* ring the service bell! */
                     : "=a"(ret)           /* the answer comes in eax */
                     : "a"(n), "b"(a), "c"(b)
                     : "memory");
    return ret;
}

void main(void) {
    print("Hello from USER MODE!\n");
    /* ...echo keys via SYS_GETCHAR / SYS_PUTC, then: */
    syscall2(2, 0, 0);         /* SYS_EXIT -> back to the kernel */
}''', "user/user.c - your first application"))
    story.append(body(
        "(3) The kernel answers the bell in <b>syscall.c</b> - and "
        "&ldquo;SYS_EXIT&rdquo; shows the final trick: returning to the kernel "
        "is just pointing iret somewhere else."))
    story.append(RoundedBox(
        "Milestone 9 victory condition - THE FINISH LINE",
        "make run. The logbook announces &ldquo;entering user mode&rdquo;, and "
        "the screen answers: &ldquo;Hello from USER MODE!&rdquo; - from a "
        "program with NO privileges, ringing doorbells to be heard. You have "
        "built an operating system: booting, drivers, interrupts, paging, "
        "memory management, protection and system calls. YOU. From nothing.",
        CREAM, GOLD, width=W))

    # ---------------------------- CH 33 ----------------------------
    story.append(PageBreak())
    story.append(ChapterTitle(33, "Your finished OS", GREEN, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "It is real: <b>make smoke</b> even boots it headlessly and checks the "
        "banner, the log and every init stage - proof it works on any machine. "
        "You can also package it the classic way from the book (a bootable CD "
        "image with GRUB):"))
    story.append(CodeBlock(r'''make iso
qemu-system-i386 -cdrom os.iso -serial stdio''',
        "the 'proper' bootloader path - grub/ has everything you need"))
    story.append(RoundedBox(
        "The debugging cookbook (pin this to your fridge)",
        "1) READ THE LOGBOOK - your serial log almost always names the crime "
        "scene first. 2) Panic prints an address: look it up in the map ("
        "nm kernel.elf). 3) Change ONE thing, rebuild, rerun. Small steps - the "
        "golden rule. 4) The exception list (chapter 6) tells you WHAT fired. "
        "5) QEMU's monitor (Ctrl-Alt-2) shows registers: info registers. "
        "6) Stuck for an hour? Walk around the block. This works astonishingly "
        "often.",
        PINKBG, GREEN, width=W))
    story.append(body(
        "Where to go next? The road is long and delightful: load real ELF "
        "programs (chapter 11's exercise), build a file system and a shell "
        "around it (chapter 12), add a real malloc to the kernel heap "
        "(chapter 10), put several processes side by side with cooperative "
        "yielding - then the timer, then preemptive scheduling (chapter 14). "
        "Then demand paging. Then a filesystem on a real disk. Then... it never "
        "really ends, and that is the joy."))
    story.append(body(
        "The original <i>Little Book About OS Development</i> (which this course "
        "wraps around) has more depth on every topic; the OSDev wiki has the "
        "collective wisdom of everyone who has done this before you. But look "
        "at what you have now: not a vague idea of how computers start - a "
        "working operating system, and the ability to read and change every "
        "line of it."))
    story.append(Spacer(1, 0.5 * cm))
    story.append(RoundedBox(
        "Well done, kernel developer.",
        "From &ldquo;I don't know coding&rdquo; to a booting, typing, "
        "user-mode-running operating system on your Mac. The world needs more "
        "people who understand the machine at this level - welcome to their "
        "ranks. Now go make it do something nobody has ever made a computer do "
        "before.",
        LIGHT, TEAL, width=W))
