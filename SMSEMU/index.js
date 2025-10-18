import { SMSEMU } from './SMSEMU.js';

// ----------------------------------------------------
// Main Game Entry Point
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    let EMU = new SMSEMU('game-canvas', 256, 192, 'black');

    await EMU.load("../Assets/Roms/SMS/Sonic The Hedgehog (USA, Europe).sms");
    EMU.start();
});