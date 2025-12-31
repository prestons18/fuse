import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    },
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from './src/fuse'`
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    port: 3001,
    open: true
  },
  define: {
    __DEV__: true
  }
});