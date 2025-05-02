import { Editor, Element as SlateElement, Range, Transforms } from 'slate';

export const isLinkActive = (editor: Editor) => {
    try {
        const [match] = Editor.nodes(editor, {
            match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
        });
        return !!match;
    } catch (error) {
        console.error('Erro ao verificar se o link está ativo:', error);
        return false;
    }
};

export const unwrapLink = (editor: Editor) => {
    try {
        Transforms.unwrapNodes(editor, {
            match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
        });
    } catch (error) {
        console.error('Erro ao remover link:', error);
    }
};

export const wrapLink = (editor: Editor, url: string) => {
    try {
        if (isLinkActive(editor)) {
            unwrapLink(editor);
        }

        const { selection } = editor;
        const isCollapsed = selection && Range.isCollapsed(selection);

        const link = {
            type: 'link',
            url,
            children: [],
        };

        if (isCollapsed) {
            // Se a seleção estiver colapsada, apenas inserimos o link com URL como texto
            link.children = [{ text: url }];
            Transforms.insertNodes(editor, link);
        } else {
            // Se houver seleção, convertemos o texto selecionado em um link
            Transforms.wrapNodes(editor, link, { split: true });
        }
    } catch (error) {
        console.error('Erro ao adicionar link:', error);
    }
};
