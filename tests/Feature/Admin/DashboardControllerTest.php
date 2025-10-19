<?php

use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'admin']);
    
    // Create some test users and payments
    $this->users = User::factory()->count(10)->create();
    
    // Create payments for current month
    $currentMonth = Carbon::now();
    foreach ($this->users as $user) {
        Payment::factory()->create([
            'user_id' => $user->id,
            'payment_date' => $currentMonth->format('Y-m-d'),
            'status' => 'validated',
            'amount' => 100000,
        ]);
    }
    
    // Create some payments for previous months
    for ($i = 1; $i <= 6; $i++) {
        $pastMonth = Carbon::now()->subMonths($i);
        foreach ($this->users->take(5) as $user) {
            Payment::factory()->create([
                'user_id' => $user->id,
                'payment_date' => $pastMonth->format('Y-m-d'),
                'status' => 'validated',
                'amount' => 95000 + ($i * 1000),
            ]);
        }
    }
});

it('displays dashboard with general report data', function () {
    $response = $this->actingAs($this->admin)
        ->get('/admin/dashboard');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/dashboard')
            ->has('generalReport')
            ->has('generalReport.memberStats')
            ->has('generalReport.monthlyContribution')
            ->has('generalReport.globalContribution')
            ->has('generalReport.yearlyChart')
            ->has('generalReport.summaryStats')
            ->has('generalReport.recentPayments')
            ->has('generalReport.generatedAt')
        );
});

it('calculates member statistics correctly', function () {
    $response = $this->actingAs($this->admin)
        ->get('/admin/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->where('generalReport.memberStats.totalMembers', 10) // Excluding user ID 1
        ->where('generalReport.memberStats.activeMembersThisMonth', 10) // All users have current month payment
        ->where('generalReport.memberStats.inactiveMembersThisMonth', 0)
        ->where('generalReport.memberStats.memberActivityRate', 100)
    );
});

it('calculates monthly contribution correctly', function () {
    $response = $this->actingAs($this->admin)
        ->get('/admin/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->where('generalReport.monthlyContribution.totalAmount', 1000000) // 10 users * 100,000
        ->where('generalReport.monthlyContribution.totalPayments', 10)
        ->where('generalReport.monthlyContribution.averageAmount', 100000)
        ->where('generalReport.monthlyContribution.uniqueMembers', 10) // 10 unique members paid
    );
});

it('calculates global contribution correctly', function () {
    $totalExpectedPayments = 10 + (5 * 6); // Current month + 6 previous months * 5 users each
    $totalExpectedAmount = 1000000 + (5 * (96000 + 97000 + 98000 + 99000 + 100000 + 101000));

    $response = $this->actingAs($this->admin)
        ->get('/admin/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->where('generalReport.globalContribution.totalValidatedCount', $totalExpectedPayments)
        ->where('generalReport.globalContribution.totalValidatedAmount', $totalExpectedAmount)
        ->has('generalReport.globalContribution.statusBreakdown')
        ->has('generalReport.globalContribution.topContributors')
    );
});

it('generates yearly chart data correctly', function () {
    $response = $this->actingAs($this->admin)
        ->get('/admin/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->has('generalReport.yearlyChart.data')
        ->has('generalReport.yearlyChart.summary')
        ->where('generalReport.yearlyChart.summary.periodMonths', 13) // 12 months + current partial month
    );
});

it('calculates summary statistics correctly', function () {
    // Create a payment for today
    Payment::factory()->create([
        'user_id' => $this->users->first()->id,
        'payment_date' => Carbon::today()->format('Y-m-d'),
        'status' => 'validated',
        'amount' => 50000,
    ]);

    // Create a pending payment
    Payment::factory()->create([
        'user_id' => $this->users->first()->id,
        'payment_date' => Carbon::today()->format('Y-m-d'),
        'status' => 'pending',
        'amount' => 75000,
    ]);

    $response = $this->actingAs($this->admin)
        ->get('/admin/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->has('generalReport.summaryStats.todayPayments')
        ->has('generalReport.summaryStats.todayAmount')
        ->has('generalReport.summaryStats.thisWeekPayments')
        ->has('generalReport.summaryStats.thisWeekAmount')
        ->has('generalReport.summaryStats.pendingPayments')
        ->has('generalReport.summaryStats.pendingAmount')
        ->has('generalReport.summaryStats.rejectedPayments')
        ->has('generalReport.summaryStats.rejectedAmount')
    );
});

it('excludes user ID 1 from member statistics', function () {
    // Create payment for admin user (should be excluded)
    Payment::factory()->create([
        'user_id' => $this->admin->id,
        'payment_date' => Carbon::now()->format('Y-m-d'),
        'status' => 'validated',
        'amount' => 999999,
    ]);

    $response = $this->actingAs($this->admin)
        ->get('/admin/dashboard');

    // Member count should still be 10 (excluding admin who is also user ID != 1 but role admin)
    $response->assertInertia(fn ($page) => $page
        ->where('generalReport.memberStats.totalMembers', 10)
    );
});

it('requires admin authentication', function () {
    $regularUser = User::factory()->create(['role' => 'user']);

    $response = $this->actingAs($regularUser)
        ->get('/admin/dashboard');

    $response->assertForbidden();
});

it('includes recent payments data', function () {
    $response = $this->actingAs($this->admin)
        ->get('/admin/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->has('generalReport.recentPayments')
        ->has('generalReport.recentPayments.0.id')
        ->has('generalReport.recentPayments.0.user_name')
        ->has('generalReport.recentPayments.0.amount')
        ->has('generalReport.recentPayments.0.status')
        ->has('generalReport.recentPayments.0.payment_date')
    );
});

it('handles empty data gracefully', function () {
    // Clear all payments
    Payment::truncate();
    
    // Clear all users except admin
    User::where('id', '!=', $this->admin->id)->delete();

    $response = $this->actingAs($this->admin)
        ->get('/admin/dashboard');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('generalReport')
            ->where('generalReport.memberStats.totalMembers', 0)
            ->where('generalReport.monthlyContribution.totalAmount', 0)
            ->where('generalReport.globalContribution.totalValidatedAmount', 0)
            ->where('generalReport.recentPayments', [])
        );
});