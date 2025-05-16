import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { X, ShoppingBag, Trash, Plus, Minus, ArrowRight, CheckCircle } from 'lucide-react'; // Adicionado CheckCircle
import { Link } from '@inertiajs/react';

const ShoppingCart: React.FC = () => {
    const { items, removeItem, updateQuantity, total, itemCount, isOpen, setIsOpen, feedbackMessage, clearFeedbackMessage } = useCart();

    if (!isOpen) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN',
        }).format(value);
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50"
                onClick={() => setIsOpen(false)}
            />

            {/* Carrinho */}
            <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col h-full">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center">
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        Carrinho de Compras
                        {itemCount > 0 && (
                            <span className="ml-2 text-sm bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                                {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                            </span>
                        )}
                    </h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Feedback Message */}
                {feedbackMessage && (
                    <div className="p-3 bg-green-50 border-b border-green-200 text-green-700 flex items-center justify-between">
                        <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            <span className="text-sm">{feedbackMessage}</span>
                        </div>
                        <button onClick={clearFeedbackMessage} className="text-green-700 hover:text-green-900">
                            <X size={16} />
                        </button>
                    </div>
                )}

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Seu carrinho está vazio</h3>
                        <p className="text-gray-500 mb-6">Adicione produtos para começar suas compras</p>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                        >
                            Continuar Comprando
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto p-4">
                            <ul className="divide-y">
                                {items.map((item, index) => (
                                    <li key={`${item.id}-${item.color_id}-${item.size_id}-${index}`} className="py-4">
                                        <div className="flex items-start space-x-3">
                                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover object-center"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <h3 className="text-sm font-medium text-gray-900">
                                                        <Link href={`/products/${item.slug}`} className="hover:text-orange-600">
                                                            {item.name}
                                                        </Link>
                                                    </h3>
                                                    <button
                                                        onClick={() => removeItem(item.id, item.color_id, item.size_id)}
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                {(item.color_name || item.size_name) && (
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        {item.color_name && <span>Cor: {item.color_name}</span>}
                                                        {item.color_name && item.size_name && <span className="mx-1">/</span>}
                                                        {item.size_name && <span>Tamanho: {item.size_name}</span>}
                                                    </div>
                                                )}

                                                <div className="mt-2 flex justify-between items-center">
                                                    <div className="flex items-center border rounded-md">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.color_id, item.size_id)}
                                                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </button>
                                                        <span className="px-2 py-1 text-sm">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.color_id, item.size_id)}
                                                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="border-t p-4 space-y-4">
                            <div className="flex justify-between text-base font-medium text-gray-900">
                                <p>Subtotal</p>
                                <p>{formatCurrency(total)}</p>
                            </div>
                            <p className="text-sm text-gray-500">
                                Frete e impostos calculados no checkout
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-md border border-orange-600 px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50"
                                >
                                    Continuar Comprando
                                </button>
                                <Link
                                    href="/checkout"
                                    className="flex items-center justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700"
                                >
                                    Finalizar Compra
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ShoppingCart;
