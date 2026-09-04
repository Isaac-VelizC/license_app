<?php

namespace App\Exceptions;

class LicenseException extends \RuntimeException
{
    public function __construct(string $message, public readonly string $errorCode)
    {
        parent::__construct($message);
    }
}
