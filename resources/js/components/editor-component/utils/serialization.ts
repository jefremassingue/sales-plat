import { Descendant, Element as SlateElement, Text } from 'slate';
import { EMPTY_VALUE } from '../constants';

// Função para converter HTML para formato Slate
export const deserializeHtml = (html: string | undefined): Descendant[] => {
    // Retorna parágrafo vazio se não houver valor
    if (!html) {
        return [{ type: 'paragraph', children: [{ text: '' }] }];
    }

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Função para converter nós do DOM para nós Slate
        const deserializeNode = (node: Node): any => {
            // Nó de texto
            if (node.nodeType === Node.TEXT_NODE) {
                return { text: node.textContent || '' };
            }

            // Elemento
            if (node.nodeType === Node.ELEMENT_NODE && node instanceof HTMLElement) {
                const element = node as HTMLElement;
                const tagName = element.tagName.toLowerCase();

                // Processar atributos e estilos
                let attributes: any = {};

                // Verificar alinhamento de texto
                const textAlign = element.style.textAlign;
                if (textAlign && ['left', 'center', 'right'].includes(textAlign)) {
                    attributes.align = textAlign;
                }

                // Converter filhos
                const children = Array.from(node.childNodes).map(deserializeNode).flat();

                // Processar cada tipo de tag
                switch (tagName) {
                    case 'p':
                        return { type: 'paragraph', ...attributes, children };
                    case 'h1':
                        return { type: 'heading-one', ...attributes, children };
                    case 'h2':
                        return { type: 'heading-two', ...attributes, children };
                    case 'blockquote':
                        return { type: 'block-quote', ...attributes, children };
                    case 'ul':
                        return { type: 'bulleted-list', ...attributes, children };
                    case 'ol':
                        return { type: 'numbered-list', ...attributes, children };
                    case 'li':
                        return { type: 'list-item', ...attributes, children };
                    case 'a':
                        return {
                            type: 'link',
                            url: element.getAttribute('href') || '',
                            ...attributes,
                            children,
                        };
                    case 'strong':
                    case 'b':
                        return children.map((child) => ({ ...child, bold: true }));
                    case 'em':
                    case 'i':
                        return children.map((child) => ({ ...child, italic: true }));
                    case 'u':
                        return children.map((child) => ({ ...child, underline: true }));
                    case 'code':
                        return children.map((child) => ({ ...child, code: true }));
                    case 'div':
                    case 'span':
                    case 'body':
                        return children;
                    default:
                        return children;
                }
            }

            return { text: '' };
        };

        const result = Array.from(doc.body.childNodes).map(deserializeNode).flat();
        return result.length > 0 ? result : EMPTY_VALUE;
    } catch (error) {
        console.error('Erro ao deserializar HTML:', error);
        return EMPTY_VALUE;
    }
};

// Função para converter formato Slate para HTML
export const serializeToHtml = (nodes: Descendant[]): string => {
    try {
        const serializeNode = (node: any): string => {
            // Verificar se é um nó de texto
            if (Text.isText(node)) {
                let text = node.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

                // Aplicar formatação
                if (node.bold) text = `<strong>${text}</strong>`;
                if (node.italic) text = `<em>${text}</em>`;
                if (node.underline) text = `<u>${text}</u>`;
                if (node.code) text = `<code>${text}</code>`;

                return text;
            }

            // É um elemento
            const children = node.children.map(serializeNode).join('');

            // Definir atributo de estilo para alinhamento, se existir
            const alignStyle = node.align ? ` style="text-align: ${node.align}"` : '';

            switch (node.type) {
                case 'paragraph':
                    return `<p${alignStyle}>${children}</p>`;
                case 'heading-one':
                    return `<h1${alignStyle}>${children}</h1>`;
                case 'heading-two':
                    return `<h2${alignStyle}>${children}</h2>`;
                case 'block-quote':
                    return `<blockquote${alignStyle}>${children}</blockquote>`;
                case 'bulleted-list':
                    return `<ul${alignStyle}>${children}</ul>`;
                case 'numbered-list':
                    return `<ol${alignStyle}>${children}</ol>`;
                case 'list-item':
                    return `<li${alignStyle}>${children}</li>`;
                case 'link':
                    return `<a href="${node.url}"${alignStyle}>${children}</a>`;
                default:
                    return children;
            }
        };

        return nodes.map(serializeNode).join('');
    } catch (error) {
        console.error('Erro ao serializar para HTML:', error);
        return '';
    }
};
