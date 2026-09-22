<?php

namespace App\Models;

use App\Enum\OrderStatusType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'order_number',
    'client_id',
    'plan_id',
    'amount_cents',
    'currency',
    'status',
    'payment_reference',
    'payment_proof_path',
    'paid_at',
    'verified_by',
    'license_id',
    'expires_at',
])]
class Order extends Model
{
    use HasFactory;

    protected $casts = [
        'status'     => OrderStatusType::class,
        'paid_at'    => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function license(): BelongsTo
    {
        return $this->belongsTo(License::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function isPaid(): bool
    {
        return $this->status === OrderStatusType::PAID;
    }

    
    public function getFormattedAmountAttribute(): string
    {
        return number_format($this->amount_cents / 100, 2) . ' ' . $this->currency;
    }

    public function getWhatsappLinkAttribute(): string
    {
        $message = "Hola, envío comprobante de mi orden {$this->order_number}";

        return 'https://wa.me/'
            . config('services.whatsapp.support_number')
            . '?text=' . urlencode($message);
    }
}
