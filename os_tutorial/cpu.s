; -------------------------------------------------------------
; gdt.s - load the CPU's special tables (NASM syntax)
; -------------------------------------------------------------
global gdt_flush
global tss_flush
global idt_load
global enable_interrupts
global disable_interrupts

section .text

; gdt_flush(gdt_ptr) - load the GDT, then reload all segment registers
gdt_flush:
    mov eax, [esp + 4]
    lgdt [eax]                  ; load the GDT
    mov ax, 0x10                ; kernel DATA selector
    mov ds, ax
    mov es, ax
    mov fs, ax
    mov gs, ax
    mov ss, ax
    jmp 0x08:.flush             ; far jump: reloads CS (code selector)
.flush:
    ret

; tss_flush() - tell the CPU where the TSS lives (selector 0x28)
tss_flush:
    mov ax, 0x28
    ltr ax
    ret

; idt_load(idt_ptr) - load the Interrupt Descriptor Table
idt_load:
    mov eax, [esp + 4]
    lidt [eax]
    ret

enable_interrupts:
    sti
    ret

disable_interrupts:
    cli
    ret
