import React, { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import CategoryCardSkeleton from './CategoryCardSkeleton';

interface Category {
    name: string;
    link: string;
    items: number;
}

interface CategorySectionProps {
    categories: Category[] | null | undefined;
}

const CategorySection: React.FC<CategorySectionProps> = ({ categories }) => {
    const isLoading = !categories;

    // Debug logs
    useEffect(() => {
        console.log('CategorySection:', {
            isLoading,
            categoriesCount: categories?.length ?? 0,
            categories
        });
    }, [categories, isLoading]);

    return (
        <section className="py-8 md:py-12  bg-zinc-50 ">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <CategoryCardSkeleton key={index} />
                        ))}
                    </div>
                ) : categories && categories.length > 0 ? (
                    <Swiper
                        modules={[Navigation, Pagination]}
                        spaceBetween={20}
                        pagination={{
                            clickable: true,
                            el: '.swiper-pagination',
                        }}
                        loop={true}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                        }}
                        slidesPerView="auto"
                        className="category-swiper flex justify-center"
                        navigation={{
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev',
                        }}
                    >
                        {categories.map((category) => (
                            <SwiperSlide key={category.name} className="!w-auto min-w-[200px]">
                                <a
                                    href={category.link}
                                    className="group block bg-white hover:bg-orange-50 border border-slate-200 rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="mb-3">
                                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 group-hover:bg-orange-200 transition-colors duration-300">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </span>
                                    </div>
                                    <h3 className="text-sm md:text-base font-semibold text-slate-700 group-hover:text-orange-600 mb-1">
                                        {category.name}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {category.items} itens
                                    </p>
                                </a>
                            </SwiperSlide>
                        ))}
                    </Swiper>


                ) : (
                    <div className="text-center py-8">
                        <p className="text-slate-500">Nenhuma categoria encontrada.</p>
                    </div>
                )}

                {/* <div className="swiper-button-prev !w-12 !h-12 !bg-white !rounded-full !shadow-lg after:!text-orange-600 after:!text-xl hover:!bg-orange-50 transition-colors"></div>
                <div className="swiper-button-next !w-12 !h-12 !bg-white !rounded-full !shadow-lg after:!text-orange-600 after:!text-xl hover:!bg-orange-50 transition-colors"></div>
                <div className="swiper-pagination !bottom-0 [&_.swiper-pagination-bullet-active]:!bg-orange-600 [&_.swiper-pagination-bullet]:!bg-orange-200"></div> */}

            </div>
        </section>
    );
};

export default CategorySection; 