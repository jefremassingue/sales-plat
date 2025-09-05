import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag, Trash, Plus, Minus, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Cart() {
    // Remova o uso do hook useCart aqui no nível superior

    const CartContent = () => {
        // Use o hook useCart dentro deste componente filho que será renderizado dentro do SiteLayout
    const { items, removeItem, updateQuantity, clearCart, itemCount } = useCart();

    // const formatCurrency = (value: number) => new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);

        if (itemCount === 0) {
            return (
                <div className="container mx-auto px-4 py-16 text-center">
                    <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Seu carrinho está vazio</h1>
                    <p className="text-gray-600 mb-8">Adicione produtos ao carrinho para continuar comprando</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" /> Voltar para a Loja
                    </Link>
                </div>
            );
        }

        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Seu Carrinho</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Produto
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantidade
                                        </th>
                                        
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Ações</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {items.map((item, index) => (
                                        <tr key={`${item.id}-${item.color_id}-${item.size_id}-${index}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
                                                        {item.image ? (
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="h-full w-full object-cover object-center"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                                                <ShoppingBag className="h-6 w-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-900">
                                                            <Link href={`/products/${item.slug}`} className="hover:text-orange-600">
                                                                {item.name}
                                                            </Link>
                                                        </h3>
                                                        {item.variant_sku && (
                                                            <div className="text-xs text-gray-500 mt-1">SKU: {item.variant_sku}</div>
                                                        )}
                                                        {(item.color_name || item.size_name) && (
                                                            <div className="mt-1 text-xs text-gray-500">
                                                                {item.color_name && <span>Cor: {item.color_name}</span>}
                                                                {item.color_name && item.size_name && <span className="mx-1">/</span>}
                                                                {item.size_name && <span>Tamanho: {item.size_name}</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center border border-gray-300 rounded-md w-32">
                                                    <button
                                                        type="button"
                                                        className="p-2 text-gray-500 hover:text-gray-700"
                                                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.color_id, item.size_id)}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <input
                                                        type="text"
                                                        className="w-full text-center border-0 focus:ring-0 text-sm"
                                                        value={item.quantity}
                                                        readOnly
                                                    />
                                                    <button
                                                        type="button"
                                                        className="p-2 text-gray-500 hover:text-gray-700"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.color_id, item.size_id)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    type="button"
                                                    className="text-red-600 hover:text-red-800"
                                                    onClick={() => removeItem(item.id, item.color_id, item.size_id)}
                                                >
                                                    <Trash className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h2>

                            <div className="space-y-4">
                                
                                {/* <div className="flex justify-between">
                                    <span className="text-gray-600">Entrega</span>
                                    <span className="font-medium">A calcular</span>
                                </div> */}
                                <div className="border-t pt-4 flex justify-between">
                                    <span className="text-lg font-semibold">Total</span>
                                    <span className="text-lg font-semibold">{items.map(({quantity}) => quantity).reduce((a,b) => a + b, 0)} Itens</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link
                                    href="/quotation"
                                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                                >
                                    Solicitar cotação <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <Link
                                    href="/products"
                                    className="w-full flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mt-3"
                                >
                                    <ArrowLeft className="mr-2 h-5 w-5" /> Continuar Adicionando
                                </Link>
                                <Button  onClick={() => clearCart()} className="w-full flex justify-center items-center px-6 py-6 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:border-red-600 hover:text-red-600 hover:bg-red-50 mt-3">
                                                    <Trash className="h-5 w-5" />
                                    Limpar carrinha
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <SiteLayout>
            <Head title="Meu Carrinho de Compras - Matony" />
            <CartContent />
        </SiteLayout>
    );
}
