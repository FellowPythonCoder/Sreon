/* serial.c - log everything to COM1 (QEMU: -serial stdio shows it). */
#include "serial.h"
#include "klib.h"

extern void outb(u16 port, u8 data);
extern u8   inb(u16 port);

#define COM1 0x3F8

#define DATA_PORT(base)         (base)
#define FIFO_COMMAND_PORT(base) ((base) + 2)
#define LINE_COMMAND_PORT(base) ((base) + 3)
#define MODEM_COMMAND_PORT(base)((base) + 4)
#define LINE_STATUS_PORT(base)  ((base) + 5)

#define LINE_ENABLE_DLAB 0x80

void serial_configure_baud_rate(u16 divisor) {
    outb(LINE_COMMAND_PORT(COM1), LINE_ENABLE_DLAB);
    outb(DATA_PORT(COM1), (u8)((divisor >> 8) & 0xFF));
    outb(DATA_PORT(COM1), (u8)(divisor & 0xFF));
}

void serial_init(void) {
    serial_configure_baud_rate(1);   /* 115200 bits/s */
    outb(LINE_COMMAND_PORT(COM1), 0x03);  /* 8 bits, no parity, 1 stop bit */
    outb(FIFO_COMMAND_PORT(COM1), 0xC7);  /* enable + clear FIFOs */
    outb(MODEM_COMMAND_PORT(COM1), 0x03); /* ready to send + ready to receive */
}

static int transmit_fifo_empty(void) {
    return inb(LINE_STATUS_PORT(COM1)) & 0x20;
}

void serial_putc(char c) {
    while (!transmit_fifo_empty())
        ;                                  /* wait for the wire to be free */
    outb(DATA_PORT(COM1), (u8)c);
}

void serial_write(const char *buf, u32 len) {
    for (u32 i = 0; i < len; i++) {
        if (buf[i] == '\n') serial_putc('\r');
        serial_putc(buf[i]);
    }
}
