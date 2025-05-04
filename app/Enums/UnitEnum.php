<?php

namespace App\Enums;

enum UnitEnum: string
{
    case UNIT = 'unit';
    case KILOGRAM = 'kg';
    case METER = 'm';
    case SQUARE_METER = 'm2';
    case CUBIC_METER = 'm3';
    case LITER = 'l';
    case HOUR = 'h';
    case DAY = 'day';
    case PIECE = 'pc';
    case BOX = 'box';
    case PALLET = 'pallet';
    case SET = 'set';

    /**
     * Obter o nome formatado da unidade para exibição
     */
    public function label(): string
    {
        return match($this) {
            self::UNIT => 'Unidade',
            self::KILOGRAM => 'Quilograma (kg)',
            self::METER => 'Metro (m)',
            self::SQUARE_METER => 'Metro quadrado (m²)',
            self::CUBIC_METER => 'Metro cúbico (m³)',
            self::LITER => 'Litro (L)',
            self::HOUR => 'Hora (h)',
            self::DAY => 'Dia',
            self::PIECE => 'Peça',
            self::BOX => 'Caixa',
            self::PALLET => 'Palete',
            self::SET => 'Conjunto',
        };
    }

    /**
     * Obter todas as unidades como array para uso em forms
     */
    public static function toArray(): array
    {
        return array_map(
            fn (self $unit) => [
                'value' => $unit->value,
                'label' => $unit->label(),
            ],
            self::cases()
        );
    }
}
