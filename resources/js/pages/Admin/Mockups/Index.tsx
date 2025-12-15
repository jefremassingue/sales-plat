import React from 'react';
import MockupGeneratorAdmin from './MockupGeneratorAdmin';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function Index({ auth }: any) {
    return (
        <AppLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Gerador de Mockups AI</h2>}
        >
            <Head title="Gerador de Mockups AI" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <MockupGeneratorAdmin />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
