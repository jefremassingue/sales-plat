import React from 'react'
import { AnalyticsProvider } from '@keiko-app/react-google-analytics';
import Header from '@/layouts/site/Header';
import Footer from '@/layouts/site/Footer';
import { CartProvider } from '@/contexts/CartContext';
import ShoppingCart from '@/components/ShoppingCart';
import { Toaster } from '@/components/ui/toaster';



interface SiteLayoutProps { children: React.ReactNode }
export default function SiteLayout({ children }: SiteLayoutProps) {
    const analyticsConfig = {
        measurementId: import.meta.env.VITE_APP_GA4_MEASUREMENT_ID,
        // debug: true, // Enable for development only
        // verbose: true, // Enable for development only
    };

    // console.log(analyticsConfig);

    return (
        <AnalyticsProvider config={analyticsConfig}>
            <CartProvider>
                <div className="flex min-h-screen flex-col bg-white text-zinc-700">
                    <Header />
                    <main className="flex-1">
                        {children}
                    </main>
                    <Footer />
                    <Toaster />
                    <ShoppingCart />
                </div>
            </CartProvider>
        </AnalyticsProvider>
    );
}


