import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import RootLayout from '@/Layouts/RootLayout';
import { SettingsProvider, useSettings } from '@/lib/settings-context';
import { MotionConfig } from 'motion/react';
import { MagnifyingMouse } from '@/Components/magnifying-mouse';

function AppWrapper({ App, props }) {
    const { reduceMotion } = useSettings();
    return (
        <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>
            <App {...props} />
        </MotionConfig>
    );
}

const appName = import.meta.env.VITE_APP_NAME || 'Berong';

createInertiaApp({
    title: (title) => `${title}`,
    resolve: async (name) => {
        // Resolve .tsx and fallback to .jsx for Breeze 
        const page = await resolvePageComponent(
            `./Pages/${name}.tsx`, 
            import.meta.glob(['./Pages/**/*.tsx', './Pages/**/*.jsx']),
        ).catch(() => resolvePageComponent(
            `./Pages/${name}.jsx`, 
            import.meta.glob(['./Pages/**/*.tsx', './Pages/**/*.jsx']),
        ));
        
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
                <MagnifyingMouse />
            </SettingsProvider>
        );
    },
    progress: {
        color: '#dc2626', // Red color for Safescape
        showSpinner: true,
    },
});
