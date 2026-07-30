import { readFileSync } from "node:fs";
import { CPU } from "./CPU/cpu.js";

const RAM = new Uint16Array(40000);

const buffer = readFileSync("./program.bin");

if (buffer.length % 2 !== 0) {
    throw new Error("Program size must be even.");
}

const program = new Uint16Array(buffer.length / 2);

for (let i = 0; i < program.length; i++) {
    const hi = buffer[i * 2];
    const lo = buffer[i * 2 + 1];

    if (hi === undefined || lo === undefined) {
        throw new Error("Invalid program data.");
    }

    program[i] = (hi << 8) | lo;
}

RAM.set(program);

const SCREEN_ADDR = 30000;
const WIDTH = 40;
const HEIGHT = 20;

function drawScreen(RAM: Uint16Array) {
    let screen = "\x1b[H\n";

    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {

            const value = RAM[SCREEN_ADDR + y * WIDTH + x] ?? 0;

            const r = ((value >> 8) & 0xff);
            const g = ((value >> 4) & 0xff);
            const b = (value & 0xff);

            screen += `\x1b[38;2;${r};${g};${b}m█`;
        }

        screen += "\x1b[0m\n";
    }

    process.stdout.write(screen);
}


process.stdout.write("\x1b[2J");

const cpu = new CPU.CPU(RAM);

cpu.onUpdate(cpu => {
    drawScreen(cpu.RAM);
});