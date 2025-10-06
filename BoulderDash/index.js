// Boulder Dash Game

"use strict";

// ----------------------------------------------------
// 1. Global Variables
// ----------------------------------------------------

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const screenWidth = 40*16;          // default 320, but for debugging 40 cols * 16 tilewidth
const screenHeight = 22*16;         // default 200, but for debugging 22 rows * 16 tileheight
const backgroundColor = 'black';

let images = []; // Will hold the array of loaded Image objects

const tilewidth = 16;
const tileheight = 16;
const cols = 40;
const rows = 22;
let cave = new Array(rows).fill(null).map(() => new Array(cols).fill(0));

let caveId = 1;
let difficultyId = 3;

const gids = [
    0, 58, 52, 52, 50, 0, 0, 50, 73, 73, 73, 73, 0, 0, 0, 0, 
    57, 57, 0, 0, 81, 81, 0, 0, 0, 0, 0, 59, 60, 61, 62, 63,
    59, 60, 61, 62, 63, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 
    89, 89, 89, 89, 0, 0, 0, 0, 1, 0, 65, 65, 65, 65];

// reference: https://jakesgordon.com/writing/boulderdash-game-logic/

var OBJECT = {
  SPACE:             { code: 0x00, rounded: false, explodable: false, consumable: true  },
  DIRT:              { code: 0x01, rounded: false, explodable: false, consumable: true  },
  BRICKWALL:         { code: 0x02, rounded: true,  explodable: false, consumable: true  },
  MAGICWALL:         { code: 0x03, rounded: false, explodable: false, consumable: true  },
  PREOUTBOX:         { code: 0x04, rounded: false, explodable: false, consumable: false },
  OUTBOX:            { code: 0x05, rounded: false, explodable: false, consumable: false },
  STEELWALL:         { code: 0x07, rounded: false, explodable: false, consumable: false },
  FIREFLY1:          { code: 0x08, rounded: false, explodable: true,  consumable: true  },
  FIREFLY2:          { code: 0x09, rounded: false, explodable: true,  consumable: true  },
  FIREFLY3:          { code: 0x0A, rounded: false, explodable: true,  consumable: true  },
  FIREFLY4:          { code: 0x0B, rounded: false, explodable: true,  consumable: true  },
  BOULDER:           { code: 0x10, rounded: true,  explodable: false, consumable: true  },
  BOULDERFALLING:    { code: 0x12, rounded: false, explodable: false, consumable: true  },
  DIAMOND:           { code: 0x14, rounded: true,  explodable: false, consumable: true  },
  DIAMONDFALLING:    { code: 0x16, rounded: false, explodable: false, consumable: true  },
  EXPLODETOSPACE0:   { code: 0x1B, rounded: false, explodable: false, consumable: false },
  EXPLODETOSPACE1:   { code: 0x1C, rounded: false, explodable: false, consumable: false },
  EXPLODETOSPACE2:   { code: 0x1D, rounded: false, explodable: false, consumable: false },
  EXPLODETOSPACE3:   { code: 0x1E, rounded: false, explodable: false, consumable: false },
  EXPLODETOSPACE4:   { code: 0x1F, rounded: false, explodable: false, consumable: false },
  EXPLODETODIAMOND0: { code: 0x20, rounded: false, explodable: false, consumable: false },
  EXPLODETODIAMOND1: { code: 0x21, rounded: false, explodable: false, consumable: false },
  EXPLODETODIAMOND2: { code: 0x22, rounded: false, explodable: false, consumable: false },
  EXPLODETODIAMOND3: { code: 0x23, rounded: false, explodable: false, consumable: false },
  EXPLODETODIAMOND4: { code: 0x24, rounded: false, explodable: false, consumable: false },
  PREROCKFORD1:      { code: 0x25, rounded: false, explodable: false, consumable: false },
  PREROCKFORD2:      { code: 0x26, rounded: false, explodable: false, consumable: false },
  PREROCKFORD3:      { code: 0x27, rounded: false, explodable: false, consumable: false },
  PREROCKFORD4:      { code: 0x28, rounded: false, explodable: false, consumable: false },
  BUTTERFLY1:        { code: 0x30, rounded: false, explodable: true,  consumable: true  },
  BUTTERFLY2:        { code: 0x31, rounded: false, explodable: true,  consumable: true  },
  BUTTERFLY3:        { code: 0x32, rounded: false, explodable: true,  consumable: true  },
  BUTTERFLY4:        { code: 0x33, rounded: false, explodable: true,  consumable: true  },
  ROCKFORD:          { code: 0x38, rounded: false, explodable: true,  consumable: true  },
  AMOEBA:            { code: 0x3A, rounded: false, explodable: false, consumable: true  }
};

