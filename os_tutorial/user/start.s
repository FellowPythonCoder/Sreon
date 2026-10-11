; user/start.s - the "welcome mat" of every user program.
; It MUST be the first code (offset 0). It just calls main().
extern main
section .text
global _start
_start:
    call main
.hang:                      ; if main returns without SYS_EXIT, spin
    jmp .hang
