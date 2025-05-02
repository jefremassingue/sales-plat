import React from 'react';

export const Element = ({ attributes, children, element }: any) => {
    const style = { textAlign: element.align };

    try {
        switch (element.type) {
            case 'block-quote':
                return (
                    <blockquote {...attributes} className="my-2 border-l-4 border-gray-400 py-1 pl-4 text-gray-700 italic dark:border-zinc-400 dark:text-white" style={style}>
                        {children}
                    </blockquote>
                );
            case 'bulleted-list':
                return (
                    <ul {...attributes} className="my-2 list-disc pl-10 text-gray-800 dark:text-white" style={style}>
                        {children}
                    </ul>
                );
            case 'heading-one':
                return (
                    <h1 {...attributes} className="my-4 text-3xl font-bold text-gray-900 dark:text-white" style={style}>
                        {children}
                    </h1>
                );
            case 'heading-two':
                return (
                    <h2 {...attributes} className="my-3 text-2xl font-bold text-gray-900 dark:text-white" style={style}>
                        {children}
                    </h2>
                );
            case 'list-item':
                return (
                    <li {...attributes} className="my-1 text-gray-800 dark:text-white" style={style}>
                        {children}
                    </li>
                );
            case 'numbered-list':
                return (
                    <ol {...attributes} className="my-2 list-decimal pl-10 text-gray-800 dark:text-white" style={style}>
                        {children}
                    </ol>
                );
            case 'link':
                return (
                    <a {...attributes} href={element.url} className="text-blue-600 underline hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200" style={style}>
                        {children}
                    </a>
                );
            default:
                return (
                    <p {...attributes} className="my-2 text-gray-800 dark:text-white" style={style}>
                        {children}
                    </p>
                );
        }
    } catch (error) {
        console.error('Erro ao renderizar elemento:', error);
        return (
            <p {...attributes} className="my-2 text-gray-800 dark:text-white">
                {children}
            </p>
        );
    }
};
