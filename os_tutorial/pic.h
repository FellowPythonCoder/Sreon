/* pic.h */
#ifndef TINYOS_PIC_H
#define TINYOS_PIC_H

#include "types.h"

void pic_init(void);
void pic_acknowledge(u32 interrupt);

#endif
