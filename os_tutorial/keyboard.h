/* keyboard.h */
#ifndef TINYOS_KEYBOARD_H
#define TINYOS_KEYBOARD_H

#include "types.h"

void keyboard_init(void);
void keyboard_interrupt(void);   /* called from the IRQ1 handler */
int  keyboard_getchar(void);     /* blocks until a key arrives; -1 = none */

#endif
