import Heading from "@/components/heading";
import { Button } from "@/components/ui";
import { dashboard } from "@/routes/admin";
import { index } from "@/routes/admin/order";
import type { PaginatedData } from "@/types";
import type { OrderEntity, StatusOptions } from "@/types/admin/order.contract";
import { Head, router } from "@inertiajs/react";
import OrdersTable from "./components/order-table";

type OrderProps = {
    orders: PaginatedData<OrderEntity>;
    filters: { status: string | null };
    statuses: StatusOptions[];
};

export default function OrdersPage({ orders, filters, statuses }: OrderProps) {
    const setStatusFilter = (status: string | null) => {
        router.get(index().url, status ? { status } : {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Órdenes" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-6">
                <Heading
                    title="Getión de Órdenes"
                    description="Revisa los pedidos de licencias y confirma los pagos recibidos."
                />

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={!filters.status ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter(null)}
                    >
                        Todas
                    </Button>
                    {statuses.map((status, index) => (
                        <Button
                            key={index}
                            variant={
                                filters.status === status.value
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            onClick={() => setStatusFilter(status.value)}
                        >
                            {status.label}
                        </Button>
                    ))}
                </div>
                <OrdersTable
                    orders={orders.data}
                    onClearFilter={() => setStatusFilter(null)}
                />
            </div>
        </>
    );
}

OrdersPage.layout = {
    breadcrumbs: [
        { title: "Panel Central", href: dashboard() },
        { title: "Órdenes", href: index().url },
    ],
};
