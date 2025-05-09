import React from 'react';

const ProductCardSkeleton: React.FC = () => (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
        <div className="relative p-2">
            <div className="w-full aspect-square bg-slate-200 rounded-xl animate-pulse" />
        </div>
        <div className="p-4 flex flex-col flex-grow">
            <div className="h-3 w-20 bg-slate-200 rounded animate-pulse mb-1" />
            <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-3 w-1/2 bg-slate-200 rounded animate-pulse mb-1" />
            <div className="flex items-baseline gap-2 mb-3 mt-auto">
                <div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-4">
                <div className="w-full h-10 bg-slate-200 rounded-lg animate-pulse" />
                <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
            </div>
        </div>
    </div>
);

export default ProductCardSkeleton; 