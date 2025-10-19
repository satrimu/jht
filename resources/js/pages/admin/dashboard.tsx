import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { 
    Activity, 
    Users, 
    TrendingUp, 
    Calendar,
    DollarSign,
    Clock,
    AlertTriangle,
    XCircle,
    BarChart3
} from 'lucide-react';

interface GeneralReport {
    memberStats: {
        totalMembers: number;
        activeMembersThisMonth: number;
        inactiveMembersThisMonth: number;
        memberActivityRate: number;
        currentMonthName: string;
    };
    monthlyContribution: {
        totalAmount: number;
        totalPayments: number;
        averageAmount: number;
        currentMonthName: string;
        uniqueMembers: number;
    };
    globalContribution: {
        totalValidatedCount: number;
        totalValidatedAmount: number;
        statusBreakdown: {
            validated: { count: number; amount: number };
            pending: { count: number; amount: number };
            rejected: { count: number; amount: number };
        };
        topContributors: Array<{
            user_id: number;
            user_name: string;
            total_amount: number;
            payment_count: number;
        }>;
    };
    yearlyChart: {
        data: Array<{
            month: string;
            amount: number;
            count: number;
        }>;
        summary: {
            totalAmount: number;
            totalPayments: number;
            averageMonthly: number;
            periodMonths: number;
        };
    };
    currentYearChart: {
        data: Array<{
            month: string;
            monthFull: string;
            totalPayments: number;
            totalAmount: number;
        }>;
        summary: {
            totalPayments: number;
            totalAmount: number;
            averageMonthlyPayments: number;
            averageMonthlyAmount: number;
            monthsCovered: number;
            currentYear: number;
        };
    };
    summaryStats: {
        todayPayments: number;
        todayAmount: number;
        thisWeekPayments: number;
        thisWeekAmount: number;
        pendingPayments: number;
        pendingAmount: number;
        rejectedPayments: number;
        rejectedAmount: number;
    };
    recentPayments: Array<{
        id: number;
        user_name: string;
        member_number: string;
        amount: number;
        payment_date: string;
        status: string;
        created_at: string;
    }>;
    generatedAt: string;
}

interface AdminDashboardProps {
    breadcrumbs: Array<{
        title: string;
        href: string;
    }>;
    generalReport: GeneralReport;
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('id-ID').format(num);
};

