<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@school.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => UserRole::Admin,
                'email_verified_at' => now(),
            ]
        );

        $teachers = [
            ['name' => 'John Smith', 'email' => 'john.smith@school.com'],
            ['name' => 'Jane Doe', 'email' => 'jane.doe@school.com'],
            ['name' => 'Bob Wilson', 'email' => 'bob.wilson@school.com'],
        ];

        foreach ($teachers as $teacher) {
            User::firstOrCreate(
                ['email' => $teacher['email']],
                [
                    'name' => $teacher['name'],
                    'password' => Hash::make('password'),
                    'role' => UserRole::Teacher,
                    'email_verified_at' => now(),
                ]
            );
        }

        User::factory()
            ->count(10)
            ->student()
            ->create();
    }
}
