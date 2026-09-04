import { PenSquare } from "lucide-react";
import { router } from "@inertiajs/react";
import { useMemo } from "react";
import { toast } from "sonner";
import { AppEntity } from "@/types/admin/app.contract";
import { Column, DataTable } from "@/components/datatable";
import { Badge, Button } from "@/components/ui";
import { show, toggle } from "@/routes/admin/apps";
import ConfirmModal from "@/components/confirm-modal";
import { useConfirmAction } from "@/hooks/use-confirm-action";

interface AppsTableProps {
    apps: AppEntity[];
    togglingId: number | null;

    onEdit(app: AppEntity): void;
    onClearSearch?(): void;
}

const AppsTable = ({
    apps,
    togglingId,
    onEdit,
    onClearSearch,
}: AppsTableProps) => {
    const {
        ask: askDeactivate,
        pendingItem: pendingDeactivation,
        cancel: cancelDeactivation,
        confirm: confirmDeactivation,
        processing: deactivating,
    } = useConfirmAction<AppEntity>({
        action: (app) => toggle(app.id).url,
        onSuccess: () => toast.success('Aplicación desactivada.'),
    })

    const handleStatusClick = (app: AppEntity) => {
        if (app.is_active) {
            askDeactivate(app);
        } else {
            router.patch(toggle(app.id).url, {}, { preserveScroll: true });
        }
    };

    const columns = useMemo<Column<AppEntity>[]>(
        () => [
            {
                id: "name",
                header: "Aplicación",
                cell: (app) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                            {app.name}
                        </span>
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                            {app.description || "Sin descripción"}
                        </span>
                    </div>
                ),
            },
            {
                id: "slug",
                header: "Slug",
                cell: (app) => (
                    <span className="font-mono text-xs font-medium text-primary">
                        {app.slug}
                    </span>
                ),
            },
            {
                id: "plans_count",
                header: "Planes",
                cell: (app) => (
                    <span className="text-sm font-medium">
                        {app.plans_count ?? 0}
                    </span>
                ),
            },
            {
                id: "licenses_count",
                header: "Licencias Emitidas",
                cell: (app) => (
                    <span className="text-sm font-medium">
                        {app.licenses_count ?? 0}
                    </span>
                ),
            },
            {
                id: "status",
                header: "Estado",
                cell: (app) => (
                    <button
                        type="button"
                        onClick={() => handleStatusClick(app)}
                        disabled={togglingId === app.id}
                        aria-label={
                            app.is_active
                                ? `Desactivar ${app.name}`
                                : `Activar ${app.name}`
                        }
                        className="disabled:opacity-50"
                    >
                        <Badge
                            variant="outline"
                            color={app.is_active ? "success" : "danger"}
                            className="select-none"
                        >
                            {togglingId === app.id
                                ? "Actualizando…"
                                : app.is_active
                                  ? "Activa"
                                  : "Inactiva"}
                        </Badge>
                    </button>
                ),
            },
            {
                id: "actions",
                header: "Acciones",
                headerClassName: "text-right",
                className: "text-right",
                cell: (app) => (
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            color="info"
                            disabled={togglingId === app.id}
                            onClick={() => router.visit(show(app.id).url)}
                        >
                            Ver Planes
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            color="neutral"
                            disabled={togglingId === app.id}
                            aria-label={`Editar ${app.name}`}
                            onClick={() => onEdit(app)}
                        >
                            <PenSquare className="size-4" />
                        </Button>
                    </div>
                ),
            },
        ],
        [onEdit, togglingId],
    );

    return (
        <>
            <DataTable
                data={apps}
                columns={columns}
                rowKey={(app) => app.id}
                clearSearch={onClearSearch}
                emptyTitle="No se encontraron aplicaciones"
            />
            <ConfirmModal
                isOpen={!!pendingDeactivation}
                onClose={cancelDeactivation}
                onConfirm={confirmDeactivation}
                processing={deactivating}
                type="warning"
                title={`¿Desactivar "${pendingDeactivation?.name}"?`}
                descriptionText="Los clientes con licencias de esta app podrían dejar de poder activar o validar mientras esté inactiva."
                confirmText="Desactivar"
            />
        </>
    );
};

export default AppsTable;
