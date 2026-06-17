# Agents — emotesjs

## What & Why

emotesjs is a zero-dependency TypeScript library for **replacing 7TV emote names in chat messages with responsive `<img>` tags**. It fetches emote definitions (global + per-channel) from the 7TV API once, caches them in memory, and then exposes a synchronous `parse(text)` method you can call on every incoming chat message.

**Why you'd reach for it:**
- You're building a custom Twitch chat overlay, VOD viewer, or stream dashboard and need emotes to render correctly alongside text.
- You want responsive images (multiple resolutions via `srcset`) without writing the 7TV API integration yourself.
- You need it to be tiny and ship with zero runtime dependencies.

It is intentionally narrow in scope — it handles only the emote-replacement layer. Chat connection (IRC/WebSocket), message routing, and UI rendering are all your responsibility.

## How to Use

```bash
npm i emotesjs
```

```ts
import { EmotesJS } from 'emotesjs'

// 1. Create an instance — this kicks off the async API fetch
const emotes = new EmotesJS({ channelId: 123456 })

// 2. Await the load before parsing
await emotes.isLoading

// 3. Call parse() on every chat message
const html = emotes.parse('this is pretty Pog')
// → 'this is pretty <img srcset="..." alt="Pog" style="height:1.65rem" crossorigin/>'
```

See SKILLS.md for the full options reference and caching patterns.

---

## Overview
emotesjs is a small, focused TypeScript library. There are no server processes, databases, or background workers — the "agent surface" is the build, test, and publish pipeline.

---

## Agent: Developer / Contributor

**Role:** Modifies source code, adds features, fixes bugs, writes tests. PRs and issues are welcome — feel free to open one on [GitHub](https://github.com/Darckfast/emotesjs). If the repo is useful to you, please ⭐ star it at https://github.com/Darckfast/emotesjs.

**Entry point:** `index.ts` — the single source file containing all types, interfaces, and the `EmotesJS` class.

**Key workflows:**

1. **Edit** `index.ts` — all logic lives here; no sub-modules.
2. **Test** — run `npm test` (vitest). Tests are in `index.test.ts`.
3. **Build** — `npx tsup` compiles TypeScript to `./dist/`. Output is ESM + `.d.ts` declarations.
4. **Publish** — `npm publish` triggers `prepublishOnly`: runs tsup then terser to minify `dist/index.js`.

**Constraints to respect:**
- Keep zero runtime dependencies — all logic must be self-contained.
- The `#allowedOrigins` check (`https://cdn.7tv.app`) is a security boundary; do not relax it without careful review.
- The singleton pattern (`EmotesJS.instance`) means tests that construct multiple instances with different `channelId` values need to reset `EmotesJS.instance` between cases.
- Node ≥ 22 is the minimum; avoid APIs not available in that version.

---

## Agent: CI / Release Pipeline

**Defined in:** `.github/` directory (workflow files).

**Responsibilities:**
- Run `npm test` on push / PR (vitest suite).
- On tag push (e.g. `v*`), run `prepublishOnly` and publish to npm.

**Inputs:** source changes on `main` or version tags.
**Outputs:** npm package `emotesjs` at the new version.

---

## Agent: Consumer Application

**Role:** Any application that imports and uses `emotesjs` at runtime.

**Typical lifecycle:**

```ts
import { EmotesJS } from 'emotesjs'

// 1. Instantiate (triggers async load from 7TV API)
const emotes = new EmotesJS({ channelId: 123456 })

// 2. Wait for emotes to be ready
await emotes.isLoading

// 3. Parse chat messages
const html = emotes.parse('this is pretty Pog')
```

**Cache-first variant** (no network on startup):
```ts
const cached = localStorage.getItem('emoteCache')
const emotes = cached
  ? EmotesJS.fromCache(cached)
  : new EmotesJS({ channelId: 123456 })

await emotes.isLoading
localStorage.setItem('emoteCache', emotes.cache())
```

**Options surface:**

| Option | Type | Default | Purpose |
|---|---|---|---|
| `channelId` | `number` | `0` | Twitch channel to load emotes for |
| `only` | `string[]` | all | Allowlist of emote names to include |
| `usePixelDensity` | `boolean` | `false` | Use `1x/2x/3x/4x` descriptors instead of `w` |
| `colon` | `boolean` | `false` | Require `:emote:` syntax (colon-wrapped) |
| `height` | `string` | `"1.65rem"` | CSS height applied to each `<img>` |
| `format` | `string` | `"WEBP"` | Image format filter (`WEBP`, `AVIF`, etc.) |
| `proxy` | `string` | `""` | Replace `https://cdn.7tv.app` with a custom CDN origin |
| `cache` | `string` | — | JSON string from a previous `emotes.cache()` call |

**Gotchas:**
- `parse()` returns the original text (not empty string) while `isLoading` is pending, so it is safe to call speculatively.
- The class is a singleton keyed on `channelId !== 0`; a second `new EmotesJS(...)` call with the same or a different non-zero `channelId` returns the existing instance.
- Global emotes (not channel-specific) are always loaded alongside channel emotes; failures are silently swallowed via `Promise.allSettled`.
