/* pmm.h - the memory landlord. */
#ifndef TINYOS_PMM_H
#define TINYOS_PMM_H

#include "types.h"
#include "multiboot.h"

void  pmm_init(multiboot_info_t *mbi, u32 kernel_end);
u32   pmm_alloc_frame(void);     /* returns a 4 KB physical address, or 0 */
u32   pmm_free_frames(void);

#endif
