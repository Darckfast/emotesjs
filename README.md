![banner](.github/images/banner.png)

# EmotesJS

Fast, dependency free, and responsive 7TV inline emotes parse

## Usage

```sh
npm i emotesjs
```

```js
import { EmotesJS } from 'emotesjs'

let emotes = new EmotesJS({ channelId: 123456, requireColon: false, height: '1.64rem', format: 'WEBP' })

// optional - once fetched, the emotes will be cached in memory
await emotes.isLoading

let html = emotes.parse('this is pretty Pog')

console.log(html) 
// this is pretty <img srcset="https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/4x.webp 128w, https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/3x.webp 96w, https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/2x.webp 64w, https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/1x.webp 32w, " alt="Pog" style="height:1.65rem"/>
```
