// Boulder Dash Game

"use strict";

// ----------------------------------------------------
// Global Variables
// ----------------------------------------------------

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const screenWidth = 40 * 16;          // default 320, but for debugging 40 cols * 16 tilewidth
const screenHeight = 22 * 16;         // default 200, but for debugging 22 rows * 16 tileheight

const backgroundColor = 'black';

let images = []; // Will hold the array of loaded Image objects

const tilewidth = 16;
const tileheight = 16;
const cols = 40;
const rows = 22;
let cave = new Array(rows).fill(null).map(() => new Array(cols).fill(0));
const caveXOffset = 0;
const caveYOffset = 0;

let caveId = 1;
let difficultyId = 1;
let sprites = [];
let time = 0;
let timer = 100; // ~100ms per frame, 10 FPS
let inboxAnimId = 10;

const types = [
    { name: "space", gid: 0,  code: 0x00 },
    { name: "dirt", gid: 58, code: 0x01 },
    { name: "brick", gid: 52, code: 0x02 },
    { name: "magic", gid: 52, code: 0x03 },
    { name: "outbox", gid: 50, code: 0x04 },
    { name: "steel", gid: 50, code: 0x07 },
    { name: "firefly", gid: 89, code: 0x08 },
    { name: "boulder", gid: 57, code: 0x10 },
    { name: "diamond", gid: 81, code: 0x14 },
    { name: "inbox", gid: 50, code: 0x25 },
    { name: "butterfly", gid: 73, code: 0x30 },
    { name: "rockford", gid: 1, code: 0x38 },
    { name: "amoeba", gid: 65, code: 0x3A }
];

// ----------------------------------------------------
// Load Games Resources (Assets, Sprites, etc... )
// ----------------------------------------------------

/**
 * Loads a list of images concurrently and waits for all of them to finish.
 * @param {string[]} urls - An array of image file paths (URLs).
 * @returns {Promise<HTMLImageElement[]>} A Promise that resolves with an array of loaded Image objects.
 */
function loadImages(urls) {
    // Create an array of Promises, one for each image file
    const loadingPromises = urls.map((url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve(img); // Resolve with the loaded Image object
            };
            img.onerror = () => {
                console.error(`Error loading image: ${url}`);
                reject(new Error(`Failed to load image: ${url}`));
            };
            img.src = url;
        });
    });

    // Promise.all waits for all promises to resolve and returns an array of their results
    return Promise.all(loadingPromises);
}

// ----------------------------------------------------
// Random Number with Seed
// ----------------------------------------------------

// Use a self-invoking function to manage the seed state.
// LCG parameters (constants from Numerical Recipes)
const LCG_MULTIPLIER = 1664525;
const LCG_INCREMENT = 1013904223;
const LCG_MODULUS = Math.pow(2, 32); // 2^32, the standard modulus for 32-bit LCG

let currentSeed = 0;

/**
 * Sets the initial seed for the random number generator.
 * @param {number} seed - The integer seed to start the sequence.
 */
function setSeed(seed) {
    // Ensure the seed is an integer and within the 32-bit range
    currentSeed = Math.floor(seed) % LCG_MODULUS; 
}

/**
 * Generates the next pseudo-random number in the sequence (0 to LCG_MODULUS - 1).
 * Updates the internal currentSeed state.
 * @returns {number} The next pseudo-random integer.
 */
function nextRandom() {
    // LCG formula: X(n+1) = (a * X(n) + c) mod m
    currentSeed = (LCG_MULTIPLIER * currentSeed + LCG_INCREMENT) % LCG_MODULUS;
    return currentSeed;
}

/**
 * Generates a pseudo-random integer between 0 and 255, inclusive.
 * @returns {number} An integer between 0 and 255.
 */
function randInt255() {
    // 1. Get the next 32-bit random number.
    const rand32Bit = nextRandom();
    
    // 2. Reduce the 32-bit number to the 0-255 range.
    // The modulus operation distributes the randomness evenly across the desired range.
    return rand32Bit % 256; 
}

// ----------------------------------------------------
// Boulder Dash Cave Loding & Decoding
// ----------------------------------------------------

