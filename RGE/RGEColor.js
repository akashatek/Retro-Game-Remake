export class RGEColor {
    constructor(red = 0, green = 0, blue = 0, alpha = 255) {
        this.bytes = [red, green, blue, alpha];
    }
    static BLACK = new RGEColor(0, 0, 0, 255);
    static RED = new RGEColor(255, 0, 0, 255);
    static GREEN = new RGEColor(0, 255, 0, 255);
    static BLUE = new RGEColor(0, 0, 255, 255);
}