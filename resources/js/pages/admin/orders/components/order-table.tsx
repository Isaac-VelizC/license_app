import { CalendarDays, Hash, Mail, PackageCheck } from "lucide-react";
import { useMemo } from "react";
import { Column, DataTable } from "@/components/datatable";
import { Badge, Button } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { show } from "@/routes/admin/order";
import type { OrderEntity } from "@/types/admin/order.contract";
import { Link } from "@inertiajs/react";
import clients from "@/routes/admin/clients";

interface OrdersTableProps {
    orders: OrderEntity[];
    onClearFilter?(): void;
}

const OrdersTable = ({ orders, onClearFilter }: OrdersTableProps) => {
    const columns = useMemo<Column<OrderEntity>[]>(
        () => [
            {
                id: "order_number",
                header: "Orden",
                cell: (order) => (
                    <span className="flex items-center gap-1.5 font-mono text-xs font-medium text-foreground">
                        <Hash className="size-3 shrink-0 text-muted-foreground" />
                        {order.order_number}
                    </span>
                ),
            },
            {
                id: "client",
                header: "Cliente",
                cell: (order) => (
                    <div className="flex flex-col gap-0.5 text-xs">
                        <Link
                            href={clients.show(order.client.id).url}
                            className="font-semibold text-foreground underline hover:text-muted-foreground"
                        >
                            {order.client.name}
                        </Link>
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="size-3 shrink-0 text-muted-foreground" />
                            {order.client.email}
                        </span>
                    </div>
                ),
            },
            {
                id: "plan",
                header: "Plan",
                cell: (order) => (
                    <div className="flex items-center gap-1.5 text-sm">
                        <PackageCheck className="size-3.5 shrink-0 text-muted-foreground" />
                        {order.plan.name}
                    </div>
                ),
            },
            {
                id: "amount",
                header: "Monto",
                cell: (order) => (
                    <span className="font-mono text-sm font-medium text-foreground">
                        {order.amount}
                    </span>
                ),
            },
            {
                id: "status",
                header: "Estado",
                cell: (order) => (
                    <Badge variant={"soft"} color={order.status_color}>
                        {order.status_label}
                    </Badge>
                ),
            },
            {
                id: "created_at",
                header: "Fecha",
                cell: (order) => (
                    <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5 shrink-0" />
                        {formatDateTime(order.created_at)}
                    </span>
                ),
            },
            {
                id: "actions",
                header: "Acciones",
                headerClassName: "text-right",
                className: "text-right",
                cell: (order) => (
                    <a href={show(order.id).url}>
                        <Button variant="ghost" size="sm" color="info">
                            Ver detalle
                        </Button>
                    </a>
                ),
            },
        ],
        [],
    );

    return (
        <DataTable
            data={orders}
            columns={columns}
            rowKey={(order) => order.id}
            clearSearch={onClearFilter}
            emptyTitle="No se encontraron órdenes"
        />
    );
};

export default OrdersTable;
