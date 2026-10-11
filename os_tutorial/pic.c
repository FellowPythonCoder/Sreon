/* pic.c - the mailroom that forwards hardware doorbells to us. */
#include "pic.h"
#include "klib.h"

extern void outb(u16 port, u8 data);

#define PIC1_CMD  0x20
#define PIC1_DATA 0x21
#define PIC2_CMD  0xA0
#define PIC2_DATA 0xA1

#define PIC1_START 0x20     /* IRQs 0-7  arrive as interrupts 32-39 */
#define PIC2_START 0x28     /* IRQs 8-15 arrive as interrupts 40-47 */
#define PIC_ACK    0x20

void pic_init(void) {
    /* Start the "remap dance" (ICW1-ICW4). Details:
       http://wiki.osdev.org/PIC - you can just copy this. */
    outb(PIC1_CMD, 0x11); outb(PIC2_CMD, 0x11);
    outb(PIC1_DATA, PIC1_START); outb(PIC2_DATA, PIC2_START);
    outb(PIC1_DATA, 0x04); outb(PIC2_DATA, 0x02);
    outb(PIC1_DATA, 0x01); outb(PIC2_DATA, 0x01);

    /* Mask everything EXCEPT the keyboard (IRQ1). 0xFD = 11111101. */
    outb(PIC1_DATA, 0xFD);
    outb(PIC2_DATA, 0xFF);
}

void pic_acknowledge(u32 interrupt) {
    if (interrupt < PIC1_START || interrupt > PIC2_START + 7) return;
    if (interrupt >= PIC2_START) outb(PIC2_CMD, PIC_ACK);
    outb(PIC1_CMD, PIC_ACK);   /* the slave hangs off the master */
}
