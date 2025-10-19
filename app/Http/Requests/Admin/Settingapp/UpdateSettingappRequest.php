<?php

namespace App\Http\Requests\Admin\Settingapp;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingappRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_app' => [
                'required',
                'string',
                'max:255',
                'min:3',
            ],
            'description' => 'required|string|max:255|min:3',
            'address' => 'required|string|max:255|min:3',
            'email' => 'required|email|max:255|min:3',
            'phone' => 'required|string|max:20|min:3',
            'facebook' => 'nullable|string|max:255|min:3',
            'instagram' => 'nullable|string|max:255|min:3',
            'tiktok' => 'nullable|string|max:255|min:3',
            'youtube' => 'nullable|string|max:255|min:3',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'nama_app.required' => 'Nama Applikasi wajib diisi.',
            'nama_app.string' => 'Nama Applikasi harus berupa teks.',
            'nama_app.max' => 'Nama Applikasi tidak boleh lebih dari 255 karakter.',
            'nama_app.unique' => 'Nama Applikasi sudah digunakan, silakan pilih yang lain.',
            'nama_app.min' => 'Nama Applikasi minimal 3 karakter.',
            'description.required' => 'Deskripsi wajib diisi.',
            'description.string' => 'Deskripsi harus berupa teks.',
            'description.max' => 'Deskripsi tidak boleh lebih dari 255 karakter.',
            'description.min' => 'Deskripsi minimal 3 karakter.',
            'address.required' => 'Alamat wajib diisi.',
            'address.string' => 'Alamat harus berupa teks.',
            'address.max' => 'Alamat tidak boleh lebih dari 255 karakter.',
            'address.min' => 'Alamat minimal 3 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Email harus berupa alamat email yang valid.',
            'email.max' => 'Email tidak boleh lebih dari 255 karakter.',
            'email.min' => 'Email minimal 3 karakter.',
            'phone.required' => 'Nomor telepon wajib diisi.',
            'phone.string' => 'Nomor telepon harus berupa teks.',
            'phone.max' => 'Nomor telepon tidak boleh lebih dari 20 karakter.',
            'phone.min' => 'Nomor telepon minimal 3 karakter.',
            'facebook.string' => 'Facebook harus berupa teks.',
            'facebook.max' => 'Facebook tidak boleh lebih dari 255 karakter.',
            'facebook.min' => 'Facebook minimal 3 karakter.',
            'instagram.string' => 'Instagram harus berupa teks.',
            'instagram.max' => 'Instagram tidak boleh lebih dari 255 karakter.',
            'instagram.min' => 'Instagram minimal 3 karakter.',
            'tiktok.string' => 'TikTok harus berupa teks.',
            'tiktok.max' => 'TikTok tidak boleh lebih dari 255 karakter.',
            'tiktok.min' => 'TikTok minimal 3 karakter.',
            'youtube.string' => 'YouTube harus berupa teks.',
            'youtube.max' => 'YouTube tidak boleh lebih dari 255 karakter.',
            'youtube.min' => 'YouTube minimal 3 karakter.',
            'image.image' => 'Gambar harus berupa file gambar.',
            'image.mimes' => 'Gambar harus berformat jpeg, png, jpg, atau webp.',
            'image.max' => 'Gambar tidak boleh lebih dari 2MB.',

        ];
    }

    public function attributes(): array
    {
        return [
            'nama_app' => 'nama program',
            'description' => 'deskripsi',
            'address' => 'alamat',
            'email' => 'email',
            'phone' => 'nomor telepon',
            'facebook' => 'facebook',
            'instagram' => 'instagram',
            'tiktok' => 'tiktok',
            'youtube' => 'youtube',
            'image' => 'logo applikasi',
        ];
    }
}
