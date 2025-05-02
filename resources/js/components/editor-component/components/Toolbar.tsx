import React from 'react';

interface ToolbarProps {
    children: React.ReactNode;
}

export const Toolbar: React.FC<ToolbarProps> = ({ children }) => {
    return (
        <div className="flex items-center gap-1 rounded-t border-b border-gray-300 bg-white p-2 dark:border-zinc-600 dark:bg-zinc-800">
            {children}
        </div>
    );
};
