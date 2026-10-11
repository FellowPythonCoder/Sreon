/* syscall.c - the service counter for user programs (book ch. 13). */
#include "syscall.h"
#include "klib.h"
#include "fb.h"
#include "serial.h"
#include "keyboard.h"
#include "usermode.h"

u32 syscall_dispatch(cpu_state_t *cpu) {
    switch (cpu->eax) {
    case SYS_WRITE: {
        const char *buf = (const char *)cpu->ebx;
        u32 len = cpu->ecx;
        for (u32 i = 0; i < len; i++) kputchar(buf[i]);
        return len;
    }
    case SYS_GETCHAR:
        return (u32)keyboard_getchar();
    case SYS_PUTC:
        kputchar((char)cpu->ebx);
        return 0;
    case SYS_EXIT:
        kprintf("\n[kernel] user program exited. Welcome back!\n");
        /* "Return to the kernel" = simply change where iret jumps to. */
        cpu->cs = 0x08;
        cpu->eip = (u32)kernel_after_user;
        cpu->eax = 0;
        return 0;
    default:
        return (u32)-1;
    }
}
