# OSR Replay Loader

This package aims to provide a simple way to load and parse Osu! replay files.

Heavily inspired by the [node-osr](https://github.com/vignedev/node-osr) package, this package is a rewrite of the original code to use modern JavaScript features, provide a more flexible API and introduce TypeScript typings.

Currently a WIP for writing a replay, however the reading and parsing of replay files is functional.

My main motive for writing this package was to fetch beatmap data using a replay file for my Discord replay renderer bot. The Danser CLI tool is a great tool for this, but it needs local access to the beatmap files. When writing a public Discord bot, it is unfeasible to have the whole Osu! library loaded for each renderer worker. I also wasn't satisfied with the lack of TS typings for replay reading packages, so I decided to write my own!

## Features

-   [x] Read and parse replay files into a plain old JavaScript object
-   [x] TypeScript typings
-   [x] Async and promise-based API as standard
-   [x] ESModule based
-   [ ] Fetch and parse beatmap data from the Osu! API using the replay file
-   [ ] Write and create replay files

## Does it support Osu! Lazer replays?

This package can parse Lazer replays, but a couple of fields might be populated differently compared to Stable replays. Here's a list of differences:

-   `lifeBarGraph` is an empty string, using this field will be useless
-   `mods` will only show stable mods, not lazer mods
-   `numberOfGekis` will be `0`
-   `numberOfKatus` will be `0`
-   `score` will use new Lazer scoring system
-   Custom gamemodes not found on stable are not supported
-   And probably more... But for the most part, Lazer replays work well enough I think.

When I learn more about Lazer replays, I will update this package to support them better. Surely the extra Lazer data is in the replay file (as Lazer itself loads it), I just need to find it!

## Install

```sh
npm install osr-loader
```

## Usage

```ts
import { Replay } from 'osr-loader';

const replay = await new Replay().readFile('your_replay_file.osr');

console.log(replay.data); // 🪄
```

## Links

-   Official Osu! docs on the replay file format [here](https://osu.ppy.sh/wiki/en/Client/File_formats/osr_%28file_format%29).
-   Original [node-osr](https://github.com/vignedev/node-osr) package. I owe a lot to this package for inspiration and understanding the replay file format.
