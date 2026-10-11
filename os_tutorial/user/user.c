/* user/user.c - our first user-mode program!
   It can only talk to the kernel through SYSTEM CALLS (int 0x80). */

typedef unsigned int u32;

/* The system-call dance: number in eax, arguments in ebx/ecx,
   "int 0x80" rings the doorbell, the answer comes back in eax. */
static u32 syscall2(u32 n, u32 a, u32 b) {
    u32 ret;
    __asm__ volatile("int $0x80"
                     : "=a"(ret)
                     : "a"(n), "b"(a), "c"(b)
                     : "memory");
    return ret;
}

static void print(const char *s) {
    u32 len = 0;
    while (s[len]) len++;
    syscall2(0, (u32)s, len);          /* SYS_WRITE */
}

static void putc(char c) {
    syscall2(3, (u32)c, 0);            /* SYS_PUTC */
}

void main(void) {
    print("Hello from USER MODE!\n");
    print("I am just a guest program - ring, ring: ");
    print("the kernel does everything for me.\n\n");
    print("Type keys and I will echo them (q = quit):\n");

    for (;;) {
        u32 c = syscall2(1, 0, 0);     /* SYS_GETCHAR */
        if (c == 'q') break;
        putc((char)c);
    }

    print("\nBye!\n");
    syscall2(2, 0, 0);                 /* SYS_EXIT -> back to the kernel */
    for (;;) { }
}
