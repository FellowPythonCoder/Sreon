/* paging.c - fake addresses for everyone! (book ch. 9)

   Plan: identity-map the first 16 MB of RAM using big 4 MB pages:
     entry 0: 0x00000000 - 0x003FFFFF  kernel + VGA screen   (boss only)
     entry 1: 0x00400000 - 0x007FFFFF  user program + stack  (VISITORS ok)
     entry 2: 0x00800000 - 0x00BFFFFF  extra RAM             (boss only)
     entry 3: 0x00C00000 - 0x00FFFFFF  extra RAM             (boss only)
*/
#include "paging.h"

#define PAGE_DIR_ENTRIES 1024
#define PAGE_PRESENT  0x001
#define PAGE_RW       0x002
#define PAGE_USER     0x004
#define PAGE_4MB      0x080   /* the PSE bit inside a directory entry */

static u32 page_directory[PAGE_DIR_ENTRIES] __attribute__((aligned(4096)));

void paging_init(void) {
    for (int i = 0; i < PAGE_DIR_ENTRIES; i++)
        page_directory[i] = 0;

    /* "identity": fake address == real address. Just fill 4 slices. */
    for (int i = 0; i < 4; i++) {
        u32 flags = PAGE_PRESENT | PAGE_RW | PAGE_4MB;
        if (i == 1) flags |= PAGE_USER;          /* visitors may enter this slice */
        page_directory[i] = (u32)(i * 0x00400000) | flags;
    }

    /* Turn on 4 MB pages (PSE), point cr3 at our directory, enable paging. */
    __asm__ volatile("mov %%cr4, %%eax\n\t"
                     "or $0x10, %%eax\n\t"
                     "mov %%eax, %%cr4" ::: "eax", "memory");
    __asm__ volatile("mov %0, %%cr3" :: "r"(page_directory) : "memory");
    __asm__ volatile("mov %%cr0, %%eax\n\t"
                     "or $0x80000000, %%eax\n\t"
                     "mov %%eax, %%cr0" ::: "eax", "memory");
}
