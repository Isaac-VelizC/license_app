import { Link } from '@inertiajs/react';
import { BookOpen, ChartPie, FolderGit2, KeyIcon, LayoutGrid, ListOrdered, ScrollText, Users2 } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import { dashboard } from "@/routes/admin";
import { index as appIndex } from '@/routes/admin/apps';
import { index as ordersIndex } from '@/routes/admin/order';
import { index as clientIndex } from '@/routes/admin/clients';
import { index as licensesIndex } from '@/routes/admin/licenses';
import { index as licenseLogsIndex } from '@/routes/admin/license-logs';

const mainNavItems: NavItem[] = [
    {
        title: 'Panel Central',
        href: dashboard(),
        icon: ChartPie,
    },
    {
        title: 'Aplicaciones',
        href: appIndex().url,
        icon: LayoutGrid,
    },
    {
        title: 'Clientes',
        href: clientIndex().url,
        icon: Users2,
    },
    {
        title: 'Licencias',
        href: licensesIndex().url,
        icon: KeyIcon,
    },
    {
        title: 'Pedidos',
        href: ordersIndex().url,
        icon: ListOrdered,
    },
    {
        title: 'Auditoría',
        href: licenseLogsIndex().url,
        icon: ScrollText,
    },
]

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
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

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