/**
 * Load cave elements based on Raw Cave Data and Random Objects.
 * @param {number} caveId - the cave data we need to load (1-20)
 * @param {number} difficultyId - the cave difficulty to load (1-5)
 **/
function caveLoad(caveId, difficultyId) {
    // Cave 1 - Cave A
    const rawCaveDatas = [
        "01 14 0A 0F 0A 0B 0C 0D 0E 0C 0C 0C 0C 0C 96 6E 46 28 1E 08 0B 09 D4 20 00 10 14 00 3C 32 09 00 42 01 09 1E 02 42 09 10 1E 02 25 03 04 04 26 12 FF",
        "02 14 14 32 03 00 01 57 58 0A 0C 09 0D 0A 96 6E 46 46 46 0A 04 09 00 00 00 10 14 08 3C 32 09 02 42 01 08 26 02 42 01 0F 26 02 42 08 03 14 04 42 10 03 14 04 42 18 03 14 04 42 20 03 14 04 40 01 05 26 02 40 01 0B 26 02 40 01 12 26 02 40 14 03 14 04 25 12 15 04 12 16 FF",
        "03 00 0F 00 00 32 36 34 37 18 17 18 17 15 96 64 5A 50 46 09 08 09 04 00 02 10 14 00 64 32 09 00 25 03 04 04 27 14 FF",
        "04 14 05 14 00 6E 70 73 77 24 24 24 24 24 78 64 50 3C 32 04 08 09 00 00 10 00 00 00 14 00 00 00 25 01 03 04 26 16 81 08 0A 04 04 00 30 0A 0B 81 10 0A 04 04 00 30 12 0B 81 18 0A 04 04 00 30 1A 0B 81 20 0A 04 04 00 30 22 0B FF",
        "05 14 32 5A 00 00 00 00 00 04 05 06 07 08 96 78 5A 3C 1E 09 0A 09 00 00 00 00 00 00 00 00 00 00 25 01 03 04 27 16 80 08 0A 03 03 00 80 10 0A 03 03 00 80 18 0A 03 03 00 80 20 0A 03 03 00 14 09 0C 08 0A 0A 14 11 0C 08 12 0A 14 19 0C 08 1A 0A 14 21 0C 08 22 0A 80 08 10 03 03 00 80 10 10 03 03 00 80 18 10 03 03 00 80 20 10 03 03 00 14 09 12 08 0A 10 14 11 12 08 12 10 14 19 12 08 1A 10 14 21 12 08 22 10 FF",
        "06 14 28 3C 00 14 15 16 17 04 06 07 08 08 96 78 64 5A 50 0E 0A 09 00 00 10 00 00 00 32 00 00 00 82 01 03 0A 04 00 82 01 06 0A 04 00 82 01 09 0A 04 00 82 01 0C 0A 04 00 41 0A 03 0D 04 14 03 05 08 04 05 14 03 08 08 04 08 14 03 0B 08 04 0B 14 03 0E 08 04 0E 82 1D 03 0A 04 00 82 1D 06 0A 04 00 82 1D 09 0A 04 00 82 1D 0C 0A 04 00 41 1D 03 0D 04 14 24 05 08 23 05 14 24 08 08 23 08 14 24 0B 08 23 0B 14 24 0E 08 23 0E 25 03 14 04 26 14 FF",
        "07 4B 0A 14 02 07 08 0A 09 0F 14 19 19 19 78 78 78 78 78 09 0A 0D 00 00 00 10 08 00 64 28 02 00 42 01 07 0C 02 42 1C 05 0B 02 7A 13 15 02 02 14 04 06 14 04 0E 14 04 16 14 22 04 14 22 0C 14 22 16 25 14 03 04 27 07 FF",
        "08 14 0A 14 01 03 04 05 06 0A 0F 14 14 14 78 6E 64 5A 50 02 0E 09 00 00 00 10 08 00 5A 32 02 00 14 04 06 14 22 04 14 22 0C 04 00 05 25 14 03 42 01 07 0C 02 42 01 0F 0C 02 42 1C 05 0B 02 42 1C 0D 0B 02 43 0E 11 08 02 14 0C 10 00 0E 12 14 13 12 41 0E 0F 08 02 FF",
        "09 14 05 0A 64 89 8C FB 33 4B 4B 50 55 5A 96 96 82 82 78 08 04 09 00 00 10 14 00 00 F0 78 00 00 82 05 0A 0D 0D 00 01 0C 0A 82 19 0A 0D 0D 00 01 1F 0A 42 11 12 09 02 40 11 13 09 02 25 07 0C 04 08 0C FF",
        "0A 14 19 3C 00 00 00 00 00 0C 0C 0C 0C 0C 96 82 78 6E 64 06 08 09 00 00 00 00 00 00 00 00 00 00 25 0D 03 04 27 16 54 05 04 11 03 54 15 04 11 05 80 05 0B 11 03 08 C2 01 04 15 11 00 0D 04 C2 07 06 0D 0D 00 0D 06 C2 09 08 09 09 00 0D 08 C2 0B 0A 05 05 00 0D 0A 82 03 06 03 0F 08 00 04 06 54 04 10 04 04 FF",
        "0B 14 32 00 00 04 66 97 64 06 06 06 06 06 78 78 96 96 F0 0B 08 09 00 00 00 10 08 00 64 50 02 00 42 0A 03 09 04 42 14 03 09 04 42 1E 03 09 04 42 09 16 09 00 42 0C 0F 11 02 42 05 0B 09 02 42 0F 0B 09 02 42 19 0B 09 02 42 1C 13 0B 01 14 04 03 14 0E 03 14 18 03 14 22 03 14 04 16 14 23 15 25 14 14 04 26 11 FF",
        "0C 14 14 00 00 3C 02 3B 66 13 13 0E 10 15 B4 AA A0 A0 A0 0C 0A 09 00 00 00 10 14 00 3C 32 09 00 42 0A 05 12 04 42 0E 05 12 04 42 12 05 12 04 42 16 05 12 04 42 02 06 0B 02 42 02 0A 0B 02 42 02 0E 0F 02 42 02 12 0B 02 81 1E 04 04 04 00 08 20 05 81 1E 09 04 04 00 08 20 0A 81 1E 0E 04 04 00 08 20 0F 25 03 14 04 27 16 FF",
        "0D 8C 05 08 00 01 02 03 04 32 37 3C 46 50 A0 9B 96 91 8C 06 08 0D 00 00 10 00 00 00 28 00 00 00 25 12 03 04 0A 03 3A 14 03 42 05 12 1E 02 70 05 13 1E 02 50 05 14 1E 02 C1 05 15 1E 02 FF",
        "0E 14 0A 14 00 00 00 00 00 1E 23 28 2A 2D 96 91 8C 87 82 0C 08 09 00 00 10 00 00 00 00 00 00 00 81 0A 0A 0D 0D 00 70 0B 0B 0C 03 C1 0C 0A 03 0D C1 10 0A 03 0D C1 14 0A 03 0D 50 16 08 0C 02 48 16 07 0C 02 C1 17 06 03 04 C1 1B 06 03 04 C1 1F 06 03 04 25 03 03 04 27 14 FF",
        "0F 08 0A 14 01 1D 1E 1F 20 0F 14 14 19 1E 78 78 78 78 8C 08 0E 09 00 00 00 10 08 00 64 50 02 00 42 02 04 0A 03 42 0F 0D 0A 01 41 0C 0E 03 02 43 0C 0F 03 02 04 14 16 25 14 03 FF",
        "10 14 0A 14 01 78 81 7E 7B 0C 0F 0F 0F 0C 96 96 96 96 96 09 0A 09 00 00 10 00 00 00 32 00 00 00 25 01 03 04 27 04 81 08 13 04 04 00 08 0A 14 C2 07 0A 06 08 43 07 0A 06 02 81 10 13 04 04 00 08 12 14 C2 0F 0A 06 08 43 0F 0A 06 02 81 18 13 04 04 00 08 1A 14 81 20 13 04 04 00 08 22 14 FF",
        "11 14 1E 00 0A 0B 0C 0D 0E 06 06 06 06 06 0A 0A 0A 0A 0A 0E 02 09 00 00 00 14 00 00 FF 09 00 00 87 00 02 28 16 07 87 00 02 14 0C 00 32 0A 0C 10 0A 04 01 0A 05 25 03 05 04 12 0C FF",
        "12 14 0A 00 0A 0B 0C 0D 0E 10 10 10 10 10 0F 0F 0F 0F 0F 06 0F 09 00 00 00 00 00 00 00 00 00 00 87 00 02 28 16 07 87 00 02 14 0C 01 50 01 03 09 03 48 02 03 08 03 54 01 05 08 03 50 01 06 07 03 50 12 03 09 05 54 12 05 08 05 50 12 06 07 05 25 01 04 04 12 04 FF",
        "13 04 0A 00 0A 0B 0C 0D 0E 0E 0E 0E 0E 0E 14 14 14 14 14 06 08 09 00 00 00 00 00 00 00 00 00 00 87 00 02 28 16 07 87 00 02 14 0C 00 54 01 0C 12 02 88 0F 09 04 04 08 25 08 03 04 12 07 FF",
        "14 03 1E 00 00 00 00 00 00 06 06 06 06 06 14 14 14 14 14 06 08 09 00 00 00 00 00 00 00 00 00 00 87 00 02 28 16 07 87 00 02 14 0C 01 D0 0B 03 03 02 80 0B 07 03 06 00 43 0B 06 03 02 43 0B 0A 03 02 50 08 07 03 03 25 03 03 04 09 0A FF"
    ]
    const hex = rawCaveDatas[caveId - 1].split(" ").map(hexString => parseInt(hexString, 16));

    setSeed(hex[0x04 + difficultyId - 1]);

    for(let row = 0; row < rows; row++) {
        for(let col = 0; col < cols; col++) {
            if (row == 0 || row == rows-1 || col == 0 || col == cols-1 ) {
                cave[row][col] = types.find(t => t.name === "steel").code;     // steel wall
                continue;
            }

            cave[row][col] = types.find(t => t.name === "dirt").code;         // dirt by default
            
            let rand = randInt255();

            if (rand < hex[0x1C] + hex[0x1D] + hex[0x1E] + hex[0x1F]) {
                cave[row][col] = hex[0x1B];
                if (rand < hex[0x1C] + hex[0x1D] + hex[0x1E]) {
                    cave[row][col] = hex[0x1A];
                    if (rand < hex[0x1C] + hex[0x1D]) {
                        cave[row][col] = hex[0x19];
                        if  (rand < hex[0x1C]) {
                            cave[row][col] = hex[0x18];
                        }
                    }
                }
            }
        }
    }

    let id = 0;
    let code = 0;
    let col = 0;
    let row = 0;
    let len = 0;
    let hei = 0;
    let index = 0x20;
    while (hex[index] != 0xFF) {
        code = hex[index] & 0b00111111;
        id = (hex[index] & 0b11000000) >> 6;
        col = hex[index+1];
        row = hex[index+2] - 2;   // map coding is keeping 2 line above for scores.
        switch (id) {
            case 0b00000000:      // store a single object
                // console.log("DEBUG: store a single object code: %d, col: %d, row: %d", code, col, row);

                cave[row][col] = code;
                index += 3;
                break;
            case 0b00000001:      // draw a line of that object
                len = hex[index+3];
                const displacement = getDXDYFromDirection(hex[index+4] + 1);
                // console.log("DEBUG: draw a line code: %d, col: %d, row: %d, len: %d, dx: %d, dy: %d", code, col, row, len, dx, dy);

                for(let i=0; i<len; i++) {
                    cave[row + displacement.dy * i][col + displacement.dx * i] = code;
                }
                index += 5;
                break;
            case 0b00000010:      // draw a rectangle of that object, filled with a second object
                len = hex[index+3];
                hei = hex[index+4];
                let fil = hex[index+5];
                // console.log("DEBUG: draw a filled rectangle code: %d, col: %d, row: %d, len: %d, hei: %d, fil: %d", code, col, row, len, hei, fil);

                for(let y=0; y<hei; y++) {
                    for(let x=0; x<len; x++) {
                        if (y == 0 || y == hei-1 || x == 0 || x == len-1) {
                            cave[row + y][col + x] = code;
                        } else {
                            cave[row + y][col + x] = fil;
                        }
                        
                    }
                }
                index += 6;
                break;
            case 0b00000011:      // draw a rectangle of that object, don't modify the insides.
                len = hex[index+3];
                hei = hex[index+4];
                // console.log("DEBUG: draw a rectangle code: %d, col: %d, row: %d, len: %d, hei: %d", code, col, row, len, hei);

                for(let y=0; y<hei; y++) {
                    for(let x=0; x<len; x++) {
                        cave[row + y][col + x] = code;   
                    }
                }
                index += 5;
                break;
        }
    }
}

