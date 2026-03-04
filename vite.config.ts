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
