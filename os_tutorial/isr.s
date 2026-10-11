; -------------------------------------------------------------
; isr.s - interrupt stubs. The CPU jumps here when something
; happens. Each stub records "which interrupt was it?", then all
; of them meet at one common place that calls C code.
;
; NASM macros generate the 48 nearly-identical stubs.
; -------------------------------------------------------------
extern interrupt_handler

%macro no_error_code_interrupt_handler 1
global isr_%1
isr_%1:
    push dword 0                ; fake error code (this interrupt has none)
    push dword %1               ; which interrupt is this?
    jmp isr_common
%endmacro

%macro error_code_interrupt_handler 1
global isr_%1
isr_%1:
    push dword %1               ; which interrupt? (error code already pushed)
    jmp isr_common
%endmacro

section .text

; ----- CPU exceptions (0-31). Some push an error code themselves. -----
no_error_code_interrupt_handler 0
no_error_code_interrupt_handler 1
no_error_code_interrupt_handler 2
no_error_code_interrupt_handler 3
no_error_code_interrupt_handler 4
no_error_code_interrupt_handler 5
no_error_code_interrupt_handler 6
no_error_code_interrupt_handler 7
error_code_interrupt_handler 8
no_error_code_interrupt_handler 9
error_code_interrupt_handler 10
error_code_interrupt_handler 11
error_code_interrupt_handler 12
error_code_interrupt_handler 13
error_code_interrupt_handler 14
no_error_code_interrupt_handler 15
no_error_code_interrupt_handler 16
error_code_interrupt_handler 17
no_error_code_interrupt_handler 18
no_error_code_interrupt_handler 19
no_error_code_interrupt_handler 20
no_error_code_interrupt_handler 21
no_error_code_interrupt_handler 22
no_error_code_interrupt_handler 23
no_error_code_interrupt_handler 24
no_error_code_interrupt_handler 25
no_error_code_interrupt_handler 26
no_error_code_interrupt_handler 27
no_error_code_interrupt_handler 28
no_error_code_interrupt_handler 29
no_error_code_interrupt_handler 30
no_error_code_interrupt_handler 31

; ----- Hardware interrupts (32-47), remapped from the PIC -----
no_error_code_interrupt_handler 32
no_error_code_interrupt_handler 33
no_error_code_interrupt_handler 34
no_error_code_interrupt_handler 35
no_error_code_interrupt_handler 36
no_error_code_interrupt_handler 37
no_error_code_interrupt_handler 38
no_error_code_interrupt_handler 39
no_error_code_interrupt_handler 40
no_error_code_interrupt_handler 41
no_error_code_interrupt_handler 42
no_error_code_interrupt_handler 43
no_error_code_interrupt_handler 44
no_error_code_interrupt_handler 45
no_error_code_interrupt_handler 46
no_error_code_interrupt_handler 47

; ----- System call doorbell (int 0x80 = interrupt 128) -----
no_error_code_interrupt_handler 128

; ----- The common path for every interrupt -----
isr_common:
    pusha                       ; save ALL general registers
    mov eax, esp                ; eax now points at the saved registers
    push eax                    ; ...pushed as the argument to the C function
    call interrupt_handler
    add esp, 4                  ; remove the argument
    popa                        ; restore ALL general registers
    add esp, 8                  ; remove error code + interrupt number
    iret                        ; back to whatever was interrupted
