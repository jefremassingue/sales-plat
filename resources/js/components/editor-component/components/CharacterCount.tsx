import React, { useMemo } from 'react';
import { Editor, Text } from 'slate';

interface CharacterCountProps {
    editor: Editor;
}

export const CharacterCount: React.FC<CharacterCountProps> = ({ editor }) => {
    // Contar caracteres
    const charCount = useMemo(() => {
        try {
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
        } catch (error) {
            console.error('Erro ao contar caracteres:', error);
            return 0;
        }
    }, [editor]);

    return (
        <div className="px-2 text-xs text-gray-600 dark:text-zinc-300">
            {charCount} {charCount === 1 ? 'caractere' : 'caracteres'}
        </div>
    );
};
