<?php

namespace Database\Seeders;

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
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'group' => 'bank',
                    'key' => 'account_number',
                    'value' => '1231881377',
                    'description' => 'Número da conta bancária principal',
                    'type' => 'text',
                    'is_public' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'group' => 'bank',
                    'key' => 'nib',
                    'value' => '0001 0000 01231881377 57',
                    'description' => 'NIB da conta bancária principal',
                    'type' => 'text',
                    'is_public' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'group' => 'bank',
                    'key' => 'swift',
                    'value' => 'BIMOMZMX',
                    'description' => 'Código SWIFT do banco principal',
                    'type' => 'text',
                    'is_public' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'group' => 'bank',
                    'key' => 'iban',
                    'value' => 'MZ59000100000123188137757',
                    'description' => 'IBAN da conta bancária principal',
                    'type' => 'text',
                    'is_public' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            ];

            // Inserir as configurações bancárias
            DB::table('settings')->insert($bankSettings);

            DB::commit();

            $this->command->info('Configurações bancárias adicionadas com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Erro ao inserir configurações bancárias: ' . $e->getMessage());
        }
    }
}
