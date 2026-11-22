<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'aisakveliz@aisak.dev'],
            [
                'name' => 'AIsak Veliz',
                'password' => Hash::make(Str::random(48)),
            ]
        );
    }
}
