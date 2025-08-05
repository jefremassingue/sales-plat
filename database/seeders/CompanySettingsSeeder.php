<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CompanySettingsSeeder extends Seeder
{
    /**
     * Executar o seeder com as configurações iniciais da empresa.
     */
    public function run(): void
    {
        try {
            // Iniciar uma transação para garantir consistência
            DB::beginTransaction();

            $now = Carbon::now();

            // Configurações da empresa para Moçambique
            $companySettings = [
                [
                    'group' => 'company',
                    'key' => 'company_name',
                    'value' => 'Matony Serviços, Lda',
                    'description' => 'Nome da empresa',
                    'type' => 'text',
                    'is_public' => true,
                ],
                [
                    'group' => 'company',
                    'key' => 'company_address',
                    'value' => 'Av. Ahmed sekou toure n° 3007',
                    'description' => 'Endereço da empresa',
                    'type' => 'text',
                    'is_public' => true,
                ],
                [
                    'group' => 'company',
                    'key' => 'company_city',
                    'value' => 'Maputo',
                    'description' => 'Cidade da empresa',
                    'type' => 'text',
                    'is_public' => true,
                ],
                [
                    'group' => 'company',
                    'key' => 'company_province',
                    'value' => 'Maputo',
                    'description' => 'Província da empresa',
                    'type' => 'text',
                    'is_public' => true,
                ],
                [
                    'group' => 'company',
                    'key' => 'company_postal_code',
                    'value' => '1105',
                    'description' => 'Código postal da empresa',
                    'type' => 'text',
                    'is_public' => true,
                ],
                [
                    'group' => 'company',
                    'key' => 'company_country',
                    'value' => 'Moçambique',
                    'description' => 'País da empresa',
                    'type' => 'text',
                    'is_public' => true,
                ],
                [
                    'group' => 'company',
                    'key' => 'company_phone',
                    'value' => '+258 87 115 4336',
                    'description' => 'Telefone principal da empresa',
                    'type' => 'text',
                    'is_public' => true,
                ],
                [
                    'group' => 'company',
                    'key' => 'company_email',
                    'value' => 'geral@matonyservicos.com',
                    'description' => 'Email principal da empresa',
                    'type' => 'text',
                    'is_public' => true,
                ],
                [
                    'group' => 'company',
                    'key' => 'company_website',
                    'value' => 'https://www.matonyservicos.com',
                    'description' => 'Website da empresa',
                    'type' => 'text',
                    'is_public' => true,
                ],
                [
                    'group' => 'company',
                    'key' => 'company_tax_number',
                    'value' => '123456789',
                    'description' => 'NUIT da empresa',
                    'type' => 'text',
                    'is_public' => true,
                ],
                [
                    'group' => 'company',
                    'key' => 'company_logo',
                    'value' => 'logo.png',
                    'description' => 'Logo da empresa',
                    'type' => 'image',
                    'is_public' => true,
                ],
                [
                    'group' => 'company',
                    'key' => 'company_currency',
                    'value' => 'MZN',
                    'description' => 'Moeda padrão da empresa',
                    'type' => 'text',
                    'is_public' => true,
                ],
                [
                    'group' => 'company',
                    'key' => 'company_fiscal_year_start',
                    'value' => '01-01',
                    'description' => 'Início do ano fiscal (MM-DD)',
                    'type' => 'text',
                    'is_public' => false,
                ],
                [
                    'group' => 'company',
                    'key' => 'company_fiscal_year_end',
                    'value' => '12-31',
                    'description' => 'Fim do ano fiscal (MM-DD)',
                    'type' => 'text',
                    'is_public' => false,
                ],
                [
                    'group' => 'company',
                    'key' => 'header_image',
                    'value' => '',
                    'description' => 'Imagem de fundo para o cabeçalho dos documentos',
                    'type' => 'image',
                    'is_public' => false,
                ],
                [
                    'group' => 'company',
                    'key' => 'footer_image',
                    'value' => '',
                    'description' => 'Imagem de fundo para o rodapé dos documentos',
                    'type' => 'image',
                    'is_public' => false,
                ],
                [
                    'group' => 'company',
                    'key' => 'footer_text',
                    'value' => 'Obrigado pela preferência! | www.matony.co.mz',
                    'description' => 'Texto adicional para o rodapé dos documentos',
                    'type' => 'text',
                    'is_public' => false,
                ],
            ];

            foreach ($companySettings as $value) {
                Setting::create($value);
            }

            // Configurações adicionais (invoice, pdf, etc)
            $invoiceSettings = [
                [
                    'group' => 'pdf',
                    'key' => 'pdf_font',
                    'value' => 'DejaVu Sans',
                    'description' => 'Fonte padrão para PDFs',
                    'type' => 'text',
                    'is_public' => false,
                ],
                [
                    'group' => 'pdf',
                    'key' => 'pdf_font_size',
                    'value' => '12',
                    'description' => 'Tamanho da fonte padrão para PDFs',
                    'type' => 'number',
                    'is_public' => false,
                ],
                [
                    'group' => 'invoice',
                    'key' => 'invoice_default_terms',
                    'value' => 'Pagamento deve ser efetuado no prazo de 30 dias a partir da data da fatura. Após esse prazo, serão aplicados juros de mora conforme a legislação em vigor.',
                    'description' => 'Termos padrão para faturas',
                    'type' => 'textarea',
                    'is_public' => false,
                ],
                [
                    'group' => 'quotation',
                    'key' => 'quotation_default_terms',
                    'value' => 'Esta cotação é válida por 30 dias a partir da data de emissão. Preços sujeitos a alteração sem aviso prévio após este período.',
                    'description' => 'Termos padrão para cotações',
                    'type' => 'textarea',
                    'is_public' => false,
                ],
            ];

            // Inserir as configurações adicionais
            // Setting::create($invoiceSettings);
            foreach ($invoiceSettings as $value) {
                Setting::create($value);
            }

            // Confirmar as alterações
            DB::commit();
        } catch (\Exception $e) {
            // Reverter em caso de erro
            DB::rollBack();
            $this->command->error('Erro ao inserir configurações da empresa: ' . $e->getMessage());
        }
    }
}
