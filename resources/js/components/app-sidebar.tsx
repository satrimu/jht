import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type MainNavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Cog,
    Dot,
    HandCoins,
    LayoutGrid,
    Shield,
    Users,
    Wrench,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: MainNavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Iuran',
        href: '/admin/payments',
        icon: HandCoins,
    },
    // {
    //     title: 'Kategori',
    //     href: '/admin/categories',
    //     icon: Users,
    // },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'App setting',
        href: '/admin/settingsapp',
        icon: Cog,
    },
    {
        title: 'Config',
        icon: Wrench,
        subitem: [
            {
                title: 'Profile',
                href: '/settings/profile',
                icon: Dot,
            },
            {
                title: 'Password',
                href: '/settings/password',
                icon: Dot,
            },
            {
                title: 'Two Factor Authentication',
                href: '/settings/two-factor',
                icon: Dot,
            },
            {
                title: 'Theme',
                href: '/settings/appearance',
                icon: Dot,
            },
        ],
    },
    {
        title: 'Security Logs',
        icon: Shield,
        subitem: [
            {
                title: 'Audit Logs',
                href: '/admin/audit-logs',
                icon: Dot,
            },
            {
                title: 'Security Logs',
                href: '/admin/security-logs',
                icon: Dot,
            },
            {
                title: 'API Documentation',
                href: '/admin/api-docs',
                icon: Dot,
            },
            {
                title: 'API Keys',
                href: '/admin/api-tokens',
                icon: Dot,
            },
        ],
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>
        </Sidebar>
    );
}
