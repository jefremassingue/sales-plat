import React from 'react';

const ProductCardSkeleton: React.FC = () => {
    return (
        <article className="group relative rounded-lg border border-zinc-100 bg-white">
            <div className="flex h-full flex-col justify-between">
                <div className="block">
                    <div className="relative aspect-square overflow-hidden rounded-t-lg p-2">
                        <div className="aspect-square h-full w-full rounded-xl bg-gray-200 animate-pulse"></div>
                    </div>
                </div>

                <div className="flex h-full flex-1 flex-col justify-between gap-2 p-4">
                    <div className="h-full flex-1">
                        <div className="mb-1 h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                        <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </div>
                    <div className="flex flex-col justify-between gap-2">
                        <div className="flex gap-1 overflow-hidden">
                            <div className="aspect-square h-10 w-10 rounded-xl bg-gray-200 animate-pulse"></div>
                            <div className="aspect-square h-10 w-10 rounded-xl bg-gray-200 animate-pulse"></div>
                            <div className="aspect-square h-10 w-10 rounded-xl bg-gray-200 animate-pulse"></div>
                        </div>
                        <div className="h-10 bg-orange-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default ProductCardSkeleton; 