import { Scanner, ScannerError } from './scanner.js';
import { describe, it, expect } from 'vitest';

describe('Scanner', () => {
    it("should throw an error if it's at the end of the source", () => {
        const data = new Uint8Array([0x00]);
        const scanner = new Scanner(Buffer.concat([data]));

        expect(scanner.readByte()).toBe(0);
        expect(() => scanner.readByte()).toThrowError(ScannerError);
    });

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
        const helloWorldMessage = [
            0x0b, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x57, 0x6f, 0x72, 0x6c, 0x64, 0x00, 0x0f
        ];
        const data = new Uint8Array([0x0f, ...helloWorldMessage, 0x0f]);
        const scanner = new Scanner(Buffer.concat([data]));

        // Checking if the scanner is at the right position by adding a byte before and after the string
        expect(scanner.readByte()).toBe(15);
        expect(scanner.readString()).toBe('Hello World');
        expect(scanner.readByte()).toBe(15);
    });
});
