<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class SettingApp extends Model
{
    protected $table = 'settingapp';

    protected $fillable = [

        'nama_app',
        'description',
        'address',
        'email',
        'phone',
        'facebook',
        'instagram',
        'tiktok',
        'youtube',
        'image',
    ];

    public function getImageAttribute(?string $image): ?string
    {
        if (in_array($image, [null, '', '0'], true)) {
            return null;
        }

        if (Storage::disk('public')->exists('images/'.$image)) {
            return asset('storage/images/'.$image);
        }
        return null;

    }

    // Sanitize text fields to prevent XSS when used in views
    public function getNamaAppAttribute($value): string|array|int|float|false|null
    {
        return $value ? strip_tags(trim((string) $value)) : $value;
    }

    public function getDescriptionAttribute($value): string|array|int|float|false|null
    {
        return $value ? strip_tags(trim((string) $value)) : $value;
    }
}
