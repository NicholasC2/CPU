import { CPU } from "./CPU/cpu.js";

const RAM = new Uint8Array(64000);

for (let i = 0; i < RAM.length; i++) {
    RAM[i] = i;
}

const cpu = new CPU.CPU(RAM);

cpu.onUpdate((c) => {
    const display = c.RAM.subarray(54000, 64000);

    for (let y = 0; y < 100; y++) {
        for (let x = 0; x < 100; x++) {
            const pixel = display[y * 100 + x];

            console.log(pixel);
        }
    }
});