import { readFileSync } from 'fs';
import { Parser } from './parser.js';
import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const replayBuf = readFileSync(join(__dirname, './../test_replay.osr'));

describe('Parser', () => {
    it('should parse a replay', async () => {
        const parser = new Parser(replayBuf);

        await parser.parse();

        // I usually don't like having dozens of expect statements in a single test,
        // but the replay file is structured in a way that it's hard to test multiple properties at once.
        expect(parser.data.gamemode).toBe(0);
        expect(parser.data.gamemodeName).toBe('standard');
        expect(parser.data.gameVersion).toBe(20240121);
        expect(parser.data.beatmapMD5).toBe('fd0d219628cc1625e9a7897748c4e0ac');
        expect(parser.data.playerName).toBe('jackw');
        expect(parser.data.replayMD5).toBe('0c7aea251178f73474124b9444c18f33');
        expect(parser.data.numberOf300s).toBe(157);
        expect(parser.data.numberOf100s).toBe(8);
        expect(parser.data.numberOf50s).toBe(0);
        expect(parser.data.numberOfGekis).toBe(32);
        expect(parser.data.numberOfKatus).toBe(6);
        expect(parser.data.numberOfMisses).toBe(17);
        expect(parser.data.score).toBe(523478);
        expect(parser.data.maxCombo).toBe(139);
        expect(parser.data.perfectCombo).toBe(false);
        expect(parser.data.mods).toBe(0);

        // The life bar graph is a bit too long to test in a single expect statement
        expect(parser.data.lifeBarGraph?.startsWith('987|1,3140|1,5291')).toBeTruthy();
        expect(parser.data.lifeBarGraph?.endsWith('|0.67,38630|0,')).toBeTruthy();

        expect(parser.data.timestamp).toEqual(new Date('2024-02-05T21:04:17.486Z'));
        expect(parser.data.replayByteLength).toBe(21521);
        expect(parser.data.replayData?.startsWith('0|256|-500|0,-1|256')).toBeTruthy();
        expect(parser.data.replayData?.endsWith('7.7793|0,-12345|0|0|0,')).toBeTruthy();
        expect(parser.data.scoreId).toBe(0n);
    });
});
