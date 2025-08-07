import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Interfaces
export interface CartItem {
    id: string;
    name: string;
    quantity: number;
    image?: string;
    slug: string;
    color_id?: number | null;
    color_name?: string | null;
    size_id?: number | null;
    size_name?: string | null;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (itemId: number, colorId?: number | null, sizeId?: number | null) => void;
    updateQuantity: (itemId: number, quantity: number, colorId?: number | null, sizeId?: number | null) => void;
    clearCart: () => void;
    itemCount: number;
    total: number;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    feedbackMessage: string | null; // Nova     propriedade para feedback
    clearFeedbackMessage: () => void; // Nova função para limpar feedback
}   

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart deve ser usado dentro de um CartProvider');
    }
    return context;
};

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null); // Estado para feedback

    // Carregar carrinho do localStorage ao iniciar
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Erro ao carregar carrinho:', error);
                localStorage.removeItem('cart');
            }
        }
    }, []);

    // Salvar carrinho no localStorage quando mudar
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    // Função para limpar a mensagem de feedback
    const clearFeedbackMessage = () => {
        setFeedbackMessage(null);
    };

    // Função para adicionar item ao carrinho
    const addItem = (item: CartItem) => {
        setItems(currentItems => {
            // Verificar se o item já existe no carrinho (considerando variantes)
            const existingItemIndex = currentItems.findIndex(
                i => i.id === item.id &&
                    i.color_id === item.color_id &&
                    i.size_id === item.size_id
            );

            if (existingItemIndex >= 0) {
                // Se existir, atualizar a quantidade
                const updatedItems = [...currentItems];
                updatedItems[existingItemIndex].quantity += item.quantity;
                return updatedItems;
            } else {
                // Se não existir, adicionar novo item
                return [...currentItems, item];
            }
        });

        // Feedback ao adicionar
        setFeedbackMessage(`${item.name} foi adicionado ao carrinho.`);
        setTimeout(() => {
            clearFeedbackMessage();
        }, 3000); // Limpar mensagem após 3 segundos

        // Abrir o carrinho ao adicionar um item
        setIsOpen(true);
    };

    // Função para remover item do carrinho
    const removeItem = (itemId: number, colorId?: number | null, sizeId?: number | null) => {
        setItems(currentItems =>
            currentItems.filter(item =>
                !(item.id === itemId &&
                    item.color_id === colorId &&
                    item.size_id === sizeId)
            )
        );
    };

    // Função para atualizar quantidade de um item
    const updateQuantity = (itemId: number, quantity: number, colorId?: number | null, sizeId?: number | null) => {
        if (quantity <= 0) {
            removeItem(itemId, colorId, sizeId);
            return;
        }

        setItems(currentItems =>
            currentItems.map(item =>
                item.id === itemId &&
                    item.color_id === colorId &&
                    item.size_id === sizeId
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    // Função para limpar o carrinho
    const clearCart = () => {
        setItems([]);
    };

    // Calcular total de itens
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    // Calcular valor total

    const value = {
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        isOpen,
        setIsOpen,
        feedbackMessage, // Adicionado ao valor do contexto
        clearFeedbackMessage // Adicionado ao valor do contexto
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
