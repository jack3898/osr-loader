import { promisify } from 'util';
import fs from 'fs';
import { Parser } from './parser.js';
import { type ReplayType, replaySchema } from './schema.js';

const readFile = promisify(fs.readFile);

export class Replay {
    #data?: ReplayType;

    async #readParser(parser: Parser): Promise<void> {
        const validatedReplayData = await replaySchema.safeParseAsync(parser.data);

        if (validatedReplayData.success) {
            this.#data = validatedReplayData.data;

            return;
        }

        throw new ReplayError(`Replay data is invalid: ${validatedReplayData.error}`);
    }

    async readFile(path: string): Promise<this> {
        const replayBuf = await readFile(path);
        const parser = new Parser(replayBuf);

        await parser.parse();
        await this.#readParser(parser);

        return this;
    }

    async readBuffer(replayBuf: Buffer): Promise<this> {
        const parser = new Parser(replayBuf);

        await parser.parse();
        await this.#readParser(parser);

        return this;
    }

    get data(): ReplayType | undefined {
        return this.#data;
    }
}

export class ReplayError extends Error {
    constructor(message: string) {
        super();
        this.message = message;
    }
}
