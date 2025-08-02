import { beforeAll, describe, expect, test } from 'vitest'
import { EmotesJS } from './index'

describe('EmotesJS: parse', () => {
    let emotes

    beforeAll(async () => {
        emotes = new EmotesJS({ channelId: 38746172, requireColon: true })
        await emotes.isLoading
    })

    test('should load emotes in memory', () => {
        expect(emotes.loadedEmotes).toBeGreaterThan(1)
    })

    test('should not parse Pog', () => {
        let result = emotes.parse('this is pretty Pog and fast')
        expect(result).toBe(`this is pretty Pog and fast`)
    })

    test('should parse :Pog:', () => {
        let result = emotes.parse('this is pretty :Pog: and fast')
        expect(result).toBe(`this is pretty <img srcset="https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/4x.webp 128w, https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/3x.webp 96w, https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/2x.webp 64w, https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/1x.webp 32w, " alt="Pog" style="height:1.65rem"/> and fast`)
    })

    test('should parse :Pog', () => {
        let result = emotes.parse('this is pretty :Pog and fast')
        expect(result).toBe(`this is pretty <img srcset="https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/4x.webp 128w, https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/3x.webp 96w, https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/2x.webp 64w, https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/1x.webp 32w, " alt="Pog" style="height:1.65rem"/> and fast`)
    })

    test('should parse Pog, if `requireColon` is disabled', async () => {
        EmotesJS.instance = undefined
        emotes = new EmotesJS({ channelId: 38746172, requireColon: false })
        await emotes.isLoading
        let result = emotes.parse('this is pretty Pog and fast')
        expect(result).toBe(`this is pretty <img srcset="https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/4x.webp 128w, https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/3x.webp 96w, https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/2x.webp 64w, https://cdn.7tv.app/emote/01EZTCN91800012PTN006Q50PR/1x.webp 32w, " alt="Pog" style="height:1.65rem"/> and fast`)
    })
})

describe('EmotesJS: init', () => {
    test('should not reload on new instance', () => {
        EmotesJS.instance = undefined
        let emotes = new EmotesJS({ channelId: 38746172 })
        let e = new EmotesJS({ channelId: 1 })

        expect(e).toBe(emotes)
        expect(e.channelId).toBe(38746172)
    })
    test('should load if not loaded on new instance', () => {
        EmotesJS.instance = undefined
        let e = new EmotesJS()
        let emotes = new EmotesJS({ channelId: 38746172 })

        expect(e).not.toBe(emotes)
        expect(emotes.channelId).toBe(38746172)
    })
})
