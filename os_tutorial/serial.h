/* serial.h - the logbook driver (COM1). */
#ifndef TINYOS_SERIAL_H
#define TINYOS_SERIAL_H

#include "types.h"

void serial_init(void);
void serial_putc(char c);
void serial_write(const char *buf, u32 len);

#endif
