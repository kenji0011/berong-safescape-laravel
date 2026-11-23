import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    server: {
        host: 'localhost',
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Keep Vite's preload & Rollup CJS helpers in react-vendor so app.jsx never
                    // pulls heavy lazy chunks (like 3d-vendor) just to import __vitePreload.
                    if (id.includes('vite/preload-helper') || id.includes('commonjsHelpers')) {
                        return 'react-vendor';
                    }
                    if (id.includes('node_modules')) {
                        // Keep core React runtime in its own chunk so 3D libraries never pull react-dom into 3d-vendor
                        if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
                            return 'react-vendor';
                        }
                        // Extract heavy 3D rendering libraries (only loaded on /game and Module 5 Hazard Hunt)
                        if (/[\\/]node_modules[\\/](three|@react-three|troika-|three-|suspend-react|camera-controls|meshoptimizer|draco3d|meshline|maath|potpack|stats-gl|stats\.js|webgl-)/.test(id)) {
                            return '3d-vendor';
                        }
                        // Extract heavy canvas and PDF generation libraries
                        if (/[\\/]node_modules[\\/](jspdf|html-to-image|html2canvas)[\\/]/.test(id)) {
                            return 'canvas-pdf-vendor';
                        }
                        // Extract animation libraries
                        if (/[\\/]node_modules[\\/](motion|motion-dom|motion-utils)[\\/]/.test(id)) {
                            return 'animations-vendor';
                        }
                        // Extract icon library
                        if (/[\\/]node_modules[\\/]lucide-react[\\/]/.test(id)) {
                            return 'icons-vendor';
                        }
                    }
                }
            }
        }
    }
});
