
export class SMSMEM {
    constructor(size = 1024) {
        this.datas = new Uint8Array(size);
        this.size = size;
    }

    loadRom(byteArray) {
        if (!(byteArray instanceof Uint8Array)) {
            console.error("Invalid input: must be a Uint8Array.");
            return false;
        }
        
        this.datas = byteArray;
        this.size = byteArray.length;
        return true;
    }

    async load(url) {
        try {
            const response = await fetch(url);
             if (!response.ok) {
                // Throw an error if the HTTP status is not successful (e.g., 404)
                throw new Error(`HTTP error! Status: ${response.status} when fetching ${url}`);
            }

            // Get the response body as a raw ArrayBuffer
            const arrayBuffer = await response.arrayBuffer();

            // Convert ArrayBuffer to Uint8Array
            const byteArray = new Uint8Array(arrayBuffer);

            // Re-use existing loadRom method to handle assignment and logging
            return this.loadRom(byteArray);
        } catch (error) {
            console.error(`Error loading file ${url}: ${error}`);
            return null;
        }
    }

    hexdump() {
        const bytesPerLine = 16;
        let str = "";
        
        for (let addr = 0; addr < this.size; addr++) {
            // Start of a new line: print the address
            if (addr % bytesPerLine === 0) {
                // If it's not the very first line, add a newline character
                if (addr !== 0) {
                    str += "\n";
                }
                // Add the 4-digit hexadecimal address (e.g., 0000)
                str += addr.toString(16).padStart(8, '0').toUpperCase() + " : ";
            }

            // Add the 2-digit hexadecimal byte value (e.g., C3)
            // Note: toString(16) uses base 16 (hex)
            str += this.datas[addr].toString(16).padStart(2, '0').toUpperCase() + " ";
        }

        // Output the final string to the console
        if (this.size > 0) {
            console.log("--- HEX DUMP START ---");
            console.log(str);
            console.log("--- HEX DUMP END ---");
        } else {
            console.log("No data loaded to dump.");
        }
    }
}
