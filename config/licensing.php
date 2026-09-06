<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Ruta de la clave privada de firma de licencias
    |--------------------------------------------------------------------------
    |
    | Ruta relativa a la raíz del proyecto (base_path()) donde se encuentra
    | la clave privada RSA usada para firmar las respuestas de activación,
    | validación y trial. Esta clave NUNCA debe subirse al control de
    | versiones — ya está en .gitignore (storage/app/licensing/*.pem).
    |
    | Genera el par de claves con:
    |   openssl genrsa -out license_signing_private.pem 2048
    |   openssl rsa -in license_signing_private.pem -pubout -out license_signing_public.pem
    |
    */

    'signing_private_key_path' => env(
        'LICENSE_SIGNING_PRIVATE_KEY_PATH',
        'storage/app/licensing/license_signing_private.pem'
    ),

];