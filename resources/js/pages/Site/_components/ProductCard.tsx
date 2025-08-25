import { useCart } from '@/contexts/CartContext';
import { Link } from '@inertiajs/react';
import { Eye, PackageSearch, ShoppingCart } from 'lucide-react';
import React from 'react';

interface Image {
    id: string | number;
    name: string;
    original_name: string;
    size: number;
    is_main?: boolean;
    url: string;
    versions?: Image[];
    version: string;
}

interface Product {
    id: string | number;
    name: string;
    slug: string;
    category?: { id?: string | number; name: string } | null;
    isNew?: boolean;
    main_image?: Image | null;
    mainImage?: Image | null; // fallback naming
}
interface ProductCardProps {
    product: Product;
}

// const formatPrice = (price: string | number) => {
//     return new Intl.NumberFormat('pt-MZ', {
//         style: 'currency',
//         currency: 'MZN',
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2
//     }).format(Number(price));
// };

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addItem } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Evitar navegação para a página do produto

        addItem({
            id: String(product.id),
            name: product.name,
            quantity: 1,
            image:
                product.main_image?.versions?.find((image) => image.version == 'md')?.url ||
                product.main_image?.versions?.find((image) => image.version == 'lg')?.url ||
                product.main_image?.url,
            slug: product.slug,
            // color_id, size_id, etc., são tipicamente nulos aqui ou representam o produto base
            // Se houver uma variante padrão, você pode adicioná-la aqui.
            color_id: null,
            color_name: null,
            size_id: null,
            size_name: null,
        });
        // Feedback é tratado pelo CartContext
    };

    return (
        <article className="group relative rounded-lg border border-zinc-100 bg-white transition-shadow duration-300">
            <Link href={`/products/${product.slug}`} className="flex h-full flex-col justify-between">
                <div className="relative aspect-square overflow-hidden rounded-t-lg p-2">
                    {product.main_image ? (
                        <img
                            src={
                                product.main_image.versions?.find((image) => image.version == 'md')?.url ||
                                product.main_image.versions?.find((image) => image.version == 'lg')?.url ||
                                product.main_image.url
                            }
                            alt={product.name}
                            className="aspect-square h-full w-full rounded-xl object-contain transition-all hover:scale-105"
                        />
                    ) : (
                        <div className="flex aspect-square h-full w-full items-center justify-center rounded-xl bg-gray-100">
                            <PackageSearch className="h-10 w-10 text-gray-400" />
                        </div>
                    )}
                    {product.isNew && <span className="absolute top-2 left-2 rounded bg-orange-500 px-2 py-1 text-xs text-white">Novo</span>}
                </div>

                <div className="flex h-full flex-1 flex-col justify-between gap-4 p-4">
                    <div className="h-full flex-1">
                        <div className="mb-1 line-clamp-1 text-sm text-slate-500">{product.category?.name}</div>
                        <h3 className="mb-2 line-clamp-2 font-medium text-slate-800">{product.name}</h3>
                    </div>
                    <div className="flex flex-col justify-between gap-2">
                        {/* <pre>{JSON.stringify(product.colors)}</pre> */}
                        {product.colors?.length ? (
                            <div className="flex gap-1 overflow-hidden hover:overflow-x-auto">
                                {product.colors.map((color) => (
                                    <img
                                        src={
                                            color.image.versions?.find((image) => image.version == 'md')?.url ||
                                            color.image.versions?.find((image) => image.version == 'lg')?.url ||
                                            color.image.url
                                        }
                                        alt={product.name}
                                        className="aspect-square h-10 w-10 rounded-xl object-contain transition-all hover:scale-105"
                                    />
                                ))}
                            </div>
                        ) : (
                            <button
                                onClick={handleAddToCart}
                                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-orange-500 bg-white px-4 py-2.5 text-sm font-medium text-orange-600 transition-colors duration-300 hover:bg-orange-600 hover:text-white"
                            >
                                <ShoppingCart size={16} />
                                Adicionar a Cotação
                            </button>
                        )}
                        <Link
                            href={`/products/${product.slug}`}
                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-orange-700"
                        >
                            <Eye size={16} />
                            Ver Detalhes
                        </Link>
                    </div>
                </div>
            </Link>
        </article>
    );
};

export default ProductCard;
