import { build, context } from "esbuild";

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
};

if (process.argv.includes("--watch")) {
    const ctx = await context(options);
    await ctx.watch();
    console.log("Watching for changes...");
} else {
    await build(options);
    console.log("Build complete!");
}