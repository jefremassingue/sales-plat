import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { inertiaTitle } from 'inertia-title';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Matony Serviços';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#f57c14',
        showSpinner: true,
    },
});

// This will set light / dark mode on load...
initializeTheme();

// Initialize inertia-title to auto-update the <title> on client navigations
inertiaTitle();
