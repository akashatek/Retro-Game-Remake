// ----------------------------------------------------
// RGE Class: The main GENERIC game engine BASE CLASS
// ----------------------------------------------------
export class RGE {
    // ----------------------------------------------------
    // Global Variables
    // ----------------------------------------------------
    canvas = null;
    ctx = null;
    container = null;
    width = 320; 
    height = 200; 
    backgroundColor = '#1e1e2d';
    time = 0;
    timer = 100; // ~100ms per frame, 10 FPS
    
    constructor(width = 320, height = 200, backgroundColor = '#1e1e2d') {
        this.width = width;
        this.height = height;
        this.backgroundColor = backgroundColor;
        console.log(`RGE: Engine constructed. Native resolution: ${this.width}x${this.height}.`);
    }
    
    // ----------------------------------------------------
    // Main Game Setup
    // ----------------------------------------------------
    setup() {
        // 1. Setup Canvas and Container
        this.canvas = document.getElementById('game-canvas');
        this.container = document.getElementById('game-container');
        
        if (!this.canvas || !this.container) {
            console.error("RGE Fatal Error: Canvas or Container element not found!");
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        
         // Set Canvas native dimensions (internal drawing resolution)
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx.imageSmoothingEnabled = false;

        console.log("RGE: Core engine initialization complete.");
    }
    
    // ----------------------------------------------------
    // Main Game Loop
    // ----------------------------------------------------
    start() {
        let previousTime = performance.now();

        // Main game loop using requestAnimationFrame for smooth rendering
        const loop = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - previousTime; // Time elapsed since last frame

            this.time += deltaTime;
            if (this.time >= this.timer) {
                this.time = 0;
                this.update();
                this.render();
            }

            previousTime = currentTime;
            requestAnimationFrame(loop);
        };

        console.log("RGE: Core engine started.");
        requestAnimationFrame(loop);
    }

    // ----------------------------------------------------
    // Main Game Update
    // ----------------------------------------------------

    update() {
        
    }

    // ----------------------------------------------------
    // Main Game Render
    // ----------------------------------------------------
    render() {
        // 1. Clear the canvas
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
}