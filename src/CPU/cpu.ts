export namespace CPU {
    enum ByteState {
        NONE,

        ADDING,
        SUBTRACTING,
    }

    export class CPU {
        constructor(
            private RAM: Uint8Array
        ) {
            setInterval(this.update, 1000); // update every second
        }

        private update() {
            let state: ByteState = ByteState.NONE;
            let mem = new Uint8Array();
            for (let i = 0; i < this.RAM.length; i++) {
                switch (this.RAM[i]) {
                    case 0x00:
                        // stays the same
                        break;

                    case 0x01:
                        // reset to zero
                        this.RAM[i] = 0x00;
                        break;

                    case 0x02:
                        // add
                        state = ByteState.ADDING;
                        break;

                    default:
                        switch(state) {
                            case ByteState.ADDING:
                                mem[0] = this.RAM[i] ?? 0;
                                break;
                        }

                        break;
                }
            }
        }
    }
}