import isHotkey from 'is-hotkey';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Heading1,
    Heading2,
    Italic,
    Link,
    List,
    ListOrdered,
    Quote,
    Redo,
    Underline,
    Undo,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BaseEditor, createEditor, Descendant, Editor, Element as SlateElement, Text, Transforms } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { Editable, ReactEditor, Slate, useSlate, withReact } from 'slate-react';

// Define tipos personalizados para o Slate
type CustomElement = {
    type: string;
    children: CustomText[];
    align?: string;
    url?: string;
};

type CustomText = {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    code?: boolean;
    link?: string;
};

declare module 'slate' {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor & HistoryEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}

// Teclas de atalho
const HOTKEYS = {
    'mod+b': 'bold',
    'mod+i': 'italic',
    'mod+u': 'underline',
    'mod+`': 'code',
    'mod+z': 'undo',
    'mod+shift+z': 'redo',
};

interface EditorComponentProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    height?: number;
    disabled?: boolean;
    className?: string;
}

// Componentes de Botão da Barra de Ferramentas
const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, active, ...props }, ref) => (
    <button
        {...props}
        ref={ref}
        className={`flex h-8 w-8 items-center justify-center rounded transition-colors duration-200 ${
            active ? 'bg-zinc-700 text-zinc-100' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100'
        } focus:ring-1 focus:ring-zinc-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className || ''} `}
    />
));

const Divider = () => <div className="mx-1 h-5 w-px bg-zinc-700" />;

const Toolbar = ({ children }: { children: React.ReactNode }) => {
    return <div className="flex items-center gap-1 rounded-t border-b border-zinc-700 bg-zinc-800 p-2">{children}</div>;
};

// Componente de formatação
const FormatButton = ({ format, icon, title }: { format: string; icon: React.ReactNode; title: string }) => {
    const editor = useSlate();
    return (
        <Button
            active={isFormatActive(editor, format)}
            onMouseDown={(event) => {
                event.preventDefault();
                toggleFormat(editor, format);
            }}
            title={title}
            type="button"
            aria-label={title}
        >
            {icon}
        </Button>
    );
};

