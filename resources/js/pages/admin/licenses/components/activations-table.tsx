import { memo, useMemo } from "react";
import type { ActivationEntity } from "@/types";
import { Clock, Laptop, Trash2, Wifi, WifiOff } from "lucide-react";
import { formatDate, formatDateTime, truncateValue } from "@/lib/utils";
import { Badge, Button } from "@/components/ui";
import { DataTable } from "@/components/datatable";

type ActivationsTableProps = {
    activations: ActivationEntity[];
    onDeactivate: (activationId: number, deviceName?: string | null) => void;
};

const ActivationsTable = memo(
    ({ activations, onDeactivate }: ActivationsTableProps) => {
        const columns = useMemo(
            () => [
                {
                    id: 'device',
                    header: 'Dispositivo',
                    cell: (activation: ActivationEntity) => (
                        <div className="flex items-center gap-2">
                            <Laptop className="size-4 shrink-0 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                                {activation.device_name || 'Sin nombre'}
                            </span>
                        </div>
                    ),
                },
                {
                    id: 'hwid',
                    header: 'Identificador HWID',
                    cell: (activation: ActivationEntity) => (
                        <span
                            className="font-mono text-xs text-muted-foreground"
                            title={activation.hwid ?? activation.device_id}
                        >
                            {truncateValue(activation.hwid ?? activation.device_id, 16)}
                        </span>
                    ),
                },
                {
                    id: 'ip_address',
                    header: 'Dirección IP',
                    cell: (activation: ActivationEntity) => (
                        <span className="text-xs">{activation.ip_address || '—'}</span>
                    ),
                },
                {
                    id: 'activated_at',
                    header: 'Fecha de activación',
                    cell: (activation: ActivationEntity) => (
                        <span className="text-xs">{formatDate(activation.activated_at)}</span>
                    ),
                },
                {
                    id: 'last_seen_at',
                    header: 'Última conexión',
                    cell: (activation: ActivationEntity) => (
                        <span className="flex items-center gap-1 text-xs">
                            <Clock className="size-3 text-muted-foreground" />
                            {formatDateTime(activation.last_seen_at)}
                        </span>
                    ),
                },
                {
                    id: 'status',
                    header: 'Estado',
                    cell: (activation: ActivationEntity) => (
                        <ActivationStatusBadge isActive={activation.is_active} />
                    ),
                },
                {
                    id: 'actions',
                    header: 'Acción',
                    headerClassName: 'text-right',
                    className: 'text-right',
                    cell: (activation: ActivationEntity) =>
                        activation.is_active ? (
                            <div className="flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDeactivate(activation.id, activation.device_name)}
                                    className="text-destructive hover:bg-destructive/10"
                                    title="Desconectar dispositivo"
                                    aria-label={`Desconectar ${activation.device_name || 'dispositivo'}`}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        ) : (
                            // Ya está desconectado — nada que hacer, evita un
                            // botón destructivo sin acción real detrás.
                            <div className="flex justify-end pr-2 text-xs text-muted-foreground">—</div>
                        ),
                },
            ],
            [onDeactivate],
        );

        return (
            <DataTable
                data={activations}
                columns={columns}
                rowKey={(activation) => activation.id}
                emptyTitle="No hay dispositivos o equipos vinculados a esta licencia todavía."
            />
        );
    },
);

ActivationsTable.displayName = 'ActivationsTable';
export default ActivationsTable;

function ActivationStatusBadge({ isActive }: { isActive: boolean }) {
    return isActive ? (
        <Badge color="success" className="gap-1">
            <Wifi className="size-3" />
            Activo
        </Badge>
    ) : (
        <Badge color="neutral" className="gap-1">
            <WifiOff className="size-3" />
            Inactivo
        </Badge>
    );
}