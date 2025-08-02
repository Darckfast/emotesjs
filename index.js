class EmotesJS {
    #cachedEmotes = new Map()
    #isReady = false
    #requireColon = true
    #height = "1.65rem"
    #format = "WEBP"
    #allowedOrigins = "https://cdn.7tv.app"

    loadedEmotes = 0
    channelId = 0
    isLoading = Promise.resolve()
    static instance

    constructor(opts) {
        if (EmotesJS.instance && EmotesJS.instance.channelId !== 0) {
            return EmotesJS.instance
        }

        if (opts) {
            this.channelId = opts.channelId
            this.#requireColon = opts.requireColon
            this.#requireColon ||= false
            this.#height = opts.height || this.#height
            this.#format = opts.format || this.#format
        }

        this.isLoading = this.load()
        EmotesJS.instance = this
    }

    async load() {
        let globalProm = fetch("https://7tv.io/v3/emote-sets/global").then(async r => {
            if (r.ok) {
                return r.json()
            }

            throw new Error("fetch unsuccessful")
        })

        let chProm = fetch("https://7tv.io/v3/users/twitch/" + this.channelId).then(async r => {
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

        for (let emote of rawEmotes) {
            let name = emote.data.name
            let url = `https:${emote.data.host.url}`

            if (!url.includes(this.#allowedOrigins)) {
                continue
            }

            let files = emote.data.host.files.filter(x => x.format === this.#format)
            let srcset = files.reduce((acc, curr) => `${url}/${curr.name} ${curr.width}w, ${acc}`, "")
            let elementString = `<img srcset="${srcset}" alt="${name}" style="height:${this.#height}"/>`

            this.#cachedEmotes.set(name, elementString)
        }

        this.loadedEmotes = this.#cachedEmotes.size

        this.#isReady = true
    }

    parse(text) {
        if (!text || !this.#isReady) {
            console.log("emotes not ready")
            return text
        }

        if (this.#isReady && this.#cachedEmotes.size === 0) {
            console.log("no emotes loaded")
            return text
        }

        let words = text.split(" ")

        let fullText = ""
        for (let i = 0; i < words.length; i++) {
            let word = words[i]


            if (this.#requireColon && !word.startsWith(":")) {
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

module.exports.EmotesJS = EmotesJS

