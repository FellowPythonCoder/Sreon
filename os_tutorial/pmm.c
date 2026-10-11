/* pmm.c - track which 4 KB "page frames" are free (book ch. 10).

   One checkbox (bit) per frame. 1 = taken, 0 = free.
   We support up to 128 MB of RAM = 32768 frames = 4096 bytes of bits.
*/
#include "pmm.h"
#include "klib.h"

#define FRAME_SIZE  4096u
#define MAX_FRAMES  32768u
#define BITMAP_BYTES (MAX_FRAMES / 8)

static u8 bitmap[BITMAP_BYTES];
static u32 frame_count = 0;

static void mark_used(u32 frame) { bitmap[frame / 8] |=  (u8)(1 << (frame % 8)); }
static void mark_free(u32 frame) { bitmap[frame / 8] &= (u8)~(1 << (frame % 8)); }
static int is_used(u32 frame)    { return (bitmap[frame / 8] >> (frame % 8)) & 1; }

static void mark_range_used(u32 start, u32 end) {
    for (u32 a = start / FRAME_SIZE; a < (end + FRAME_SIZE - 1) / FRAME_SIZE && a < MAX_FRAMES; a++)
        mark_used(a);
}

static void mark_range_free(u32 start, u32 end) {
    for (u32 a = start / FRAME_SIZE; a < (end + FRAME_SIZE - 1) / FRAME_SIZE && a < MAX_FRAMES; a++)
        mark_free(a);
}

void pmm_init(multiboot_info_t *mbi, u32 kernel_end) {
    for (u32 i = 0; i < BITMAP_BYTES; i++) bitmap[i] = 0xFF;  /* assume taken */
    frame_count = MAX_FRAMES;

    if (mbi->flags & MULTIBOOT_INFO_MMAP) {
        kprintf("memory map from bootloader:\n");
        u32 pos = mbi->mmap_addr;
        while (pos < mbi->mmap_addr + mbi->mmap_length) {
            multiboot_mmap_t *e = (multiboot_mmap_t *)pos;
            u32 base = e->base_addr_low;
            u32 len  = e->len_low;
            kprintf("  0x%x + %u KB (%s)\n", base, len / 1024,
                    e->type == 1 ? "usable" : "reserved");
            if (e->type == 1) mark_range_free(base, base + len);
            pos += e->size + sizeof(e->size);
        }
    } else if (mbi->flags & MULTIBOOT_INFO_MEMORY) {
        /* Short version: RAM runs from 1 MB up to mem_upper KB above it. */
        kprintf("no mmap; using mem_upper = %u KB\n", mbi->mem_upper);
        mark_range_free(0x00100000, 0x00100000 + mbi->mem_upper * 1024);
    } else {
        panic("bootloader told us nothing about memory");
    }

    /* Never hand out: the first MB (BIOS, VGA, ...) and the kernel itself. */
    mark_range_used(0x00000000, kernel_end);
    /* Reserve our own bitmap too (it sits inside the kernel - already covered). */

    kprintf("page frames: %u total, %u free (4 KB each)\n",
            frame_count, pmm_free_frames());
}

u32 pmm_alloc_frame(void) {
    for (u32 f = 0; f < frame_count; f++) {
        if (!is_used(f)) {
            mark_used(f);
            return f * FRAME_SIZE;
        }
    }
    return 0;   /* out of memory */
}

u32 pmm_free_frames(void) {
    u32 n = 0;
    for (u32 f = 0; f < frame_count; f++)
        if (!is_used(f)) n++;
    return n;
}
