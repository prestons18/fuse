import { build } from "esbuild";

await build({
    entryPoints: ["src/index.tsx"],
    bundle: true,
    outfile: "dist/index.js",
    format: "esm",
    target: ["esnext"],
    sourcemap: true,
    jsxFactory: "h",
    jsxFragment: "Fragment",
    jsxImportSource: "./src/fuse",
    platform: "browser",
    minify: false,
    watch: process.argv.includes("--watch"),
});