import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

interface SearchContextType {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    performSearch: (term?: string) => void;
    clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch deve ser usado dentro de um SearchProvider');
    }
    return context;
};

interface SearchProviderProps {
    children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Carregar termo de busca do localStorage ao iniciar
    useEffect(() => {
        const savedSearch = localStorage.getItem('searchTerm');
        if (savedSearch) {
            setSearchTerm(savedSearch);
        }
    }, []);

    // Salvar termo de busca no localStorage quando mudar
    useEffect(() => {
        localStorage.setItem('searchTerm', searchTerm);
    }, [searchTerm]);

    // Função para executar busca
    const performSearch = (term?: string) => {
        const searchValue = term !== undefined ? term : searchTerm;
        if (searchValue.trim()) {
            router.get('/products', { q: searchValue.trim() }, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    // Função para limpar busca
    const clearSearch = () => {
        setSearchTerm('');
        localStorage.removeItem('searchTerm');
    };

    const value = {
        searchTerm,
        setSearchTerm,
        performSearch,
        clearSearch,
    };

    return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};
