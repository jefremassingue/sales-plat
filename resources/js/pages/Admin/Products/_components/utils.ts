/**
 * Gera um ID temporário para elementos que ainda não possuem um ID permanente
 * Útil para gestão de coleções no frontend antes de enviar para o backend
 */
export const generateTempId = () => `temp_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Verifica se há erros em uma seção específica do formulário
 */
export const hasTabErrors = (tab: string, errors: Record<string, string>): boolean => {
    switch (tab) {
        case 'basic':
            return !!errors.name || !!errors.slug || !!errors.price || !!errors.sku
                || !!errors.category_id || !!errors.stock || !!errors.weight;
        case 'description':
            return !!errors.description || !!errors.technical_details || !!errors.features || !!errors.description_pdf;
        case 'attributes':
            return !!errors.attributes;
        case 'variants':
            return !!errors.colors || !!errors.sizes || !!errors.variants;
        case 'images':
            return !!errors.images || !!errors.main_image;
        default:
            return false;
    }
};
