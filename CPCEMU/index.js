// ----------------------------------------------------
// Amstrad CPC Emulator - Basic Framework
// ----------------------------------------------------

"use strict";
import { RGE } from '../RGE/RGE.js';

// ----------------------------------------------------
// Main Emulator Entry Point
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    let rge = new RGE(320, 200, '#1e1e2d');
    rge.setup();
    rge.start();
});