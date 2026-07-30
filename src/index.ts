import { readFileSync } from "node:fs";
import { CPU } from "./CPU/cpu.js";
import sdl from "@kmamal/sdl";

const RAM = new Uint16Array(20000);

const buffer = readFileSync("./program.bin");

const program = new Uint16Array(buffer.length / 2);

for (let i = 0; i < program.length; i++) {
    const hi = buffer[i * 2]!;
    const lo = buffer[i * 2 + 1]!;

    program[i] = (hi << 8) | lo;
}

RAM.set(program);

const SCREEN_ADDR = 10000;
const WIDTH = 100;
const HEIGHT = 100;

const cpu = new CPU.CPU(RAM);

const window = sdl.video.createWindow({
    title: "CPU Screen",
    width: 800,
    height: 800,
    accelerated: true,
    vsync: true,
});

// RGBA8888 output buffer for SDL
const pixels = Buffer.alloc(WIDTH * HEIGHT * 4);

function updateScreen() {
    for (let i = 0; i < WIDTH * HEIGHT; i++) {
        const value = cpu.RAM[SCREEN_ADDR + i] ?? 0;

        const index = i * 4;

        // RGB565:
        // rrrrrggggggbbbbb

        const r5 = (value >> 11) & 0x1F;
        const g6 = (value >> 5) & 0x3F;
        const b5 = value & 0x1F;

        // expand to 8-bit
        const r = (r5 << 3) | (r5 >> 2);
        const g = (g6 << 2) | (g6 >> 4);
        const b = (b5 << 3) | (b5 >> 2);

        pixels[index] = r;
        pixels[index + 1] = g;
        pixels[index + 2] = b;
        pixels[index + 3] = 255;
    }
}

function draw() {
    window.render(
        WIDTH,
        HEIGHT,
        WIDTH * 4,
        "rgba8888",
        pixels,
        {
            scaling: "nearest",
            dstRect: {
                x: 0,
                y: 0,
                width: 800,
                height: 800,
            },
        },
    );
}

window.on("close", () => {
    process.exit(0);
});

setInterval(async () => {
    await cpu.update();

    updateScreen();
    draw();
}, 16);