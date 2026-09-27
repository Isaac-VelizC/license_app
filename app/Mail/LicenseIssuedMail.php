<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LicenseIssuedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Order $order
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Tu licencia de {$this->order->plan->app->name} está lista",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.orders.license-issued',
            with: [
                'clientName'  => $this->order->client->name,
                'appName'     => $this->order->plan->app->name,
                'planName'    => $this->order->plan->name,
                'licenseKey'  => $this->order->license->license_key,
                'orderNumber' => $this->order->order_number,
                'maxDevices'  => $this->order->license->max_devices,
                'docsUrl'     => rtrim((string) config('app.landing_url'), '/') . '/documentacion',
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
