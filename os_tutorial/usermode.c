/* usermode.c - unpack the guest program and hand it the visitor badge. */
#include "usermode.h"
#include "klib.h"
#include "gdt.h"
#include "idt.h"

#define USER_CODE_ADDR 0x00400000
#define USER_STACK_TOP 0x00800000

/* the kernel stack lives in loader.s */
extern u8 kernel_stack[];
#define KERNEL_STACK_SIZE 16384

void kernel_after_user(void) {
    kprintf("[kernel] back in the boss's chair. Halting.\n");
    for (;;) __asm__ volatile("cli; hlt");
}

void usermode_try_start(multiboot_info_t *mbi) {
    if (!(mbi->flags & MULTIBOOT_INFO_MODS) || mbi->mods_count == 0) {
        kprintf("[kernel] no user program loaded (see README: make run).\n");
        return;
    }

    multiboot_module_t *mod = (multiboot_module_t *)mbi->mods_addr;
    u32 size = mod->mod_end - mod->mod_start;
    kprintf("[kernel] user program found: %u bytes at 0x%x\n", size, mod->mod_start);

    if (size > (USER_STACK_TOP - USER_CODE_ADDR - 4096))
        panic("user program too big");

    /* Copy the program into user-land (address 0x400000). */
    memcpy((void *)USER_CODE_ADDR, (const void *)mod->mod_start, size);

    /* When the user program rings a doorbell, the CPU switches to THIS stack. */
    tss_set_kernel_stack((u32)(kernel_stack + KERNEL_STACK_SIZE));

    kprintf("[kernel] entering user mode... try typing!\n");
    enter_user_mode();
}

/* memcpy + panic come from klib */
extern void *memcpy(void *dest, const void *src, u32 n);
extern void panic(const char *msg) __attribute__((noreturn));
