/* klib.h - little helpers: printing, panics, memory utilities. */
#ifndef TINYOS_KLIB_H
#define TINYOS_KLIB_H

#include "types.h"

void  kprintf(const char *fmt, ...);   /* prints to screen AND serial log */
void  kputchar(char c);
void  panic(const char *msg) __attribute__((noreturn));

void *memset(void *dest, int value, u32 n);
void *memcpy(void *dest, const void *src, u32 n);
u32   strlen(const char *s);

#endif
