import React from 'react'
import Header from '@/layouts/site/Header';
import Footer from '@/layouts/site/Footer';



export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main className='bg-white flex-1'>
                {children}
            </main>
            <Footer />
        </>
    )
}


