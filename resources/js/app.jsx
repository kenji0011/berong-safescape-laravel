/**
 * BFP Berong SafeScape - Interactive Fire Safety E-Learning Platform
 * Copyright (c) 2026 Bureau of Fire Protection - Sta. Cruz Fire Station, Laguna.
 * All Rights Reserved.
 *
 * This computer software and source code are protected by Philippines and international
 * copyright laws. Unauthorized reproduction, distribution, or reverse engineering
 * of this software without explicit permission is strictly prohibited.
 */

import '../css/app.css';
import './bootstrap';

import React, { Suspense } from 'react';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import RootLayout from '@/Layouts/RootLayout';
import { SettingsProvider, useSettings } from '@/lib/settings-context';
import { MotionConfig } from 'motion/react';

const LazyMagnifyingMouse = React.lazy(() =>
    import('@/Components/Effects/magnifying-mouse').then((m) => ({ default: m.MagnifyingMouse }))
);

const pages = import.meta.glob(['./Pages/**/*.tsx', './Pages/**/*.jsx']);

function AppWrapper({ App, props }) {
    const { reduceMotion, magnifyingMouse } = useSettings();
    return (
        <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>
            <App {...props} />
            {magnifyingMouse && (
                <Suspense fallback={null}>
                    <LazyMagnifyingMouse />
                </Suspense>
            )}
        </MotionConfig>
    );
}

const appName = import.meta.env.VITE_APP_NAME || 'Berong';

createInertiaApp({
    title: (title) => `${title}`,
    resolve: async (name) => {
        // Resolve .tsx and fallback to .jsx for Breeze 
        const page = await resolvePageComponent(`./Pages/${name}.tsx`, pages)
            .catch(() => resolvePageComponent(`./Pages/${name}.jsx`, pages));
        
        // Attach the persistent layout globally if a page doesn't define its own
        if (!page.default.layout) {
            page.default.layout = (page) => <RootLayout>{page}</RootLayout>;
        }
        
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <SettingsProvider>
                <AppWrapper App={App} props={props} />
            </SettingsProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