function caveStatistics() {
    let stats = new Array(0x3B).fill(0);
    for(let row=0; row<rows; row++) {
        for(let col=0; col<cols; col++) {
            let code = cave[row][col];
            stats[code] += 1;
        }
    }

    let total = 0;
    for (let code = 0; code < stats.length; code++) {
        total += stats[code];
    }

    console.log("Boulder Dash Cave Statistics - total: %d", total);
    for (let code = 0; code < stats.length; code++) {
        const stat = Math.round(stats[code] * 100/total);
        if (stat != 0) {
            console.log("\code: %d\tcount: %d\tcoverage: %d%", code, stats[code], Math.round(stats[code] * 100/total));
        }
    }
}

// ----------------------------------------------------
// Sprite Functions
// ----------------------------------------------------

function appendSprites(col, row, type) {
    let sprite = { 
        name: type.name, 
        col: col, 
        row: row,
        direction: 0,   // 0=none, 1=up, 2=right, 3=down, 4=left
        gid: type.gid,
        animated: false,
        rounded: false,
        fallable: false,
        explodable: false,
        consumable: false,
        animId: 0, 
        animIdMax: 0,
        animCycle: 0,
        isFalling: false
    };

    if (type.name == "diamond" || type.name == "firefly" || type.name == "butterfly" || type.name == "amoeba") {
        sprite.animated = true;
        sprite.animId = 0;
        sprite.animIdMax = 8;
    }

    if (type.name == "boulder" || type.name == "diamond") {
        sprite.fallable = true;
    }

    if (type.name == "brick" || type.name == "boulder" || type.name == "diamond") {
        sprite.rounded = true;
    }

    if (type.name == "firefly" || type.name == "butterfly") {
        sprite.explodable = true;
    }

    if (type.name == "dirt" || type.name == "brick" || type.name == "magic" ||type.name == "firefly" || type.name == "boulder" || type.name == "diamond" || type.name == "butterfly" || type.name == "rockford" || type.name == "amoeba") {
        sprite.consumable = true;
    } 

    if (type.name == "inbox") {
        sprite.animated = true;
        sprite.animId = 0;
        sprite.animIdMax = 2;
        sprite.animCycle = 5; // animate twice then stop
    }

    sprites.push(sprite);
}

