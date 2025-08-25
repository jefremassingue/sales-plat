import React from 'react';
import { Link } from '@inertiajs/react';
import { Eye, PackageSearch, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

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
            image: product.main_image?.versions?.find((image) => image.version == 'md')?.url ||
                product.main_image?.versions?.find((image) => image.version == 'lg')?.url ||
                product.main_image?.url,
            slug: product.slug,
            // color_id, size_id, etc., são tipicamente nulos aqui ou representam o produto base
            // Se houver uma variante padrão, você pode adicioná-la aqui.
            color_id: null,
            color_name: null,
            size_id: null,
            size_name: null
        });
        // Feedback é tratado pelo CartContext
    };

    return (
        <article className="group relative bg-white rounded-lg border border-zinc-100 transition-shadow duration-300">
            <Link href={`/products/${product.slug}`} className="flex flex-col justify-between h-full">
                <div className="relative aspect-square overflow-hidden rounded-t-lg p-2">

                    {product.main_image ? (
                        <img
                            src={
                                product.main_image.versions?.find((image) => image.version == 'md')?.url ||
                                product.main_image.versions?.find((image) => image.version == 'lg')?.url ||
                                product.main_image.url
                            }
                            alt={product.name}
                            className="h-full w-full aspect-square rounded-xl object-contain transition-all hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full aspect-square items-center rounded-xl justify-center bg-gray-100 ">
                            <PackageSearch className="h-10 w-10 text-gray-400" />
                        </div>
                    )}
                    {product.isNew && (
                        <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                            Novo
                        </span>
                    )}
                </div>

                <div className="flex flex-col justify-between p-4 flex-1 gap-4 h-full">
                    <div className="flex-1 h-full">
                        <div className="text-sm text-slate-500 mb-1 line-clamp-1">{product.category?.name}</div>
                        <h3 className="font-medium text-slate-800 mb-2 line-clamp-2">{product.name}</h3>


                    </div>
                    <div className="flex flex-col justify-between gap-2">
                        <button
                            onClick={handleAddToCart}
                            className="text-orange-600 hover:bg-orange-600 hover:text-white cursor-pointer border border-orange-500 bg-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors duration-300 flex items-center justify-center gap-2"
                        >
                            <ShoppingCart size={16} />
                            Adicionar a Cotação
                        </button>
                        <Link
                            href={`/products/${product.slug}`}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white cursor-pointer font-medium py-2.5 px-4 rounded-lg text-sm transition-colors duration-300 flex items-center justify-center gap-2"
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
