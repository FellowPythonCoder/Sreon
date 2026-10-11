; -------------------------------------------------------------
; io.s - talk to hardware I/O ports (NASM syntax)
; cdecl calling convention: args on the stack, result in eax.
; -------------------------------------------------------------
global outb
global inb

section .text

; outb - send one byte to an I/O port
; stack: [esp + 8] the data byte, [esp + 4] the port, [esp] return address
outb:
    mov al, [esp + 8]           ; the data byte -> al
    mov dx, [esp + 4]           ; the port number -> dx
    out dx, al                  ; send it!
    ret

; inb - read one byte from an I/O port
; stack: [esp + 4] the port, [esp] return address; result in al
inb:
    mov dx, [esp + 4]           ; the port number -> dx
    xor eax, eax                ; clear the whole result register
    in al, dx                   ; read the byte
    ret
