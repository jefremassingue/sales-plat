<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Jefre\SpatiePermissionGenerate\SpatiePermissionGenerate;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hasGenarate = SpatiePermissionGenerate::synchronizelPermission();

        // Admin users
        $role = Role::create(['name' => 'Admin']);

        $permissions = Permission::pluck('id', 'id')->all();

        $role->syncPermissions($permissions);

        $user =  User::create([
            'name' => 'Administrador',
            'email' => 'admin@matonyservicos.com',
            'password' => bcrypt('12345678'),
        ]);
        $user2 =  User::create([
            'name' => 'Pestanea',
            'email' => 'pestanea@matonyservicos.com',
            'password' => bcrypt('12345678'),
        ]);
        $user->assignRole($role->name);
        $user2->assignRole($role->name);

        $role1 = Role::create(['name' => 'Guest']);
        // Guest users
        $user =  User::create([
            'name' => 'Guest',
            'email' => 'guest@matonyservicos.com',
            'password' => bcrypt('12345678'),
        ]);
        $user->assignRole($role->name);

        // Instructor users
        $role = Role::create(['name' => 'Publisher']);

        // $permissions = Permission::where('name', 'like', 'console-%')->pluck('id', 'id')->all();

        $role1->syncPermissions($permissions);
        $role->syncPermissions($permissions);

        $user =  User::create([
            'name' => 'Publisher',
            'email' => 'publisher@matonyservicos.com',
            'password' => bcrypt('12345678'),
        ]);
        $user->assignRole($role->name);

    }
        // Criação de usuários padrão
        \App\Models\User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@matonyservicos.com',
        ]);
    }
}
