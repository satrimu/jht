<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan {{ $user->full_name }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            font-size: 11px;
            color: #333;
            line-height: 1.4;
        }

        .container {
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
        }

        .header h1 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .header p {
            font-size: 10px;
            margin: 2px 0;
        }

        .user-info {
            margin-bottom: 20px;
            background: #f5f5f5;
            padding: 12px;
            border-radius: 4px;
        }

        .user-info p {
            margin: 4px 0;
            font-size: 11px;
        }

        .section-title {
            font-size: 13px;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
            background: #e0e0e0;
            padding: 8px;
            border-radius: 3px;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 20px;
        }

        .summary-card {
            background: #f9f9f9;
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 3px;
        }

        .summary-card .label {
            font-size: 10px;
            color: #666;
            margin-bottom: 4px;
        }

        .summary-card .value {
            font-size: 14px;
            font-weight: bold;
            color: #000;
        }

        .summary-card .subtext {
            font-size: 9px;
            color: #999;
            margin-top: 2px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 10px;
        }

        table thead {
            background: #333;
            color: #fff;
        }

        table th {
            padding: 8px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #333;
        }

        table td {
            padding: 8px;
            border: 1px solid #ddd;
        }

        table tbody tr:nth-child(even) {
            background: #f9f9f9;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .badge {
            display: inline-block;
            padding: 2px 6px;
            font-size: 9px;
            border-radius: 2px;
            font-weight: bold;
        }

        .badge-terbayar {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .badge-pending {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeeba;
        }

        .monthly-summary {
            margin-bottom: 20px;
        }

        .monthly-row {
            display: flex;
            justify-content: space-between;
            padding: 6px;
            border-bottom: 1px solid #eee;
        }

        .monthly-row:nth-child(even) {
            background: #f9f9f9;
        }

        .monthly-month {
            width: 20%;
            font-weight: bold;
        }

        .monthly-count {
            width: 15%;
            text-align: right;
        }

        .monthly-amount {
            width: 30%;
            text-align: right;
        }

        .monthly-terbayar {
            width: 35%;
            text-align: right;
        }

        .footer {
            margin-top: 30px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
            text-align: center;
            font-size: 9px;
            color: #666;
        }

        .page-break {
            page-break-after: always;
        }

        .status-summary {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 20px;
        }

        .status-box {
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 3px;
        }

        .status-box.terbayar {
            border-left: 4px solid #10b981;
        }

        .status-box.pending {
            border-left: 4px solid #f59e0b;
        }

        .status-box .label {
            font-size: 10px;
            color: #666;
            margin-bottom: 4px;
        }

        .status-box .value {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 4px;
        }

        .status-box .amount {
            font-size: 11px;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>LAPORAN IURAN JAMINAN HARI TUA (JHT)</h1>
            <p>Periode: {{ $period }}</p>
            <p>Tanggal Cetak: {{ now()->format('d F Y H:i') }}</p>
        </div>

        <!-- User Info -->
        <div class="user-info">
            <p><strong>Nama Anggota:</strong> {{ $user->full_name }}</p>
            <p><strong>Email:</strong> {{ $user->email }}</p>
            <p><strong>Member Number:</strong> {{ $user->member_number ?? '-' }}</p>
            <p><strong>Anggota Sejak:</strong> {{ $user->created_at->format('d F Y') }}</p>
        </div>

        <!-- Status Summary -->
        <div class="section-title">Ringkasan Status Pembayaran</div>
        <div class="status-summary">
            <div class="status-box terbayar">
                <div class="label">Terbayar</div>
                <div class="value">{{ $userReport['status_summary']['terbayar'] }}</div>
                <div class="amount">Rp {{ number_format($userReport['amount_summary']['terbayar'], 0, ',', '.') }}</div>
            </div>
            <div class="status-box pending">
                <div class="label">Menunggu</div>
                <div class="value">{{ $userReport['status_summary']['pending'] }}</div>
                <div class="amount">Rp {{ number_format($userReport['amount_summary']['pending'], 0, ',', '.') }}</div>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="section-title">Ringkasan Pembayaran</div>
        <div class="summary-grid">
            <div class="summary-card">
                <div class="label">Total Pembayaran</div>
                <div class="value">{{ $userReport['status_summary']['total'] }}</div>
                <div class="subtext">transaksi pembayaran</div>
            </div>
            <div class="summary-card">
                <div class="label">Total Nominal</div>
                <div class="value">Rp {{ number_format($userReport['amount_summary']['total'], 0, ',', '.') }}</div>
                <div class="subtext">jumlah pembayaran</div>
            </div>
            <div class="summary-card">
                <div class="label">Rata-rata Pembayaran</div>
                <div class="value">
                    @if($userReport['status_summary']['total'] > 0)
                        Rp {{ number_format($userReport['amount_summary']['total'] / $userReport['status_summary']['total'], 0, ',', '.') }}
                    @else
                        Rp 0
                    @endif
                </div>
                <div class="subtext">per transaksi</div>
            </div>
            <div class="summary-card">
                <div class="label">Periode Laporan</div>
                <div class="value">{{ $year }}</div>
                <div class="subtext">tahun pelaporan</div>
            </div>
        </div>

        <!-- Monthly Breakdown -->
        <div class="section-title">Ringkasan Bulanan {{ $year }}</div>
        <div class="monthly-summary">
            <div class="monthly-row" style="background: #e0e0e0; font-weight: bold;">
                <div class="monthly-month">Bulan</div>
                <div class="monthly-count">Jumlah</div>
                <div class="monthly-amount">Total</div>
                <div class="monthly-terbayar">Terbayar</div>
            </div>
            @foreach($userReport['monthly_breakdown'] as $month)
                <div class="monthly-row">
                    <div class="monthly-month">{{ $month['month_name'] }}</div>
                    <div class="monthly-count">{{ $month['payment_count'] }}</div>
                    <div class="monthly-amount">Rp {{ number_format($month['total_amount'], 0, ',', '.') }}</div>
                    <div class="monthly-terbayar">Rp {{ number_format($month['terbayar_amount'], 0, ',', '.') }}</div>
                </div>
            @endforeach
        </div>

        <!-- Payments Table -->
        <div class="section-title">Detail Pembayaran {{ $year }}</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 12%">Tanggal</th>
                    <th style="width: 15%" class="text-right">Nominal</th>
                    <th style="width: 12%" class="text-center">Status</th>
                    <th style="width: 35%">Catatan</th>
                    <th style="width: 26%" class="text-center">Dibuat</th>
                </tr>
            </thead>
            <tbody>
                @forelse($userReport['payments'] as $payment)
                    <tr>
                        <td>{{ \Carbon\Carbon::parse($payment->payment_date)->format('d/m/Y') }}</td>
                        <td class="text-right">Rp {{ number_format($payment->amount, 0, ',', '.') }}</td>
                        <td class="text-center">
                            @if($payment->status === 'terbayar')
                                <span class="badge badge-terbayar">Terbayar</span>
                            @else
                                <span class="badge badge-pending">Menunggu</span>
                            @endif
                        </td>
                        <td>{{ $payment->notes ?? '-' }}</td>
                        <td class="text-center">{{ \Carbon\Carbon::parse($payment->created_at)->format('d/m/Y H:i') }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="text-center">Tidak ada pembayaran dalam tahun {{ $year }}</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <!-- Footer -->
        <div class="footer">
            <p>Dokumen ini dicetak secara otomatis oleh sistem Jaminan Hari Tua (JHT)</p>
            <p>Waktu Cetak: {{ now()->format('d F Y H:i:s') }}</p>
        </div>
    </div>
</body>
</html>