// ----------------------------------------------------
// 2. Setup all game aspects (Bulk Image Loading with a URL list)
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
// Randomness with Seed
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
        "07 4B 0A 14 02 07 08 0A 09 0F 14 19 19 19 78 78 78 78 78 09 0A 0D 00 00 00 10 08 00 64 28 02 00 42 01 07 0C 02 42 1C 05 0B 02 7A 13 15 02 02 14 04 06 14 04 0E 14 04 16 14 22 04 14 22 0C 14 22 16 25 14 03 04 27 07 FF"
    ]
    const hex = rawCaveDatas[caveId - 1].split(" ").map(hexString => parseInt(hexString, 16));

    setSeed(hex[0x04 + difficultyId - 1]);

    for(let row = 0; row < rows; row++) {
        for(let col = 0; col < cols; col++) {
            if (row == 0 || row == rows-1 || col == 0 || col == cols-1 ) {
                cave[row][col] = OBJECT["STEELWALL"].code;     // steel wall
                continue;
            }

            cave[row][col] = OBJECT["DIRT"].code         // dirt by default
            
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
                let dx = 0;
                let dy = 0;
                switch (hex[index+4]) {
                    case 0: dy = -1; break;                 // up
                    case 1: dx = 1; dy = -1; break;         // up-right
                    case 2: dx = 1; break;                  // right
                    case 3: dx = 1; dy = 1; break;          // down-right
                    case 4: dy = 1; break;                  // down
                    case 5: dx = -1; dy = 1; break;         // down-left
                    case 6: dx = -1; break;                 // left
                    case 7: dx = -1; dy = -1; break;        // up-left
                }
                // console.log("DEBUG: draw a line code: %d, col: %d, row: %d, len: %d, dx: %d, dy: %d", code, col, row, len, dx, dy);

                for(let i=0; i<len; i++) {
                    cave[row + dy * i][col + dx * i] = code;
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
    let stats = new Array(0x3A).fill(0);
    for(let row=1; row<rows-1; row++) {
        for(let col=1; col<cols-1; col++) {
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

/**
 * Loads all game assets and stores them in the global loadedImages array.
 * @returns {Promise<void>}
 */
async function setup() {
    images = await loadImages(['title.png', 'tileset.png']);
    console.log("All assets loaded successfully.");

    caveLoad(caveId, difficultyId);
    console.log("Cave loaded successfully.");

    caveStatistics();
}

// ----------------------------------------------------
// 3. Main Game Loop
// ----------------------------------------------------
function start() {
    const loop = () => {
        update();
        render();
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

// ----------------------------------------------------
// 4. Update Game Mechanics
// ----------------------------------------------------
function update() {

}

// ----------------------------------------------------
// 5. Render Game Sprites
// ----------------------------------------------------
function drawTile(gid, x, y) {
    let tilerow = Math.round((gid - 1) / 8);    // tileset has 8 tiles per row
    let tilecol = (gid - 1) % 8;                // tileset has 8 tiles per col
    ctx.drawImage(images[1], (tilecol * tileheight), (tilerow * tilewidth), tilewidth, tileheight, x, y, tilewidth, tileheight, );
}

function render() {
    // 1. Clear the canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    
    // 2. Draw the loaded screenshot image (it's the first image in the array)
    for(let row = 0; row < rows; row++) {
        for(let col = 0; col < cols; col++) {
            const code = cave[row][col];
            if (code == 0) {
                continue;       // skipping drawing of blank tile
            }

            drawTile(gids[code], col * tilewidth, row * tileheight);
        }    
    }
}

// ----------------------------------------------------
// 6. DOM Entry Point
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    canvas.width = screenWidth;
    canvas.height = screenHeight;

    await setup(); // Wait for all assets to load
    start();
});