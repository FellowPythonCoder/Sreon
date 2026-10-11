/* klib.c - printing and small utilities. */
#include "klib.h"
#include "fb.h"
#include "serial.h"

/* Compiler built-in varargs: no standard library needed at all. */
typedef __builtin_va_list va_list;
#define va_start(ap, last) __builtin_va_start(ap, last)
#define va_arg(ap, type)   __builtin_va_arg(ap, type)
#define va_end(ap)         __builtin_va_end(ap)

void kputchar(char c) {
    fb_putc(c);
    serial_putc(c);
}

static void print_unsigned(u32 value, u32 base) {
    char buf[16];
    const char *digits = "0123456789abcdef";
    int i = 0;
    if (value == 0) { kputchar('0'); return; }
    while (value > 0) {
        buf[i++] = digits[value % base];
        value /= base;
    }
    while (i-- > 0) kputchar(buf[i]);
}

/* A tiny printf: understands %s %c %d %u %x %p %%  */
void kprintf(const char *fmt, ...) {
    va_list ap;
    va_start(ap, fmt);
    for (u32 i = 0; fmt[i] != '\0'; i++) {
        if (fmt[i] != '%') {
            kputchar(fmt[i]);
            continue;
        }
        i++;
        switch (fmt[i]) {
        case 's': {
            const char *s = va_arg(ap, const char *);
            if (!s) s = "(null)";
            while (*s) kputchar(*s++);
            break;
        }
        case 'c': kputchar((char)va_arg(ap, int)); break;
        case 'd': {
            i32 v = va_arg(ap, i32);
            if (v < 0) { kputchar('-'); print_unsigned((u32)(-v), 10); }
            else print_unsigned((u32)v, 10);
            break;
        }
        case 'u': print_unsigned(va_arg(ap, u32), 10); break;
        case 'x': print_unsigned(va_arg(ap, u32), 16); break;
        case 'p': kputchar('0'); kputchar('x'); print_unsigned(va_arg(ap, u32), 16); break;
        case '%': kputchar('%'); break;
        default:  kputchar('?'); break;
        }
    }
    va_end(ap);
}

void panic(const char *msg) {
    fb_set_color(FB_WHITE, FB_RED);
    kprintf("\nPANIC: %s\n", msg);
    for (;;) {                          /* stop dead */
        __asm__ volatile("cli; hlt");
    }
}

void *memset(void *dest, int value, u32 n) {
    u8 *d = (u8 *)dest;
    for (u32 i = 0; i < n; i++) d[i] = (u8)value;
    return dest;
}

void *memcpy(void *dest, const void *src, u32 n) {
    u8 *d = (u8 *)dest;
    const u8 *s = (const u8 *)src;
    for (u32 i = 0; i < n; i++) d[i] = s[i];
    return dest;
}

u32 strlen(const char *s) {
    u32 n = 0;
    while (s[n]) n++;
    return n;
}
