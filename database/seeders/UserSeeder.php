<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin user
        User::firstOrCreate(
            ['email' => 'admin@school.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Teacher users with known credentials
        $teachers = [
            ['name' => 'John Smith', 'email' => 'john.smith@school.com'],
            ['name' => 'Jane Doe',   'email' => 'jane.doe@school.com'],
            ['name' => 'Bob Wilson', 'email' => 'bob.wilson@school.com'],
        ];

        foreach ($teachers as $teacher) {
            User::firstOrCreate(
                ['email' => $teacher['email']],
                [
                    'name' => $teacher['name'],
                    'password' => Hash::make('password'),
                    'role' => 'teacher',
                    'email_verified_at' => now(),
                ]
            );
        }

        // 10 random student users
        User::factory()
            ->count(10)
            ->student()
            ->create();
    }
}
