import { RGEColor } from '../RGE/RGEColor.js';

export class RGE {
    constructor(canvasId, screenWidth, screenHeight) {
        this.canvas = document.getElementById(canvasId);
        this.canvas.width = screenWidth;
        this.canvas.height = screenHeight;

        // Initialize the GL context
        this.gl = this.canvas.getContext("webgl");

        // Only continue if WebGL is available and working
        if (this.gl === null) {
            alert(
            "Unable to initialize WebGL. Your browser or machine may not support it.",
            );
            return;
        }

        // Set clear color to black, fully opaque
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    start() {

    }
}