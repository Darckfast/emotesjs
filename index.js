class EmotesJS {
    #cachedEmotes = new Map()
    #colon = true
    #height = "1.65rem"
    #format = "WEBP"
    #allowedOrigins = "https://cdn.7tv.app"
    #isReady = false
    #usePixelDensity = false

    total = 0
    channelId = 0
    isLoading = Promise.resolve()
    static instance

    constructor(opts) {
        if (EmotesJS.instance && EmotesJS.instance.channelId !== 0) {
            return EmotesJS.instance
        }

        let only
        if (opts) {
            only = opts.only
            this.channelId = opts.channelId
            this.#colon = opts.colon
            this.#colon ||= false
            this.#height = opts.height || this.#height
            this.#format = opts.format || this.#format
            this.#usePixelDensity = opts.usePixelDensity
            this.#usePixelDensity ||= false

            if (opts.cache && typeof opts.cache === "string") {
                this.#cachedEmotes = new Map(Object.entries(JSON.parse(opts.cache)))
                this.total = this.#cachedEmotes.size
                this.#isReady = true
            }
        }

        this.isLoading = this.load(only)
        EmotesJS.instance = this
    }

    cache() {
        return JSON.stringify(Object.fromEntries(this.#cachedEmotes.entries()));
    }

    async load(only = []) {
        let globalProm = fetch("https://7tv.io/v3/emote-sets/global").then(r => {
            if (r.ok) {
                return r.json()
            }

            throw new Error("fetch unsuccessful")
        })

        let chProm = fetch("https://7tv.io/v3/users/twitch/" + this.channelId).then(r => {
            if (r.ok) {
                return r.json()
            }

            throw new Error("fetch unsuccessful")
        })

        let [global, ch] = await Promise.allSettled([globalProm, chProm])

        let rawEmotes = []

        if (ch.status === "fulfilled") {
            rawEmotes.push(...ch.value.emote_set.emotes)
        }

        if (global.status === "fulfilled") {
            rawEmotes.push(...global.value.emotes)
        }

        if (this.#cachedEmotes.size !== 0) {
            this.#cachedEmotes.clear()
        }

        for (let emote of rawEmotes) {
            let name = emote.data.name
            let url = `https:${emote.data.host.url}`

            if (!url.includes(this.#allowedOrigins)) {
                continue
            }

            if (only.length > 0 && !only.includes(name)) {
                continue
            }

            let files = emote.data.host.files.filter(x => x.format === this.#format)
            let srcset = files.reduce((acc, curr) => {
                let w = `${curr.width}w`

                if (this.#usePixelDensity) {
                    [w] = curr.name.split('.')
                }
                return `${url}/${curr.name} ${w}, ${acc}`
            }, "")
            let elementString = `<img srcset="${srcset}" alt="${name}" style="height:${this.#height}"/>`

            this.#cachedEmotes.set(name, elementString)
        }

        this.total = this.#cachedEmotes.size
        this.#isReady = true
    }

    parse(text) {
        if (!text) {
            console.log("no text to parse emotes")
            return text
        }
        if (!this.#isReady) {
            console.log("emotes are not ready")
            return text
        }

        if (this.#cachedEmotes.size === 0) {
            console.log("no emotes loaded")
            return text
        }

        let words = text.split(" ")

        let fullText = ""
        for (let i = 0; i < words.length; i++) {
            let word = words[i]


            if (this.#colon && !word.startsWith(":")) {
                fullText += word + " "
                continue
            }

            let wordKey = word.replaceAll(":", "")
            let emote = this.#cachedEmotes.get(wordKey)

            if (emote) {
                fullText += emote + " "
                continue;
            }

            fullText += word + " "
        }

        return fullText.trim()
    }

}

module.exports = { EmotesJS }
