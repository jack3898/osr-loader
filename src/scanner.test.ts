import { Scanner, ScannerError } from './scanner.js';
import { describe, it, expect } from 'vitest';

describe('Scanner', () => {
    it('should read a byte', () => {
        const data = new Uint8Array([0x00, 0x0f]);
        const scanner = new Scanner(Buffer.concat([data]));

        expect(scanner.readByte()).toBe(0);
        expect(scanner.readByte()).toBe(15);
    });

    it('should read a short', () => {
        const data = new Uint8Array([0x0f, 0x0f, 0x0f]);
        const scanner = new Scanner(Buffer.concat([data]));

        expect(scanner.readByte()).toBe(15);
        expect(scanner.readShort()).toBe(3855);
    });

    it('should read an int', () => {
        const data = new Uint8Array([0x0f, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f]);
        const scanner = new Scanner(Buffer.concat([data]));

        expect(scanner.readInt()).toBe(252645135);
        expect(scanner.readInt()).toBe(252645135);
    });

    it('should read a long', () => {
        const data = new Uint8Array([
            0x0f, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f, 0x0f,
            0x0f, 0x0f
        ]);
        const scanner = new Scanner(Buffer.concat([data]));

        expect(scanner.readLong()).toBe(1085102592571150095n);
    });

    it('should read a uleb string', () => {
        // Osr has is that the first byte (11 in this case) is the start of ULEB128, then the second byte is the length of the string
        const helloWorldMessage = [
            0x0b, 0x0b, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x57, 0x6f, 0x72, 0x6c, 0x64
        ];

        const data = new Uint8Array([0x0f, ...helloWorldMessage, 0x0f]);
        const scanner = new Scanner(Buffer.concat([data]));

        // Checking if the scanner is at the right position by adding a byte before and after the string
        expect(scanner.readByte()).toBe(15);
        expect(scanner.readString()).toBe('Hello World');
        expect(scanner.readByte()).toBe(15);
    });

    it('should read a compressed lzma string', async () => {
        const helloWorldMessage = [
            93, 0, 0, -128, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 36, 25, 73, -104, 111, 16, 17, -56, 95,
            -26, -43, -114, 34, 36, 26, -1, -3, -4, -16, 0
        ];

        const data = new Uint8Array([0x0f, ...helloWorldMessage, 0x0f]);

        const scanner = new Scanner(Buffer.concat([data]));

        // Checking if the scanner is at the right position by adding a byte before and after the string
        expect(scanner.readByte()).toBe(15);
        expect(await scanner.readCompressed(helloWorldMessage.length)).toBe('Hello World');
        expect(scanner.readByte()).toBe(15);
    });

    it('should throw a scanner error if the scanner is out of bounds', () => {
        const data = new Uint8Array([0x0f]);
        const scanner = new Scanner(Buffer.concat([data]));

        expect(() => scanner.readByte()).not.toThrowError(ScannerError);
        expect(() => scanner.readByte()).toThrowError(ScannerError);
    });
});
