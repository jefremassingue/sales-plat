import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import ProductGrid from '@/components/products/ProductGrid';
import Pagination from '@/components/Pagination';

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

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface SearchPageProps extends PageProps {
  query: string;
  products: {
    data: Product[];
    links: PaginationLink[];
  };
}

export default function Search({ query, products }: SearchPageProps) {
  return (
    <>
      <Head title={`Resultados para "${query}"`} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Resultados para "{query}"
        </h1>

        {products.data.length > 0 ? (
          <>
            <ProductGrid products={products.data} />
            <div className="mt-8">
              <Pagination links={products.links} />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">
              Nenhum produto encontrado para "{query}".
            </p>
            <p className="text-gray-600 mt-2">
              Tente usar termos diferentes ou mais genéricos.
            </p>
          </div>
        )}
      </div>
    </>
  );
} 