import React from 'react';
import { useSlate } from 'slate-react';
import { Button } from './Button';
import { isAlignActive, toggleAlign } from '../utils/formatting';

interface AlignButtonProps {
    format: string;
    icon: React.ReactNode;
    title: string;
}

export const AlignButton: React.FC<AlignButtonProps> = ({ format, icon, title }) => {
    const editor = useSlate();

    return (
        <Button
            active={isAlignActive(editor, format)}
            onMouseDown={(event) => {
                event.preventDefault();
                toggleAlign(editor, format);
            }}
            title={title}
            type="button"
            aria-label={title}
        >
            {icon}
        </Button>
    );
};
