import React from 'react';
import { Button } from '@/components/ui/button';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Tipos frouxos para compatibilidade ampla
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ProductSectionProps { title: string; products: any[] | null | undefined; bgColor?: string; }

const ProductSection: React.FC<ProductSectionProps> = ({ title, products, bgColor = 'bg-slate-50' }) => {
    const isLoading = !products;
    
    // Debug
    console.log(`ProductSection ${title}:`, {
        isLoading,
        productsCount: products?.length ?? 0,
        products
    });

    return (
        <section className={`py-16 md:py-24 ${bgColor}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <header className='flex gap-2 justify-between items-end mb-4'>
                    <div>
                        <h2 className="text-xl md:text-2xl lg:text-4xl font-bold text-slate-800 mb-4">{title}</h2>
                    </div>
                    <Button>Ver todos</Button>
                </header>
                {isLoading ? (
                    // Loading state
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <ProductCardSkeleton key={index} />
                        ))}
                    </div>
                ) : products && products.length > 0 ? (
                    // Loaded state with products using Swiper
                    <div className="relative">
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={24}
                            slidesPerView={1}
                            navigation={{
                                nextEl: '.swiper-button-next',
                                prevEl: '.swiper-button-prev',
                            }}
                            pagination={{
                                clickable: true,
                                el: '.swiper-pagination',
                            }}
                            loop={true}
                            autoplay={{
                                delay: 3000,
                                disableOnInteraction: false,
                            }}
                            breakpoints={{
                                300: {
                                    slidesPerView: 1.2,
                                },
                                640: {
                                    slidesPerView: 2,
                                },
                                1024: {
                                    slidesPerView: 4,
                                },
                                1280: {
                                    slidesPerView: 5,
                                },
                            }}
                            className="product-swiper"
                        >
                            {products.map((product) => (
                                <SwiperSlide key={String(product.id)}>
                                    <ProductCard product={product} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        <div className="swiper-button-prev !w-12 !h-12 !bg-white !rounded-full !shadow-lg after:!text-orange-600 after:!text-xl hover:!bg-orange-50 transition-colors"></div>
                        <div className="swiper-button-next !w-12 !h-12 !bg-white !rounded-full !shadow-lg after:!text-orange-600 after:!text-xl hover:!bg-orange-50 transition-colors"></div>
                        <div className="swiper-pagination !bottom-0 [&_.swiper-pagination-bullet-active]:!bg-orange-600 [&_.swiper-pagination-bullet]:!bg-orange-200"></div>
                    </div>
                ) : (
                    // No products state
                    <div className="text-center py-8">
                        <p className="text-slate-500">Nenhum produto encontrado.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductSection; 