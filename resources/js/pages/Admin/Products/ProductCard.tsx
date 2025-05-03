import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import { Eye, Edit, Trash, Box, Tag, WarehouseIcon } from "lucide-react";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    sku: string;
    price: number | null;
    inventory_price: number | null;
    total_stock: number;
    active: boolean;
    featured: boolean;
    mainImage?: {
      path: string;
    };
  };
  onDeleteClick: (id: number) => void;
}

export default function ProductCard({ product, onDeleteClick }: ProductCardProps) {
  const formatCurrency = (value: number | null) => {
    if (value === null) return "N/A";
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "MZN",
    }).format(value);
  };

  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] relative bg-gray-100">
        {product.mainImage ? (
          <img
            src={`/storage/${product.mainImage.path}`}
            alt={product.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Box className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {product.featured && (
            <Badge variant="secondary" className="opacity-90">
              Destacado
            </Badge>
          )}
          {!product.active && (
            <Badge variant="destructive" className="opacity-90">
              Inativo
            </Badge>
          )}
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="font-medium line-clamp-2">{product.name}</div>
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <Tag className="h-3 w-3" />
          <span>{product.sku || "Sem SKU"}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm">
            <div className="font-medium">Preço:</div>
            <div>{formatCurrency(product.inventory_price || product.price)}</div>
          </div>
          <div className="text-sm text-right">
            <div className="font-medium flex items-center gap-1">
              <WarehouseIcon className="h-3 w-3" />
              <span>Stock:</span>
            </div>
            <div className={product.total_stock === 0 ? "text-red-500" : "text-emerald-600"}>
              {product.total_stock}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-2 bg-muted/50 flex justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/products/${product.id}`}>
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/products/${product.id}/edit`}>
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteClick(product.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash className="h-4 w-4 mr-1" />
          Eliminar
        </Button>
      </CardFooter>
    </Card>
  );
}
