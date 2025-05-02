import React from 'react';

export const Leaf = ({ attributes, children, leaf }: any) => {
    try {
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
            children = <code className="rounded bg-gray-200 px-1 font-mono dark:bg-zinc-600">{children}</code>;
        }

        return <span {...attributes}>{children}</span>;
    } catch (error) {
        console.error('Erro ao renderizar folha:', error);
        return <span {...attributes}>{children}</span>;
    }
};
