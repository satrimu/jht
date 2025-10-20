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
            margin-bottom: 10px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
        }

        .header .app-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 3px;
        }

        .header .app-info {
            font-size: 10px;
            color: #666;
            margin-bottom: 8px;
        }

        .header h1 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 3px;
        }

        .header p {
            font-size: 10px;
            margin: 2px 0;
            color: #666;
        }

        .info-section {
            margin-bottom: 15px;
        }

        .info-row {
            width: 100%;
        }

        .user-info {
            float: left;
            width: 48%;
            background: #f5f5f5;
            padding: 12px;
            border-radius: 4px;
            margin-right: 4%;
            box-sizing: border-box;
        }

        .user-info p {
            margin: 3px 0;
            font-size: 11px;
        }

        .user-info strong {
            font-weight: bold;
            width: 70px;
            display: inline-block;
        }

        .total-iuran {
            float: left;
            width: 48%;
            background: #e8f5e9;
            border-left: 4px solid #10b981;
            padding: 12px;
            border-radius: 3px;
            box-sizing: border-box;
        }

        .total-iuran p {
            margin: 3px 0;
            font-size: 11px;
        }

        .total-iuran .label {
            color: #666;
            font-size: 10px;
        }

        .total-iuran .value {
            font-size: 18px;
            font-weight: bold;
            color: #10b981;
            margin: 5px 0;
        }

        .info-section::after {
            content: "";
            display: table;
            clear: both;
        }

        .section-title {
            font-size: 12px;
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 10px;
            background: #e0e0e0;
            padding: 8px;
            border-radius: 3px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
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

        .footer {
            margin-top: 20px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
            text-align: center;
            font-size: 9px;
            color: #666;
        }

        .empty-state {
            text-align: center;
            padding: 20px;
            color: #999;
            font-size: 11px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="app-name">{{ config('app.name') }}</div>
            <div class="app-info">Sistem Laporan Iuran Jaminan Hari Tua</div>
            <h1>LAPORAN IURAN JAMINAN HARI TUA (JHT)</h1>
            <p>Periode: {{ $period }}</p>
        </div>

        <!-- Info Section (2 Columns) -->
        <div class="info-section">
            <!-- User Info -->
            <div class="user-info">
                <p><strong>Nama:</strong> {{ $user->full_name }}</p>
                <p><strong>Email:</strong> {{ $user->email }}</p>
                <p><strong>Member:</strong> {{ $user->member_number ?? '-' }}</p>
                <p><strong>Sejak:</strong> {{ $user->created_at->format('d F Y') }}</p>
            </div>

            <!-- Total Iuran -->
            <div class="total-iuran">
                <p class="label">Total Iuran Terbayar {{ $year }}</p>
                <p class="value">Rp {{ number_format($userReport['amount_summary']['terbayar'], 0, ',', '.') }}</p>
                <p style="font-size: 10px; color: #666;">
                    {{ $userReport['status_summary']['terbayar'] }} terbayar / {{ $userReport['status_summary']['pending'] }} pending
                </p>
            </div>
        </div>

        <!-- Payments Table -->
        @if($userReport['payments']->count() > 0)
            <table>
                <thead>
                    <tr>
                        <th style="width: 12%">Tanggal</th>
                        <th style="width: 18%" class="text-right">Nominal</th>
                        <th style="width: 12%" class="text-center">Status</th>
                        <th style="width: 42%">Catatan</th>
                        <th style="width: 16%" class="text-center">Dibuat</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($userReport['payments'] as $payment)
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
                    @endforeach
                </tbody>
            </table>
        @else
            <div class="empty-state">
                Tidak ada pembayaran dalam tahun {{ $year }}
            </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <p>Dokumen ini dicetak secara otomatis oleh sistem {{ config('app.name') }}.</p>
            <p>Data yang ditampilkan dalam dokumen ini berdasarkan keadaan nyata pada database.</p>
            <p>Dokumen ini hanya untuk keperluan internal.</p>
            <p>Waktu Cetak: {{ now()->format('d F Y H:i:s') }}</p>
        </div>
    </div>
</body>
</html>
