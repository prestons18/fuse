import { build, context } from "esbuild";
import { writeFileSync } from "fs";
import { basename, extname } from "path";

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
    if (isProd) {
        const entryPoints = Array.isArray(options.entryPoints)
            ? options.entryPoints
            : Object.values(options.entryPoints);

        for (const entry of entryPoints) {
            const base = basename(entry, extname(entry));
            // this is not a great way to do this, but it'll work for now.
            const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fuse App</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="./${base}.js"></script>
</body>
</html>`;

            writeFileSync(`dist/${base}.html`, html, "utf8");
        }
    }
    console.log("Build complete!");
}