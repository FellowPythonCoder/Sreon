/* syscall.h */
#ifndef TINYOS_SYSCALL_H
#define TINYOS_SYSCALL_H

#include "types.h"
#include "idt.h"

#define SYS_WRITE 0    /* ebx = buffer, ecx = length  */
#define SYS_GETCHAR 1  /* returns a character in eax  */
#define SYS_EXIT  2    /* never returns to user mode  */
#define SYS_PUTC  3    /* ebx = character             */

u32 syscall_dispatch(cpu_state_t *cpu);

#endif