function orderSprites() {
    sprites.sort((a, b) => {
        if (a.row !== b.row) {
            return a.row - b.row; // sort by y-coordinate first
        }
        return a.col - b.col; // sort by x-coordinate second
    });
}

function getSpriteAt(col, row) {
    return sprites.find(sprite => sprite.col == col && sprite.row == row);
}

function getSpriteCoord(sprite) {
    return { col: sprite.col, row: sprite.row };
}

function drawTile(gid, x, y) {
    let tilerow = Math.floor((gid - 1) / 8);    // tileset has 8 tiles per col
    let tilecol = (gid - 1) % 8;                // tileset has 8 tiles per col
    ctx.drawImage(images[1], (tilecol * tilewidth), (tilerow * tileheight), tilewidth, tileheight, x, y, tilewidth, tileheight);
}

// ----------------------------------------------------
// Main Game Setup
// ----------------------------------------------------

/**
 * Loads all game assets and stores them in the global loadedImages array.
 * @returns {Promise<void>}
 */
async function setup() {
    images = await loadImages(['title.png', 'tileset.png']);
    // images.forEach((img, index) => {
    //     console.log(`Image ${index}: ${img.width}x${img.height}, src: ${img.src}`);
    // });

    caveLoad(caveId, difficultyId);
    // caveStatistics();

    sprites = [];
    for(let row = 0; row < rows; row++) {
        for(let col = 0; col < cols; col++) {
            const code = cave[row][col];
            if (code == 0x00) {
                continue;       // no need to create a blank sprite
            }
            let type = types.find(t => t.code == code);
            if (type == undefined) {
                console.log("ERROR: cannot find object %d", code);
                continue;
            }
            appendSprites(col, row, type);
        }    
    }
}

