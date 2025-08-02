# EmotesJS

Simple, fast, responsive and dependency free 7TV inline emotes parse

## Usages

```sh
npm i emotesjs
```

```js
import { EmotesJS } from 'emotesjs'

let emotes = new EmotesJS({ channelId: 123456, requireColon: false, height: '1.64rem', format: 'WEBP' })

// optional - once fetched, the emotes will be cached in memory
await emotes.isLoading

let html = emotes.parse('this is pretty Pog')
```
