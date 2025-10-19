import AppLogo from '@/components/app-logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    Code2,
    Facebook,
    Github,
    Instagram,
    Palette,
    Settings,
    Shield,
    Sparkles,
    Users,
    Youtube,
    Zap,
} from 'lucide-react';

export default function Home() {
    const { auth, setting } = usePage<SharedData>().props;

    return (
        <>
            <Head
                title={
                    setting?.nama_app ? `${setting.nama_app} - Home` : 'Home'
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
                                        <Button asChild>
                                            <Link href={register()}>
                                                Get Started
                                            </Link>
                                        </Button>
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
                                Laravel 12 + React 19 + Inertia.js
                            </Badge>
                        </div>

                        <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 lg:text-6xl dark:text-white">
                            Modern Fullstack
                            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                                Starter Kit
                            </span>
                        </h1>

                        <p className="mb-10 text-xl leading-8 text-slate-600 dark:text-slate-300">
                            Starter kit fullstack modern yang menggabungkan
                            Laravel 12, React 19, dan Inertia.js dengan fokus
                            pada pemisahan yang jelas antara admin panel dan
                            public site.
                        </p>

                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            {!auth.user && (
                                <>
                                    <Button
                                        asChild
                                        size="lg"
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    >
                                        <Link href={register()}>
                                            <Zap className="mr-2 h-5 w-5" />
                                            Start Building
                                        </Link>
                                    </Button>
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
                                Tech Stack Modern
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300">
                                Dibangun dengan teknologi terdepan untuk
                                performa dan developer experience yang optimal
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Card className="border-0 bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                Laravel 12
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Backend
                                            </p>
                                        </div>
                                        <Badge
                                            className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                            variant="secondary"
                                        >
                                            Latest
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                React 19
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Frontend
                                            </p>
                                        </div>
                                        <Badge
                                            className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                            variant="secondary"
                                        >
                                            Latest
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                TypeScript
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Language
                                            </p>
                                        </div>
                                        <Badge
                                            className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                            variant="secondary"
                                        >
                                            Latest
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                Inertia.js
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Framework
                                            </p>
                                        </div>
                                        <Badge
                                            className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                                            variant="secondary"
                                        >
                                            Latest
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                Tailwind CSS
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Styling
                                            </p>
                                        </div>
                                        <Badge
                                            className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400"
                                            variant="secondary"
                                        >
                                            Latest
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                shadcn/ui
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Components
                                            </p>
                                        </div>
                                        <Badge
                                            className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                                            variant="secondary"
                                        >
                                            Latest
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
                                Fitur Lengkap & Powerful
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300">
                                Semua yang Anda butuhkan untuk membangun
                                aplikasi web modern
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            <Card className="border-0 bg-white shadow-lg dark:bg-slate-800">
                                <CardContent className="p-8">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                                        <Shield className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
                                        Authentication System
                                    </h3>
                                    <p className="mb-4 text-slate-600 dark:text-slate-300">
                                        Complete auth with 2FA, password reset,
                                        dan email verification menggunakan
                                        Laravel Fortify
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Two-Factor Auth
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Password Reset
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Email Verification
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
                                        Modern UI/UX
                                    </h3>
                                    <p className="mb-4 text-slate-600 dark:text-slate-300">
                                        Responsive design dengan dark mode
                                        support dan component-based architecture
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Dark Mode
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Mobile-First
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Accessibility
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-white shadow-lg dark:bg-slate-800">
                                <CardContent className="p-8">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
                                        Admin Panel
                                    </h3>
                                    <p className="mb-4 text-slate-600 dark:text-slate-300">
                                        Dashboard lengkap dengan sidebar
                                        navigation, user management, dan
                                        activity logging
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Dashboard
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            User Management
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Activity Logs
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
                                        Advanced Features
                                    </h3>
                                    <p className="mb-4 text-slate-600 dark:text-slate-300">
                                        Image processing, backup system, dan
                                        configuration management yang powerful
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Image Processing
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Auto Backup
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                            Configuration
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
                            Siap Memulai Project Anda?
                        </h2>
                        <p className="mb-10 text-xl text-slate-600 dark:text-slate-300">
                            Dapatkan starter kit lengkap dengan semua fitur
                            modern yang Anda butuhkan
                        </p>

                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            {!auth.user ? (
                                <>
                                    <Button
                                        asChild
                                        size="lg"
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    >
                                        <Link href={register()}>
                                            Mulai Sekarang
                                        </Link>
                                    </Button>
                                    <Button asChild size="lg" variant="outline">
                                        <a
                                            href="https://github.com/sdldev/fullstack-laravel-react-starter"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Github className="mr-2 h-5 w-5" />
                                            View on GitHub
                                        </a>
                                    </Button>
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
                                    <Button asChild size="lg" variant="outline">
                                        <a
                                            href="https://github.com/sdldev/fullstack-laravel-react-starter"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Github className="mr-2 h-5 w-5" />
                                            GitHub Repository
                                        </a>
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
                                    Laravel React Starter
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Built with ❤️ using Laravel, React, and the
                                amazing open source community
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
