import { Descendant } from 'slate';

// Define tipos personalizados para o Slate
export type CustomElement = {
    type: string;
    children: CustomText[];
    align?: string;
    url?: string;
};

export type CustomText = {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    code?: boolean;
    link?: string;
};

// Teclas de atalho
export const HOTKEYS = {
    'mod+b': 'bold',
    'mod+i': 'italic',
    'mod+u': 'underline',
    'mod+`': 'code',
    'mod+z': 'undo',
    'mod+shift+z': 'redo',
};

// Valor padrão para o editor
export const EMPTY_VALUE: Descendant[] = [{ type: 'paragraph', children: [{ text: '' }] }];
