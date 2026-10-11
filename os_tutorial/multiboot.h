/* multiboot.h - the "handover note" the bootloader gives us in ebx. */
#ifndef TINYOS_MULTIBOOT_H
#define TINYOS_MULTIBOOT_H

#include "types.h"

#define MULTIBOOT_BOOTLOADER_MAGIC 0x2BADB002

/* flags bits we care about */
#define MULTIBOOT_INFO_MEMORY  0x00000001  /* mem_lower / mem_upper valid */
#define MULTIBOOT_INFO_MODS    0x00000008  /* mods_count / mods_addr valid */
#define MULTIBOOT_INFO_MMAP    0x00000040  /* mmap_length / mmap_addr valid */

typedef struct {
    u32 flags;
    u32 mem_lower;      /* KB of "low" memory below 1 MB */
    u32 mem_upper;      /* KB of memory starting at 1 MB */
    u32 boot_device;
    u32 cmdline;
    u32 mods_count;     /* how many modules were loaded */
    u32 mods_addr;      /* where the module list lives */
    u32 syms[4];
    u32 mmap_length;
    u32 mmap_addr;
} __attribute__((packed)) multiboot_info_t;

typedef struct {
    u32 mod_start;      /* first byte of the module  */
    u32 mod_end;        /* one past the last byte    */
    u32 string;
    u32 reserved;
} __attribute__((packed)) multiboot_module_t;

typedef struct {
    u32 size;           /* size of this entry, NOT counting this field */
    u32 base_addr_low;
    u32 base_addr_high;
    u32 len_low;
    u32 len_high;
    u32 type;           /* 1 = usable RAM, anything else = reserved */
} __attribute__((packed)) multiboot_mmap_t;

#endif
