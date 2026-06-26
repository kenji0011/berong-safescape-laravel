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
                    if (id.includes('node_modules')) {
                        // Extract heavy 3D rendering libraries
                        if (id.includes('three') || id.includes('@react-three')) {
                            return '3d-vendor';
                        }
                        // Extract heavy canvas and PDF generation libraries
                        if (id.includes('jspdf') || id.includes('html-to-image') || id.includes('fabric')) {
                            return 'canvas-pdf-vendor';
                        }
                        // Let Vite handle React and other core vendors to prevent circular dependencies
                    }
                }
            }
        }
    }
});
