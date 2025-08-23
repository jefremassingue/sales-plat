import isHotkey from 'is-hotkey';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createEditor, Descendant } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, Slate, withReact } from 'slate-react';

import { BlockButton } from './components/BlockButton';
import { AlignButton } from './components/AlignButton';
import { CharacterCount } from './components/CharacterCount';
import { Divider } from './components/Divider';
import { Element } from './components/Element';
import { FormatButton } from './components/FormatButton';
import { HistoryButton } from './components/HistoryButton';
import { Leaf } from './components/Leaf';
import { LinkButton } from './components/LinkButton';
import { Toolbar } from './components/Toolbar';
import { deserializeHtml, serializeToHtml } from './utils/serialization';
import { HOTKEYS, EMPTY_VALUE } from './constants';

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
    }, [value]);

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
        try {
            if (Array.isArray(newValue) && newValue.length > 0) {
                setEditorContent(newValue);
                const html = serializeToHtml(newValue);
                onChange(html);
            }
        } catch (error) {
            console.error('Erro ao atualizar conteúdo do editor:', error);
        }
    };

    // Renderiza o editor Slate
    try {
        const safeValue = Array.isArray(editorContent) && editorContent.length > 0 ? editorContent : EMPTY_VALUE;

        return (
            <div
                className={`overflow-hidden rounded-md border border-gray-300 bg-white shadow-md focus-within:ring-1 focus-within:ring-gray-400 dark:border-zinc-600 dark:bg-zinc-800 dark:focus-within:ring-zinc-400 ${className} `}
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
                        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 overflow-y-auto bg-white p-3 dark:scrollbar-thumb-zinc-600 dark:scrollbar-track-zinc-700 dark:bg-zinc-800"
                        style={{ height: height ? `${height - 60}px` : '340px' }}
                    >
                        <Editable
                            readOnly={disabled}
                            placeholder={placeholder}
                            onKeyDown={handleHotkeys}
                            renderElement={(props) => <Element {...props} />}
                            renderLeaf={(props) => <Leaf {...props} />}
                            className="min-h-full text-gray-900 outline-none dark:text-white"
                            spellCheck={false}
                        />
                    </div>

                    {!disabled && (
                        <div className="flex h-8 items-center justify-end border-t border-gray-300 bg-gray-100 px-2 dark:border-zinc-600 dark:bg-zinc-800">
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
                <div className="rounded-md border border-gray-300 bg-white p-4 dark:border-zinc-600 dark:bg-zinc-800">
                    <p className="mb-2 text-red-600 dark:text-red-300">Ocorreu um erro ao carregar o editor. A utilizar modo básico.</p>
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
                        className="w-full resize-none rounded border border-gray-300 bg-white p-2 text-gray-800 focus:ring-1 focus:ring-gray-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                        style={{ height: `${height}px` }}
                    />
                </div>
            );
        } catch (fallbackError) {
            console.error('Erro crítico no editor, nem o fallback funcionou:', fallbackError);
            return <div className="rounded bg-red-900 p-4 text-white dark:bg-red-800">Erro crítico no editor. Por favor, recarregue a página.</div>;
        }
    }
};

// Função para verificar se um formato de texto está ativo
const toggleFormat = (editor, format) => {
    // Importamos estas funções dos arquivos respectivos
    const { toggleFormatMark } = require('./utils/formatting');
    toggleFormatMark(editor, format);
};
