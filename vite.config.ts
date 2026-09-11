import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Vite 8 bundles with rolldown, which replaced manualChunks with
        // advancedChunks. Groups preserve the previous vendor splits.
        advancedChunks: {
          groups: [
            // React core — loaded on every page
            {
              name: 'vendor-react',
              test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|@remix-run[\\/]router)[\\/]/,
            },
            // Maps — only needed on map pages
            {
              name: 'vendor-leaflet',
              test: /node_modules[\\/](leaflet|react-leaflet)[\\/]/,
            },
            // Charts — only needed on stats/transparency pages
            {
              name: 'vendor-recharts',
              test: /node_modules[\\/]recharts[\\/]/,
            },
            // Search — only needed on search page
            {
              name: 'vendor-search',
              test: /node_modules[\\/](meilisearch|fuse\.js)[\\/]/,
            },
            // i18n — loaded early but large
            {
              name: 'vendor-i18n',
              test: /node_modules[\\/](i18next|react-i18next)[\\/]/,
            },
          ],
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
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
        rewrite: path => path,
        configure: proxy => {
          // Handle proxy errors (ECONNREFUSED, ECONNRESET, etc.)
          proxy.on(
            'error',
            (
              _err: Error,
              _req: unknown,
              res: {
                headersSent: boolean;
                writeHead: (
                  code: number,
                  headers: Record<string, string>
                ) => void;
                end: (data: string) => void;
              }
            ) => {
              if (!res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({ error: 'API unavailable', offline: true })
                );
              }
            }
          );
          // Handle proxy request errors (connection failures)
          proxy.on(
            'proxyReq',
            (proxyReq: {
              on: (event: string, handler: () => void) => void;
            }) => {
              proxyReq.on('error', () => {
                // Error will be caught by the main error handler above
              });
            }
          );
        },
      },
    },
  },
});
