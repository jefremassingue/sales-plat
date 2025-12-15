import { z } from 'zod';

export const formSchema = z.object({
    quotation_number: z.string().optional().nullable(),
    customer_id: z.string().optional(),
    user_id: z.string().optional().nullable(),
    issue_date: z.date({ required_error: 'Data de emissão é obrigatória' }),
    expiry_date: z.date().optional().nullable(),
    status: z.enum(['draft', 'sent', 'approved', 'rejected']),
    currency_code: z.string().min(1, { message: 'Moeda é obrigatória' }),
    exchange_rate: z
        .string()
        .min(1, { message: 'Taxa de câmbio é obrigatória' })
        .refine((val) => !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
        .refine((val) => parseFloat(val) > 0, { message: 'Deve ser maior que zero' }),
    include_tax: z.boolean().default(true),
    notes: z.string().optional().nullable(),
    terms: z.string().optional().nullable(),
    items: z
        .array(
            z.object({
                id: z.string().optional(),
                product_id: z.string().optional(),
                product_variant_id: z.string().optional(),
                product_color_id: z.string().optional(),
                product_size_id: z.string().optional(),
                warehouse_id: z.string().optional(),
                name: z.string().min(1, { message: 'Nome é obrigatório' }),
                description: z.string().optional().nullable(),
                quantity: z
                    .string()
                    .min(1, { message: 'Quantidade é obrigatória' })
                    .refine((val) => !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
                    .refine((val) => parseFloat(val) > 0, { message: 'Deve ser maior que zero' }),
                unit: z.string().optional().nullable(),
                unit_price: z
                    .string()
                    .min(1, { message: 'Preço é obrigatório' })
                    .refine((val) => !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
                    .refine((val) => parseFloat(val) >= 0, { message: 'Não pode ser negativo' }),
                discount_percentage: z
                    .string()
                    .optional()
                    .nullable()
                    .refine((val) => !val || !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
                    .refine((val) => !val || parseFloat(val) >= 0, { message: 'Não pode ser negativo' })
                    .refine((val) => !val || parseFloat(val) <= 100, { message: 'Deve ser no máximo 100%' }),
                tax_percentage: z
                    .string()
                    .optional()
                    .nullable()
                    .refine((val) => !val || !isNaN(parseFloat(val)), { message: 'Deve ser um número válido' })
                    .refine((val) => !val || parseFloat(val) >= 0, { message: 'Não pode ser negativo' }),
            }),
        )
        .min(1, { message: 'Adicione pelo menos 1 item à cotação' }),
});

export type FormValues = z.infer<typeof formSchema>;
