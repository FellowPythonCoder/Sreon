# TinyOS — your first operating system (macOS friendly!)

This is the **runnable project** that goes with the visual guide
(`os.pdf`, Part 3). When you finish, you will have an operating system
that boots in a few seconds on your Mac and can:

* print to the screen (a real framebuffer driver),
* write a log to the serial port,
* handle interrupts and read your **keyboard**,
* use **paging** and a **page-frame allocator**,
* run a **user-mode program** that talks to it through **system calls**.

---

## 1. Set up the workshop (once)

Open **Terminal** (press `Cmd+Space`, type "Terminal", hit Enter).

Install [Homebrew](https://brew.sh) if you don't have it:

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then install the tools (works on Apple Silicon **and** Intel Macs):

```sh
brew install nasm i386-elf-gcc i386-elf-binutils qemu
```

> **Linux?** `sudo apt install nasm gcc-multilib qemu-system-x86` works too.

## 2. Build and run

```sh
cd os_tutorial
make            # build kernel.elf + program.bin
make run        # boot TinyOS in QEMU!
```

A window opens: **congratulations, that is YOUR operating system
booting.** Click the window, type keys, and TinyOS will echo them.
Press `Ctrl+Alt+2` (QEMU monitor) then type `quit` to stop — or simply
close the window. On macOS you can also use `Ctrl+Q`... see QEMU docs.

The terminal shows the same output through the serial log:

```
Welcome to TinyOS 0.1!
built for real by YOU, following the visual guide.
...
READY.
[kernel] user program found: ... bytes at ...
[kernel] entering user mode... try typing!
Hello from USER MODE!
```

The `program.bin` guest prints via system calls and echoes your keys
(`q` quits back to the kernel). Without `program.bin`, the kernel's own
echo shell runs instead.

## 3. Useful commands

| command | what it does |
|---|---|
| `make` | build everything |
| `make run` | boot in QEMU (screen + serial) |
| `make run-headless` | boot without a window (serial only) |
| `make smoke` | automated boot test (needs `pip3 install unicorn`) |
| `make iso` | build a classic GRUB `os.iso` (needs `cdrtools` or `xorriso`) |
| `make clean` | delete build output |

Boot the ISO the classic way (like the book does with GRUB):

```sh
make iso
qemu-system-i386 -cdrom os.iso -serial stdio
```

## 4. Where things live

```
os_tutorial/
├── loader.s        the first code that runs (multiboot header + stack)
├── kmain.c         the boss's first day: init everything
├── fb.c / fb.h     screen driver (80x25 tiles at 0xB8000)
├── serial.c/.h     logbook driver (COM1)
├── cpu.s           loads the GDT/IDT tables, sti/cli
├── gdt.c / gdt.h   segments + privilege levels + TSS
├── idt.c / idt.h   interrupt dispatch ("the phone book")
├── isr.s           the interrupt stubs (NASM macros)
├── pic.c / pic.h   the interrupt controller
├── keyboard.c/.h   scan codes -> characters
├── paging.c/.h     identity paging (4 MB pages)
├── pmm.c / pmm.h   page-frame allocator ("the landlord")
├── syscall.c/.h    int 0x80 system calls
├── usermode.c/.h   loads + starts the user program
├── switch.s        the iret into user mode
├── user/           the guest program (start.s + user.c)
├── grub/           GRUB files for the optional ISO path
├── tools/nasm2gas.py  builds without NASM (uses GNU as instead)
└── tests/smoke.py  headless boot test
```

## 5. FAQ

**Q: `make` says "No i386-elf-gcc found".**
A: `brew install i386-elf-gcc i386-elf-binutils`, then reopen Terminal.

**Q: Can I use this without NASM?**
A: Yes — the Makefile falls back to `tools/nasm2gas.py` + GNU `as`.

**Q: My screen is black / "no such file qemu-system-i386".**
A: `brew install qemu` and check `qemu-system-i386 --version`.

**Q: Something crashed!**
A: Read the serial log (the Terminal), and see the "debugging cookbook"
chapter in `os.pdf`. The panic message tells you the address where it
happened.

Now go read Part 3 of `os.pdf` and type it in yourself — that is how
it sticks. Good luck, kernel developer!
