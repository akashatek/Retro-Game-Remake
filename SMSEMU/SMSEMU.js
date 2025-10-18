import { SMSDSK } from './SMSDSK.js';

export class SMSEMU {
    DSK = new SMSDSK();

    constructor(canvasId, screenWidth, screenHeight, backgroundColor) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d');
        this.context.imageSmoothingEnabled = false; // Disable smoothing for pixel art

        this.canvas.width = screenWidth;
        this.canvas.height = screenHeight;

        this.backgroundColor = backgroundColor;
        this.context.fillStyle = this.backgroundColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    async load(url) {
        await this.DSK.load(url);
    }

    start() {
        // Placeholder for starting the emulator logic
        console.log('Starting the emulator...');
    }
}