import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['index.ts'],
    dts: true,
    splitting: false,
    sourcemap: false,
    clean: true,
    minify: true,
    format: ["esm"],
})
