import { build, context } from "esbuild";

const isWatchMode = process.argv.includes("--watch");

const options = {
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