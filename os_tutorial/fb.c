/* fb.c - write text to the screen by poking memory at 0xB8000. */
#include "fb.h"

#define FB_ADDR      0x000B8000
#define FB_COLS      80
#define FB_ROWS      25

#define FB_COMMAND_PORT  0x3D4
#define FB_DATA_PORT     0x3D5
#define FB_HIGH_BYTE     14
#define FB_LOW_BYTE      15

static u16 *const fb = (u16 *)FB_ADDR;
static u32 cursor_row = 0;
static u32 cursor_col = 0;
static u8  fg = FB_LIGHT_GREY;
static u8  bg = FB_BLACK;

/* outb() lives in io.s */
extern void outb(u16 port, u8 data);

static void move_cursor(void) {
    u16 pos = (u16)(cursor_row * FB_COLS + cursor_col);
    outb(FB_COMMAND_PORT, FB_HIGH_BYTE);
    outb(FB_DATA_PORT,    (u8)((pos >> 8) & 0xFF));
    outb(FB_COMMAND_PORT, FB_LOW_BYTE);
    outb(FB_DATA_PORT,    (u8)(pos & 0xFF));
}

static void scroll(void) {
    for (u32 r = 1; r < FB_ROWS; r++)
        for (u32 c = 0; c < FB_COLS; c++)
            fb[(r - 1) * FB_COLS + c] = fb[r * FB_COLS + c];
    for (u32 c = 0; c < FB_COLS; c++)
        fb[(FB_ROWS - 1) * FB_COLS + c] = (u16)(' ' | ((u16)((bg << 4) | fg) << 8));
    cursor_row = FB_ROWS - 1;
}

void fb_clear(void) {
    for (u32 i = 0; i < FB_COLS * FB_ROWS; i++)
        fb[i] = (u16)(' ' | ((u16)((bg << 4) | fg) << 8));
    cursor_row = 0;
    cursor_col = 0;
    move_cursor();
}

void fb_init(void) {
    fb_clear();
}

void fb_set_color(u8 foreground, u8 background) {
    fg = foreground & 0x0F;
    bg = background & 0x0F;
}

void fb_putc(char c) {
    if (c == '\n') {
        cursor_col = 0;
        cursor_row++;
    } else if (c == '\r') {
        cursor_col = 0;
    } else if (c == '\b') {
        if (cursor_col > 0) {
            cursor_col--;
            fb[cursor_row * FB_COLS + cursor_col] =
                (u16)(' ' | ((u16)((bg << 4) | fg) << 8));
        }
    } else {
        fb[cursor_row * FB_COLS + cursor_col] =
            (u16)((u8)c | ((u16)((bg << 4) | fg) << 8));
        cursor_col++;
        if (cursor_col == FB_COLS) { cursor_col = 0; cursor_row++; }
    }
    if (cursor_row == FB_ROWS) scroll();
    move_cursor();
}

void fb_write(const char *buf, u32 len) {
    for (u32 i = 0; i < len; i++) fb_putc(buf[i]);
}
