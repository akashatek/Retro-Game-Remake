import { RGE } from '../RGE/RGE.js';
import { RGEColor } from '../RGE/RGEColor.js';

const rge = new RGE('gl-canvas', 256, 240, RGEColor.RED);

// ----------------------------------------------------
// Main Game Entry Point
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    rge.start();    
});