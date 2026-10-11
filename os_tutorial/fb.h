/* fb.h - the screen driver (80x25 tiles of light). */
#ifndef TINYOS_FB_H
#define TINYOS_FB_H

#include "types.h"

/* the 16 colors a tile can use */
enum fb_color {
    FB_BLACK = 0, FB_BLUE = 1, FB_GREEN = 2, FB_CYAN = 3,
    FB_RED = 4, FB_MAGENTA = 5, FB_BROWN = 6, FB_LIGHT_GREY = 7,
    FB_DARK_GREY = 8, FB_LIGHT_BLUE = 9, FB_LIGHT_GREEN = 10,
    FB_LIGHT_CYAN = 11, FB_LIGHT_RED = 12, FB_LIGHT_MAGENTA = 13,
    FB_LIGHT_BROWN = 14, FB_WHITE = 15
};

void fb_init(void);
void fb_clear(void);
void fb_set_color(u8 fg, u8 bg);
void fb_putc(char c);
void fb_write(const char *buf, u32 len);

#endif
