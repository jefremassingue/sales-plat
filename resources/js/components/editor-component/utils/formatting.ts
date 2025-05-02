import { Editor, Element as SlateElement, Text, Transforms } from 'slate';

// Função para verificar se um formato de texto está ativo
export const isFormatActive = (editor: Editor, format: string) => {
    try {
        const [match] = Editor.nodes(editor, {
            match: (n) => Text.isText(n) && n[format as keyof typeof n] === true,
            universal: true,
        });
        return !!match;
    } catch (error) {
        console.error('Erro ao verificar formato ativo:', error);
        return false;
    }
};

// Função para alternar formatos de texto
export const toggleFormatMark = (editor: Editor, format: string) => {
    try {
        const isActive = isFormatActive(editor, format);
        Transforms.setNodes(editor, { [format]: isActive ? null : true }, { match: (n) => Text.isText(n), split: true });
    } catch (error) {
        console.error('Erro ao alternar formato:', error);
    }
};

// Função para verificar se um formato de bloco está ativo
export const isBlockActive = (editor: Editor, format: string) => {
    try {
        const [match] = Editor.nodes(editor, {
            match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
        });
        return !!match;
    } catch (error) {
        console.error('Erro ao verificar se bloco está ativo:', error);
        return false;
    }
};

// Função para alternar formatos de bloco
export const toggleBlock = (editor: Editor, format: string) => {
    try {
        const isActive = isBlockActive(editor, format);
        const isList = format === 'numbered-list' || format === 'bulleted-list';

        Transforms.unwrapNodes(editor, {
            match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && ['numbered-list', 'bulleted-list'].includes(n.type),
            split: true,
        });

        const newProperties: Partial<any> = {
            type: isActive ? 'paragraph' : isList ? 'list-item' : format,
        };

        Transforms.setNodes(editor, newProperties);

        if (!isActive && isList) {
            const block = { type: format, children: [] };
            Transforms.wrapNodes(editor, block);
        }
    } catch (error) {
        console.error('Erro ao alternar bloco:', error);
    }
};

// Verificar alinhamento ativo
export const isAlignActive = (editor: Editor, value: string) => {
    try {
        const [match] = Editor.nodes(editor, {
            match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.align === value,
        });
        return !!match;
    } catch (error) {
        console.error('Erro ao verificar alinhamento ativo:', error);
        return false;
    }
};

// Alternar alinhamento
export const toggleAlign = (editor: Editor, value: string) => {
    try {
        const isActive = isAlignActive(editor, value);
        Transforms.setNodes(editor, { align: isActive ? undefined : value }, { match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) });
    } catch (error) {
        console.error('Erro ao alternar alinhamento:', error);
    }
};
