import React, { useEffect, useState } from 'react';
import Editor from 'react-simple-wysiwyg';

interface EditorComponentProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    height?: number;
    disabled?: boolean;
    className?: string;
}

export const EditorComponent: React.FC<EditorComponentProps> = ({
    value,
    onChange,
    placeholder = 'Comece a escrever...',
    height = 400,
    disabled = false,
    className = '',
}) => {
    const [html, setHtml] = useState(value || '');

    // Sincroniza o estado interno com o prop value quando ele muda
    useEffect(() => {
        setHtml(value || '');
    }, [value]);

    const handleChange = (e: { target: { value: string } }) => {
        const newValue = e.target.value;
        setHtml(newValue);
        onChange(newValue);
    };

    return (
        <div
            className={`overflow-hidden rounded-md border border-gray-300 bg-white shadow-md focus-within:ring-1 focus-within:ring-gray-400 dark:border-zinc-600 dark:bg-zinc-800 dark:focus-within:ring-zinc-400 ${className}`}
            style={{ height: `${height}px` }}
        >
            <Editor
                value={html}
                onChange={handleChange}
                placeholder={placeholder}
                containerProps={{
                    style: {
                        height: '100%',
                        border: 'none',
                        borderRadius: '0.375rem',
                    },
                    className: disabled ? 'pointer-events-none opacity-60' : '',
                }}
                style={{
                    height: '100%',
                }}
            />
        </div>
    );
};


