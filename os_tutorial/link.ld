/* link.ld - the blueprint that decides WHERE the kernel lives in memory. */
ENTRY(loader)
SECTIONS
{
    . = 0x00100000;                 /* load at 1 MB (below this: BIOS etc.) */

    .text ALIGN(0x1000) :
    {
        *(.text)
    }

    .rodata ALIGN(0x1000) :
    {
        *(.rodata*)
    }

    .data ALIGN(0x1000) :
    {
        *(.data)
    }

    .bss ALIGN(0x1000) :
    {
        *(COMMON)
        *(.bss)
    }

    _kernel_end = .;                /* pmm needs to know where we stop */
}
