import React from 'react';

const CategoryCardSkeleton: React.FC = () => (
    <div className="group block bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
        <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-3">
            <div className="w-full h-full bg-slate-200 rounded-md animate-pulse" />
        </div>
        <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse mx-auto mb-2" />
        <div className="h-3 w-1/3 bg-slate-200 rounded animate-pulse mx-auto" />
    </div>
);

export default CategoryCardSkeleton; 