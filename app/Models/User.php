<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, LogsActivity, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'member_number',
        'full_name',
        'address',
        'phone',
        'join_date',
        'note',
        'image',
        'is_active',
    ];

    /**
     * Get the user's image URL with fallback to default avatar.
     *
     * If user has no image, return default user.svg from public folder.
     * If user has image, return full storage URL.
     *
     * Note: Image is stored as 'users/avatar-xxx.webp' in database,
     * so we prepend 'storage/' to get full public URL.
     */
    public function getImageUrlAttribute(): string
    {
        if (empty($this->attributes['image'])) {
            return asset('user.svg');
        }

        // Image is stored in the public disk under the 'users' folder and the
        // database only contains the filename (e.g. "avatar-xxx.webp").
        // Build the correct public URL: /storage/users/{filename}
        $filename = ltrim((string) $this->attributes['image'], '/');

        return asset('storage/users/'.$filename);
    }

    /**
     * Generate a unique member number for new users.
     * Format: M + 4 digits (e.g. M0001). Falls back to a random string if collisions persist.
     */
    public static function generateMemberNumber(): string
    {
        for ($i = 0; $i < 10; $i++) {
            $candidate = 'M'.str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT);

            if (! self::where('member_number', $candidate)->exists()) {
                return $candidate;
            }
        }

        // Fallback: unlikely collision case
        return 'M'.strtoupper(bin2hex(random_bytes(3)));
    }

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Append image_url to JSON serialization
     */
    protected $appends = ['image_url'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'join_date' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the payments for the user.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Configure activity logging using Spatie
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'name',
                'email',
                'role',
                'full_name',
                'is_active',
                'member_number',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
