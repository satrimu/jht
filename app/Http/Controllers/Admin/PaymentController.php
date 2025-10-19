<?php

namespace App\Http\Controllers\Admin;

use Exception;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePaymentRequest;
use App\Http\Requests\Admin\UpdatePaymentRequest;
use App\Models\Payment;
use App\Models\User;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentRepositoryInterface $repo,
        private readonly ImageService $imageService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $payments = $this->repo->paginateWithRelations($perPage);
        $users = User::select('id', 'full_name', 'member_number')->get();

        $breadcrumbs = [
            ['title' => 'Dashboard', 'href' => '/admin/dashboard'],
            ['title' => 'Payments', 'href' => '/admin/payments'],
        ];

        return Inertia::render('admin/payments/Index', ['payments' => $payments, 'users' => $users, 'breadcrumbs' => $breadcrumbs]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePaymentRequest $request)
    {
        $data = $request->validated();

        // Handle image upload if present
        if ($request->hasFile('image')) {
            try {
                $filename = $this->imageService->processImageWithDimensions(
                    $request->file('image'),
                    storagePath: 'payments', // Storage folder
                    width: 800,              // Target width
                    height: 600,             // WebP quality
                    prefix: 'payment',
                    // Target height
                    quality: 85        // Filename prefix
                );
                $data['image'] = $filename;
            } catch (Exception) {
                return redirect()->back()->withErrors(['image' => 'Failed to process image']);
            }
        }

        $this->repo->create($data);

        return redirect()->route('admin.payments.index')
            ->with('success', 'Payment berhasil dibuat!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Payment $payment)
    {
        // Eager load the user relationship
        $payment->load('user');

        $breadcrumbs = [
            ['title' => 'Dashboard', 'href' => '/admin/dashboard'],
            ['title' => 'Payments', 'href' => '/admin/payments'],
            ['title' => 'Payment Details', 'href' => "/admin/payments/{$payment->id}"],
        ];

        return Inertia::render('admin/payments/Show', ['payment' => $payment, 'breadcrumbs' => $breadcrumbs]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePaymentRequest $request, Payment $payment)
    {
        $data = $request->validated();

        // Handle image upload if present
        if ($request->hasFile('image')) {
            try {
                // Delete old image if exists
                if ($payment->image) {
                    $this->imageService->deleteImage($payment->image, 'payments');
                }

                $filename = $this->imageService->processImageWithDimensions(
                    $request->file('image'),
                    storagePath: 'payments',
                    width: 800,
                    height: 600,
                    prefix: 'payment',
                    quality: 85
                );
                $data['image'] = $filename;
            } catch (Exception) {
                return redirect()->back()->withErrors(['image' => 'Failed to process image']);
            }
        }

        $this->repo->update($payment, $data);

        return redirect()->route('admin.payments.index')
            ->with('success', 'Payment berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Payment $payment)
    {
        // Delete image if exists
        if ($payment->image) {
            $this->imageService->deleteImage($payment->image, 'payments');
        }

        $this->repo->delete($payment);

        return redirect()->route('admin.payments.index')
            ->with('success', 'Payment berhasil dihapus!');
    }
}
