/* usermode.h */
#ifndef TINYOS_USERMODE_H
#define TINYOS_USERMODE_H

#include "types.h"
#include "multiboot.h"

void usermode_try_start(multiboot_info_t *mbi);
void kernel_after_user(void);   /* where SYS_EXIT sends us back */

/* implemented in switch.s - never returns */
void enter_user_mode(void);

#endif
