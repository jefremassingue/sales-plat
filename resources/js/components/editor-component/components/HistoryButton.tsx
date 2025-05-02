import React, { useCallback } from 'react';
import { useSlate } from 'slate-react';
import { Button } from './Button';

interface HistoryButtonProps {
    format: 'undo' | 'redo';
    icon: React.ReactNode;
    title: string;
}

export const HistoryButton: React.FC<HistoryButtonProps> = ({ format, icon, title }) => {
    const editor = useSlate();

    const handleClick = useCallback(() => {
        try {
            if (format === 'undo') {
                editor.undo();
            } else {
                editor.redo();
            }
        } catch (error) {
            console.error(`Erro ao ${format === 'undo' ? 'desfazer' : 'refazer'}:`, error);
        }
    }, [editor, format]);

    return (
        <Button
            onMouseDown={(event) => {
                event.preventDefault();
                handleClick();
            }}
            title={title}
            type="button"
            aria-label={title}
        >
            {icon}
        </Button>
    );
};
