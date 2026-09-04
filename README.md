# Plataforma de Licencias

Backend de licencias (Laravel + Inertia + React) que gestiona activaciones, licencias de por vida y periodos de prueba para múltiples aplicaciones de escritorio (Electron). No es exclusivo de un solo producto: cada app se registra de forma independiente (`apps`) con sus propios planes, clientes y licencias, todas servidas desde este mismo backend. VextoPos es la primera app integrada, pero el sistema está pensado desde el diseño para sumar nuevas apps sin duplicar infraestructura.

## Stack

- **Backend**: Laravel, Inertia.js
- **Frontend admin**: React + TypeScript, Tailwind CSS, shadcn/ui
- **Base de datos**: MySQL / PostgreSQL
- **Firma de licencias**: RSA-SHA256 (OpenSSL)
- **Pagos**: Stripe Checkout (webhooks)

## Requisitos

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL o PostgreSQL
- Extensión `openssl` de PHP habilitada

## Instalación

```bash
git clone <url-del-repo>
cd licensing-platform

composer install
npm install

cp .env.example .env
php artisan key:generate
```

Configura la base de datos en `.env`, luego:

```bash
php artisan migrate --seed
```

### Generar las claves de firma RSA (obligatorio, por entorno)

```bash
openssl genrsa -out license_signing_private.pem 2048
openssl rsa -in license_signing_private.pem -pubout -out license_signing_public.pem

mkdir -p storage/app/licensing
mv license_signing_private.pem license_signing_public.pem storage/app/licensing/
```

Agrega en `.env`:

```env
LICENSE_SIGNING_PRIVATE_KEY_PATH=storage/app/licensing/license_signing_private.pem
```

> ⚠️ Genera un par de claves **distinto por entorno** (local/staging/producción). La clave privada nunca sale del servidor ni se sube al repositorio (`storage/app/licensing/*.pem` ya está en `.gitignore`). Guarda un backup de la clave privada de producción en un gestor de secretos.

La clave **pública** (`license_signing_public.pem`) se copia al cliente Electron para verificar las firmas — no es secreta.

### Levantar en desarrollo

```bash
php artisan serve
npm run dev
```

## Estructura del dominio

```
apps        → cada software registrado (VextoPos, y cualquier app futura), identificado por `slug`
plans       → planes por app (mensual, vitalicio, trial) con precio en centavos
clients     → clientes, compartidos entre todas las apps (una persona puede tener licencias de varias)
licenses    → licencia de por vida o trial, con clave LIC-XXXX-XXXX-XXXX, siempre ligada a una app
activations → dispositivos (hwid) activados por licencia
license_logs→ auditoría de eventos (activar, revocar, suspender, trial, etc.)
```

Un mismo `Client` puede tener licencias de distintas `App` sin duplicarse — el CRUD de clientes, el panel de auditoría y el checkout son compartidos por todas las aplicaciones registradas.

## Modelo de licenciamiento

- Las licencias son **de por vida por dispositivo/cliente** (`expires_at = null`), no por suscripción.
- Cada instalación nueva recibe un **trial de 7 días**, registrado por `hwid` contra el servidor — reinstalar no reinicia el trial.
- El control de dispositivos usa `max_devices` + tabla `activations`; superar el límite bloquea nuevas activaciones.
- La respuesta de cada `activate`/`validate`/`trial` va firmada con RSA-SHA256, verificada del lado de Electron con la clave pública embebida.

## API pública (consumida por cada app Electron)

Base: `/api/v1/licenses`

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/activate` | Activa una licencia en un dispositivo (`app_slug`, `license_key`, `hwid`) |
| `POST` | `/validate` | Valida una activación existente |
| `POST` | `/deactivate` | Libera un dispositivo |
| `POST` | `/trial` | Registra o recupera el trial de 7 días para un `hwid` |

`app_slug` identifica a qué aplicación pertenece la petición — cualquier app registrada en `apps` puede consumir estos mismos endpoints sin cambios en el backend. Todos están protegidos por rate limiting (por IP y por `license_key`).

### Agregar una nueva app a la plataforma

1. Crear el registro en `apps` (nombre + `slug` único) desde el panel admin.
2. Crear al menos un plan de pago y, opcionalmente, un plan `is_trial` para esa app.
3. Configurar `app_slug` en el cliente Electron de esa nueva app — el resto del flujo (activar/validar/trial/checkout) ya funciona sin tocar este backend.

## Panel de administración

Accesible en `/admin` (requiere autenticación):

- **Aplicaciones** — apps registradas y sus planes
- **Clientes** — base de clientes y sus licencias
- **Licencias** — emisión manual, suspender/revocar/reactivar/renovar/cambiar plan
- **Auditoría** — historial de eventos de todas las licencias

## Flujo de compra

Cada app tiene su propia landing de marketing (independiente de este proyecto), pero todas comparten el mismo checkout:

1. Landing de la app → botón "Comprar licencia" → `/checkout/{app_slug}`
2. Checkout de Stripe (precio propio por app/plan) → pago confirmado → webhook
3. Se crea/reusa el `Client` (por email, compartido entre apps) y se emite la `License` para esa app específica
4. Se envía la clave por correo al cliente

## Pendientes de producción

Ver [`VextoposLicenciasRoadmap.md`](./VextoposLicenciasRoadmap.md) para el checklist completo (code signing, HTTPS, backups, rotación de clave RSA, etc.).

## Licencia

Uso privado / interno.