/* keyboard.c - turn scan codes into actual characters. */
#include "keyboard.h"

extern u8 inb(u16 port);
extern void *memset(void *dest, int value, u32 n);

#define KBD_DATA_PORT 0x60

static const char scancode_to_ascii[128] = {
    0,  27, '1','2','3','4','5','6','7','8','9','0','-','=', '\b',
    '\t','q','w','e','r','t','y','u','i','o','p','[',']','\n', 0,
    'a','s','d','f','g','h','j','k','l',';','\'','`',  0,'\\',
    'z','x','c','v','b','n','m',',','.','/',  0, '*',  0, ' ',
};

static char ring[256];
static volatile u32 ring_head = 0;   /* next spot to WRITE */
static volatile u32 ring_tail = 0;   /* next spot to READ  */

void keyboard_init(void) {
    ring_head = 0;
    ring_tail = 0;
}

void keyboard_interrupt(void) {
    u8 sc = inb(KBD_DATA_PORT);       /* reading also tells the keyboard
                                         we got the message */
    if (sc & 0x80) return;            /* key RELEASE - ignore for now */
    if (sc >= 128) return;
    char c = scancode_to_ascii[sc];
    if (!c) return;
    u32 next = (ring_head + 1) % 256;
    if (next == ring_tail) return;    /* ring full: drop the key */
    ring[ring_head] = c;
    ring_head = next;
}

int keyboard_getchar(void) {
    for (;;) {
        if (ring_head != ring_tail) {
            char c = ring[ring_tail];
            ring_tail = (ring_tail + 1) % 256;
            return (int)(unsigned char)c;
        }
        /* nothing yet: let interrupts happen and nap until one does */
        __asm__ volatile("sti; hlt");
    }
}
