/* gdt.c - the "name tags" that decide privilege levels (see book ch. 5/11). */
#include "gdt.h"
#include "klib.h"

typedef struct {
    u16 limit_low;
    u16 base_low;
    u8  base_mid;
    u8  access;
    u8  granularity;
    u8  base_high;
} __attribute__((packed)) gdt_entry_t;

typedef struct {
    u16 limit;
    u32 base;
} __attribute__((packed)) gdt_ptr_t;

typedef struct {
    u32 prev_tss, esp0, ss0, esp1, ss1, esp2, ss2, cr3;
    u32 eip, eflags, eax, ecx, edx, ebx, esp, ebp, esi, edi;
    u32 es, cs, ss, ds, fs, gs, ldt;
    u16 trap, iomap_base;
} __attribute__((packed)) tss_t;

static gdt_entry_t gdt[6];
static gdt_ptr_t   gdt_ptr;
static tss_t       tss;

static void gdt_set_gate(int i, u32 base, u32 limit, u8 access, u8 gran) {
    gdt[i].base_low    = (u16)(base & 0xFFFF);
    gdt[i].base_mid    = (u8)((base >> 16) & 0xFF);
    gdt[i].base_high   = (u8)((base >> 24) & 0xFF);
    gdt[i].limit_low   = (u16)(limit & 0xFFFF);
    gdt[i].granularity = (u8)(((limit >> 16) & 0x0F) | (gran & 0xF0));
    gdt[i].access      = access;
}

void tss_set_kernel_stack(u32 stack_top) {
    tss.esp0 = stack_top;
}

void gdt_init(void) {
    gdt_ptr.limit = sizeof(gdt) - 1;
    gdt_ptr.base  = (u32)&gdt;

    gdt_set_gate(0, 0, 0, 0, 0);                /* 0x00: the mandatory null */
    gdt_set_gate(1, 0, 0xFFFFFFFF, 0x9A, 0xCF); /* 0x08: kernel code, PL0 */
    gdt_set_gate(2, 0, 0xFFFFFFFF, 0x92, 0xCF); /* 0x10: kernel data, PL0 */
    gdt_set_gate(3, 0, 0xFFFFFFFF, 0xFA, 0xCF); /* 0x18: user code,   PL3 */
    gdt_set_gate(4, 0, 0xFFFFFFFF, 0xF2, 0xCF); /* 0x20: user data,   PL3 */

    /* 0x28: the TSS - tells the CPU which stack to use when a
       user-mode program rings the doorbell (int 0x80). */
    memset(&tss, 0, sizeof(tss));
    tss.ss0 = 0x10;                     /* kernel data selector */
    tss.esp0 = 0x00090000;              /* replaced in usermode.c */
    tss.iomap_base = sizeof(tss);       /* no I/O permission bitmap */
    gdt_set_gate(5, (u32)&tss, sizeof(tss) - 1, 0x89, 0x00);

    gdt_flush((u32)&gdt_ptr);
    tss_flush();
}
