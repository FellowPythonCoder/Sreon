/* gdt.h */
#ifndef TINYOS_GDT_H
#define TINYOS_GDT_H

#include "types.h"

void gdt_init(void);
void tss_set_kernel_stack(u32 stack_top);

/* implemented in cpu.s */
void gdt_flush(u32 gdt_ptr_addr);
void tss_flush(void);

#endif
