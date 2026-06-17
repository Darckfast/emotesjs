# Skills — emotesjs

## What & Why

emotesjs exists to solve a specific problem in Twitch/streaming chat UIs: **rendering 7TV emotes inline in plain text**. When a viewer types an emote name like `Pog` in chat, the raw message is just a string. emotesjs fetches the emote definitions for a channel (plus global emotes) from the 7TV API and replaces those tokens with responsive `<img>` tags — no dependencies, no bundler magic, just a small ESM library you drop in.

**Use it when you are building:**
- A custom Twitch chat overlay (e.g. for OBS/stream software)
- A chat replay or VOD viewer
- A stream dashboard or moderation tool that renders chat
- Any web app that needs to display 7TV emotes alongside regular text

It is **not** a full chat client or a WebSocket listener — it only handles the emote-replacement layer. You bring your own chat messages.

---

## How to Use

### Install
```bash
npm i emotesjs
```

### Basic usage
```ts
import { EmotesJS } from 'emotesjs'

const emotes = new EmotesJS({ channelId: 123456 })
await emotes.isLoading

const html = emotes.parse('this is pretty Pog')
// → 'this is pretty <img srcset="..." alt="Pog" style="height:1.65rem" crossorigin/>'
```

### With caching (skip the network on repeat visits)
```ts
const emotes = new EmotesJS({
  channelId: 123456,
  cache: localStorage.getItem('emoteCache') ?? undefined,
})
await emotes.isLoading
localStorage.setItem('emoteCache', emotes.cache())
```

### Only load specific emotes
```ts
const emotes = new EmotesJS({
  channelId: 123456,
  only: ['Pog', 'KEKW', 'OMEGALUL'],
})
```

### Colon syntax (`:emote:` style)
```ts
const emotes = new EmotesJS({ channelId: 123456, colon: true })
await emotes.isLoading
emotes.parse('this is :Pog:') // replaces :Pog: with the img tag
```

### Custom CDN proxy
```ts
const emotes = new EmotesJS({
  channelId: 123456,
  proxy: 'https://my-cdn.example.com',
})
// CDN URLs will use your proxy instead of cdn.7tv.app
```

---

## Language & Runtime
- **TypeScript** (100% of codebase) targeting ESM output (`"type": "module"`)
- **Node.js ≥ 22** required
- Build toolchain: **tsup** (bundle) + **terser** (minify) + **vitest** (test)

## Core Domain: 7TV Emote Parsing
- Fetches emote sets from the **7TV REST API** (`https://7tv.io/v3/`)
  - Global emote set: `GET /v3/emote-sets/global`
  - Channel emote set: `GET /v3/users/twitch/:channelId`
- Parses raw API responses into typed interfaces (`SevenTVChannelEmotes`, `EmoteSet`, `Emote`, `Host`, `File`, etc.)
- Builds responsive `<img srcset="...">` HTML strings per emote, supporting multiple resolutions (`1x`–`4x`) and both **width-descriptor** (`128w`) and **pixel-density** (`2x`) srcset modes
- Outputs `crossorigin` images with configurable inline `height` style

## EmotesJS Class Capabilities
- **Singleton pattern** — one instance per `channelId`; constructor returns the cached instance on repeat calls
- **Cache system** — emote map serialisable to/from JSON string (`cache()` / `fromCache()`) for persistence between page loads
- **Configurable options**: `channelId`, `only` (allowlist), `usePixelDensity`, `colon` (`:emote:` syntax toggle), `height`, `format` (WEBP default), `proxy` (CDN origin swap), `cache`
- **Origin allowlist** — only URLs starting with `https://cdn.7tv.app` are stored (prevents injecting arbitrary HTML)
- **`parse(text)`** — splits input by spaces, replaces matching tokens (optionally colon-wrapped) with the pre-built `<img>` strings; returns original text untouched while emotes are loading

## Testing
- **vitest** test suite in `index.test.ts`
- Run with `npm test`

## Publishing
- Package name: `emotesjs` on npm
- Exports: ESM only (`./dist/index.js`), ships type declarations (`./dist/index.d.ts`)
- `prepublishOnly` script: `tsup` then `terser` minification
- Zero runtime dependencies
