<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class Setting extends Model
{
    use HasFactory, HasUlids;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'group',
        'key',
        'value',
        'description',
        'type',
        'is_public',
    ];

    /**
     * Obter uma configuração específica pelo grupo e chave
     *
     * @param string $group
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function get(string $group, string $key, $default = null)
    {
        $cacheKey = "settings_{$group}_{$key}";

        return Cache::remember($cacheKey, 3600, function () use ($group, $key, $default) {
            $setting = self::where('group', $group)
                          ->where('key', $key)
                          ->first();

            return $setting ? $setting->value : $default;
        });
    }

    /**
     * Obter todas as configurações de um grupo específico
     *
     * @param string $group
     * @return array
     */
    public static function getGroup(string $group)
    {
        $cacheKey = "settings_group_{$group}";

        return Cache::remember($cacheKey, 3600, function () use ($group) {
            return self::where('group', $group)->get()->keyBy('key')->toArray();
        });
    }

    /**
     * Definir ou atualizar uma configuração
     *
     * @param string $group
     * @param string $key
     * @param mixed $value
     * @param array $attributes Atributos adicionais (description, type, is_public)
     * @return \App\Models\Setting
     */
    public static function set(string $group, string $key, $value, array $attributes = [])
    {
        try {
            $setting = self::updateOrCreate(
                ['group' => $group, 'key' => $key],
                array_merge(['value' => $value], $attributes)
            );

            // Limpar o cache desta configuração
            $cacheKey = "settings_{$group}_{$key}";
            Cache::forget($cacheKey);
            Cache::forget("settings_group_{$group}");

            return $setting;
        } catch (\Exception $e) {
            Log::error("Erro ao definir configuração {$group}.{$key}: " . $e->getMessage());
            throw $e;
        }
    }
}
