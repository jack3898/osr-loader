// @ts-expect-error - leb does not publish typescript typings
import leb from 'leb';
// @ts-expect-error - lzma does not publish typescript typings
import lzma from 'lzma';

export class Scanner {
    #current = 0;
    #source: Buffer;

    constructor(source: Buffer) {
        this.#source = source;
    }

    /**
     * Increment the current cursor position of this scanner by an amount.
     * Will throw an error if the new scanner position will be out of bounds.
     */
    #advance(by: number): void {
        if (this.#source.byteLength <= this.#current) {
            throw new ScannerError('Unable scan next position as it is out of bounds.');
        }

        this.#current += by;
    }

    /**
     * Read a byte from the source. The byte will be represented as a number (i.e. 0-255)
     */
    readByte(): number {
        this.#advance(1);

        return this.#source.readInt8(this.#current - 1);
    }

    /**
     * Read a short from the source. The short is a 16-bit number represented as a number (i.e. 0-65535)
     */
    readShort(): number {
        this.#advance(2);

        return this.#source.readUIntLE(this.#current - 2, 2);
    }

    /**
     * Read a int from the source. The int is a 32-bit number represented as a number (i.e. 0-4294967295)
     */
    readInt(): number {
        this.#advance(4);

        return this.#source.readInt32LE(this.#current - 4);
    }

    /**
     * Read a long from the source. The long is a 64-bit number represented as a bigint (i.e. 0-18446744073709551615)
     */
    readLong(): bigint {
        this.#advance(8);

        return this.#source.readBigInt64LE(this.#current - 8);
    }

    /**
     * Reads a string from the source using LEB128 encoding. The string returned is a UTF-8 string.
     *
     * @see https://osu.ppy.sh/wiki/en/Client/File_formats/osr_%28file_format%29
     * @see https://en.wikipedia.org/wiki/LEB128
     */
    readString(): string {
        if (this.#source.readInt8(this.#current) !== 0x0b) {
            this.#advance(1);

            return '';
        }

        this.#advance(1);

        const sourceSlice = this.#source.subarray(this.#current, this.#current + 8);
        const ulebString = leb.decodeUInt64(sourceSlice);
        const strLen: number = ulebString.value;

        this.#advance(strLen + ulebString.nextIndex);

        return this.#source.subarray(this.#current - strLen, this.#current).toString();
    }

    /**
     * Reads compressed data using the Lempel–Ziv–Markov chain algorithm.
     *
     * @param {string} byteLength The amount of uncompressed bytes in the source the algorithm should read to process.
     * @see https://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Markov_chain_algorithm
     */
    readCompressed(byteLength: number): Promise<string | null> {
        this.#advance(byteLength);

        if (byteLength === 0) {
            return Promise.resolve(null);
        }

        const slice = this.#source.subarray(this.#current - byteLength, this.#current);

        return new Promise((resolve, reject) => {
            return lzma.decompress(slice, (result: string, error: unknown) => {
                if (error) {
                    reject(new ScannerError(String(error)));

                    return;
                }

                if (typeof result !== 'string') {
                    reject(new ScannerError('Decompressed data is not a string.'));

                    return;
                }

                if (typeof result === 'string') {
                    resolve(result);

                    return;
                }

                reject(new ScannerError('Unknown error occurred when decompressing data.'));
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
