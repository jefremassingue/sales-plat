<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BankSettingsSeeder extends Seeder
{
    /**
     * Executar o seeder com as configurações bancárias.
     */
    public function run(): void
    {
        try {
            // Iniciar uma transação para garantir consistência
            DB::beginTransaction();

            $now = Carbon::now();

            // Configurações bancárias para Moçambique
            $bankSettings = [
                [
                    'group' => 'bank',
                    'key' => 'bank_name',
                    'value' => 'BIM',
                    'description' => 'Nome do banco principal',
                    'type' => 'text',
                    'is_public' => true,
                ],
                [
                    'group' => 'bank',
                    'key' => 'account_number',
                    'value' => '1231881377',
                    'description' => 'Número da conta bancária principal',
                    'type' => 'text',
                    'is_public' => true,
                ],
                [
                    'group' => 'bank',
                    'key' => 'nib',
                    'value' => '0001 0000 01231881377 57',
                    'description' => 'NIB da conta bancária principal',
                    'type' => 'text',
                    'is_public' => true,
                ],
                [
                    'group' => 'bank',
                    'key' => 'swift',
                    'value' => 'BIMOMZMX',
                    'description' => 'Código SWIFT do banco principal',
                    'type' => 'text',
                    'is_public' => true,
                ],
                [
                    'group' => 'bank',
                    'key' => 'iban',
                    'value' => 'MZ59000100000123188137757',
                    'description' => 'IBAN da conta bancária principal',
                    'type' => 'text',
                    'is_public' => true,
                ],

                     [
                    'group' => 'bank',
                    'key' => 'bank_name_bci',
                    'value' => 'BCI',
                    'description' => 'Nome do banco BCI',
                    'type' => 'text',
                    'is_public' => true,
                ],
                [
                    'group' => 'bank',
                    'key' => 'account_number_bci',
                    'value' => '31610592910001',
                    'description' => 'Número da conta bancária BCI',
                    'type' => 'text',
                    'is_public' => true,
                ],
                [
                    'group' => 'bank',
                    'key' => 'nib_bci',
                    'value' => '0008 0000 316105929100128',
                    'description' => 'NIB da conta bancária BCI',
                    'type' => 'text',
                    'is_public' => true,
                ],
            ];

            // Inserir as configurações bancárias
            foreach ($bankSettings as $value) {
                Setting::create($value);
            }

            DB::commit();

            $this->command->info('Configurações bancárias adicionadas com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Erro ao inserir configurações bancárias: ' . $e->getMessage());
        }
    }
}
