import React from 'react'
import Header from '@/layouts/site/Header';
import Footer from '@/layouts/site/Footer';
import { CartProvider } from '@/contexts/CartContext';
import ShoppingCart from '@/components/ShoppingCart';
import { Toaster } from '@/components/ui/toaster';



interface SiteLayoutProps { children: React.ReactNode }
export default function SiteLayout({ children }: SiteLayoutProps) {
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


