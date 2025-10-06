// Boulder Dash Game

"use strict";

// ----------------------------------------------------
// 1. Global Variables
// ----------------------------------------------------

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const screenWidth = 320;
const screenHeight = 200;
const backgroundColor = 'darkgray';

let images = []; // Will hold the array of loaded Image objects

// ----------------------------------------------------
// 2. Setup all game aspects (Bulk Image Loading with a URL list)
// ----------------------------------------------------

/**
 * Loads a list of images concurrently and waits for all of them to finish.
 * @param {string[]} urls - An array of image file paths (URLs).
 * @returns {Promise<HTMLImageElement[]>} A Promise that resolves with an array of loaded Image objects.
 */
function loadImages(urls) {
    console.log("Starting bulk asset loading...");
    
    // Create an array of Promises, one for each image file
    const loadingPromises = urls.map((url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                console.log(`Image loaded: ${url}`);
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

/**
 * Loads all game assets and stores them in the global loadedImages array.
 * @returns {Promise<void>}
 */
async function setup() {
    images = await loadImages(['title.png', 'tileset.png']);
    console.log("All assets loaded successfully.");
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
function render() {
    // 1. Clear the canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    
    // 2. Draw the loaded screenshot image (it's the first image in the array)
    ctx.drawImage(images[0], 0, 0);
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