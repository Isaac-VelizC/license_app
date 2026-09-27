@component('mail::message')
# Hola {{ $clientName }}

Gracias por tu compra. Tu licencia de **{{ $appName }}** ya está activa.

@component('mail::panel')
**Plan:** {{ $planName }}
**Clave de licencia:** `{{ $licenseKey }}`
**Dispositivos permitidos:** {{ $maxDevices }}
**N° de orden:** {{ $orderNumber }}
@endcomponent

## Cómo activarla

1. Abre **{{ $appName }}** en tu computadora.
2. En la pantalla de activación, ingresa la clave de arriba.
3. Listo — a partir de ahí funciona incluso sin conexión a internet.

@component('mail::button', ['url' => $docsUrl])
Ver guía de instalación
@endcomponent

Si tienes algún problema con la activación, responde a este correo y te ayudamos.

Saludos,<br>
El equipo de {{ $appName }}
@endcomponent
