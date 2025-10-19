import AppLogo from '@/components/app-logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    Code2,
    Facebook,
    Instagram,
    Palette,
    Settings,
    Shield,
    Sparkles,
    Users,
    Youtube,
} from 'lucide-react';

export default function Home() {
    const { auth, setting } = usePage<SharedData>().props;

    return (
        <>
            <Head
                title={
                    setting?.nama_app
                        ? `${setting.nama_app} - Jaminan Hari Tua`
                        : 'Jaminan Hari Tua (JHT)'
                }
            >
                <meta
                    name="description"
                    content={
                        setting?.description ||
                        'Modern fullstack starter kit...'
                    }
                />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
                {/* Navigation */}
                <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <AppLogo />
                            </div>

                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Button asChild variant="default">
                                        <Link href={dashboard()}>
                                            <Settings className="mr-2 h-4 w-4" />
                                            Dashboard
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button asChild variant="ghost">
                                            <Link href={login()}>Login</Link>
                                        </Button>
                                        {/* <Button asChild>
                                            <Link href={register()}>
                                                Get Started
                                            </Link>
                                        </Button> */}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative px-6 py-24 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-8 flex justify-center">
                            <Badge
                                variant="secondary"
                                className="px-4 py-2 text-sm font-medium"
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Sistem Manajemen Iuran Jaminan Hari Tua
                            </Badge>
                        </div>

                        <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 lg:text-6xl dark:text-white">
                            Aplikasi Jaminan
                            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                                Hari Tua (JHT)
                            </span>
                        </h1>

                        <p className="mb-10 text-xl leading-8 text-slate-600 dark:text-slate-300">
                            Sistem manajemen iuran rutin bulanan untuk program
                            Jaminan Hari Tua. Kelola pembayaran anggota,
                            validasi admin, dan laporan keuangan yang akurat.
                        </p>

                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            {!auth.user && (
                                <>
                                    {/* Register disabled - only admins can create users */}
                                    {/* <Button
                                        asChild
                                        size="lg"
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    >
                                        <Link href={register()}>
                                            <Zap className="mr-2 h-5 w-5" />
                                            Start Building
                                        </Link>
                                    </Button> */}
                                    <Button asChild size="lg" variant="outline">
                                        <Link href={login()}>
                                            Login to Dashboard
                                        </Link>
                                    </Button>
                                </>
                            )}
                            {auth.user && (
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    <Link href={dashboard()}>
                                        <Settings className="mr-2 h-5 w-5" />
                                        Go to Dashboard
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Tech Stack */}
                <section className="px-6 py-16 lg:px-8">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">
                                Fitur Utama Aplikasi JHT
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300">
                                Kelola iuran anggota, validasi pembayaran, dan
                                monitoring program Jaminan Hari Tua dengan mudah
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Card className="border-0 bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                Manajemen Anggota
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Kelola data anggota JHT
                                            </p>
                                        </div>
                                        <Badge
                                            className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                            variant="secondary"
                                        >
                                            Lengkap
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                Setoran Iuran
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Upload bukti pembayaran
                                            </p>
                                        </div>
                                        <Badge
                                            className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                            variant="secondary"
                                        >
                                            Online
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                Validasi Admin
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Approve/reject pembayaran
                                            </p>
                                        </div>
                                        <Badge
                                            className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                                            variant="secondary"
                                        >
                                            Aman
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                Dashboard Laporan
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Monitoring & statistik
                                            </p>
                                        </div>
                                        <Badge
                                            className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400"
                                            variant="secondary"
                                        >
                                            Real-time
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                Laporan Individual
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Riwayat iuran per anggota
                                            </p>
                                        </div>
                                        <Badge
                                            className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                                            variant="secondary"
                                        >
                                            Detail
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                Laporan General
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Laporan keseluruhan sistem
                                            </p>
                                        </div>
                                        <Badge
                                            className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                                            variant="secondary"
                                        >
                                            Komprehensif
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="bg-slate-50 px-6 py-16 lg:px-8 dark:bg-slate-900/50">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">
                                Fitur Unggulan JHT
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300">
                                Sistem lengkap untuk mengelola program Jaminan
                                Hari Tua dengan fitur modern dan aman
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            <Card className="border-0 bg-white shadow-lg dark:bg-slate-800">
                                <CardContent className="p-8">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
                                        Manajemen Anggota Terintegrasi
                                    </h3>
                                    <p className="mb-4 text-slate-600 dark:text-slate-300">
                                        Sistem lengkap untuk mengelola data
                                        anggota JHT dengan profil lengkap dan
                                        riwayat pembayaran
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Registrasi Online
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Profil Lengkap
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Riwayat Aktivitas
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-white shadow-lg dark:bg-slate-800">
                                <CardContent className="p-8">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                                        <Shield className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
                                        Sistem Pembayaran Aman
                                    </h3>
                                    <p className="mb-4 text-slate-600 dark:text-slate-300">
                                        Proses setoran iuran dengan upload bukti
                                        pembayaran dan validasi admin untuk
                                        keamanan maksimal
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Upload Bukti Bayar
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Validasi Admin
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Status Real-time
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-white shadow-lg dark:bg-slate-800">
                                <CardContent className="p-8">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                                        <Settings className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
                                        Dashboard Admin Lengkap
                                    </h3>
                                    <p className="mb-4 text-slate-600 dark:text-slate-300">
                                        Panel admin dengan fitur validasi
                                        pembayaran, input manual, dan laporan
                                        komprehensif untuk monitoring program
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Validasi Pembayaran
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Input Manual
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Laporan Detail
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-white shadow-lg dark:bg-slate-800">
                                <CardContent className="p-8">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                                        <Palette className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
                                        Laporan & Analitik Modern
                                    </h3>
                                    <p className="mb-4 text-slate-600 dark:text-slate-300">
                                        Dashboard dengan chart interaktif,
                                        statistik real-time, dan laporan
                                        individual untuk monitoring performa
                                        program
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Chart Interaktif
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Statistik Real-time
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Export Data
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-6 py-24 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <h2 className="mb-6 text-4xl font-bold text-slate-900 dark:text-white">
                            Siap Mengelola Program JHT Anda?
                        </h2>
                        <p className="mb-10 text-xl text-slate-600 dark:text-slate-300">
                            Dapatkan sistem manajemen Jaminan Hari Tua yang
                            lengkap dengan fitur modern untuk mengelola iuran
                            anggota dan laporan keuangan yang akurat.
                        </p>

                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            {!auth.user ? (
                                <>
                                    {/* <Button
                                        asChild
                                        size="lg"
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    >
                                        <Link href={register()}>
                                            Mulai Sekarang
                                        </Link>
                                    </Button> */}
                                </>
                            ) : (
                                <>
                                    <Button
                                        asChild
                                        size="lg"
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    >
                                        <Link href={dashboard()}>
                                            <Settings className="mr-2 h-5 w-5" />
                                            Go to Dashboard
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Contact & Social Section */}
                <section className="bg-white px-6 py-12 lg:px-8 dark:bg-slate-900">
                    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
                        <div>
                            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                                Contact Us
                            </h3>
                            {setting?.address && (
                                <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">
                                    {setting.address}
                                </p>
                            )}
                            {setting?.email && (
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Email:{' '}
                                    <a
                                        href={`mailto:${setting.email}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {setting.email}
                                    </a>
                                </p>
                            )}
                            {setting?.phone && (
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Phone:{' '}
                                    <a
                                        href={`tel:${setting.phone}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {setting.phone}
                                    </a>
                                </p>
                            )}
                        </div>
                        <div>
                            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                                Follow Us
                            </h3>
                            <div className="flex space-x-4">
                                {setting?.facebook && (
                                    <a
                                        href={setting.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-600 hover:text-blue-600 dark:text-slate-400"
                                    >
                                        <Facebook className="h-6 w-6" />
                                    </a>
                                )}
                                {setting?.instagram && (
                                    <a
                                        href={setting.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-600 hover:text-pink-500 dark:text-slate-400"
                                    >
                                        <Instagram className="h-6 w-6" />
                                    </a>
                                )}
                                {setting?.youtube && (
                                    <a
                                        href={setting.youtube}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-600 hover:text-red-600 dark:text-slate-400"
                                    >
                                        <Youtube className="h-6 w-6" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                        <div className="text-center">
                            <div className="mb-4 flex items-center justify-center space-x-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                                    <Code2 className="h-5 w-5 text-white" />
                                </div>
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
                                    Santrimu.com | JHT Management System
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Built with ❤️ untuk program Jaminan Hari Tua
                                menggunakan Laravel, React, dan teknologi modern
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
