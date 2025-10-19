<?php

namespace App\Http\Requests\Admin\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === 'admin';
    }

    public function rules(): array
    {
        $userId = $this->route('user')->id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users', 'name')->ignore($userId),
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|string|in:admin,user',
            'member_number' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users', 'member_number')->ignore($userId),
            ],
            'full_name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'phone' => 'required|string|max:20',
            'join_date' => 'required|date',
            'note' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB max
            'is_active' => 'required|boolean',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'Nama',
            'email' => 'Email',
            'password' => 'Password',
            'role' => 'Role',
            'member_number' => 'Nomor Anggota',
            'full_name' => 'Nama Lengkap',
            'address' => 'Alamat',
            'phone' => 'Telepon',
            'join_date' => 'Tanggal Bergabung',
            'note' => 'Catatan',
            'image' => 'Gambar',
            'is_active' => 'Status ',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => ':attribute wajib diisi.',
            'name.unique' => ':attribute sudah terdaftar.',
            'email.required' => ':attribute wajib diisi.',
            'email.email' => ':attribute harus berupa alamat email yang valid.',
            'email.unique' => ':attribute sudah terdaftar.',
            'password.min' => ':attribute harus terdiri dari minimal :min karakter.',
            'password.confirmed' => ':attribute konfirmasi tidak cocok.',
            'role.required' => ':attribute wajib diisi.',
            'role.in' => ':attribute yang dipilih tidak valid.',
            'member_number.unique' => ':attribute sudah terdaftar.',
            'member_number.required' => ':attribute wajib diisi.',
            'full_name.required' => ':attribute wajib diisi.',
            'address.required' => ':attribute wajib diisi.',
            'phone.required' => ':attribute wajib diisi.',
            'join_date.date' => ':attribute harus berupa tanggal yang valid.',
            'note.max' => ':attribute tidak boleh lebih dari :max karakter.',
            'image.image' => ':attribute harus berupa gambar.',
            'image.mimes' => ':attribute harus berupa file dengan tipe: :values.',
            'image.max' => ':attribute tidak boleh lebih dari :max kilobyte.',
        ];
    }
}
