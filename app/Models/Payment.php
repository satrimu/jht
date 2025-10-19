<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Payment extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'amount',
        'payment_date',
        'status',
        'notes',
        'image',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
    ];

    /**
     * Append image_url to JSON serialization
     */
    protected $appends = ['image_url'];

    /**
     * Get the payment's image URL with fallback to default.
     */
    public function getImageUrlAttribute(): string
    {
        if (empty($this->attributes['image'])) {
            return asset('payment-default.svg'); // Default image
        }

        // Image stored as 'payments/filename.webp'
        $filename = ltrim((string) $this->attributes['image'], '/');

        return asset('storage/payments/'.$filename);
    }

    /**
     * Get the user that owns the payment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Configure activity logging using Spatie
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'user_id',
                'amount',
                'payment_date',
                'status',
                'notes',
            ])
            ->logOnlyDirty()      // Hanya log perubahan
            ->dontSubmitEmptyLogs(); // Jangan log kosong
    }
}
