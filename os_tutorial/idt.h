/* idt.h */
#ifndef TINYOS_IDT_H
#define TINYOS_IDT_H

#include "types.h"

/* Saved register state when an interrupt happens (matches isr.s). */
typedef struct {
    u32 edi, esi, ebp, esp_dummy, ebx, edx, ecx, eax;  /* pusha order */
    u32 int_no, err_code;
    u32 eip, cs, eflags;
    u32 useresp, ss;   /* only present after a privilege-level switch */
} __attribute__((packed)) cpu_state_t;

void idt_init(void);
void idt_set_gate(u8 num, u32 handler, u16 selector, u8 flags);

/* implemented in cpu.s */
void idt_load(u32 idt_ptr_addr);
void enable_interrupts(void);
void disable_interrupts(void);

/* the C function called by isr_common (see isr.s) */
void interrupt_handler(cpu_state_t *cpu);

#endif
