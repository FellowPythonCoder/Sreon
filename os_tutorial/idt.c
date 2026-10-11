/* idt.c - the "phone book" of interrupt handlers (book ch. 6). */
#include "idt.h"
#include "klib.h"
#include "pic.h"
#include "keyboard.h"
#include "syscall.h"

typedef struct {
    u16 offset_low;
    u16 selector;
    u8  zero;
    u8  flags;
    u16 offset_high;
} __attribute__((packed)) idt_gate_t;

typedef struct {
    u16 limit;
    u32 base;
} __attribute__((packed)) idt_ptr_t;

static idt_gate_t idt[256];
static idt_ptr_t  idt_ptr;

void idt_set_gate(u8 num, u32 handler, u16 selector, u8 flags) {
    idt[num].offset_low  = (u16)(handler & 0xFFFF);
    idt[num].offset_high = (u16)((handler >> 16) & 0xFFFF);
    idt[num].selector    = selector;
    idt[num].zero        = 0;
    idt[num].flags       = flags;
}

/* The 48+1 stubs generated in isr.s */
extern void isr_0(void);  extern void isr_1(void);  extern void isr_2(void);
extern void isr_3(void);  extern void isr_4(void);  extern void isr_5(void);
extern void isr_6(void);  extern void isr_7(void);  extern void isr_8(void);
extern void isr_9(void);  extern void isr_10(void); extern void isr_11(void);
extern void isr_12(void); extern void isr_13(void); extern void isr_14(void);
extern void isr_15(void); extern void isr_16(void); extern void isr_17(void);
extern void isr_18(void); extern void isr_19(void); extern void isr_20(void);
extern void isr_21(void); extern void isr_22(void); extern void isr_23(void);
extern void isr_24(void); extern void isr_25(void); extern void isr_26(void);
extern void isr_27(void); extern void isr_28(void); extern void isr_29(void);
extern void isr_30(void); extern void isr_31(void);
extern void isr_32(void); extern void isr_33(void); extern void isr_34(void);
extern void isr_35(void); extern void isr_36(void); extern void isr_37(void);
extern void isr_38(void); extern void isr_39(void); extern void isr_40(void);
extern void isr_41(void); extern void isr_42(void); extern void isr_43(void);
extern void isr_44(void); extern void isr_45(void); extern void isr_46(void);
extern void isr_47(void);
extern void isr_128(void);

static const char *exception_names[32] = {
    "divide by zero", "debug", "non-maskable interrupt", "breakpoint",
    "overflow", "bound range exceeded", "invalid opcode", "device not available",
    "double fault", "coprocessor overrun", "invalid TSS", "segment not present",
    "stack-segment fault", "general protection fault", "page fault",
    "reserved", "x87 floating-point", "alignment check", "machine check",
    "SIMD floating-point", "virtualization", "control protection",
    "reserved", "reserved", "reserved", "reserved", "reserved", "reserved",
    "hypervisor injection", "VMM communication", "security", "reserved"
};

void idt_init(void) {
    idt_ptr.limit = sizeof(idt) - 1;
    idt_ptr.base  = (u32)&idt;

    void (*stubs[49])(void) = {
        isr_0, isr_1, isr_2, isr_3, isr_4, isr_5, isr_6, isr_7,
        isr_8, isr_9, isr_10, isr_11, isr_12, isr_13, isr_14, isr_15,
        isr_16, isr_17, isr_18, isr_19, isr_20, isr_21, isr_22, isr_23,
        isr_24, isr_25, isr_26, isr_27, isr_28, isr_29, isr_30, isr_31,
        isr_32, isr_33, isr_34, isr_35, isr_36, isr_37, isr_38, isr_39,
        isr_40, isr_41, isr_42, isr_43, isr_44, isr_45, isr_46, isr_47,
        isr_128
    };

    for (int i = 0; i < 48; i++)
        idt_set_gate((u8)i, (u32)stubs[i], 0x08, 0x8E);

    /* int 0x80: the system-call doorbell. Flags 0xEE = present, DPL 3,
       32-bit interrupt gate - user programs ARE allowed to ring it. */
    idt_set_gate(0x80, (u32)stubs[48], 0x08, 0xEE);

    idt_load((u32)&idt_ptr);
}

void interrupt_handler(cpu_state_t *cpu) {
    if (cpu->int_no < 32) {
        kprintf("\nEXCEPTION %u (%s) at eip=0x%x err=0x%x\n",
                cpu->int_no, exception_names[cpu->int_no], cpu->eip, cpu->err_code);
        if (cpu->int_no == 14) {
            u32 cr2;
            __asm__ volatile("mov %%cr2, %0" : "=r"(cr2));
            kprintf("page fault: tried to use address 0x%x\n", cr2);
        }
        panic("unhandled CPU exception");
    } else if (cpu->int_no >= 32 && cpu->int_no < 48) {
        if (cpu->int_no == 33) keyboard_interrupt();   /* IRQ1 = keyboard */
        pic_acknowledge(cpu->int_no);
    } else if (cpu->int_no == 0x80) {
        cpu->eax = syscall_dispatch(cpu);   /* return value goes to eax! */
    }
}
