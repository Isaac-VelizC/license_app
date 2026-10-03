<?php

namespace Database\Seeders;

use App\Models\App;
use App\Models\Client;
use App\Models\Plan;
use App\Models\ProductVersion;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DataSeeder extends Seeder
{
    public function run(): void
    {
        $appsData = [
            ['name' => 'SaaSify Pro', 'description' => 'Plataforma de gestión empresarial todo en uno.'],
            ['name' => 'InvoiceMaster', 'description' => 'Generador de facturas y control de gastos.'],
            ['name' => 'CodeShield License', 'description' => 'Sistema de control de licencias para software de escritorio.'],
            ['name' => 'TaskFlow Desktop', 'description' => 'Gestor de tareas y proyectos fuera de línea.'],
        ];

        foreach ($appsData as $appInfo) {
            $app = App::create([
                'name' => $appInfo['name'],
                'slug' => Str::slug($appInfo['name']),
                'description' => $appInfo['description'],
                'is_active' => true,
            ]);

            // 2. Crear Versiones de Producto para cada App (v1.0.0 y v2.0.0)
            $v1 = ProductVersion::create([
                'app_id' => $app->id,
                'version' => '1.0.0',
                'file_name' => Str::slug($app->name) . '-v1.0.0.zip',
                'file_path' => 'downloads/' . Str::slug($app->name) . '/v1.0.0.zip',
                'release_notes' => 'Lanzamiento inicial de la versión 1.0',
                'is_active' => false,
                'released_at' => now()->subMonths(6),
            ]);

            $v2 = ProductVersion::create([
                'app_id' => $app->id,
                'version' => '2.0.0',
                'file_name' => Str::slug($app->name) . '-v2.0.0.zip',
                'file_path' => 'downloads/' . Str::slug($app->name) . '/v2.0.0.zip',
                'release_notes' => 'Actualización mayor con mejoras de rendimiento y seguridad.',
                'is_active' => true,
                'released_at' => now()->subDays(10),
            ]);

            // 3. Crear Planes asociados a la App y sus Versiones
            // Plan de Prueba (Trial)
            Plan::create([
                'app_id' => $app->id,
                'product_version_id' => $v2->id,
                'updates_until_version' => '2.0.0',
                'name' => 'Plan de Prueba (14 días)',
                'price_cents' => 0,
                'currency' => 'USD',
                'duration_days' => 14,
                'max_devices' => 1,
                'is_trial' => true,
                'is_active' => true,
            ]);

            // Plan Anual Estándar
            Plan::create([
                'app_id' => $app->id,
                'product_version_id' => $v2->id,
                'updates_until_version' => '2.x',
                'name' => 'Licencia Anual Estándar',
                'price_cents' => 4900, // $49.00
                'currency' => 'USD',
                'duration_days' => 365,
                'max_devices' => 3,
                'is_trial' => false,
                'is_active' => true,
            ]);

            // Plan Vitalicio (Lifetime - sin duración)
            Plan::create([
                'app_id' => $app->id,
                'product_version_id' => $v2->id,
                'updates_until_version' => 'lifetime',
                'name' => 'Licencia Vitalicia (Lifetime)',
                'price_cents' => 14900, // $149.00
                'currency' => 'USD',
                'duration_days' => null,
                'max_devices' => 5,
                'is_trial' => false,
                'is_active' => true,
            ]);
        }

        // 4. Crear 6 Clientes de prueba
        $clients = [
            ['name' => 'Carlos Pérez', 'email' => 'carlos@example.com'],
            ['name' => 'María Gómez', 'email' => 'maria@example.com'],
            ['name' => 'Juan Rodríguez', 'email' => 'juan@example.com'],
            ['name' => 'Ana Torres', 'email' => 'ana@example.com'],
            ['name' => 'Luis Martínez', 'email' => 'luis@example.com'],
            ['name' => 'Sofía Benítez', 'email' => 'sofia@example.com'],
        ];

        foreach ($clients as $clientData) {
            Client::create([
                'name' => $clientData['name'],
                'email' => $clientData['email'],
                // Si tu tabla de clientes requiere contraseña o campos adicionales, agrégalos aquí.
            ]);
        }
    }
}
