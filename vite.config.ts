import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist',
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: /^@bettergov\/kapwa(\/(?:input|label|banner|button|card|lib\/utils))?$/,
        replacement: (...match) => {
          const subpath = match[1] || '';
          if (!subpath) return path.resolve(__dirname, 'src/kapwa');
          const paths: Record<string, string> = {
            '/input': 'src/kapwa/input/index.tsx',
            '/label': 'src/kapwa/label/index.tsx',
            '/banner': 'src/kapwa/banner/index.tsx',
            '/button': 'src/kapwa/button/index.tsx',
            '/card': 'src/kapwa/card/index.tsx',
            '/lib/utils': 'src/kapwa/lib/utils.ts',
          };
          return path.resolve(__dirname, paths[subpath]);
        },
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src'),
      },
    ],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
        // secure: false,
        rewrite: path => path,
      },
    },
  },
});
