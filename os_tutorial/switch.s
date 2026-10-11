; -------------------------------------------------------------
; switch.s - drop the boss uniform, put on the visitor badge.
; enter_user_mode() never returns: it "iret"s into ring 3.
; -------------------------------------------------------------
global enter_user_mode

section .text

enter_user_mode:
    cli
    mov ax, 0x23                ; user DATA selector (0x20) | RPL 3
    mov ds, ax
    mov es, ax
    mov fs, ax
    mov gs, ax
    push dword 0x23             ; ss  - user data selector | RPL 3
    push dword 0x00800000       ; esp - top of the user stack
    pushfd                      ; eflags...
    pop eax
    or eax, 0x200               ; ...with the INTERRUPT flag switched ON
    push eax
    push dword 0x1B             ; cs  - user code selector (0x18) | RPL 3
    push dword 0x00400000       ; eip - first instruction of the program
    iret                        ; knock-knock: user mode!
