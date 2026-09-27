<?php

namespace App\Listeners;

use App\Events\OrderPaid;
use App\Mail\LicenseIssuedMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendLicenseIssuedEmail implements ShouldQueue
{
    public int $tries = 3;

    public array $backoff = [60, 300, 900];

    public function __construct() {}

    public function handle(OrderPaid $event): void
    {
        $order = $event->order->loadMissing(['client', 'plan.app', 'license']);

        Mail::to($order->client->email)->send(new LicenseIssuedMail($order));
    }
}
