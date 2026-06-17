export interface SevenTVChannelEmotes {
    id: string
    platform: string
    username: string
    display_name: string
    linked_at: number
    emote_capacity: number
    emote_set_id: string
    emote_set: EmoteSet
    user: User
}

export interface EmoteSet {
    id: string
    name: string
    flags: number
    tags: any[]
    immutable: boolean
    privileged: boolean
    emotes: Emote[]
    emote_count: number
    capacity: number
    owner: any
}

export interface Emote {
    id: string
    name: string
    flags: number
    timestamp: number
    actor_id?: string
    data: Data
    origin_id: any
}

export interface Data {
    id: string
    name: string
    flags: number
    lifecycle: number
    state: string[]
    listed: boolean
    animated: boolean
    owner?: Owner
    host: Host
    tags?: string[]
}

export interface Owner {
    id: string
    username: string
    display_name: string
    avatar_url?: string
    style: Style
    role_ids: string[]
    connections: Connection[]
}

export interface Style {
    color?: number
    paint_id?: string
    badge_id?: string
}



export interface Connection {
    id: string
    platform: string
    username: string
    display_name: string
    linked_at: number
    emote_capacity: number
    emote_set_id: string
    emote_set: any
}

export interface Host {
    url: string
    files: File[]
}

export interface File {
    name: string
    static_name: string
    width: number
    height: number
    frame_count: number
    size: number
    format: string
}

export interface User {
    id: string
    username: string
    display_name: string
    created_at: number
    avatar_url: string
    style: Style
    emote_sets: EmoteSet[]
    editors: Editor[]
    roles: string[]
    connections: Connection[]
}

export interface Editor {
    id: string
    permissions: number
    visible: boolean
    added_at: number
}



interface Opts {
    channelId?: number
    only?: Array<string>
    usePixelDensity?: boolean
    colon?: boolean
    height?: string
    format?: string
    cache?: string
    proxy?: string
}

export class EmotesJS {
    #cachedEmotes = new Map<string, string>();
    #colon = true;
    #height = "1.65rem";
    #format = "WEBP";
    #allowedOrigins = "https://cdn.7tv.app";
    #isReady = false;
    #usePixelDensity = false;
    total = 0;
    channelId = 0;
    isLoading = Promise.resolve();
    proxy = ""

    static instance: EmotesJS;

    constructor(opts: Opts) {
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

            this.proxy = opts.proxy || ""
        }
        this.isLoading = this.load(only);
        EmotesJS.instance = this;
    }

    static fromCache(cache: string) {
        return new EmotesJS({ cache });
    }

    cache() {
        return JSON.stringify(Object.fromEntries(this.#cachedEmotes.entries()));
    }

    async load(only: Array<string> = []) {
        let globalProm: Promise<EmoteSet> = fetch("https://7tv.io/v3/emote-sets/global").then(r => {
            if (r.ok) {
                return r.json();
            }
            throw new Error("fetch unsuccessful");
        });
        let chProm: Promise<SevenTVChannelEmotes> = fetch("https://7tv.io/v3/users/twitch/" + this.channelId).then(r => {
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
                    //@ts-ignore
                    [w] = curr.name.split('.') || '';
                }
                return `${url}/${curr.name} ${w}, ${acc}`;
            }, "");
            let elementString = `<img srcset="${srcset}" alt="${name}" style="height:${this.#height}" crossorigin/>`;
            this.#cachedEmotes.set(name, elementString);
        }
        this.total = this.#cachedEmotes.size;
        this.#isReady = true;
    }

    parse(text: string) {
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
            if (this.#colon && !word?.startsWith(":")) {
                fullText += word + " ";
                continue;
            }
            let wordKey = word?.replaceAll(":", "") || '';
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

