<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Settingapp\UpdateSettingappRequest;
use App\Models\SettingApp;
use App\Services\ImageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class SettingAppController extends Controller
{
    public function __construct(
        private readonly ImageService $imageService,
    ) {}

    /**
     * Show the settings form.
     */
    public function edit(): Response
    {
        $setting = SettingApp::first() ?? new SettingApp;

        return Inertia::render('admin/settingapp/Form', [
            'setting' => [
                'id' => $setting->id,
                'nama_app' => $setting->nama_app ?? '',
                'description' => $setting->description ?? '',
                'address' => $setting->address ?? '',
                'phone' => $setting->phone ?? '',
                'email' => $setting->email ?? '',
                'facebook' => $setting->facebook ?? '',
                'instagram' => $setting->instagram ?? '',
                'youtube' => $setting->youtube ?? '',
                'tiktok' => $setting->tiktok ?? '',
                'image' => $setting->image ?? null,
            ],
            'breadcrumbs' => [
                ['title' => 'Application Settings', 'href' => '/admin/settingsapp'],
            ],
        ]);
    }

    /**
     * Update the settings.
     */
    public function update(UpdateSettingappRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $setting = SettingApp::first();

        // Handle image upload with ImageService
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            // Delete old image if exists
            if ($setting && $setting->image) {
                $this->imageService->deleteImage($setting->image, 'images');
            }

            // Process and store new image using ImageService
            $filename = $this->imageService->processImage($data['image'], 'images', null, $data['nama_app'] ?? 'logo');

            if ($filename) {
                $data['image'] = $filename;
            } else {
                // If image processing fails, remove image from update
                unset($data['image']);
            }
        } else {
            // If image is not a file (null or empty), don't update it
            unset($data['image']);
        }

        if ($setting) {
            $setting->update($data);
        } else {
            SettingApp::create($data);
        }

        return redirect()->route('setting.edit')->with('success', 'Settings saved successfully!');
    }
}
