export namespace CPU {
    enum ByteState {
        NONE,

        ADDING,
        SUBTRACTING,
    }

    export type Callback = (cpu: CPU)=>(void | Promise<void>)

    export class CPU {
        private updateFunction: Callback = ()=>{}

        public onUpdate(callback: Callback) {
            this.updateFunction = callback;
        }

        constructor(
            public readonly RAM: Uint8Array
        ) {
            setInterval(() => this.update(), 16); // update every second
        }

        read(addr: number): number {
            return (addr >= 0 && addr < this.RAM.length)
                ? this.RAM[addr] ?? 0
                : 0;
        }
        
        write(addr: number, value: number): void {
            if (addr >= 0 && addr < this.RAM.length) {
                this.RAM[addr] = value;
            }
        }
        
        private update(): void {
            for (let i = 0; i < this.RAM.length; i++) {
        
                switch (this.read(i)) {
        
                    // =====================
                    // 0x00 - Basic
                    // =====================
        
                    case 0x00: // NOP
                        break;
        
                    case 0x01: // CLEAR
                        this.write(i, 0);
                        break;
        
                    // =====================
                    // 0x02-0x09 Arithmetic
                    // =====================
        
                    case 0x02: // ADD
                        this.write(i, this.read(i + 1) + this.read(i + 2));
                        this.write(i + 1, 0);
                        this.write(i + 2, 0);
                        break;
        
                    case 0x03: // SUB
                        this.write(i, this.read(i + 1) - this.read(i + 2));
                        this.write(i + 1, 0);
                        this.write(i + 2, 0);
                        break;
        
                    case 0x04: // MUL
                        this.write(i, this.read(i + 1) * this.read(i + 2));
                        this.write(i + 1, 0);
                        this.write(i + 2, 0);
                        break;
        
                    case 0x05: { // DIV
                        const b = this.read(i + 2);
                        this.write(i, b === 0 ? 0 : Math.floor(this.read(i + 1) / b));
                        break;
                    }
        
                    case 0x06: { // MOD
                        const b = this.read(i + 2);
                        this.write(i, b === 0 ? 0 : this.read(i + 1) % b);
                        break;
                    }
        
                    case 0x07: // INC
                        this.write(i + 1, this.read(i + 1) + 1);
                        this.write(i, 0);
                        break;
        
                    case 0x08: // DEC
                        this.write(i + 1, this.read(i + 1) - 1);
                        this.write(i, 0);
                        break;
        
                    case 0x09: // NEGATE
                        this.write(i, -this.read(i + 1));
                        break;
        
                    // =====================
                    // 0x10-0x15 Logic
                    // =====================
        
                    case 0x10:
                        this.write(i, this.read(i + 1) & this.read(i + 2));
                        break;
        
                    case 0x11:
                        this.write(i, this.read(i + 1) | this.read(i + 2));
                        break;
        
                    case 0x12:
                        this.write(i, this.read(i + 1) ^ this.read(i + 2));
                        break;
        
                    case 0x13:
                        this.write(i, ~this.read(i + 1));
                        break;
        
                    case 0x14:
                        this.write(i, this.read(i + 1) << 1);
                        break;
        
                    case 0x15:
                        this.write(i, this.read(i + 1) >> 1);
                        break;
        
                    // =====================
                    // 0x20 Comparisons
                    // =====================
        
                    case 0x20:
                        this.write(i, this.read(i + 1) === this.read(i + 2) ? 1 : 0);
                        break;
        
                    case 0x21:
                        this.write(i, this.read(i + 1) > this.read(i + 2) ? 1 : 0);
                        break;
        
                    case 0x22:
                        this.write(i, this.read(i + 1) < this.read(i + 2) ? 1 : 0);
                        break;
        
                    // =====================
                    // 0x30 Memory
                    // =====================
        
                    case 0x30: { // COPY
                        const src = this.read(i + 1);
                        const dst = this.read(i + 2);
                        this.write(dst, this.read(src));
                        break;
                    }
        
                    case 0x31: { // SWAP
                        const a = this.read(i + 1);
                        const b = this.read(i + 2);
        
                        const tmp = this.read(a);
        
                        this.write(a, this.read(b));
                        this.write(b, tmp);
                        break;
                    }
        
                    case 0x32: { // STORE CONSTANT
                        const dst = this.read(i + 1);
                        this.write(dst, this.read(i + 2));
                        break;
                    }
        
                    // =====================
                    // 0x40 Control Flow
                    // =====================
        
                    case 0x40: { // JUMP
                        const addr = this.read(i + 1);
        
                        if (addr < this.RAM.length) {
                            i = addr - 1;
                        }
                        break;
                    }
        
                    case 0x41: { // JUMP IF TRUE
                        if (this.read(i + 1) !== 0) {
                            const addr = this.read(i + 2);
                            if (addr < this.RAM.length)
                                i = addr - 1;
                        }
                        break;
                    }
        
                    case 0x42: { // JUMP IF FALSE
                        if (this.read(i + 1) === 0) {
                            const addr = this.read(i + 2);
                            if (addr < this.RAM.length)
                                i = addr - 1;
                        }
                        break;
                    }
        
                    // =====================
                    // 0x50 Utilities
                    // =====================
        
                    case 0x50:
                        this.write(i, Math.floor(Math.random() * 256));
                        break;
        
                    case 0x51:
                        this.write(i, Math.min(this.read(i + 1), this.read(i + 2)));
                        break;
        
                    case 0x52:
                        this.write(i, Math.max(this.read(i + 1), this.read(i + 2)));
                        break;
        
                    default:
                        break;
                }
            }

            this.updateFunction(this);
        }
    }
}