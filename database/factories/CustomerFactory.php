<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        $isCompany = $this->faker->boolean(30);

        return [
            'user_id' => User::factory(),
            'name' => $isCompany ? $this->faker->company() : $this->faker->name(),
            'company_name' => $isCompany ? $this->faker->company() : null,
            'tax_id' => $this->faker->numerify('#########'), // Formato NUIT Moçambique
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'mobile' => $this->faker->phoneNumber(),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'province' => $this->faker->randomElement(['Maputo', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula', 'Cabo Delgado', 'Niassa']),
            'postal_code' => $this->faker->numerify('####'),
            'country' => 'Moçambique',
            'notes' => $this->faker->optional()->text(),
            'active' => $this->faker->boolean(90), // 90% chance of being active
            'birth_date' => $isCompany ? null : $this->faker->date(),
            'contact_person' => $isCompany ? $this->faker->name() : null,
            'billing_address' => $this->faker->optional()->address(),
            'shipping_address' => $this->faker->optional()->address(),
            'website' => $isCompany ? $this->faker->optional()->url() : null,
            'client_type' => $isCompany ? 'company' : 'individual',
        ];
    }
}
