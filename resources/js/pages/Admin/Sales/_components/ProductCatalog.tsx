import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  sku?: string;
  unit?: string;
  stock_quantity?: number;
  category?: Category;
  category_id?: number;
}

interface ProductCatalogProps {
  products: Product[];
  categories?: Category[];
  onProductSelect: (productId: string, warehouseId?: string) => void;
  warehouses: { id: number; name: string }[];
  selectedWarehouseId?: string;
  onWarehouseChange: (warehouseId: string) => void;
  className?: string;
}

export default function ProductCatalog({
  products,
  categories = [],
  onProductSelect,
  warehouses,
  selectedWarehouseId,
  onWarehouseChange,
  className
}: ProductCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [inventoryData, setInventoryData] = useState<Record<string, number>>({});
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [productPrices, setProductPrices] = useState<Record<string, number>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Definir número de produtos por página
  const itemsPerPage = 12;

  // Extrair categorias únicas dos produtos se não fornecidas
  const uniqueCategories = categories.length > 0
    ? categories
    : [...new Set(products
        .filter(product => product.category)
        .map(product => product.category?.id))].map(id => {
          const category = products.find(p => p.category?.id === id)?.category;
          return { id: id || 0, name: category?.name || "Sem categoria" };
        });

  // Filtrar produtos com base na busca e categoria
  useEffect(() => {
    let filtered = products;

    // Filtro por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.sku?.toLowerCase().includes(term)
      );
    }

    // Filtro por categoria
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(product =>
        product.category_id === selectedCategory ||
        product.category?.id === selectedCategory
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset para a primeira página quando filtros mudam
  }, [searchTerm, selectedCategory, products]);

  // Quando o armazém muda, buscar dados de inventário e preços
  useEffect(() => {
    if (selectedWarehouseId) {
      fetchInventoryStatus();
    }
  }, [selectedWarehouseId]);

  // Buscar status de inventário para os produtos filtrados
  const fetchInventoryStatus = async () => {
    if (!selectedWarehouseId) return;

    try {
      setIsLoadingInventory(true);
      const productIds = filteredProducts.map(p => p.id).join(',');
      const response = await fetch(`/admin/api/inventory-status?warehouse_id=${selectedWarehouseId}&product_ids=${productIds}`);
      const data = await response.json();

      if (data.success) {
        setInventoryData(data.inventory || {});
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível obter os dados de stock",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar status de inventário:", error);
    } finally {
      setIsLoadingInventory(false);
    }
  };

  // Buscar preço específico do armazém para um produto
  const fetchProductPrice = async (productId: number) => {
    if (!selectedWarehouseId) return null;

    try {
      setIsLoadingPrices(true);
      const response = await fetch(`/admin/api/product-inventory?product_id=${productId}&warehouse_id=${selectedWarehouseId}`);
      const data = await response.json();

      if (data.success) {
        if (data.inventory && data.inventory.unit_cost) {
          const newPrices = { ...productPrices };
          newPrices[productId] = data.inventory.unit_cost;
          setProductPrices(newPrices);
          return data.inventory.unit_cost;
        }
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar preço do produto:", error);
      return null;
    } finally {
      setIsLoadingPrices(false);
    }
  };

  // Função para selecionar um produto e verificar se tem preço específico
  const handleProductSelect = async (productId: string) => {
    const numericProductId = productId;
    // Verificar se já temos o preço deste produto neste armazém
    if (!productPrices[numericProductId] && selectedWarehouseId) {
      const specificPrice = await fetchProductPrice(numericProductId);
      // Usar o preço específico do armazém ou seguir com o preço padrão
      onProductSelect(productId, selectedWarehouseId);
    } else {
      // Se já temos o preço, simplesmente selecionar o produto
      onProductSelect(productId, selectedWarehouseId);
    }
  };

  // Formatar preço
  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'MZN'
    }).format(price);
  };

  // Focar no campo de busca quando o componente montar
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Calcular produtos paginados
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Funções de navegação
  const goToNextPage = () => {
    setCurrentPage(curr => Math.min(curr + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage(curr => Math.max(curr - 1, 1));
  };

  // Obter quantidade em stock para um produto
  const getStockQuantity = (productId: number): number | undefined => {
    if (isLoadingInventory) return undefined;
    return selectedWarehouseId ? (inventoryData[productId] !== undefined ? inventoryData[productId] : undefined) : undefined;
  };

  // Obter preço específico do armazém ou usar o padrão
  const getProductPrice = (product: Product): number => {
    return productPrices[product.id] || product.price;
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6 px-4">
        <div className="flex gap-3 items-center mb-4">
          <div className="flex-grow relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
              ref={searchInputRef}
            />
          </div>

          <Select
            value={selectedWarehouseId || ""}
            onValueChange={onWarehouseChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione um armazém" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de categorias */}
        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="mb-4">
          <TabsList className="mb-4 flex flex-wrap">
            <TabsTrigger value="all">Todas as Categorias</TabsTrigger>
            {uniqueCategories.map(category => (
              <TabsTrigger
                key={category.id}
                value={category.id.toString()}
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {paginatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2">
              {paginatedProducts.map((product) => {
                const stockQuantity = getStockQuantity(product.id);
                const productPrice = getProductPrice(product);

                return (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleProductSelect(product.id.toString())}
                  >
                    <CardContent className="p-3">
                      <div className="flex flex-col h-full">
                        <div className="text-sm font-medium mb-1 truncate">{product.name}</div>
                        <div className="text-muted-foreground text-xs mb-2">
                          {product.sku || 'Sem código'}
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <div className={`font-semibold ${isLoadingPrices ? 'opacity-50' : ''}`}>
                            {formatCurrency(productPrice)}
                          </div>
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0" type="button">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Exibir quantidade em stock */}
                        <div className="flex items-center justify-between mt-2">
                          {stockQuantity !== undefined ? (
                            <div className={`text-xs ${
                              stockQuantity > 10 ? 'text-green-600' :
                              stockQuantity > 0 ? 'text-amber-600' :
                              'text-red-600'
                            }`}>
                              Stock: {stockQuantity || 0}
                            </div>
                          ) : isLoadingInventory ? (
                            <div className="text-xs text-muted-foreground">Verificando stock...</div>
                          ) : (
                            <div className="text-xs text-muted-foreground">Stock não disponível</div>
                          )}

                          {product.category && (
                            <Badge variant="outline" className="text-xs ml-2">
                              {product.category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  type="button"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <div className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  type="button"
                >
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Package className="h-10 w-10 mb-2" />
            <p>Nenhum produto encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
