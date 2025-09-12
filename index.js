class EmotesJS {
    /** @default Map<string, string> */
    #cachedEmotes = new Map();
    /** @default true */
    #colon = true;
    /** @default "1.65rem" */
    #height = "1.65rem";
    /** @default "WEBP" */
    #format = "WEBP";
    /** @default "https://cdn.7tv.app" */
    #allowedOrigins = "https://cdn.7tv.app";
    /** @default false */
    #isReady = false;
    /** @default false */
    #usePixelDensity = false;
    /** @default 0 */
    total = 0;
    /** @default 0 */
    channelId = 0;
    /** @default Promise<void> */
    isLoading = Promise.resolve();
    /** @default "" */
    proxy = ""

    /**
     * @static
     */
    static instance;
    /**
     * @param {Opts} opts
     */
    constructor(opts) {
        if (EmotesJS.instance && EmotesJS.instance.channelId !== 0) {
            return EmotesJS.instance;
        }
        let only;
        if (opts) {
            only = opts.only;
            this.channelId = opts.channelId || 0;
            this.#colon = Boolean(opts.colon);
            this.#height = opts.height || this.#height;
            this.#format = opts.format || this.#format;
            this.#usePixelDensity = Boolean(opts.usePixelDensity);
            if (opts.cache && typeof opts.cache === "string") {
                this.#cachedEmotes = new Map(Object.entries(JSON.parse(opts.cache)));
                this.total = this.#cachedEmotes.size;
                this.#isReady = true;
            }

            this.proxy = opts.proxy
        }
        this.isLoading = this.load(only);
        EmotesJS.instance = this;
    }
    /**
     * @static
     * @param {string} cache
     * @returns {EmotesJS}
     */
    static fromCache(cache) {
        return new EmotesJS({ cache });
    }
    /**
     * @returns {string}
     */
    cache() {
        return JSON.stringify(Object.fromEntries(this.#cachedEmotes.entries()));
    }
    /**
     * @param {string[]} [only=[]]
     * @returns {Promise<void>}
     */
    async load(only = []) {
        let globalProm = fetch("https://7tv.io/v3/emote-sets/global").then(r => {
            if (r.ok) {
                return r.json();
            }
            throw new Error("fetch unsuccessful");
        });
        let chProm = fetch("https://7tv.io/v3/users/twitch/" + this.channelId).then(r => {
            if (r.ok) {
                return r.json();
            }
            throw new Error("fetch unsuccessful");
        });
        let [global, ch] = await Promise.allSettled([globalProm, chProm]);
        let rawEmotes = [];
        if (ch.status === "fulfilled") {
            rawEmotes.push(...ch.value.emote_set.emotes);
        }
        if (global.status === "fulfilled") {
            rawEmotes.push(...global.value.emotes);
        }
        if (this.#cachedEmotes.size !== 0) {
            this.#cachedEmotes.clear();
        }
        for (let emote of rawEmotes) {
            let name = emote.data.name;
            let url = `https:${emote.data.host.url}`;
            if (!url.includes(this.#allowedOrigins)) {
                continue;
            }
            if (this.proxy) {
                url = url.replace(this.#allowedOrigins, this.proxy)
            }
            if (only.length > 0 && !only.includes(name)) {
                continue;
            }
            let files = emote.data.host.files.filter(x => x.format === this.#format)
            let srcset = files.reduce((acc, curr) => {
                let w = `${curr.width}w`;
                if (this.#usePixelDensity) {
                    [w] = curr.name.split('.');
                }
                return `${url}/${curr.name} ${w}, ${acc}`;
            }, "");
            let elementString = `<img srcset="${srcset}" alt="${name}" style="height:${this.#height}"/>`;
            this.#cachedEmotes.set(name, elementString);
        }
        this.total = this.#cachedEmotes.size;
        this.#isReady = true;
    }
    /**
     * @param {string | undefined} text
     * @returns {string}
     */
    parse(text) {
        if (!text) {
            console.log("no text to parse emotes");
            return "";
        }
        if (!this.#isReady) {
            console.log("emotes are not ready");
            return text;
        }
        if (this.#cachedEmotes.size === 0) {
            console.log("no emotes loaded");
            return text;
        }
        let words = text.split(" ");
        let fullText = "";
        for (let i = 0; i < words.length; i++) {
            let word = words[i];
            if (this.#colon && !word.startsWith(":")) {
                fullText += word + " ";
                continue;
            }
            let wordKey = word.replaceAll(":", "");
            let emote = this.#cachedEmotes.get(wordKey);
            if (emote) {
                fullText += emote + " ";
                continue;
            }
            fullText += word + " ";
        }
        return fullText.trim();
    }
}
module.exports = { EmotesJS };
/**
 * @typedef {Object} Opts
 * @property {number} [channelId]
 * @property {string[]} [only]
 * @property {boolean} [colon]
 * @property {string} [height]
 * @property {"WEBP" | "AVIF"} [format]
 * @property {boolean} [usePixelDensity]
 * @property {string} [cache]
 */
