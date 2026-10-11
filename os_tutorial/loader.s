; -------------------------------------------------------------
; TinyOS loader.s - the first code that runs (NASM syntax)
;
; Jobs: (1) show the multiboot "secret handshake" header so the
; bootloader agrees to start us, (2) set up a stack, (3) call
; the C function kmain().
; -------------------------------------------------------------
global loader                 ; the entry symbol for ELF
global kernel_stack           ; C code needs the stack address (usermode.c)
extern kmain                  ; kmain() lives in kmain.c

MAGIC_NUMBER    equ 0x1BADB002            ; the bootloader's magic number
ALIGN_MODULES   equ 0x00000001            ; ask: page-align loaded modules
MEMINFO         equ 0x00000002            ; ask: give us a memory map
FLAGS           equ ALIGN_MODULES | MEMINFO
CHECKSUM        equ -(MAGIC_NUMBER + FLAGS)

KERNEL_STACK_SIZE equ 16384               ; 16 KB of stack

section .text
align 4
    dd MAGIC_NUMBER                       ; the magic number itself
    dd FLAGS                              ; the flags
    dd CHECKSUM                           ; so magic+flags+checksum = 0

loader:
    mov esp, kernel_stack + KERNEL_STACK_SIZE   ; point esp to TOP of stack
    push ebx                            ; argument 2: multiboot info pointer
    push eax                            ; argument 1: multiboot magic (0x2BADB002)
    call kmain                          ; jump into C code!
.hang:
    cli                                 ; if kmain ever returns: stop forever
    hlt
    jmp .hang

section .bss
align 16
kernel_stack: resb KERNEL_STACK_SIZE    ; reserve room for the stack
