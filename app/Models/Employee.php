<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'position',
        'base_salary',
        'commission_rate',
        'admission_date',
        'photo_path',
        'academic_level',
        'birth_date',
        'gender',
        'nuit',
        'bi_number',
        'department',
        'status',
        'notes',
    ];

    protected $casts = [
        'base_salary' => 'float',
        'commission_rate' => 'float',
        'admission_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
