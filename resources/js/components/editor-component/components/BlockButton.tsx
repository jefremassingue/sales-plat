import React from 'react';
import { useSlate } from 'slate-react';
import { Button } from './Button';
import { isBlockActive, toggleBlock } from '../utils/formatting';

interface BlockButtonProps {
    format: string;
    icon: React.ReactNode;
    title: string;
}

export const BlockButton: React.FC<BlockButtonProps> = ({ format, icon, title }) => {
    const editor = useSlate();

    return (
        <Button
            active={isBlockActive(editor, format)}
            onMouseDown={(event) => {
                event.preventDefault();
                toggleBlock(editor, format);
            }}
            title={title}
            type="button"
            aria-label={title}
        >
            {icon}
        </Button>
    );
};
