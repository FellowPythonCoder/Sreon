# ============================================================
# TinyOS Makefile
#
# On macOS (recommended toolchain via Homebrew):
#   brew install nasm i386-elf-gcc i386-elf-binutils qemu
# On Linux:
#   sudo apt install nasm gcc-multilib qemu-system-x86
#   (or install i386-elf-gcc / i386-elf-binutils instead)
#
# Targets:
#   make            - build kernel.elf + program.bin
#   make run        - boot TinyOS in QEMU (screen + serial in terminal)
#   make run-headless - boot without a window (serial only)
#   make iso        - build a bootable os.iso (GRUB, optional)
#   make smoke      - automated boot test (no window; needs python3)
#   make clean
# ============================================================

UNAME := $(shell uname -s)

# Prefer the proper cross toolchain if it is installed
ifneq ($(shell command -v i386-elf-gcc 2>/dev/null),)
  CROSS := i386-elf-
endif

CC := $(CROSS)gcc
LD := $(CROSS)ld

ifeq ($(CROSS),)
  ifeq ($(UNAME),Linux)
    CC := gcc
    LD := ld
  else
    $(error No i386-elf-gcc found. On macOS run: brew install i386-elf-gcc i386-elf-binutils nasm qemu)
  endif
endif

CFLAGS  := -m32 -std=gnu99 -ffreestanding -fno-builtin -fno-stack-protector \
           -fno-pic -fno-pie -fno-asynchronous-unwind-tables \
           -nostartfiles -nodefaultlibs -Wall -Wextra -O1
LDFLAGS := -melf_i386

OBJS := loader.o io.o cpu.o isr.o switch.o \
        kmain.o klib.o fb.o serial.o gdt.o idt.o pic.o \
        keyboard.o paging.o pmm.o syscall.o usermode.o

all: kernel.elf program.bin

kernel.elf: $(OBJS) link.ld
	$(LD) $(LDFLAGS) -T link.ld $(OBJS) -o $@
	@echo "kernel.elf ready."

program.bin: user/start.o user/user.o user/ulink.ld
	$(LD) $(LDFLAGS) -T user/ulink.ld user/start.o user/user.o -o $@
	@echo "program.bin ready."

# --- C files (both . and user/) ---
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# --- assembly: real NASM if available, else the converter + GNU as ---
%.o: %.s
	@if command -v nasm >/dev/null 2>&1; then \
		nasm -f elf32 $< -o $@; \
	else \
		echo "[$@] nasm not found -> tools/nasm2gas.py + as"; \
		python3 tools/nasm2gas.py $< $@.gas.s; \
		as --32 -o $@ $@.gas.s; \
	fi

run: kernel.elf program.bin
	qemu-system-i386 -kernel kernel.elf -initrd program.bin -serial stdio -no-reboot

run-headless: kernel.elf program.bin
	qemu-system-i386 -kernel kernel.elf -initrd program.bin -serial stdio -display none -no-reboot

# Optional: full GRUB bootable ISO (the "classic" way from the book)
iso: kernel.elf program.bin
	mkdir -p iso/boot/grub iso/modules
	cp kernel.elf iso/boot/
	cp program.bin iso/modules/
	cp grub/menu.lst iso/boot/grub/
	cp grub/stage2_eltorito iso/boot/grub/
	@if command -v genisoimage >/dev/null 2>&1; then \
		genisoimage -R -b boot/grub/stage2_eltorito -no-emul-boot \
			-boot-load-size 4 -A TinyOS -input-charset utf8 -quiet \
			-boot-info-table -o os.iso iso; \
	elif command -v xorriso >/dev/null 2>&1; then \
		xorriso -as mkisofs -R -b boot/grub/stage2_eltorito -no-emul-boot \
			-boot-load-size 4 -A TinyOS -input-charset utf8 -quiet \
			-boot-info-table -o os.iso iso; \
	else \
		echo "need genisoimage or xorriso: brew install cdrtools (or xorriso)"; exit 1; \
	fi
	@echo "os.iso ready - boot it with: qemu-system-i386 -cdrom os.iso -serial stdio"

smoke: kernel.elf
	python3 tests/smoke.py kernel.elf

clean:
	rm -f *.o user/*.o *.gas.s user/*.gas.s kernel.elf program.bin os.iso
	rm -rf iso

.PHONY: all run run-headless iso smoke clean
