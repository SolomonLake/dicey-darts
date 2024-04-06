import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from 'vite-plugin-pwa'

const injectRegister = (process.env.SW_INLINE ?? 'auto') as 'inline' | 'auto' | 'script' | 'script-defer'
const selfDestroying = process.env.SW_DESTROY === 'true'

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        sourcemap: process.env.SOURCE_MAP === 'true',
    },
    base: '/dicey-darts/',
    plugins: [
        react(),
        VitePWA({
            mode: 'development',
            base: '/dicey-darts/',
            /* buildBase: '/test-build-base/', */
            includeAssets: ['dart.svg'],
            selfDestroying,
            manifest: {
                name: 'Dicey Darts',
                short_name: 'game',
                theme_color: '#ffffff',
                icons: [
                    {
                        src: 'dart.svg', // <== don't add slash, for testing
                        sizes: '48x48 96x96 128x128 256x256',
                        type: 'image/svg+xml',
                    },
                ],
            },
            workbox: {
                cleanupOutdatedCaches: true,
                clientsClaim: true,
                skipWaiting: true,
            },
            injectManifest: {
                minify: false,
                enableWorkboxModulesLogs: true,
                injectionPoint: undefined,
            },
            devOptions: {
                enabled: process.env.SW_DEV === 'true',
                type: 'module',
            },
        }),
    ],
});
