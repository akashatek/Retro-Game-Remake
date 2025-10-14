# Amstrad CPC Emulator (CPCEMU)

Reference:
 * [CPCWiki](https://www.cpcwiki.eu/index.php/Main_Page)
 * [CPCemu](https://www.irespa.eu/daan/lib/howtoCPCemu.htm)
 * [Neuro Sys](https://gist.github.com/neuro-sys/eeb7a323b27a9d8ad891b41144916946)

Components:
 * Processor: Zilog Z80A running at 4 MHz.
 * ROM: 48 KB, including Locomotive Basic.
 * RAM: Varies by model. The CPC 6128 has 128 KB, split into two 64 KB banks, with one bank accessible by the user and the other used for data, a RAM disk, or the operating system. 
 * Graphics Modes:
    * Mode 0: 160 x 200 pixels with 16 colors from a palette of 4096. 
    * Mode 1: 320 x 200 pixels with 4 colors from a palette of 4096. 
    * Mode 2: 640 x 200 pixels with 2 colors from a palette of 4096. 
    * Text Modes: 80 x 25, 40 x 25, and 20 x 25 lines. 
 * Sound: A single-channel mono sound output. 
 * Storage
    * CPC 464: Cassette tape drive. 
    * CPC 664/6128: Built-in 3-inch floppy disk drive (180 KB capacity per side). 
 * Operating system
    * AMSDOS: Amstrad's proprietary disk operating system. 
    * CP/M: Both CP/M 2.2 and CP/M 3.0 (CP/M Plus) are supported. 
 * Other features
    * Expansion Port: A Centronics-style parallel port for printers or other peripherals, and a serial port for modems or disk drives. 
    * Keyboard: An integrated QWERTY keyboard with a numeric keypad and function keys. 
    * Video Output: A standard composite video output. 

BUS
 * Z80 Data and Address Bus: The Z80's complete 8-bit data bus (D0–D7) and 16-bit address bus (A0–A15) are exposed directly to the expansion port, allowing for standard memory and I/O operations.
* Control Signals: Signals like /RD, /WR, /IORQ, and /MREQ are used to manage the flow of data during read, write, memory access, and I/O operations.
* Interrupts: /INT and /NMI provide external peripherals with ways to interrupt the Z80's processing.
* ROM Management: The /ROMDIS signal is crucial for memory expansion. It allows an expansion peripheral to disable the internal system ROM and map in its own ROM banks, typically in the memory region starting at &C000.
* Clock Signals: A 4 MHz clock signal is available, though the actual speed of the Z80 is constrained by the Gate Array's memory access timings.
* System Signals: /RESET is included for system reset, and /WAIT, /BUSREQ, and /BUSACK are for managing bus access.
* Expansion I/O Decoding: The CPC relies on a combination of IORQ and address lines (specifically bit 10 and bit 5 of the BC register) to identify a request to an expansion peripheral. The addresses $FExx to $FBxx are typically allocated for expansion hardware. 