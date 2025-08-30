import React from 'react'
import { useEffect } from 'react';
import Header from '@/layouts/site/Header';
import Footer from '@/layouts/site/Footer';
import { CartProvider } from '@/contexts/CartContext';
import ShoppingCart from '@/components/ShoppingCart';
import { Toaster } from '@/components/ui/toaster';



interface SiteLayoutProps { children: React.ReactNode }
export default function SiteLayout({ children }: SiteLayoutProps) {
    useEffect(() => {
        // Inject Google Analytics gtag.js script
        const scriptTag = document.createElement('script');
        scriptTag.async = true;
        scriptTag.src = 'https://www.googletagmanager.com/gtag/js?id=G-1K545DKM2W';
        document.head.appendChild(scriptTag);

        // Inject gtag config
        const inlineScript = document.createElement('script');
        inlineScript.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1K545DKM2W');
        `;
        document.head.appendChild(inlineScript);

        return () => {
            document.head.removeChild(scriptTag);
            document.head.removeChild(inlineScript);
        };
    }, []);

    return (
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
    );
}


