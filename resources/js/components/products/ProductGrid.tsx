import { Link } from '@inertiajs/react';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  images: {
    id: number;
    url: string;
  }[];
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}`}
          className="group"
        >
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
            <img
              src={product.images[0]?.url || '/images/placeholder.png'}
              alt={product.name}
              className="h-full w-full object-cover object-center group-hover:opacity-75"
            />
          </div>
          <div className="mt-4">
            <h3 className="text-sm text-gray-700">{product.name}</h3>
            <div className="mt-1 flex items-center gap-2">
              {product.sale_price ? (
                <>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(product.sale_price)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-sm font-medium text-gray-900">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 