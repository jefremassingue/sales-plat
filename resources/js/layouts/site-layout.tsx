import React from 'react'
import Header from '@/layouts/site/Header';
import Footer from '@/layouts/site/Footer';
import { CartProvider } from '@/contexts/CartContext';
import ShoppingCart from '@/components/ShoppingCart';



export default function SiteLayout({ children }: any) {
    return (
        <CartProvider>
            <div className="flex min-h-screen flex-col bg-white text-zinc-700">
                <Header />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
                <ShoppingCart />
            </div>
        </CartProvider>
    );
}


