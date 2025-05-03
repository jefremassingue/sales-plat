import { z } from "zod";

export const supplierSchema = z.object({
  // Campos gerais
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  company_name: z.string().nullable().optional(),
  tax_id: z.string().nullable().optional(),
  email: z.string().email({ message: "Email inválido" }).nullable().optional(),
  active: z.boolean().default(true),
  supplier_type: z.enum(['products', 'services', 'both']),

  // Contactos
  phone: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  contact_person: z.string().nullable().optional(),

  // Endereço
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  postal_code: z.string().nullable().optional(),
  country: z.string().default("Mozambique"),
  billing_address: z.string().nullable().optional(),

  // Pagamentos
  payment_terms: z.string().nullable().optional(),
  credit_limit: z.number().nullable().optional(),
  currency: z.string().default("MZN"),
  bank_name: z.string().nullable().optional(),
  bank_account: z.string().nullable().optional(),
  bank_branch: z.string().nullable().optional(),

  // Outros
  notes: z.string().nullable().optional(), // Suporta HTML do editor rich text

  // User ID
  user_id: z.number().nullable().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
