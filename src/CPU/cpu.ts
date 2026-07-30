export namespace CPU {
    export type Callback = (cpu: CPU) => (void | Promise<void>);

    export class CPU {
        public PC = 0;

        constructor(
            public readonly RAM: Uint16Array
        ) {}

        private wait(ms: number): Promise<void> {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        read(addr: number): number {
            return (addr >= 0 && addr < this.RAM.length)
                ? this.RAM[addr] ?? 0
                : 0;
        }

        write(addr: number, value: number): void {
            if (addr >= 0 && addr < this.RAM.length) {
                this.RAM[addr] = value & 0xffff;
            }
        }

        randomByte(): number {
            return Math.floor(Math.random() * 0x10000);
        }

        async update(): Promise<void> {

            if (Math.random() > 0.999) {
                this.write(
                    this.PC,
                    0x0013
                );

                return;
            }

            const opcode = this.read(this.PC);

            switch (opcode) {

                case 0x0000: // NOP
                    this.PC++;
                    break;

                case 0x0001: { // JUMP addr
                    const addr = this.read(this.PC + 1);
                    this.PC = addr;
                    break;
                }

                case 0x0011: { // RNDNA dest
                    const dest = this.read(this.PC + 1);

                    this.write(
                        dest,
                        this.randomByte()
                    );

                    this.PC += 2;
                    break;
                }

                case 0x0012: // RNDJ
                    this.PC = Math.floor(
                        Math.random() * this.RAM.length
                    );
                    break;

                case 0x0013: { // VRUS
                    const dest = Math.floor(
                        Math.random() * this.RAM.length
                    );

                    this.write(
                        dest,
                        0x0013
                    );

                    this.PC++;
                    break;
                }

                case 0x0014: { // RNDFILL start,length
                    const start = this.read(this.PC + 1);
                    const length = this.read(this.PC + 2);

                    for (let i = 0; i < length; i++) {
                        this.write(
                            start + i,
                            this.randomByte()
                        );
                    }

                    this.PC += 3;
                    break;
                }

                case 0x0015: { // WAIT ms
                    const ms = this.read(this.PC + 1);

                    await this.wait(ms);

                    this.PC += 2;
                    break;
                }

                default:
                    this.PC++;
                    break;
            }
        }
    }
}