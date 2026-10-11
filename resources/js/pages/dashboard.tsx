import { Head, Link } from "@inertiajs/react";
import {
    AppWindow,
    ArrowRight,
    Clock3,
    KeyRound,
    MonitorCheck,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dashboard } from "@/routes/admin";
import { formatDate } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { show } from "@/routes/admin/order";

interface Stats {
    apps: number;
    activeLicenses: number;
    pendingOrders: number;
    activeTrials: number;
}

interface RecentOrder {
    id: number;
    number: string;
    client: string;
    plan: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
}

interface DashboardProps {
    stats: Stats;
    recentOrders: RecentOrder[];
}

const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    paid: "Pagado",
    cancelled: "Cancelado",
    expired: "Vencido",
};

export default function Dashboard({ stats, recentOrders }: DashboardProps) {
    const summary = [
        {
            title: "Licencias activas",
            value: stats.activeLicenses,
            icon: KeyRound,
        },
        {
            title: "Pedidos pendientes",
            value: stats.pendingOrders,
            icon: Clock3,
        },
        {
            title: "Aplicaciones",
            value: stats.apps,
            icon: AppWindow,
        },
        {
            title: "Pruebas activas",
            value: stats.activeTrials,
            icon: MonitorCheck,
        },
    ];

    return (
        <>
            <Head title="Panel Central" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Panel Central
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Resumen general de tu sistema de licencias.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {summary.map((item) => (
                        <Card key={item.title}>
                            <CardContent className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        {item.title}
                                    </p>
                                    <p className="text-3xl font-semibold tabular-nums">
                                        {item.value}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-muted p-3">
                                    <item.icon className="size-5 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-3">
                        <CardTitle className="text-base">
                            Pedidos recientes
                        </CardTitle>

                        <Link
                            href="/admin/orders"
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            Ver todos
                            <ArrowRight className="size-4" />
                        </Link>
                    </CardHeader>

                    <CardContent className="px-0">
                        {recentOrders.length === 0 ? (
                            <div className="py-12 text-center text-sm text-muted-foreground">
                                Todavía no hay pedidos registrados.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pedido</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">
                                            Importe
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">
                                                <Link href={show(order.id).url} className="text-primary underline">
                                                    {order.number}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{order.client}</TableCell>
                                            <TableCell>{order.plan}</TableCell>
                                            <TableCell>
                                                {formatDate(order.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {statusLabels[
                                                        order.status
                                                    ] ?? order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {order.amount}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Accesos rápidos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-3">
                        {[
                            {
                                label: "Gestionar pedidos",
                                href: "/admin/orders",
                            },
                            {
                                label: "Gestionar licencias",
                                href: "/admin/licenses",
                            },
                            { label: "Aplicaciones", href: "/admin/apps" },
                        ].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center justify-between rounded-lg border p-4 text-sm font-medium transition-colors hover:bg-muted"
                            >
                                {item.label}
                                <ArrowRight className="size-4 text-muted-foreground" />
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: "Panel Central",
            href: dashboard(),
        },
    ],
};
