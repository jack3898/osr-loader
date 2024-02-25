import { z } from 'zod';

export const replaySchema = z.object({
    gamemode: z.number(),
    gamemodeName: z.union([
        z.literal('standard'),
        z.literal('taiko'),
        z.literal('catch-the-beat'),
        z.literal('mania')
    ]),
    gameVersion: z.number(),
    beatmapMD5: z.string(),
    playerName: z.string(),
    replayMD5: z.string(),
    numberOf300s: z.number(),
    numberOf100s: z.number(),
    numberOf50s: z.number(),
    numberOfGekis: z.number(),
    numberOfKatus: z.number(),
    numberOfMisses: z.number(),
    score: z.number(),
    maxCombo: z.number(),
    perfectCombo: z.boolean(),
    mods: z.number(),
    lifeBarGraph: z.string(),
    timestamp: z.date(),
    replayByteLength: z.number(),
    replayData: z.string(),
    scoreId: z.bigint()
});

export type ReplayType = z.infer<typeof replaySchema>;
