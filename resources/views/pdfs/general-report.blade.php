<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Umum Iuran JHT</title>
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
            max-width: 900px;
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
            grid-template-columns: repeat(3, 1fr);
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
            width: 15%;
            font-weight: bold;
        }

        .monthly-count {
            width: 15%;
            text-align: right;
        }

        .monthly-members {
            width: 20%;
            text-align: right;
        }

        .monthly-amount {
            width: 25%;
            text-align: right;
        }

        .monthly-terbayar {
            width: 25%;
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
            <h1>LAPORAN UMUM IURAN JAMINAN HARI TUA (JHT)</h1>
            <p>Periode: {{ $period }}</p>
            <p>Tanggal Cetak: {{ now()->format('d F Y H:i') }}</p>
        </div>

        <!-- Status Summary -->
        <div class="section-title">Ringkasan Status Pembayaran</div>
        <div class="status-summary">
            <div class="status-box terbayar">
                <div class="label">Terbayar</div>
                <div class="value">{{ $generalStats['terbayar_payments'] }}</div>
                <div class="amount">Rp {{ number_format($generalStats['terbayar_amount'], 0, ',', '.') }}</div>
            </div>
            <div class="status-box pending">
                <div class="label">Menunggu</div>
                <div class="value">{{ $generalStats['pending_payments'] }}</div>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="section-title">Statistik Umum</div>
        <div class="summary-grid">
            <div class="summary-card">
                <div class="label">Total Anggota</div>
                <div class="value">{{ $generalStats['total_members'] }}</div>
                <div class="subtext">{{ $generalStats['active_members'] }} aktif</div>
            </div>
            <div class="summary-card">
                <div class="label">Total Pembayaran</div>
                <div class="value">{{ $generalStats['total_payments'] }}</div>
                <div class="subtext">transaksi</div>
            </div>
            <div class="summary-card">
                <div class="label">Total Nominal</div>
                <div class="value">Rp {{ number_format($generalStats['total_amount'], 0, ',', '.') }}</div>
                <div class="subtext">jumlah iuran</div>
            </div>
            <div class="summary-card">
                <div class="label">Rata-rata Pembayaran</div>
                <div class="value">Rp {{ number_format($generalStats['average_amount'], 0, ',', '.') }}</div>
                <div class="subtext">per transaksi</div>
            </div>
            <div class="summary-card">
                <div class="label">Rata-rata per Anggota</div>
                <div class="value">
                    @if($generalStats['total_members'] > 0)
                        Rp {{ number_format($generalStats['total_amount'] / $generalStats['total_members'], 0, ',', '.') }}
                    @else
                        Rp 0
                    @endif
                </div>
                <div class="subtext">per anggota</div>
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
                <div class="monthly-count">Pembayaran</div>
                <div class="monthly-members">Anggota Aktif</div>
                <div class="monthly-amount">Total Iuran</div>
                <div class="monthly-terbayar">Terbayar</div>
            </div>
            @foreach($monthlyBreakdown as $month)
                <div class="monthly-row">
                    <div class="monthly-month">{{ $month['month_name'] }}</div>
                    <div class="monthly-count">{{ $month['total_payments'] }}</div>
                    <div class="monthly-members">{{ $month['unique_members'] }}</div>
                    <div class="monthly-amount">Rp {{ number_format($month['total_amount'], 0, ',', '.') }}</div>
                    <div class="monthly-terbayar">Rp {{ number_format($month['terbayar_amount'], 0, ',', '.') }}</div>
                </div>
            @endforeach
        </div>

        <!-- Summary Members Table -->
        <div class="section-title">Ringkasan per Anggota</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 5%">No</th>
                    <th style="width: 25%">Nama Anggota</th>
                    <th style="width: 20%">Email</th>
                    <th style="width: 15%; text-align: right;">Total Iuran</th>
                    <th style="width: 15%; text-align: right;">Terbayar</th>
                    <th style="width: 15%; text-align: right;">Pending</th>
                    <th style="width: 5%; text-align: center;">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                @forelse($members as $index => $member)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $member['full_name'] }}</td>
                        <td>{{ $member['email'] }}</td>
                        <td class="text-right">Rp {{ number_format($member['total_amount'] ?? 0, 0, ',', '.') }}</td>
                        <td class="text-right">Rp {{ number_format($member['terbayar_amount'] ?? 0, 0, ',', '.') }}</td>
                        <td class="text-right">Rp {{ number_format($member['pending_amount'] ?? 0, 0, ',', '.') }}</td>
                        <td class="text-center">{{ $member['payment_count'] ?? 0 }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="text-center">Tidak ada data anggota</td>
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
