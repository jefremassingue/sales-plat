import React from 'react';

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }>(
    ({ className, active, ...props }, ref) => (
        <button
            {...props}
            ref={ref}
            className={`flex h-8 w-8 items-center justify-center rounded transition-colors duration-200 ${
                active
                    ? 'bg-gray-300 text-gray-800 dark:bg-zinc-600 dark:text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-200 hover:text-gray-900 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600 dark:hover:text-white'
            } focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className || ''} `}
        />
    )
);

Button.displayName = 'Button';
