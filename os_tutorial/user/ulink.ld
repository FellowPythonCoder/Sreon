/* user/ulink.ld - pack the user program as a FLAT binary at 0x400000. */
OUTPUT_FORMAT("binary")
SECTIONS
{
    . = 0x00400000;
    .text ALIGN(4) :
    {
        user/start.o(.text)     /* the welcome mat goes FIRST */
        *(.text)
    }
    .rodata ALIGN(4) :
    {
        *(.rodata*)
    }
    .data ALIGN(4) :
    {
        *(.data)
    }
}
