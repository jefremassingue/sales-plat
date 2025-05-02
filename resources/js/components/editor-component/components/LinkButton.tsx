import React, { useCallback, useState } from 'react';
import { Editor, Range, Transforms } from 'slate';
import { useSlate } from 'slate-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from './Button';
import { isLinkActive, unwrapLink, wrapLink } from '../utils/link';

interface LinkButtonProps {
    icon: React.ReactNode;
    title: string;
}

export const LinkButton: React.FC<LinkButtonProps> = ({ icon, title }) => {
    const editor = useSlate();
    const [isModalOpen, setModalOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [text, setText] = useState('');
    const [savedSelection, setSavedSelection] = useState<Range | null>(null);

    const isActive = isLinkActive(editor);

    const openModal = useCallback(() => {
        try {
            // Se já é um link, remova-o
            if (isActive) {
                unwrapLink(editor);
                return;
            }

            // Verificar se existe uma seleção válida
            if (editor.selection) {
                // Salvar a seleção atual antes de abrir o modal
                setSavedSelection({...editor.selection});

                // Pré-preencher texto com a seleção atual
                const selectedText = Editor.string(editor, editor.selection);
                setText(selectedText);
            } else {
                // Se não houver seleção, criar um ponto de inserção
                setSavedSelection(null);
                setText('');
            }

            // Abrir modal
            setModalOpen(true);
        } catch (error) {
            console.error('Erro ao abrir modal de link:', error);
        }
    }, [editor, isActive]);

    const handleInsertLink = useCallback(() => {
        try {
            if (!url) return;

            // Restaurar a seleção original antes de inserir o link
            if (savedSelection) {
                Transforms.select(editor, savedSelection);
            }

            // Verifica se a seleção atual está vazia ou se o texto foi alterado
            const currentText = editor.selection ? Editor.string(editor, editor.selection) : '';

            if (!editor.selection || Range.isCollapsed(editor.selection) || currentText !== text) {
                // Inserir novo nó com o texto definido pelo utilizador
                if (text) {
                    // Se a seleção estiver colapsada, inserir o novo texto como link
                    Transforms.insertNodes(editor, {
                        type: 'link',
                        url,
                        children: [{ text }],
                    });
                } else {
                    // Se não houver texto definido, usar a URL como texto
                    Transforms.insertNodes(editor, {
                        type: 'link',
                        url,
                        children: [{ text: url }],
                    });
                }
            } else {
                // Converter o texto selecionado em link
                wrapLink(editor, url);
            }

            // Mover o cursor para após o link inserido
            Transforms.move(editor, { distance: 1, unit: 'offset' });

            // Fechar o modal e limpar campos
            setModalOpen(false);
            setUrl('');
            setText('');
        } catch (error) {
            console.error('Erro ao inserir link:', error);
            setModalOpen(false);
        }
    }, [editor, url, text, savedSelection]);

    return (
        <>
            <Button
                active={isActive}
                onMouseDown={(event) => {
                    event.preventDefault();
                    openModal();
                }}
                title={title}
                type="button"
                aria-label={title}
            >
                {icon}
            </Button>

            <Dialog open={isModalOpen} onOpenChange={(open) => {
                if (!open) {
                    setUrl('');
                    setText('');
                }
                setModalOpen(open);
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Inserir Link</DialogTitle>
                        <DialogDescription>
                            Adicione um URL e texto para criar um link no documento.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="link-url" className="text-right">
                                URL
                            </Label>
                            <Input
                                id="link-url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://exemplo.com"
                                className="col-span-3"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleInsertLink();
                                    }
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="link-text" className="text-right">
                                Texto
                            </Label>
                            <Input
                                id="link-text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Texto a exibir"
                                className="col-span-3"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleInsertLink();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-end">
                        <ShadcnButton
                            type="button"
                            variant="secondary"
                            onClick={() => setModalOpen(false)}
                        >
                            Cancelar
                        </ShadcnButton>
                        <ShadcnButton
                            type="button"
                            disabled={!url}
                            onClick={handleInsertLink}
                        >
                            Inserir
                        </ShadcnButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