// Componente de bloco
const BlockButton = ({ format, icon, title }: { format: string; icon: React.ReactNode; title: string }) => {
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

// Botão de alinhamento
const AlignButton = ({ format, icon, title }: { format: string; icon: React.ReactNode; title: string }) => {
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

// Link button
const LinkButton = ({ icon, title }: { icon: React.ReactNode; title: string }) => {
    const editor = useSlate();

    const insertLink = useCallback(() => {
        const isActive = isLinkActive(editor);

        if (isActive) {
            unwrapLink(editor);
            return;
        }

        const url = window.prompt('Digite a URL do link:');
        if (!url) return;

        if (editor.selection) {
            const isEmptySelection = Editor.string(editor, editor.selection) === '';

            if (isEmptySelection) {
                // Se não houver texto selecionado, insira o URL como texto
                const linkText = window.prompt('Digite o texto do link:', url) || url;
                Transforms.insertNodes(editor, {
                    type: 'link',
                    url,
                    children: [{ text: linkText }],
                });
            } else {
                // Caso contrário, converta o texto selecionado em um link
                wrapLink(editor, url);
            }
        }
    }, [editor]);

    const isActive = isLinkActive(editor);

    return (
        <Button
            active={isActive}
            onMouseDown={(event) => {
                event.preventDefault();
                insertLink();
            }}
            title={title}
            type="button"
            aria-label={title}
        >
            {icon}
        </Button>
    );
};

// Link utilities
const isLinkActive = (editor: Editor) => {
    const [match] = Editor.nodes(editor, {
        match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
    });
    return !!match;
};

const unwrapLink = (editor: Editor) => {
    Transforms.unwrapNodes(editor, {
        match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
    });
};

const wrapLink = (editor: Editor, url: string) => {
    if (isLinkActive(editor)) {
        unwrapLink(editor);
    }

    const { selection } = editor;
    const isCollapsed = selection && window.getSelection()?.isCollapsed;

    const link = {
        type: 'link',
        url,
        children: isCollapsed ? [{ text: url }] : [],
    };

    if (isCollapsed) {
        Transforms.insertNodes(editor, link);
    } else {
        Transforms.wrapNodes(editor, link, { split: true });
        Transforms.collapse(editor, { edge: 'end' });
    }
};

// History buttons
const HistoryButton = ({ format, icon, title }: { format: 'undo' | 'redo'; icon: React.ReactNode; title: string }) => {
    const editor = useSlate();

    const handleClick = useCallback(() => {
        if (format === 'undo') {
            editor.undo();
        } else {
            editor.redo();
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

// Função para verificar se um formato de texto está ativo
const isFormatActive = (editor: Editor, format: string) => {
    const [match] = Editor.nodes(editor, {
        match: (n) => Text.isText(n) && n[format as keyof typeof n] === true,
        universal: true,
    });
    return !!match;
};

// Função para alternar formatos de texto
const toggleFormat = (editor: Editor, format: string) => {
    const isActive = isFormatActive(editor, format);
    Transforms.setNodes(editor, { [format]: isActive ? null : true }, { match: (n) => Text.isText(n), split: true });
};

// Função para verificar se um formato de bloco está ativo
const isBlockActive = (editor: Editor, format: string) => {
    const [match] = Editor.nodes(editor, {
        match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    });
    return !!match;
};

// Verificar alinhamento ativo
const isAlignActive = (editor: Editor, value: string) => {
    const [match] = Editor.nodes(editor, {
        match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.align === value,
    });

    return !!match;
};

// Alternar alinhamento
const toggleAlign = (editor: Editor, value: string) => {
    const isActive = isAlignActive(editor, value);

    Transforms.setNodes(editor, { align: isActive ? undefined : value }, { match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) });
};

// Função para alternar formatos de bloco
const toggleBlock = (editor: Editor, format: string) => {
    const isActive = isBlockActive(editor, format);
    const isList = format === 'numbered-list' || format === 'bulleted-list';

    Transforms.unwrapNodes(editor, {
        match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && ['numbered-list', 'bulleted-list'].includes(n.type),
        split: true,
    });

    const newProperties: Partial<CustomElement> = {
        type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    };

    Transforms.setNodes(editor, newProperties);

    if (!isActive && isList) {
        const block = { type: format, children: [] };
        Transforms.wrapNodes(editor, block);
    }
};

// Elemento personalizado do Slate
const Element = ({ attributes, children, element }: any) => {
    const style = { textAlign: element.align };

    switch (element.type) {
        case 'block-quote':
            return (
                <blockquote {...attributes} className="my-2 border-l-4 border-zinc-500 py-1 pl-4 text-zinc-300 italic" style={style}>
                    {children}
                </blockquote>
            );
        case 'bulleted-list':
            return (
                <ul {...attributes} className="my-2 list-disc pl-10 text-zinc-200" style={style}>
                    {children}
                </ul>
            );
        case 'heading-one':
            return (
                <h1 {...attributes} className="my-4 text-3xl font-bold text-zinc-100" style={style}>
                    {children}
                </h1>
            );
        case 'heading-two':
            return (
                <h2 {...attributes} className="my-3 text-2xl font-bold text-zinc-100" style={style}>
                    {children}
                </h2>
            );
        case 'list-item':
            return (
                <li {...attributes} className="my-1 text-zinc-200" style={style}>
                    {children}
                </li>
            );
        case 'numbered-list':
            return (
                <ol {...attributes} className="my-2 list-decimal pl-10 text-zinc-200" style={style}>
                    {children}
                </ol>
            );
        case 'link':
            return (
                <a {...attributes} href={element.url} className="text-blue-400 underline hover:text-blue-300" style={style}>
                    {children}
                </a>
            );
        default:
            return (
                <p {...attributes} className="my-2 text-zinc-200" style={style}>
                    {children}
                </p>
            );
    }
};

// Folha personalizada do Slate para formatos de texto
const Leaf = ({ attributes, children, leaf }: any) => {
    if (leaf.bold) {
        children = <strong className="font-bold">{children}</strong>;
    }

    if (leaf.italic) {
        children = <em className="italic">{children}</em>;
    }

    if (leaf.underline) {
        children = <u className="underline">{children}</u>;
    }

    if (leaf.code) {
        children = <code className="rounded bg-zinc-700 px-1 font-mono">{children}</code>;
    }

    return <span {...attributes}>{children}</span>;
};

// Função para converter HTML para formato Slate
const deserializeHtml = (html: string | undefined): Descendant[] => {
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
        return result.length > 0 ? result : [{ type: 'paragraph', children: [{ text: '' }] }];
    } catch (error) {
        console.error('Erro ao deserializar HTML:', error);
        return [{ type: 'paragraph', children: [{ text: '' }] }];
    }
};

// Função para converter formato Slate para HTML
const serializeToHtml = (nodes: Descendant[]): string => {
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

// Valor padrão para o editor
const EMPTY_VALUE: Descendant[] = [{ type: 'paragraph', children: [{ text: '' }] }];

// Contador de caracteres
const CharacterCount = ({ editor }: { editor: Editor }) => {
    // Contar caracteres
    const charCount = useMemo(() => {
        let count = 0;
        const nodes = Editor.nodes(editor, {
            at: [],
            match: (n) => Text.isText(n),
        });

        for (const [node] of nodes) {
            if (Text.isText(node)) {
                count += node.text.length;
            }
        }

        return count;
    }, [editor]);

    return (
        <div className="px-2 text-xs text-zinc-500">
            {charCount} {charCount === 1 ? 'caractere' : 'caracteres'}
        </div>
    );
};

export const EditorComponent: React.FC<EditorComponentProps> = ({
    value,
    onChange,
    placeholder = 'Comece a escrever...',
    height = 400,
    disabled = false,
    className = '',
}) => {

    // Cria um editor Slate com plugins React e histórico
    const editor = useMemo(() => withHistory(withReact(createEditor())), []);

    // Adiciona um handler personalizado para links
    const { isInline } = editor;
    editor.isInline = (element) => {
        return element.type === 'link' ? true : isInline(element);
    };

    // Converte o HTML para formato Slate quando value mudar
    const initialValue = useMemo(() => {
        try {
            const result = deserializeHtml(value);
            return Array.isArray(result) && result.length > 0 ? result : EMPTY_VALUE;
        } catch (error) {
            console.error('Erro ao processar valor inicial:', error);
            return EMPTY_VALUE;
        }
    }, [value]); // Adiciona value como dependência para reagir às alterações

    // Estado para o conteúdo do editor
    const [editorContent, setEditorContent] = useState<Descendant[]>(initialValue);

    // Atualiza o conteúdo do editor quando initialValue mudar (que muda quando value muda)
    useEffect(() => {
        setEditorContent(initialValue);
    }, [initialValue]);

    // Manipulador de teclas de atalho
    const handleHotkeys = useCallback(
        (event: React.KeyboardEvent) => {
            for (const hotkey in HOTKEYS) {
                if (isHotkey(hotkey, event as any)) {
                    event.preventDefault();
                    const format = HOTKEYS[hotkey as keyof typeof HOTKEYS];

                    if (format === 'undo') {
                        editor.undo();
                        return;
                    }

                    if (format === 'redo') {
                        editor.redo();
                        return;
                    }

                    toggleFormat(editor, format);
                }
            }
        },
        [editor],
    );

    // Manipula alterações no editor
    const handleChange = (newValue: Descendant[]) => {
        if (Array.isArray(newValue) && newValue.length > 0) {
            setEditorContent(newValue);
            const html = serializeToHtml(newValue);
            onChange(html);
        }
    };

    // Renderiza o editor Slate
    try {
        const safeValue = Array.isArray(editorContent) && editorContent.length > 0 ? editorContent : EMPTY_VALUE;

        return (
            <div
                className={`overflow-hidden rounded-md border border-zinc-700 bg-zinc-900 shadow-md focus-within:ring-1 focus-within:ring-zinc-500 ${className} `}
            >
                <Slate editor={editor} onValueChange={handleChange} initialValue={safeValue} onChange={handleChange}>
                    {!disabled && (
                        <Toolbar>
                            <HistoryButton format="undo" icon={<Undo size={16} />} title="Desfazer" />
                            <HistoryButton format="redo" icon={<Redo size={16} />} title="Refazer" />

                            <Divider />

                            <BlockButton format="heading-one" icon={<Heading1 size={16} />} title="Título 1" />
                            <BlockButton format="heading-two" icon={<Heading2 size={16} />} title="Título 2" />

                            <Divider />

                            <FormatButton format="bold" icon={<Bold size={16} />} title="Negrito" />
                            <FormatButton format="italic" icon={<Italic size={16} />} title="Itálico" />
                            <FormatButton format="underline" icon={<Underline size={16} />} title="Sublinhado" />

                            <Divider />

                            <BlockButton format="bulleted-list" icon={<List size={16} />} title="Lista com Marcadores" />
                            <BlockButton format="numbered-list" icon={<ListOrdered size={16} />} title="Lista Numerada" />
                            <BlockButton format="block-quote" icon={<Quote size={16} />} title="Citação" />

                            <Divider />

                            <AlignButton format="left" icon={<AlignLeft size={16} />} title="Alinhar à Esquerda" />
                            <AlignButton format="center" icon={<AlignCenter size={16} />} title="Centralizar" />
                            <AlignButton format="right" icon={<AlignRight size={16} />} title="Alinhar à Direita" />

                            <Divider />

                            <LinkButton icon={<Link size={16} />} title="Inserir Link" />
                        </Toolbar>
                    )}

                    <div
                        className="scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800 overflow-y-auto bg-zinc-900 p-3"
                        style={{ height: height ? `${height - 60}px` : '340px' }}
                    >
                        <Editable
                            readOnly={disabled}
                            placeholder={placeholder}
                            onKeyDown={handleHotkeys}
                            renderElement={(props) => <Element {...props} />}
                            renderLeaf={(props) => <Leaf {...props} />}
                            className="min-h-full text-zinc-100 outline-none"
                            spellCheck={false}
                        />
                    </div>

                    {!disabled && (
                        <div className="flex h-8 items-center justify-end border-t border-zinc-700 bg-zinc-800 px-2">
                            <CharacterCount editor={editor} />
                        </div>
                    )}
                </Slate>
            </div>
        );
    } catch (error) {
        console.error('Erro ao renderizar o editor:', error);

        // Modo de contingência: usar textarea simples quando o editor falha
        try {
            return (
                <div className="rounded-md border border-zinc-700 bg-zinc-900 p-4">
                    <p className="mb-2 text-red-400">Ocorreu um erro ao carregar o editor. A utilizar modo básico.</p>
                    <textarea
                        value={typeof value === 'string' ? value : ''}
                        onChange={(e) => {
                            try {
                                onChange(e.target.value);
                            } catch (err) {
                                console.error('Erro ao atualizar valor do textarea:', err);
                            }
                        }}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="w-full resize-none rounded border border-zinc-700 bg-zinc-800 p-2 text-zinc-200 focus:ring-1 focus:ring-zinc-500 focus:outline-none"
                        style={{ height: `${height}px` }}
                    />
                </div>
            );
        } catch (fallbackError) {
            console.error('Erro crítico no editor, nem o fallback funcionou:', fallbackError);
            return <div className="rounded bg-red-900 p-4 text-white">Erro crítico no editor. Por favor, recarregue a página.</div>;
        }
    }
};