export default function AdminDashboard({ breadcrumbs, generalReport }: AdminDashboardProps) {
    const {
        memberStats,
        monthlyContribution,
        globalContribution,
        yearlyChart,
        currentYearChart,
        summaryStats,
        recentPayments,
        generatedAt
    } = generalReport;

    // Quick stats for the top cards
    const quickStats = [
        {
            title: 'Total Anggota',
            value: formatNumber(memberStats.totalMembers),
            icon: Users,
            change: `${memberStats.memberActivityRate}% aktif bulan ini`,
            changeType: memberStats.memberActivityRate >= 80 ? 'positive' : 'warning',
        },
        {
            title: `Iuran ${monthlyContribution.currentMonthName}`,
            value: formatCurrency(monthlyContribution.totalAmount),
            icon: DollarSign,
            change: `${monthlyContribution.totalPayments} pembayaran`,
            changeType: 'positive',
        },
        {
            title: 'Rata-rata Iuran',
            value: formatCurrency(monthlyContribution.averageAmount),
            icon: TrendingUp,
            change: `dari ${formatNumber(monthlyContribution.totalPayments)} anggota`,
            changeType: 'neutral',
        },
        {
            title: 'Total Global',
            value: formatCurrency(globalContribution.totalValidatedAmount),
            icon: BarChart3,
            change: `${formatNumber(globalContribution.totalValidatedCount)} transaksi`,
            changeType: 'positive',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin - JHT" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Dashboard JHT
                        </h1>
                        <p className="text-muted-foreground">
                            Laporan Umum Jaminan Hari Tua - {new Date(generatedAt).toLocaleDateString('id-ID')}
                        </p>
                    </div>
                </div>

                {/* Quick Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {quickStats.map((stat) => (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stat.value}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    <span
                                        className={`${
                                            stat.changeType === 'positive'
                                                ? 'text-green-600'
                                                : stat.changeType === 'warning'
                                                  ? 'text-yellow-600'
                                                  : 'text-muted-foreground'
                                        }`}
                                    >
                                        {stat.change}
                                    </span>
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Chart Global Tahun Ini */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Chart Pembayaran Tahun {currentYearChart.summary.currentYear}</CardTitle>
                            <div className="text-sm text-muted-foreground">
                                Trend pembayaran bulanan {currentYearChart.summary.monthsCovered} bulan terakhir
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Chart */}
                                <ChartContainer 
                                    config={{
                                        totalPayments: {
                                            label: "Jumlah Pembayaran",
                                            color: "hsl(var(--chart-1))",
                                        },
                                    } satisfies ChartConfig}
                                    className="min-h-[320px]"
                                >
                                    <BarChart
                                        accessibilityLayer
                                        data={currentYearChart.data.map(item => ({
                                            month: item.month,
                                            totalPayments: item.totalPayments,
                                            fullMonth: item.monthFull,
                                            amount: item.totalAmount,
                                        }))}
                                        margin={{
                                            left: 20,
                                            right: 20,
                                            top: 20,
                                            bottom: 20,
                                        }}
                                    >
                                        <CartesianGrid 
                                            vertical={false} 
                                            stroke="hsl(var(--muted-foreground))"
                                            strokeDasharray="3 3"
                                            opacity={0.4}
                                        />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={12}
                                            fontSize={12}
                                            tickFormatter={(value) => value.slice(0, 3)}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            fontSize={12}
                                            tickFormatter={(value) => `${value}`}
                                        />
                                        <ChartTooltip
                                            cursor={{ fill: 'rgba(0, 0, 0, 0.1)', radius: 4 }}
                                            content={
                                                <ChartTooltipContent 
                                                    formatter={(value) => [
                                                        `${formatNumber(value as number)} pembayaran`,
                                                        "Jumlah Pembayaran"
                                                    ]}
                                                    labelFormatter={(label, payload) => {
                                                        const data = payload?.[0]?.payload;
                                                        return (
                                                            <div className="space-y-1">
                                                                <div className="font-medium">{data?.fullMonth || label}</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    Total: {formatCurrency(data?.amount || 0)}
                                                                </div>
                                                            </div>
                                                        );
                                                    }}
                                                />
                                            }
                                        />
                                        <Bar 
                                            dataKey="totalPayments" 
                                            fill="var(--color-totalPayments)" 
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={60}
                                        />
                                    </BarChart>
                                </ChartContainer>

                                {/* Summary Stats */}
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">
                                            {formatNumber(currentYearChart.summary.totalPayments)}
                                        </div>
                                        <div className="text-sm text-green-700 font-medium">Total Pembayaran</div>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {formatCurrency(currentYearChart.summary.totalAmount)}
                                        </div>
                                        <div className="text-sm text-blue-700 font-medium">Total Nilai</div>
                                    </div>
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {formatNumber(currentYearChart.summary.averageMonthlyPayments)}
                                        </div>
                                        <div className="text-sm text-purple-700 font-medium">Rata-rata/Bulan</div>
                                    </div>
                                </div>

                                {/* Trend Footer */}
                                <div className="flex items-center justify-center gap-2 text-sm">
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                    <span className="font-medium text-green-600">
                                        Rata-rata {formatNumber(currentYearChart.summary.averageMonthlyPayments)} pembayaran per bulan
                                    </span>
                                    <span className="text-muted-foreground">
                                        • {formatCurrency(currentYearChart.summary.averageMonthlyAmount)} per bulan
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Payments */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>10 Pembayaran Terakhir</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {recentPayments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-2 h-2 rounded-full ${
                                                payment.status === 'validated' ? 'bg-green-500' : 
                                                payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}></div>
                                            <div>
                                                <div className="font-medium text-sm">{payment.user_name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {payment.member_number} • {new Date(payment.payment_date).toLocaleDateString('id-ID')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-sm">{formatCurrency(payment.amount)}</div>
                                            <div className={`text-xs capitalize ${
                                                payment.status === 'validated' ? 'text-green-600' : 
                                                payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                                {payment.status === 'validated' ? 'Tervalidasi' : 
                                                 payment.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {recentPayments.length === 0 && (
                                    <div className="text-center text-muted-foreground py-4">
                                        Belum ada pembayaran
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Section */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Member Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistik Anggota</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {formatNumber(memberStats.totalMembers)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Total Anggota</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {memberStats.memberActivityRate}%
                                        </div>
                                        <div className="text-sm text-muted-foreground">Tingkat Aktivitas</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-green-600">
                                            {formatNumber(memberStats.activeMembersThisMonth)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Aktif Bulan Ini</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-red-600">
                                            {formatNumber(memberStats.inactiveMembersThisMonth)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Tidak Aktif</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ringkasan Aktivitas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium">Hari Ini</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold">{formatNumber(summaryStats.todayPayments)}</div>
                                        <div className="text-xs text-muted-foreground">{formatCurrency(summaryStats.todayAmount)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Activity className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium">Minggu Ini</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold">{formatNumber(summaryStats.thisWeekPayments)}</div>
                                        <div className="text-xs text-muted-foreground">{formatCurrency(summaryStats.thisWeekAmount)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-yellow-600" />
                                        <span className="text-sm font-medium">Menunggu</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-yellow-600">{formatNumber(summaryStats.pendingPayments)}</div>
                                        <div className="text-xs text-muted-foreground">{formatCurrency(summaryStats.pendingAmount)}</div>
                                    </div>
                                </div>
                                {summaryStats.rejectedPayments > 0 && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <XCircle className="h-4 w-4 text-red-600" />
                                            <span className="text-sm font-medium">Ditolak</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-red-600">{formatNumber(summaryStats.rejectedPayments)}</div>
                                            <div className="text-xs text-muted-foreground">{formatCurrency(summaryStats.rejectedAmount)}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Contributors */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top 5 Kontributor</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {globalContribution.topContributors.slice(0, 5).map((contributor, index) => (
                                    <div key={contributor.user_id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Badge variant={index === 0 ? "default" : "secondary"}>
                                                #{index + 1}
                                            </Badge>
                                            <div>
                                                <div className="font-medium text-sm">{contributor.user_name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatNumber(contributor.payment_count)} pembayaran
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-sm">{formatCurrency(contributor.total_amount)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Status Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Breakdown Status Pembayaran (Global)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {formatNumber(globalContribution.statusBreakdown.validated.count)}
                                </div>
                                <div className="text-sm text-green-600 font-medium">Tervalidasi</div>
                                <div className="text-xs text-muted-foreground">
                                    {formatCurrency(globalContribution.statusBreakdown.validated.amount)}
                                </div>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {formatNumber(globalContribution.statusBreakdown.pending.count)}
                                </div>
                                <div className="text-sm text-yellow-600 font-medium">Menunggu</div>
                                <div className="text-xs text-muted-foreground">
                                    {formatCurrency(globalContribution.statusBreakdown.pending.amount)}
                                </div>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">
                                    {formatNumber(globalContribution.statusBreakdown.rejected.count)}
                                </div>
                                <div className="text-sm text-red-600 font-medium">Ditolak</div>
                                <div className="text-xs text-muted-foreground">
                                    {formatCurrency(globalContribution.statusBreakdown.rejected.amount)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
