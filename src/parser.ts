import { Scanner } from './scanner.js';
import { type ReplayType } from './schema.js';

export class Parser {
    #data: Partial<ReplayType> = {};
    #replayScanner: Scanner;

    constructor(replay: Buffer) {
        this.#replayScanner = new Scanner(replay);
    }

    get data(): Partial<ReplayType> {
        return this.#data;
    }

    async parse(): Promise<void> {
        // NOTE: The order of these function calls is important as they are dependent on each other
        // These functions are called in the order of the .osr file binary structure
        this.#readGamemode();
        this.#readGameVersion();
        this.#readBeatmapMD5();
        this.#readPlayerName();
        this.#readReplayMD5();
        this.#readNumberOf300s();
        this.#readNumberOf100s();
        this.#readNumberOf50s();
        this.#readNumberOfGekis();
        this.#readNumberOfKatus();
        this.#readNumberOfMisses();
        this.#readScore();
        this.#readMaxCombo();
        this.#readPerfectCombo();
        this.#readMods();
        this.#readLifeBarGraph();
        this.#readTimestamp();
        this.#readReplayLength();
        await this.#readReplayData();
        this.#readScoreId();
    }

    #readGamemode(): void {
        this.#data.gamemode = this.#replayScanner.readByte();

        switch (this.#data.gamemode) {
            case 0:
                this.#data.gamemodeName = 'standard';
                break;
            case 1:
                this.#data.gamemodeName = 'taiko';
                break;
            case 2:
                this.#data.gamemodeName = 'catch-the-beat';
                break;
            case 3:
                this.#data.gamemodeName = 'mania';
                break;
            default:
                this.#data.gamemodeName = undefined;
        }
    }

    #readGameVersion(): void {
        this.#data.gameVersion = this.#replayScanner.readInt();
    }

    #readBeatmapMD5(): void {
        this.#data.beatmapMD5 = this.#replayScanner.readString();
    }

    #readPlayerName(): void {
        this.#data.playerName = this.#replayScanner.readString();
    }

    #readReplayMD5(): void {
        this.#data.replayMD5 = this.#replayScanner.readString();
    }

    #readNumberOf300s(): void {
        this.#data.numberOf300s = this.#replayScanner.readShort();
    }

    #readNumberOf100s(): void {
        this.#data.numberOf100s = this.#replayScanner.readShort();
    }

    #readNumberOf50s(): void {
        this.#data.numberOf50s = this.#replayScanner.readShort();
    }

    #readNumberOfGekis(): void {
        this.#data.numberOfGekis = this.#replayScanner.readShort();
    }

    #readNumberOfKatus(): void {
        this.#data.numberOfKatus = this.#replayScanner.readShort();
    }

    #readNumberOfMisses(): void {
        this.#data.numberOfMisses = this.#replayScanner.readShort();
    }

    #readScore(): void {
        this.#data.score = this.#replayScanner.readInt();
    }

    #readMaxCombo(): void {
        this.#data.maxCombo = this.#replayScanner.readShort();
    }

    #readPerfectCombo(): void {
        this.#data.perfectCombo = this.#replayScanner.readByte() === 1;
    }

    #readMods(): void {
        this.#data.mods = this.#replayScanner.readInt();
    }

    #readLifeBarGraph(): void {
        this.#data.lifeBarGraph = this.#replayScanner.readString();
    }

    #readTimestamp(): void {
        // The replay stores the time in windows ticks, which is 100 nanoseconds since 1/1/0001
        // We need to convert this to a unix timestamp (milliseconds since 1/1/1970)
        // The difference between the two epochs is 621355968000000000 nanoseconds (a.k.a a big number lol)
        // The division by 10_000 is to convert from nanoseconds to milliseconds
        // The result is still a bigint, even though it can now fit in a 32-bit memory space
        // so we need to convert it to a number
        // Then we can create a Date object from the timestamp
        const epoch = 621355968000000000n;
        const unixTimestamp = (this.#replayScanner.readLong() - epoch) / 10_000n;

        this.#data.timestamp = new Date(Number(unixTimestamp));
    }

    #readReplayLength(): void {
        this.#data.replayByteLength = this.#replayScanner.readInt();
    }

    async #readReplayData(): Promise<void> {
        if (!this.#data.replayByteLength) {
            throw new ParserError('Replay byte length not found. Unable to read replay data.');
        }

        const replayData = await this.#replayScanner.readCompressed(this.#data.replayByteLength);

        if (!replayData) {
            throw new ParserError('Replay data is empty.');
        }

        this.#data.replayData = replayData;
    }

    #readScoreId(): void {
        this.#data.scoreId = this.#replayScanner.readLong();
    }
}

export class ParserError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ParserError';
    }
}
