// @ts-expect-error - leb does not publish typescript typings
import leb from 'leb';
// @ts-expect-error - lzma does not publish typescript typings
import lzma from 'lzma';

export class Scanner {
    #current = 0x0;
    #source: Buffer;

    constructor(source: Buffer) {
        this.#source = source;
    }

    /**
     * Read a byte from the source. The byte will be represented as a number (i.e. 0-255)
     */
    readByte(): number {
        this.#current += 1;

        return this.#source.readInt8(this.#current - 1);
    }

    /**
     * Read a short from the source. The short is a 16-bit number represented as a number (i.e. 0-65535)
     */
    readShort(): number {
        this.#current += 2;

        return this.#source.readUIntLE(this.#current - 2, 2);
    }

    /**
     * Read a int from the source. The int is a 32-bit number represented as a number (i.e. 0-4294967295)
     */
    readInt(): number {
        this.#current += 4;

        return this.#source.readInt32LE(this.#current - 4);
    }

    /**
     * Read a long from the source. The long is a 64-bit number represented as a bigint (i.e. 0-18446744073709551615)
     */
    readLong(): bigint {
        this.#current += 8;

        return this.#source.readBigInt64LE(this.#current - 8);
    }

    /**
     * Reads a string from the source using LEB128 encoding. The string returned is a UTF-8 string.
     *
     * @see https://en.wikipedia.org/wiki/LEB128
     */
    readString(): string {
        if (this.#source.readInt8(this.#current) !== 0x0b) {
            this.#current += 1;

            return '';
        }

        this.#current += 1;

        const sourceSlice = this.#source.subarray(this.#current - 1, this.#current + 8);
        const ulebString = leb.decodeUInt64(sourceSlice);
        const strLen: number = ulebString.value;

        this.#current += strLen + ulebString.nextIndex;

        return this.#source.subarray(this.#current - strLen - 1, this.#current - 1).toString();
    }

    /**
     * Reads compressed data using the Lempel–Ziv–Markov chain algorithm.
     *
     * @see https://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Markov_chain_algorithm
     * @todo write tests
     */
    readCompressed(length: number): Promise<unknown | null> {
        this.#current += length;

        if (length === 0) {
            return Promise.resolve(null);
        }

        const slice = this.#source.subarray(this.#current - length, this.#current);

        return new Promise((resolve, reject) => {
            return lzma.decompress(slice, (result: unknown, error: unknown) => {
                if (!error) {
                    resolve(result);
                }

                reject(error);
            });
        });
    }
}

export class ScannerError extends Error {
    constructor(message: string) {
        super();
        this.message = message;
    }
}
