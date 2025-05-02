import React from 'react';
import { useSlate } from 'slate-react';
import { Button } from './Button';
import { isFormatActive, toggleFormatMark } from '../utils/formatting';

interface FormatButtonProps {
    format: string;
    icon: React.ReactNode;
    title: string;
}

export const FormatButton: React.FC<FormatButtonProps> = ({ format, icon, title }) => {
    const editor = useSlate();

    return (
        <Button
            active={isFormatActive(editor, format)}
            onMouseDown={(event) => {
                event.preventDefault();
                toggleFormatMark(editor, format);
            }}
            title={title}
            type="button"
            aria-label={title}
        >
            {icon}
        </Button>
    );
};
