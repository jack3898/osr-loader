# OSR replay loader

This package aims to provide a simple way to load and parse osu! replay files.

Heavily inspired by the [node-osr](https://github.com/vignedev/node-osr) package, this package is a rewrite of the original code to use modern JavaScript features, provide a more flexible API and introduce TypeScript typings.

Currently a WIP, however the reading and parsing of replay files is functional.

## Install

NPM package coming soon.

## Usage

```ts
import { Replay } from 'osr-loader';

const replay = await new Replay().readFile('test_replay.osr');

console.log(replay.data); // 🪄
```
