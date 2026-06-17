![banner](.github/images/banner.png)

![NPM Version](https://img.shields.io/npm/v/emotesjs) ![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/emotesjs)

# EmotesJS

Fast, dependency free, and responsive 7TV inline emotes parse

## Basic usage

```sh
npm i emotesjs
```

```ts
import { EmotesJS } from 'emotesjs'

let emotes = new EmotesJS({ channelId: 123456 })

let html = emotes.parse('this is pretty Pog')

console.log(html) 
// this is pretty <img srcset="https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/4x.webp 128w, 
//      https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/3x.webp 96w, 
//      https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/2x.webp 64w, 
//      https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/1x.webp 32w" 
//      alt="Pog" style="height:1.65rem"
// />
```

[Check the documentation here](https://darckfast.com/docs/emotesjs)
