import { build, context } from "esbuild";

const isWatchMode = process.argv.includes("--watch");
const isProd = process.env.NODE_ENV === "production" || process.argv.includes("--prod");

const options = {
    entryPoints: ["src/index.tsx"],
    bundle: true,
    outdir: "dist",
    format: "esm",
    target: ["esnext"],
    sourcemap: !isProd,
    jsxFactory: "h",
    jsxFragment: "Fragment",
    jsxImportSource: "./src/fuse",
    platform: "browser",
    loader: {
        ".ts": "ts",
        ".tsx": "tsx",
        ".css": "css"
    },
    minify: isProd,
    splitting: true,
    chunkNames: "chunks/[name]-[hash]",
    external: ['react', 'react-dom'],
    logLevel: "info"
};

if (isWatchMode) {
    const ctx = await context(options);
    await ctx.watch();
    await ctx.serve({
        servedir: ".",
        port: 3001,
        fallback: "index.html"
    });
    console.log("Dev server running at http://localhost:3001");
} else {
    await build(options);
    console.log("Build complete!");
}