import { Head, Link, router } from "@inertiajs/react";
import { useMemo } from "react";
import { Column, DataTable } from "@/components/datatable";
import Heading from "@/components/heading";
import { Selectable } from "@/components/selectable";
import { Badge, InputSearch } from "@/components/ui";
import { useDebounceSearch } from "@/hooks/use-debounce-search";
import { formatDateTime } from "@/lib/utils";
import { dashboard } from "@/routes/admin";
import { index as licenseLogsIndex } from "@/routes/admin/license-logs";
import { show as licenseShow } from "@/routes/admin/licenses";
import type { LicenseLogEntity, PaginatedData } from "@/types";

interface Props {
    logs: PaginatedData<LicenseLogEntity>;
    filters: { search: string; event: string };
    events: string[];
}

const EVENT_LABELS: Record<string, string> = {
    issued: "Emitida",
    renewed: "Renovada",
    plan_changed: "Cambio de plan",
    suspended: "Suspendida",
    revoked: "Revocada",
    reactivated: "Reactivada",
    trial_started: "Prueba iniciada",
    deactivated: "Dispositivo desconectado",
};

const EVENT_COLORS: Record<
    string,
    "success" | "warning" | "danger" | "info" | "neutral"
> = {
    issued: "success",
    renewed: "success",
    plan_changed: "info",
    suspended: "warning",
    revoked: "danger",
    reactivated: "success",
    trial_started: "info",
    deactivated: "neutral",
};

export default function LicenseLogsPage({ logs, filters, events }: Props) {
    const { searchValue, setSearchValue, clearSearch, isSearching } =
        useDebounceSearch(filters.search || "", {
            delay: 500,
            only: ["logs", "filters"],
            minChars: 2,
        });

    const eventOptions = events.map((e) => ({
        label: EVENT_LABELS[e] ?? e,
        value: e,
    }));

    const handleEventChange = (value: string) => {
        router.get(
            licenseLogsIndex().url,
            { search: filters.search, event: value === "all" ? "" : value },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["logs", "filters"],
            },
        );
    };

    const columns = useMemo<Column<LicenseLogEntity>[]>(
        () => [
            {
                id: "event",
                header: "Evento",
                cell: (log) => (
                    <Badge
                        variant="soft"
                        color={EVENT_COLORS[log.event] ?? "neutral"}
                    >
                        {EVENT_LABELS[log.event] ?? log.event}
                    </Badge>
                ),
            },
            {
                id: "license",
                header: "Licencia",
                cell: (log) => (
                    <div className="flex flex-col gap-0.5 text-xs">
                        <Link
                            href={licenseShow(log.license.id).url}
                            className="font-mono font-medium text-foreground hover:underline"
                        >
                            {log.license.license_key}
                        </Link>
                        <span className="text-muted-foreground">
                            {log.license.client_name ?? "Sin cliente"} ·{" "}
                            {log.license.app_name ?? "App"}
                        </span>
                    </div>
                ),
            },
            {
                id: "meta",
                header: "Detalle",
                cell: (log) => {
                    const reason = log.meta?.reason;
                    return (
                        <span className="text-xs text-muted-foreground">
                            {typeof reason === "string" ? reason : "—"}
                        </span>
                    );
                },
            },
            {
                id: "ip_address",
                header: "IP",
                cell: (log) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {log.ip_address ?? "—"}
                    </span>
                ),
            },
            {
                id: "created_at",
                header: "Fecha",
                cell: (log) => (
                    <span className="text-xs">
                        {formatDateTime(log.created_at)}
                    </span>
                ),
            },
        ],
        [],
    );

    return (
        <>
            <Head title="Auditoría de Licencias" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-6">
                <Heading
                    title="Auditoría"
                    description="Historial de eventos de todas las licencias: emisiones, cambios de estado y dispositivos."
                />

                <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row">
                    <InputSearch
                        search={searchValue}
                        onSearchChange={setSearchValue}
                        onClear={clearSearch}
                        loading={isSearching}
                        placeholder="Buscar por clave o cliente..."
                        className="w-full sm:max-w-sm"
                    />
                    <Selectable
                        value={filters.event || ""}
                        onValueChange={handleEventChange}
                        placeholder="Filtrar por evento"
                        labelAll="Todos los eventos"
                        options={eventOptions}
                    />
                </div>

                <DataTable
                    data={logs.data}
                    columns={columns}
                    rowKey={(log) => log.id}
                    clearSearch={clearSearch}
                    emptyTitle="No hay eventos registrados todavía."
                />

                {/*logs.meta.last_page > 1 && <Pagination links={logs.meta.links} />*/}
            </div>
        </>
    );
}

LicenseLogsPage.layout = {
    breadcrumbs: [
        { title: "Panel Central", href: dashboard() },
        { title: "Auditoría", href: "#" },
    ],
};
