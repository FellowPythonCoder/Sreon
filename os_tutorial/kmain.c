/* -------------------------------------------------------------
   kmain.c - the boss's first day at work.

   Order of business:
     1. say hello (screen + serial logbook)
     2. check the bootloader's magic handshake
     3. set up segments (GDT), interrupts (IDT), the PIC, keyboard
     4. turn on paging + the page-frame allocator
     5. start the user program (if one was loaded) - or just echo keys
   -------------------------------------------------------------
*/
#include "types.h"
#include "multiboot.h"
#include "klib.h"
#include "fb.h"
#include "serial.h"
#include "gdt.h"
#include "idt.h"
#include "pic.h"
#include "keyboard.h"
#include "paging.h"
#include "pmm.h"
#include "usermode.h"

extern u8 kernel_stack[];            /* defined in loader.s */
#define KERNEL_STACK_SIZE 16384

/* End of the kernel image, from link.ld */
extern u8 _kernel_end[];

static void shell(void) {
    kprintf("\nTinyOS shell - type something and I will echo it!\n");
    kprintf("(with a user program installed, it runs instead - see README)\n> ");
    for (;;) {
        int c = keyboard_getchar();
        if (c == '\n') kprintf("\n> ");
        else kputchar((char)c);
    }
}

void kmain(u32 magic, u32 mbi_addr) {
    fb_init();
    serial_init();
    kprintf("Welcome to TinyOS 0.1!\n");
    kprintf("built for real by YOU, following the visual guide.\n\n");

    if (magic != MULTIBOOT_BOOTLOADER_MAGIC)
        panic("bad bootloader magic - not started via multiboot?");

    multiboot_info_t *mbi = (multiboot_info_t *)mbi_addr;
    kprintf("bootloader flags: 0x%x\n", mbi->flags);
    if (mbi->flags & MULTIBOOT_INFO_MEMORY)
        kprintf("memory: low = %u KB, upper = %u KB\n",
                mbi->mem_lower, mbi->mem_upper);

    gdt_init();
    kprintf("gdt: segments ready (kernel PL0, user PL3)\n");

    idt_init();
    kprintf("idt: interrupt handlers installed\n");

    pic_init();
    keyboard_init();
    kprintf("pic + keyboard: doorbells wired up\n");

    paging_init();
    kprintf("paging: fake addresses ON (identity map, 4 MB pages)\n");

    pmm_init(mbi, (u32)_kernel_end);
    kprintf("pmm: landlord on duty\n");

    /* Allow interrupts from here on (keyboard!). */
    enable_interrupts();

    kprintf("\nREADY.\n");

    /* If a user program came with the boot, run it in user mode. */
    usermode_try_start(mbi);

    /* Otherwise (or if it returns) we just sit and echo keystrokes. */
    shell();
}
