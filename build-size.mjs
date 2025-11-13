import { build } from "esbuild";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';
import { gzipSync } from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function measureSize() {
    const outfile = 'dist/fuse-size.js';
    
    await build({
        entryPoints: ["size-test.ts"],
        bundle: true,
        outfile,
        format: "esm",
        target: ["esnext"],
        sourcemap: false,
        minify: true,
        treeShaking: true,
        platform: "browser",
        logLevel: "info"
    });

    const stats = await readFile(join(__dirname, outfile), 'utf-8');
    const sizeInKb = (Buffer.byteLength(stats, 'utf8') / 1024).toFixed(2);
    
    console.log(`\nFuse library size:`);
    console.log(`- ${sizeInKb} KB`);
    
    // Also gzipped size
    const gzipped = gzipSync(Buffer.from(stats));
    const gzippedSizeKb = (gzipped.length / 1024).toFixed(2);
    console.log(`- ${gzippedSizeKb} KB (gzipped)`);
}

measureSize().catch(console.error);