// ----------------------------------------------------
// Main Game Loop
// ----------------------------------------------------
function start() {
    let previousTime = performance.now();

    // Main game loop using requestAnimationFrame for smooth rendering
    const loop = () => {
        /// TBD: DEBUG testing frame by frame triggered by pressing SPACE key
        // if (isJoypadPressed(JOYPAD_SELECT)) {
        //     update();
        //     render();
        //     resetJoypadPressed();
        // }

        const currentTime = performance.now();
        const deltaTime = currentTime - previousTime; // Time elapsed since last frame

        time += deltaTime;
        if (time >= timer) {
            time = 0;
            update();
            render();
        }

        previousTime = currentTime;

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

// ----------------------------------------------------
// Main Game Update
// ----------------------------------------------------
function update() {
    // update player input
    let inbox = sprites.find(sprite => sprite.name === "inbox");
    if (inbox == null) {
        let direction = getDirectionFromJoypad();
        if (direction != 0) {
            let rockford = sprites.find(sprite => sprite.name === "rockford");
            let displacement = getDXDYFromDirection(direction);
            let target = getSpriteAt(rockford.col + displacement.dx, rockford.row + displacement.dy);
            if (target == null || target.name == "dirt" || target.name == "diamond") {
                // Move to empty space or consume dirt
                rockford.col += displacement.dx;
                rockford.row += displacement.dy;

                if (target != null && (target.name == "dirt" || target.name == "diamond")) {
                    sprites.splice(sprites.indexOf(target), 1); // remove the dirt or diamond
                }
            }
        }
    } else if (inbox != null && inbox.animCycle == 0) {
        // Replace inbox with rockford
        let rockfordType = types.find(t => t.name === "rockford");
        appendSprites(inbox.col, inbox.row, rockfordType);
        console.log("DEBUG: Rockford appears at col: %d, row: %d", inbox.col, inbox.row);
        sprites.splice(sprites.indexOf(inbox), 1); // remove the inbox
    }

    // sort all sprite from bottom to top, left to right
    orderSprites();

    // update falling
    sprites.filter(sprite => sprite.fallable == true).forEach(sprite => {
        let coord = getSpriteCoord(sprite);
        let below = getSpriteAt(coord.col, coord.row + 1);
        if (below == null) {
            // Below is empty, fall down
            sprite.isFalling = true;
            sprite.row += 1;
        } else {
            // Below is not empty so either explode or continue falling
            if (below.rounded == true) {
                // Below is rounded, check side falling
                let left = getSpriteAt(coord.col - 1, coord.row);
                let belowLeft = getSpriteAt(coord.col - 1, coord.row + 1);
                if (left == null && belowLeft == null) {
                    // Fall to left
                    sprite.col -= 1;
                } else {
                    let right = getSpriteAt(coord.col + 1, coord.row);
                    let belowRight = getSpriteAt(coord.col + 1, coord.row + 1);
                    if (right == null && belowRight == null) {
                        // Fall to right
                        sprite.col += 1;
                    } else {
                        // Cannot fall, stop falling
                        sprite.isFalling = false;
                    }
                }
            } else {
                // Expode or stop falling
                if (sprite.explodable == true) {
                    // TBD: Explode
                    console.log("DEBUG: explode at col: %d, row: %d", coord.col, coord.row);
                } else {
                    // Stop falling
                    sprite.isFalling = false;
                }
            }
        }
    });

    // Update animated sprites
    sprites.forEach(sprite => {
        if (sprite.animated) {
            sprite.animId = (sprite.animId + 1); // Cycle through 0, 1, 2, 3
            if (sprite.animId >= sprite.animIdMax) {
                // Reset to the first frame if exceeding max
                sprite.animId = 0;
                if (sprite.animCycle > 0) {
                    sprite.animCycle -= 1;
                    if (sprite.animCycle == 0) {
                        sprite.animated = false;
                    }
                }
            }
        }
    });

    
}

// ----------------------------------------------------
// Main Game Render
// ----------------------------------------------------

function render() {
    // 1. Clear the canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    // let count = 0;
    sprites.forEach(sprite => {
        drawTile(sprite.gid + sprite.animId, sprite.col * tilewidth - caveXOffset, sprite.row * tileheight - caveYOffset);
        // count += 1;
    });
    // console.log("Render: updated %d sprites", count);
}


// ----------------------------------------------------
// Main Game Keyboard Handler
// ----------------------------------------------------

let joypad = 0b00000000;
const JOYPAD_UP     = 0b00000001;
const JOYPAD_RIGHT  = 0b00000010;
const JOYPAD_DOWN   = 0b00000100;
const JOYPAD_LEFT   = 0b00001000;
const JOYPAD_A      = 0b00010000;
const JOYPAD_B      = 0b00100000;
const JOYPAD_START  = 0b01000000;
const JOYPAD_SELECT = 0b10000000;

function getDirectionFromJoypad() {
    if (isJoypadPressed(JOYPAD_UP)) {
        return 1;   // up
    }
    if (isJoypadPressed(JOYPAD_RIGHT)) {
        return 3;   // right
    }
    if (isJoypadPressed(JOYPAD_DOWN)) {
        return 5;   // down
    }
    if (isJoypadPressed(JOYPAD_LEFT)) {
        return 7;   // left
    }
    return 0;      // no direction
}

function getDXDYFromDirection(direction) {
    let dx = 0;
    let dy = 0;
    switch (direction) {
        case 1: dy = -1; break;                 // up
        case 2: dx = 1; dy = -1; break;         // up-right
        case 3: dx = 1; break;                  // right
        case 4: dx = 1; dy = 1; break;          // down-right
        case 5: dy = 1; break;                  // down
        case 6: dx = -1; dy = 1; break;         // down-left
        case 7: dx = -1; break;                 // left
        case 8: dx = -1; dy = -1; break;        // up-left
    }
    return {dx: dx, dy: dy};
}

function isJoypadPressed(mask) {
    return (joypad & mask) != 0;
}

function resetJoypadPressed() {
    joypad = 0b00000000;
}

function keyDownHandler(event) {
    switch (event.code) {
        case "ArrowRight":
            joypad = joypad | JOYPAD_RIGHT;
            break;
        case "ArrowLeft":
            joypad = joypad | JOYPAD_LEFT;
            break;
        case "ArrowUp":
            joypad = joypad | JOYPAD_UP;
            break;
        case "ArrowDown":
            joypad = joypad | JOYPAD_DOWN;
            break;
        case "KeyQ":
            joypad = joypad | JOYPAD_A;
            break;
        case "KeyS":
            joypad = joypad | JOYPAD_B;
            break;
        case "Enter":
            joypad = joypad | JOYPAD_START;
            break;
        case "Space":
            joypad = joypad | JOYPAD_SELECT;
            break;
    }
  
    // Prevent default browser actions (e.g., scrolling with arrow keys)
    event.preventDefault(); 
}

function keyUpHandler(event) {
    switch (event.code) {
        case "ArrowRight":
            joypad = joypad & ~JOYPAD_RIGHT;
            break;
        case "ArrowLeft":
            joypad = joypad & ~JOYPAD_LEFT;
            break;
        case "ArrowUp":
            joypad = joypad & ~JOYPAD_UP;
            break;
        case "ArrowDown":
            joypad = joypad & ~JOYPAD_DOWN;
            break;
        case "KeyQ":
            joypad = joypad & ~JOYPAD_A;
            break;
        case "KeyS":
            joypad = joypad & ~JOYPAD_B;
            break;
        case "Enter":
            joypad = joypad & ~JOYPAD_START;
            break;
        case "Space":
            joypad = joypad & ~JOYPAD_SELECT;
            break;
    }
      
    // Prevent default browser actions (e.g., scrolling with arrow keys)
    event.preventDefault(); 
}

// ----------------------------------------------------
// Main Game Entry Point
// ----------------------------------------------------
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

document.addEventListener('DOMContentLoaded', async () => {
    canvas.width = screenWidth;
    canvas.height = screenHeight;

    await setup(); // Wait for all assets to load
    start();
});