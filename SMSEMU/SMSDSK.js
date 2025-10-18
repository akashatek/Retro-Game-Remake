import { SMSMEM } from './SMSMEM.js';

export class SMSDSK {
    mem = new SMSMEM();
    text = "";
    romSizeKB = 0;

    async load(url) {   
        await this.mem.load(url);
        
        // Placeholder for decoding DSK logic
        const decoder = new TextDecoder('utf-8');
        this.text = decoder.decode(this.mem.datas.slice(0x7FF0, 0x7FF8)); // Decode first 256 bytes as text
        if (this.text != "TMR SEGA") {
            console.error(`Not a valid SMS Disk file header: ${this.text}`);
            return;
        }

        // TBD: checksum, productcode, version, region, etc ...
        switch (this.mem.datas[0x7FFF] & 0x0F) {
            case 0x00: this.romSizeKB = 256; break;
            case 0x01: this.romSizeKB = 512; break;
            case 0x02: this.romSizeKB = 1024; break;
            case 0x0A: this.romSizeKB = 8; break;
            case 0x0B: this.romSizeKB = 16; break;
            case 0x0C: this.romSizeKB = 32; break;
            case 0x0D: this.romSizeKB = 48; break;
            case 0x0E: this.romSizeKB = 64; break;
            case 0x0F: this.romSizeKB = 128; break;
        }

        console.log(`SMSDSK load complete: ${url}`);
        console.log(`\tHeader: ${this.text}`);
        console.log(`\tSize: ${this.romSizeKB} KB`);
    }
}